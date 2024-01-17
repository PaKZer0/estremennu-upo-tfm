const functions = require('@google-cloud/functions-framework');
const { Translate } = require('@google-cloud/translate');

const translate = new Translate();

const sourceFolder = 'es/';
const targetFolder = 'en/';
const eventType = 'google.storage.object.finalize';

functions.cloudEvent('translateEs2En', cloudEvent => {
  // Filter only creation/update events on the source folder
  if ( cloudEvent.type === eventType && 
    cloudEvent.data.name.indexOf(sourceFolder) > -1 ){
    const bucket = functions.config().storage.bucket;
    const file = bucket.getFile(sourceFolder);
  
    const content = file.content.toString();
    const translatedContent = translate.translate(content, 'es', 'en');
    const newFilePath = cloudEvent.data.name.replace(sourceFolder, targetFolder)
    bucket.createFile(translatedContent, translatedContent);
  }
});
