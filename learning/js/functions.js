// function basics
function add(a, b) {
  return a + b;
}

function greet(name) {
  console.log('hello ' + name);
}

console.log(add(3, 4));
greet('Senthil');

function defaultParam(a, b = 10) {
  return a * b;
}
console.log(defaultParam(5));
