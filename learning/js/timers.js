let clock = document.getElementById('clock');
let seconds = 0;

let timer = setInterval(function () {
  seconds++;
  clock.textContent = seconds + ' seconds passed';
}, 1000);

document.getElementById('stop').addEventListener('click', function () {
  clearInterval(timer);
  clock.textContent = 'stopped at ' + seconds;
});

setTimeout(function () {
  console.log('one-time message after 3 seconds');
}, 3000);
