let form = document.getElementById('signup');
let message = document.getElementById('message');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  let name = document.getElementById('name').value;
  let email = document.getElementById('email').value;
  if (name === '' || email === '') {
    message.textContent = 'please fill everything';
    return;
  }
  message.textContent = 'thanks ' + name + '! check ' + email;
});
