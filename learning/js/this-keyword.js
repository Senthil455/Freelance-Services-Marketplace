// this keyword
let obj = {
  name: 'demo',
  show: function () {
    console.log(this.name);
  }
};
obj.show();

function regular() {
  console.log(this);
}
regular();

let arrow = () => console.log(this);
arrow();
