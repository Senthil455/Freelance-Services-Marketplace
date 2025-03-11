console.log('Hello from Node.js');

const version = process.version;
console.log('Running on Node ' + version);

if (process.argv.length > 2) {
  console.log('Called with arguments:', process.argv.slice(2).join(', '));
}
