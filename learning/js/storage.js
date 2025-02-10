let out = document.getElementById('out');

document.getElementById('save').addEventListener('click', function () {
  let name = document.getElementById('name').value;
  localStorage.setItem('user_name', name);
  out.textContent = 'saved: ' + name;
});

document.getElementById('load').addEventListener('click', function () {
  let name = localStorage.getItem('user_name');
  out.textContent = name ? name : 'nothing stored yet';
});

document.getElementById('clear').addEventListener('click', function () {
  localStorage.removeItem('user_name');
  out.textContent = 'cleared';
});
