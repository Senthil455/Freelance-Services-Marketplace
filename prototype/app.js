var currentCategory = 'all';

function renderCategories() {
  var box = document.getElementById('categories');
  box.innerHTML = '';
  for (var i = 0; i < categories.length; i++) {
    var btn = document.createElement('button');
    btn.textContent = categories[i];
    btn.className = 'cat-btn';
    btn.addEventListener('click', function () {
      currentCategory = this.textContent;
      renderAll();
    });
    box.appendChild(btn);
  }
}

function matchedGigs() {
  return gigs.filter(function (g) {
    return currentCategory === 'all' || g.category === currentCategory;
  });
}

function renderGigs() {
  var grid = document.getElementById('gigs');
  grid.innerHTML = '';
  var list = matchedGigs();
  for (var i = 0; i < list.length; i++) {
    var g = list[i];
    var card = document.createElement('div');
    card.className = 'card';
    var img = document.createElement('img');
    img.src = g.img;
    img.alt = g.title;
    var title = document.createElement('h3');
    title.textContent = g.title;
    var rating = document.createElement('p');
    rating.className = 'rating';
    rating.textContent = 'rating ' + g.rating;
    var price = document.createElement('p');
    price.className = 'price';
    price.textContent = 'Rs ' + g.price;
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

renderAll();
