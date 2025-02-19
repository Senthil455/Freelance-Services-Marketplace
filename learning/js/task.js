let tasks = [];
let list = document.getElementById('tasks');

function render() {
  list.innerHTML = '';
  tasks.forEach(function (task) {
    let li = document.createElement('li');
    let label = task.title + ' (' + task.priority + ')';
    li.textContent = label;
    let done = document.createElement('button');
    done.textContent = 'done';
    done.addEventListener('click', function () {
      li.style.textDecoration = 'line-through';
    });
    li.appendChild(done);
    list.appendChild(li);
  });
}

document.getElementById('add').addEventListener('click', function () {
  let title = document.getElementById('title').value.trim();
  if (!title) return;
  let priority = document.getElementById('priority').value;
  tasks.push({ title: title, priority: priority });
  render();
});
