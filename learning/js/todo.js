let tasks = [];
let input = document.getElementById('task');
let list = document.getElementById('tasks');

function render() {
  list.innerHTML = '';
  for (let i = 0; i < tasks.length; i++) {
    let li = document.createElement('li');
    li.textContent = tasks[i];
    list.appendChild(li);
  }
}

document.getElementById('add').addEventListener('click', function () {
  let value = input.value.trim();
  if (value === '') return;
  tasks.push(value);
  input.value = '';
  render();
});

render();
