const fs = require('fs');

const fileName = 'notes.txt';
fs.writeFileSync(fileName, 'Learning the file system module\n');

fs.appendFileSync(fileName, 'Appending a second line\n');

const content = fs.readFileSync(fileName, 'utf8');
console.log(content.trim());

fs.renameSync(fileName, 'renamed-notes.txt');

const exists = fs.existsSync('renamed-notes.txt');
console.log('File renamed and exists:', exists);
