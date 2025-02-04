let box = document.getElementById('box');
let colorsBtn = document.getElementById('colors');
let sizeBtn = document.getElementById('size');
let size = 50;

box.style.width = size + 'px';
box.style.height = size + 'px';
box.style.background = 'teal';

colorsBtn.addEventListener('click', function () {
  let r = Math.floor(Math.random() * 255);
  let g = Math.floor(Math.random() * 255);
  let b = Math.floor(Math.random() * 255);
  box.style.background = 'rgb(' + r + ',' + g + ',' + b + ')';
});

sizeBtn.addEventListener('click', function () {
  size += 20;
  box.style.width = size + 'px';
  box.style.height = size + 'px';
});
