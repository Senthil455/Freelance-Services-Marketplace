var id = new URLSearchParams(window.location.search).get('id');
var detail = document.getElementById('detail');

function findGig() {
  for (var i = 0; i < gigs.length; i++) {
    if (gigs[i].id === Number(id)) return gigs[i];
  }
  return null;
}

var gig = findGig();
if (!gig) {
  detail.innerHTML = '<p class=\'empty\'>gig not found</p>';
} else {
  detail.innerHTML = '';
  var img = document.createElement('img');
  img.src = gig.img;
  img.alt = gig.title;
  var title = document.createElement('h1');
  title.textContent = gig.title;
  var meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = 'category: ' + gig.category + ' | rating ' + gig.rating;
  var price = document.createElement('p');
  price.className = 'price';
  price.textContent = 'Rs ' + gig.price;
  var btn = document.createElement('button');
  btn.className = 'buy';
  btn.textContent = 'Purchase (static demo)';
  btn.addEventListener('click', function () {
    alert('this is just a static prototype - checkout comes later');
  });
  detail.appendChild(img);
  detail.appendChild(title);
  detail.appendChild(meta);
  detail.appendChild(price);
  detail.appendChild(btn);
}
