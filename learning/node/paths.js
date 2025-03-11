const path = require('path');
const os = require('os');

const dir = '/home/me/projects/node-app';
console.log('basename:', path.basename(dir));
console.log('extname:', path.extname('index.html'));
console.log('joined:', path.join('src', 'controllers', 'user.js'));
console.log('resolved:', path.resolve('node-app', '..', 'demo'));

console.log('platform:', os.platform());
console.log('cpus:', os.cpus().length);
console.log('home:', os.homedir());
