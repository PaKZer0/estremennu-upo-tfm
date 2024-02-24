const fs = require('fs');
const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore(
  { databaseId: 'dialogflow-estremennu', keyFilename: 'credentials.json' });

const responseSkeleton = {
  fulfillmentMessages: [
    {
      text: {
        text: ['']
      }
    }
  ]
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

  const response = responseSkeleton;
  response.fulfillmentMessages = request?.queryResult?.fulfillmentMessages;

  return response;
};

const toIntent = async (request) => {
  const sessionId = getSession(request);
  const parameters = getParameters(request);

  let response = responseSkeleton;
  if (parameters && parameters?.language) {
    const language = parameters?.language.toLowerCase();
    console.log(`Language detectado es: ${language}`);

    if (language !== 'inglés' && language !== 'español' && language !== 'castellano') {
      // redirect to DetectIntentAl - fallback
      console.log('TENEMOS QUE PARAR ESTO');
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

      console.log('Enviar analíticas de datos: from, to, fecha y hora');
    }
  }

  return response;
};

const translateIntent = async (request) => {
  const sessionId = getSession(request);
  const queryText = request?.queryResult?.queryText;
  let response = responseSkeleton;

  const document = firestore.doc(`translate/${sessionId}`);
  const doc = await document.get();
  let myData = doc.data();

  const from = myData.direction == 'from' ? 'ext' : myData.language;
  const to = myData.direction == 'to' ? 'ext' : myData.language;

  console.log(`Query a LibreTranslate:\nfrom: ${from}\nto: ${to}\ntexto:${queryText}`);
  const translatedText = await getTranslation('es', 'en', queryText); // getTranslation(from, to, queryText);

  const rawMessage = request?.queryResult?.fulfillmentMessages[0].text.text[0];
  const translatedResponse = rawMessage.replace('${texto}', translatedText);
  response.fulfillmentMessages[0].text.text[0] = translatedResponse;

  console.log(`Borrar sessionId de bdd`);
  await document.delete();

  return response;
};

functions.http('fulfillment', async (req, res) => {
  const request = req?.body;
  const intentName = getIntentName(request);

  let response = responseSkeleton;

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

  console.log(`Enviar respuesta ${JSON.stringify(response)}`);
  res.send(response);
});
