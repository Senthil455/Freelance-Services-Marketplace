// async await
async function getUsers() {
  let res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3');
  let users = await res.json();
  for (let u of users) {
    console.log(u.name + ' - ' + u.email);
  }
}

getUsers().catch(function (err) {
  console.log('error', err);
});
