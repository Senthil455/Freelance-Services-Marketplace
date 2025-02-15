// higher order functions on arrays
let nums = [1, 2, 3, 4, 5];

let doubled = nums.map(function (n) { return n * 2; });
console.log(doubled);

let evens = nums.filter(function (n) { return n % 2 === 0; });
console.log(evens);

let sum = nums.reduce(function (acc, n) { return acc + n; }, 0);
console.log(sum);

nums.forEach(function (n) { console.log('item', n); });

let found = nums.find(function (n) { return n > 3; });
console.log(found);
