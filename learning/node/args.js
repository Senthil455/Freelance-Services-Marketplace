const args = process.argv.slice(2);

const values = args.map(Number).filter((n) => !Number.isNaN(n));
const total = values.reduce((sum, n) => sum + n, 0);

console.log('numbers:', values.join(' + '));
console.log('total:', total);
