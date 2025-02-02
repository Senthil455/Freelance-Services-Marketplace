// for, while and do while
for (let i = 1; i <= 5; i++) {
  console.log('count: ' + i);
}

let j = 0;
while (j < 3) {
  console.log('while loop ' + j);
  j++;
}

let k = 0;
do {
  console.log('do while ' + k);
  k++;
} while (k < 0);

let total = 0;
for (let n = 1; n <= 10; n++) {
  total += n;
}
console.log('sum of 1..10 = ' + total);
