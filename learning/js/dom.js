let title = document.getElementById('title');
console.log(title.textContent);
title.textContent = 'changed by javascript';

let notes = document.getElementsByClassName('note');
console.log(notes.length);
for (let i = 0; i < notes.length; i++) {
  notes[i].style.color = 'blue';
}

let h1s = document.querySelectorAll('h1');
console.log(h1s.length);
console.log(document.querySelector('.note').textContent);
