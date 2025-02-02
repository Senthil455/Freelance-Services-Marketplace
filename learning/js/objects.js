// objects practice
let user = {
  name: 'Senthil',
  age: 22,
  skills: ['html', 'css', 'javascript'],
  greet: function () {
    return 'hi, i am ' + this.name;
  }
};

console.log(user.name);
console.log(user['age']);
user.city = 'Chennai';
delete user.skills;
console.log(user);
console.log(user.greet());
