// callbacks
function doWithDelay(callback, ms) {
  console.log('starting...');
  setTimeout(callback, ms);
}

doWithDelay(function () {
  console.log('callback ran after delay');
}, 1000);

function process(array, fn) {
  let result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i]));
  }
  return result;
}

let doubled = process([1, 2, 3], function (n) { return n * 2; });
console.log(doubled);
