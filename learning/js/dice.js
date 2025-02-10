let rollBtn = document.getElementById('roll');
let dice = document.getElementById('dice');
let history = document.getElementById('history');
let rolls = [];

rollBtn.addEventListener('click', function () {
  let value = Math.floor(Math.random() * 6) + 1;
  dice.textContent = value;
  rolls.push(value);
  history.textContent = rolls.join(', ');
});
