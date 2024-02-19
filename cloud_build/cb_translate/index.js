const fs = require('fs');
const fspromises = require('node:fs/promises');
const { Translate } = require('@google-cloud/translate').v2;

const projectId = 'test-cf-411521';
const translate = new Translate({ projectId });

const sourceSuffix = '.es.txt';
const targetSuffix = '.en.txt';
const maxSize = 204800; // 200 KB

const inFile = process.argv[2];

if (process.argv.length < 2 || !inFile || inFile === '') {
  console.error('This script needs to be invocked with a file parameter');
  process.exit(1);
}

if (inFile.indexOf(sourceSuffix) < 0) {
  console.error('The input file doesnt match the suffix ".es.txt"');
  process.exit(1);
}

const translateFunction = async () => {
  // Create translated file
  const newFilePath = inFile.replace(sourceSuffix, targetSuffix);
  let fh = await fspromises.open(newFilePath, 'a');
  await fh.close();
  fs.writeFileSync(newFilePath, ''); // create a blank file

  const content = fs.readFileSync(inFile).toString();

  // Translate line by line
  const chunks = content.split('\n');
  let translatedChunks = [];

  for (const chunk of chunks) {
    const [translatedChunk] = await translate.translate(chunk, 'en');
    console.log(translatedChunk);
    translatedChunks.push(translatedChunk);
  }

  const translatedContent = translatedChunks.join('\n');
  fs.writeFileSync(newFilePath, translatedContent); // create a blank file
};

translateFunction().catch(err => {
  console.error(err);
  process.exit(1);
})