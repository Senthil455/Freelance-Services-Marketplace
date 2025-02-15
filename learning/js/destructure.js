// destructuring and spread
let { name, age } = { name: 'Senthil', age: 22 };
console.log(name, age);

let [first, second, ...rest] = [10, 20, 30, 40];
console.log(first, second, rest);

let base = { a: 1 };
let copy = { ...base, b: 2 };
console.log(copy);

let parts = ['x', 'y'];
let all = [...parts, 'z'];
console.log(all);
