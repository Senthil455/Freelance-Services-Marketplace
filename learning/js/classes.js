// classes
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(this.name + ' makes a sound');
  }
}

class Dog extends Animal {
  speak() {
    console.log(this.name + ' barks');
  }
}

let a = new Animal('cat');
a.speak();
let d = new Dog('rex');
d.speak();
