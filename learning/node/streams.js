const fs = require('fs');

const readStream = fs.createReadStream('notes.txt', 'utf8');
const writeStream = fs.createWriteStream('copy.txt');

readStream.pipe(writeStream);

readStream.on('end', () => {
  console.log('finished streaming the file');
});
