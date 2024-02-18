const fs = require('fs');
const { Translate } = require('@google-cloud/translate').v2;

const projectId = 'test-cf-411521';
const translate = new Translate({ projectId });

const sourceSuffix = '.es.txt';
const targetSuffix = '.en.txt';

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
  const content = fs.readFileSync(inFile).toString();
  const [translatedContent] = await translate.translate(content, 'en');

  // console.log(content);
  // console.log(translatedContent);

  // Create translated file
  const newFilePath = inFile.replace(sourceSuffix, targetSuffix);
  fs.writeFileSync(newFilePath, translatedContent);
};

translateFunction().catch(err => {
  console.error(err);
  process.exit(1);
})