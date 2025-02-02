// function expressions and arrow functions
let square = function (n) {
  return n * n;
};
console.log(square(5));

let cube = (n) => { return n * n * n; };
console.log(cube(3));

let double = n => n * 2;
console.log(double(8));

let sum = (a, b) => a + b;
console.log(sum(1, 2));
