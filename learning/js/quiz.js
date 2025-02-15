let questions = [
  { q: 'what is 2 + 2?', options: [3, 4, 5], answer: 1 },
  { q: 'controller of a webpage?', options: ['HTML', 'CSS', 'JavaScript'], answer: 2 },
  { q: 'loops run:', options: ['once', 'multiple times', 'maybe once'], answer: 1 }
];
let index = 0;
let score = 0;
let questionEl = document.getElementById('question');
let optionEls = document.querySelectorAll('.opt');
let scoreEl = document.getElementById('score');

function show() {
  if (index >= questions.length) {
    questionEl.textContent = 'done! score ' + score;
    return;
  }
  let current = questions[index];
  questionEl.textContent = current.q;
  for (let i = 0; i < optionEls.length; i++) {
    optionEls[i].textContent = current.options[i];
    optionEls[i].dataset.index = i;
  }
}

for (let i = 0; i < optionEls.length; i++) {
  optionEls[i].addEventListener('click', function () {
    let current = questions[index];
    if (Number(this.dataset.index) === current.answer) score++;
    index++;
    show();
  });
}

show();
