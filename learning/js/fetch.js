let list = document.getElementById('jokes');

document.getElementById('load').addEventListener('click', function () {
  fetch('https://jsonplaceholder.typicode.com/todos?_limit=5')
    .then(function (res) {
      return res.json();
    })
    .then(function (todos) {
      list.innerHTML = '';
      for (let todo of todos) {
        let li = document.createElement('li');
        li.textContent = todo.title;
        list.appendChild(li);
      }
    })
    .catch(function (err) {
      list.textContent = 'failed to load: ' + err.message;
    });
});
