let totalEl = document.getElementById('total');
let total = 0;
let buttons = document.querySelectorAll('#items button');

for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    total += Number(this.dataset.price);
    totalEl.textContent = total;
  });
}
