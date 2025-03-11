var currentCategory = 'all';
var currentSearch = '';
var sortBy = 'recommended';

function renderCategories() {
  var box = document.getElementById('categories');
  box.innerHTML = '';
  for (var i = 0; i < categories.length; i++) {
    var btn = document.createElement('button');
    btn.textContent = categories[i];
    btn.className = 'cat-btn';
    if (categories[i] === currentCategory) btn.classList.add('active');
    btn.addEventListener('click', function () {
      currentCategory = this.textContent;
      renderAll();
    });
    box.appendChild(btn);
  }
}

function matchedGigs() {
  return gigs.filter(function (g) {
    var okCategory = currentCategory === 'all' || g.category === currentCategory;
    var text = g.title.toLowerCase();
    var okSearch = currentSearch === '' || text.indexOf(currentSearch) !== -1;
    return okCategory && okSearch;
  });
}

function sortedGigs() {
  var list = matchedGigs();
  if (sortBy === 'price-low') {
    list = list.slice().sort(function (a, b) { return a.price - b.price; });
  } else if (sortBy === 'price-high') {
    list = list.slice().sort(function (a, b) { return b.price - a.price; });
  } else if (sortBy === 'rating') {
    list = list.slice().sort(function (a, b) { return b.rating - a.rating; });
  }
  return list;
}

function renderGigs() {
  var grid = document.getElementById('gigs');
  grid.innerHTML = '';
  var list = sortedGigs();
  var count = document.getElementById('count');
  count.textContent = list.length + ' gigs found';
  if (list.length === 0) {
    grid.innerHTML = '<p class=\'empty\'>no gigs match your search - try another keyword</p>';
    return;
  }
  for (var i = 0; i < list.length; i++) {
    var g = list[i];
    var card = document.createElement('a');
    card.className = 'card';
    card.href = 'gig.html?id=' + g.id;
    if (g.isNew) {
    var badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = 'NEW';
    card.appendChild(badge);
  }
  var img = document.createElement('img');
    img.src = g.img;
    img.alt = g.title;
    var title = document.createElement('h3');
    title.textContent = g.title;
    var price = document.createElement('p');
    price.className = 'price';
    price.textContent = 'Rs ' + g.price;
    var rating = document.createElement('p');
    rating.className = 'rating';
    rating.textContent = 'rating ' + g.rating;
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(rating);
    card.appendChild(price);
    grid.appendChild(card);
  }
}

function renderAll() {
  renderCategories();
  renderGigs();
}

var searchInput = document.getElementById('search');
searchInput.addEventListener('input', function () {
  currentSearch = searchInput.value.trim();
  renderGigs();
});

var sortSelect = document.getElementById('sort');
sortSelect.addEventListener('change', function () {
  sortBy = sortSelect.value;
  renderGigs();
});

document.addEventListener('keydown', function (e) {
  if (e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  }
});

renderAll();
