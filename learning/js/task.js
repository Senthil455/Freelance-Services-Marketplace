let tasks = [];
let list = document.getElementById('tasks');

function addTask(title, priority) {
  tasks.push({ title: title, priority: priority });
}

function createTaskElement(task) {
  let li = document.createElement('li');
  li.textContent = task.title + ' (' + task.priority + ')';
  return li;
}

function render() {
  list.innerHTML = '';
  tasks.forEach(function (task) {
    let li = createTaskElement(task);
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
  addTask(title, document.getElementById('priority').value);
  render();
});
