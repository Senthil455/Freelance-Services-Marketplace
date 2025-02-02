// array methods
let nums = [3, 1, 4, 1, 5];
nums.push(9);
nums.pop();
nums.unshift(0);
nums.shift();
console.log(nums);

let more = [7, 8];
let combined = nums.concat(more);
console.log(combined);
console.log(combined.indexOf(4));
console.log(combined.includes(99));
console.log(combined.join('-'));
console.log(combined.reverse());
console.log(combined.sort());
