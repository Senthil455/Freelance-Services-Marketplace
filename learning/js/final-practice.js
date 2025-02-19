// combining everything
// (small tidy up)
// process a list of gigs
let gigs = [
  { title: 'Website design', price: 1500, rating: 4.8 },
  { title: 'Logo design', price: 400, rating: 4.5 },
  { title: 'Mobile app UI', price: 2500, rating: 4.9 },
  { title: 'Poster design', price: 200, rating: 4.2 }
];

let titles = gigs.map(function (g) { return g.title; });
console.log(titles);

let cheap = gigs.filter(function (g) { return g.price < 1000; });
console.log(cheap);

let total = gigs.reduce(function (sum, g) { return sum + g.price; }, 0);
console.log('total value', total);

let best = gigs.find(function (g) { return g.rating > 4.8; });
console.log(best);

gigs.push({ title: 'SEO audit', price: 900, rating: 4.6 });
let sorted = gigs.slice().sort(function (a, b) { return b.price - a.price; });
console.log(sorted);
