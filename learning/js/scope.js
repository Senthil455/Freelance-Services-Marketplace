// scope and hoisting quick notes
var oldWay = 'still works';
let blockScoped = 'let is scoped to blocks';

function test() {
  var inside = 'function scope';
  console.log(inside);
}
test();

console.log(typeof hoistedVar);
var hoistedVar = 'hoisted declaration';

const notHoisted = 'const hoists too but stays in temporal dead zone';
console.log(notHoisted);
