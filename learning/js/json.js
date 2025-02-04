// json practice
let person = { name: 'Senthil', age: 22, city: 'Chennai' };
let json = JSON.stringify(person);
console.log(json);

let back = JSON.parse(json);
console.log(back.name);

let people = [
  { name: 'A', age: 20 },
  { name: 'B', age: 30 }
];
for (let p of people) {
  console.log(JSON.stringify(p));
}
