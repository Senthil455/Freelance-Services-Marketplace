let input = document.getElementById('item');
let addBtn = document.getElementById('add');
let removeBtn = document.getElementById('remove');
let list = document.getElementById('list');

addBtn.addEventListener('click', function () {
  let value = input.value.trim();
  if (value === '') return;
  let li = document.createElement('li');
  li.textContent = value;
  list.appendChild(li);
  input.value = '';
});

removeBtn.addEventListener('click', function () {
  if (list.firstChild) {
    list.removeChild(list.firstChild);
  }
});
