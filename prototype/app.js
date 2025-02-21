function renderGigs() {
  var grid = document.getElementById('gigs');
  grid.innerHTML = '';
  for (var i = 0; i < gigs.length; i++) {
    var g = gigs[i];
    var card = document.createElement('div');
    card.className = 'card';
    var img = document.createElement('img');
    img.src = g.img;
    img.alt = g.title;
    var title = document.createElement('h3');
    title.textContent = g.title;
    var price = document.createElement('p');
    price.className = 'price';
    price.textContent = 'Rs ' + g.price;
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(price);
    grid.appendChild(card);
  }
}

renderGigs();
