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
    let myData = doc.data()
    if (! doc.data() ){
      await document.set({ direction });
    } else {
      myData.direction = direction;
      await document.update(myData);
    }
  }

  const response = responseSkeleton
  response.fulfillmentMessages[0].text.text[0] = parsedMessage;

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

  console.log('Obtener from y to, hacer query a LibreTranslate');
  const document = firestore.doc(`translate/${sessionId}`);
  const doc = await document.get();
  let myData = doc.data();

  const from = myData.direction == 'from' ? 'ext' : myData.language;
  const to = myData.direction == 'to' ? 'ext' : myData.language;

  console.log(`Query a LibreTranslate:\nfrom: ${from}\nto: ${to}\ntexto:${queryText}`);

  translatedText = 'Estu es una preba';

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
    response = await translateIntent(request)
  }

  console.log(`Enviar respuesta ${JSON.stringify(response, null, 2)}`);
  res.send(response);
});
