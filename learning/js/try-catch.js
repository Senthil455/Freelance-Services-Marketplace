// try catch
function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.log('parse failed: ' + err.message);
    return null;
  }
}

console.log(safeParse('{"a":1}'));
console.log(safeParse('not json'));

let n = Math.floor(Math.random() * 6) + 1;
if (n === 1) {
  throw new Error('unlucky roll');
}
console.log('rolled: ' + n);
