let secret = Math.floor(Math.random() * 20) + 1;
let hint = document.getElementById('hint');
let tries = 0;

document.getElementById('btn').addEventListener('click', function () {
  let guess = Number(document.getElementById('guess').value);
  if (!guess) return;
  tries++;
  if (guess === secret) {
    hint.textContent = 'correct! you took ' + tries + ' tries';
  } else if (guess < secret) {
    hint.textContent = 'too low';
  } else {
    hint.textContent = 'too high';
  }
});
