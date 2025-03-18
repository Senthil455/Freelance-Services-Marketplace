const path = require('path');

console.log('NODE_ENV =', process.env.NODE_ENV);
console.log('HOME     =', process.env.HOME || process.env.USERPROFILE);
console.log('PATH has', process.env.PATH ? process.env.PATH.split(path.delimiter).length : 0, 'entries');
