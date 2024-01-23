const fs = require('fs');
const functions = require('@google-cloud/functions-framework');
const { Translate } = require('@google-cloud/translate').v2;
const { Storage } = require('@google-cloud/storage');

const projectId = 'test-cf-411521';
const translate = new Translate({ projectId });

const sourceSuffix = '.es.txt';
const targetSuffix = '.en.txt';
const trainFolder = 'training-data';
const eventType = 'google.cloud.storage.object.v1.finalized';
const tempFilename = '/tmp/tmp.txt';
const tempFilename2 = '/tmp/translated.txt';

functions.cloudEvent('translateEs2En', async (cloudEvent) => {
  // Filter only creation/update events on the training data folder
  if ( cloudEvent.type === eventType && 
    cloudEvent.data.name.indexOf(sourceSuffix) > -1 && 
    cloudEvent.data.name.indexOf(trainFolder) > -1 ) {
    const storage = new Storage();
    const bucket = storage.bucket(cloudEvent.data.bucket);

    // Check if the file exists and proceed if it doesnt
    const newFilePath = cloudEvent.data.name.replace(sourceSuffix, targetSuffix)
    const [exists] = await bucket.file(newFilePath).exists();
    if (!exists) {
      // Download the file
      const options = {
        destination: tempFilename,
      };
      await bucket.file(cloudEvent.data.name).download(options);
      
      const content = fs.readFileSync(tempFilename).toString();
      const [translatedContent] = await translate.translate(content, 'en');
      // Create translated file
      fs.writeFileSync(tempFilename2, translatedContent);

      await bucket.upload(tempFilename2, { destination: newFilePath });
    }
  }
});
