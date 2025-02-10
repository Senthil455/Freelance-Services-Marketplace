// promises
let wait = function (ms) {
  return new Promise(function (resolve, reject) {
    if (ms < 0) reject(new Error('negative time'));
    setTimeout(function () { resolve('waited ' + ms + 'ms'); }, ms);
  });
};

wait(500).then(function (msg) {
  console.log(msg);
  return wait(300);
}).then(function (msg) {
  console.log(msg);
}).catch(function (err) {
  console.log('error:', err.message);
});
