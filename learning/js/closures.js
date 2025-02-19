// closures
function makeCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}

let counter = makeCounter();
console.log(counter());
console.log(counter());
console.log(counter());

function multiplier(factor) {
  return function (value) {
    return value * factor;
  };
}
let double = multiplier(2);
let triple = multiplier(3);
console.log(double(5), triple(5));
