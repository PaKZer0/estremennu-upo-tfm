const fs = require('fs');
const { BigQuery } = require('@google-cloud/bigquery');
const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

let accessValues = {};
try {
  const fileContent = fs.readFileSync('access.json');
  accessValues = JSON.parse(fileContent);
} catch (e) {
  // do nothing
}

// external api options
// init firestore
const firestore = new Firestore(
  { databaseId: 'dialogflow-estremennu', ...accessValues });
const bigquery = new BigQuery({ ...accessValues });

// Definitions
const datasetId = "translate_analytics";
const tableId = "kpis";

// functions
const getResponseSkeleton = () => {
  return {
    fulfillmentMessages: [
      {
        text: {
          text: ['']
        }
      }
    ]
  };
};

const getSession = (request) => {
  sessionString = request.session;
  const split = sessionString.split('/');
  const session = split[split.length - 1] ? split[split.length - 1] : '';
  return session;
};

const getIntentName = (request) => {
  return request?.queryResult?.intent?.displayName;
};

const getParameters = (request) => {
  return request?.queryResult?.parameters;
}

const resetContexts = (request, response) => {
  const firstOutContext = 'detectintent';
  const systemCounters = '__system_counters__';

  const contexts = request?.queryResult?.outputContexts;
  const outContexts = [];

  if (contexts) {
    for (context of contexts) {
      if (context?.name && 
        !context.name.endsWith(firstOutContext) &&
        !context.name.endsWith(systemCounters)) {
        const zeroContext = {
          name: context.name,
          lifespanCount: 0
        };
        outContexts.push(zeroContext);
      }
    }
    response.outputContexts = outContexts;
  }

  response.fulfillmentMessages = request?.queryResult?.fulfillmentMessages;

  return response;
}

const getTranslation = async (from, to, text) => {
  const endpoint = fs.readFileSync('endpointTraslate.txt');

  const res = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({
      q: text,
      source: from,
      target: to,
      format: "text",
      api_key: ""
    }),
    headers: { "Content-Type": "application/json" }
  });
  const jsonResponse = await res.json();

  return jsonResponse?.translatedText;
};

const getDateTime = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hour = ('0' + date.getHours()).slice(-2);
  const mins = ('0' + date.getMinutes()).slice(-2);
  const secs = ('0' + date.getSeconds()).slice(-2);
  const ms = ('00' + date.getMilliseconds()).slice(-3);

  const formatDate = year + '-' + month + '-' + day + ' ' + hour + ':' + mins + ':' + secs + '.' + ms;

  return formatDate;
};

const insertKPI = async (sessionid, from, to) => {
  try {
    const datetime = getDateTime();
    const newRow = [{ sessionid, from, to, when: datetime}];

    await bigquery.dataset(datasetId).table(tableId).insert(newRow);
  } catch (e) {
    console.error(JSON.stringify(e, null, 2))
  }
}; 

// Intent handlers
const intentParameter = async (request) => {
  const sessionId = getSession(request);
  const parameters = getParameters(request);
  if (parameters && parameters?.direction_intent) {
    let direction;
    if (parameters?.direction_intent === 'al') {
      direction = 'to';
    } else {
      direction = 'from';
    }

    // get or create data
    const document = firestore.doc(`translate/${sessionId}`);
    const doc = await document.get();
    let myData = doc.data();
    if (! doc.data() ){
      await document.set({ direction });
    } else {
      myData.direction = direction;
      await document.update(myData);
    }
  }

  const response = getResponseSkeleton();
  response.fulfillmentMessages = request?.queryResult?.fulfillmentMessages;

  return response;
};

const toIntent = async (request) => {
  const sessionId = getSession(request);
  const parameters = getParameters(request);

  let response = getResponseSkeleton();
  if (parameters && parameters?.language) {
    const language = parameters?.language.toLowerCase();

    if (language !== 'inglés' && language !== 'español' && language !== 'castellano') {
      // redirect to DetectIntentAl - fallback
      console.log('Redirigir');

      // modify contexts
      const contexts = request?.queryResult?.outputContexts;
      contexts[0].lifespanCount = 2; // increase otherlanguage lifespan
      contexts.splice(1, 1);

      response = {
        followupEventInput: {
          name: 'UNSUPPORTED_LANGUAGE',
        },
        outputContexts: contexts
      };
    } else {
      // get direction and store language
      const document = firestore.doc(`translate/${sessionId}`);
      const doc = await document.get();
      let myData = doc.data();
      myData.language = language === 'inglés' ? 'en' : 'es';
      await document.update(myData);

      // build phrase
      const from = myData.direction == 'from' ? 'extremeño' : language;
      const to = myData.direction == 'to' ? 'extremeño' : language;

      const rawMessage = request?.queryResult?.fulfillmentMessages[0].text.text[0];
      const parsedMessage = rawMessage.replace('${from}', from).replace('${to}', to);
      response.fulfillmentMessages[0].text.text[0] = parsedMessage;

      // insert kpi
      const fromCode = myData.direction == 'from' ? 'ext' : myData.language;
      const toCode = myData.direction == 'to' ? 'ext' : myData.language;
      insertKPI(sessionId, fromCode, toCode); // don't await bigQuery insertion
    }
  }

  return response;
};

const translateIntent = async (request) => {
  const sessionId = getSession(request);
  const queryText = request?.queryResult?.queryText;
  let response = getResponseSkeleton();

  const document = firestore.doc(`translate/${sessionId}`);
  const doc = await document.get();
  let myData = doc.data();

  const from = myData.direction == 'from' ? 'ext' : myData.language;
  const to = myData.direction == 'to' ? 'ext' : myData.language;

  const translatedText = await getTranslation('es', 'en', queryText); // getTranslation(from, to, queryText);

  const rawMessage = request?.queryResult?.fulfillmentMessages[0].text.text[0];
  const translatedResponse = rawMessage.replace('${texto}', translatedText);
  response.fulfillmentMessages[0].text.text[0] = translatedResponse;

  await document.delete();

  return response;
};

// main function
functions.http('fulfillment', async (req, res) => {
  const request = req?.body;
  const intentName = getIntentName(request);
  console.log(`Get request: ${JSON.stringify(request)}`);

  let response = getResponseSkeleton();

  if(intentName === 'DetectIntentAl' || intentName === 'DetectIntentDel'){
    response = await intentParameter(request);
  } else if (intentName === 'OtherLanguage') {
    response = await toIntent(request);
  } else if (intentName === 'Translate'){
    response = await translateIntent(request);
  } else if (intentName === 'Default Welcome Intent'){
    response = await resetContexts(request, response);
    // create warmup translation request
    getTranslation('es', 'en', 'Esta petición es de calentamiento');
  }
  console.log(`Send response: ${JSON.stringify(response)}`);
  res.send(response);
});
