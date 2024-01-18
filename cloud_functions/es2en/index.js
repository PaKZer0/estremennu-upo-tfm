const fs = require('fs');
const functions = require('@google-cloud/functions-framework');
const { Translate } = require('@google-cloud/translate').v2;
const { Storage } = require('@google-cloud/storage');

const projectId = 'test-cf-411521';
const translate = new Translate({ projectId });

const sourceFolder = 'es/';
const targetFolder = 'en/';
const eventType = 'google.cloud.storage.object.v1.finalized';
const tempFilename = '/tmp/tmp.txt';
const tempFilename2 = '/tmp/translated.txt';

functions.cloudEvent('translateEs2En', async (cloudEvent) => {
  // Filter only creation/update events on the source folder
  if ( cloudEvent.type === eventType && 
    cloudEvent.data.name.indexOf(sourceFolder) > -1 ) {
    const storage = new Storage();
    const bucket = storage.bucket(cloudEvent.data.bucket);
    // Download the file
    const options = {
      destination: tempFilename,
    };
    await bucket.file(cloudEvent.data.name).download(options);
    
    const content = fs.readFileSync(tempFilename).toString();
    const [translatedContent] = await translate.translate(content, 'en');
    // Create translated file
    fs.writeFileSync(tempFilename2, translatedContent);

    // Check if the file exists and overwrite
    const newFilePath = cloudEvent.data.name.replace(sourceFolder, targetFolder)
    await bucket.upload(tempFilename2, { destination: newFilePath });
  }
});
