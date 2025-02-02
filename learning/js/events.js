let btn = document.getElementById('btn');
let out = document.getElementById('out');

function handleClick() {
  out.textContent = 'button was clicked!';
}

btn.addEventListener('click', handleClick);

let count = 0;
btn.addEventListener('click', function () {
  count++;
  this.textContent = 'clicks: ' + count;
});
