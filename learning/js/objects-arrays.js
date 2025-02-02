// array of objects
let people = [
  { name: 'Ravi', age: 25 },
  { name: 'Priya', age: 22 },
  { name: 'Karthik', age: 28 }
];

for (let i = 0; i < people.length; i++) {
  console.log(people[i].name + ' is ' + people[i].age);
}

people.push({ name: 'Anita', age: 24 });
console.log(people.length);
console.log(people[1].name);
