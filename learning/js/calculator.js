document.getElementById('calc').addEventListener('click', function () {
  let a = Number(document.getElementById('a').value);
  let b = Number(document.getElementById('b').value);
  let op = document.getElementById('op').value;
  let result;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/': result = a / b; break;
  }
  document.getElementById('result').textContent = result;
});
