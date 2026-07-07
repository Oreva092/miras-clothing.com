const user = JSON.parse(localStorage.getItem('user'));
let sessionId = localStorage.getItem('sessionId');

if (!sessionId) {
  sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
}

const userId = (user && user.id) ? user.id : null;
let wishlistData = [];

function renderLoading(el) {
  el.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-[#e36d3b]" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <p class="font-poppins text-gray-400 text-sm mt-4">Loading your wishlist...</p>
    </div>`;
}

async function fetchWishlist() {
  const el = document.getElementById('wishlistContent');
  if (el) renderLoading(el);

  const query = userId ? `userId=${userId}` : `sessionId=${sessionId}`;
  try {
    const res = await fetch(`/api/wishlist?${query}`);
    const data = await res.json();
    if (data.success && data.wishlist && data.wishlist.items.length > 0) {
      wishlistData = data.wishlist.items;
    } else {
      wishlistData = [];
    }
    render();
  } catch (err) {
    console.error('Wishlist fetch error:', err);
    if (el) {
      el.innerHTML = `<p class="font-poppins text-center text-gray-400 py-20">Couldn't load your wishlist. Please refresh the page.</p>`;
    }
  }
}

function render() {
  const el = document.getElementById('wishlistContent');
  if (!el) return;

  if (wishlistData.length === 0) {
    el.innerHTML = `
      <div class="text-center py-20">
        <i class="ph ph-heart text-6xl text-gray-300"></i>
        <p class="font-poppins text-gray-500 mt-4 text-lg">Your wishlist is empty</p>
        <a href="shop.html" class="inline-block mt-6 bg-[#e36d3b] text-white font-poppins py-3 px-8 hover:bg-orange-700 transition">CONTINUE SHOPPING</a>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      ${wishlistData.map(item => `
        <div class="group relative bg-white border border-gray-100 p-4">
          <div class="relative overflow-hidden">
            <img src="${item.image}" class="w-full h-[300px] object-cover">
            <button data-id="${item.productId}" data-action="remove" class="wishlist-btn absolute top-3 right-3 bg-white p-2 shadow text-[#e36d3b] hover:text-red-500 transition">
              <i class="ph ph-trash text-xl"></i>
            </button>
          </div>
          <div class="mt-4 text-center">
            <h3 class="font-poppins font-medium text-sm">${item.title}</h3>
            <p class="font-poppins text-[#e36d3b] text-sm mt-1">₦${item.price.toLocaleString()},000</p>
            <button data-id="${item.productId}" data-title="${item.title}" data-price="${item.price}" data-image="${item.image}" data-action="addtocart" class="wishlist-btn mt-3 w-full py-2 text-sm bg-[#e36d3b] text-white font-poppins py-3 hover:bg-orange-700 transition">
              ADD TO CART
            </button>
          </div>
        </div>
      `).join('')}
    </div>
    <div class="mt-8">
      <a href="shop.html" class="font-poppins text-sm underline text-gray-500 hover:text-black transition">← Continue Shopping</a>
    </div>`;
}

async function removeFromWishlist(productId) {
  wishlistData = wishlistData.filter(i => i.productId != productId);
  render();
  await fetch('/api/wishlist/remove', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, userId, sessionId: userId ? null : sessionId })
  });
  loadWishlistCount();
}

async function addToCartFromWishlist(productId, title, price, image, btn) {
  try {
    if (btn) setButtonLoading(btn, true, '');
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        title,
        price,
        image,
        userId,
        sessionId: userId ? null : sessionId
      })
    });
    const data = await res.json();
    if (data.success) {
      showPopup(`${title} added to cart!`);
      loadCartCount();
    }
  } catch (err) {
    console.error('Add to cart error:', err);
  } finally {
    if (btn) setButtonLoading(btn, false);
  }
}

function setButtonLoading(button, isLoading, loadingText = 'Adding...') {
  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <span class="inline-flex items-center gap-2 justify-center w-full">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        ${loadingText}
      </span>`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

function showPopup(message) {
  const existing = document.getElementById('wishlistPopup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'wishlistPopup';
  popup.className = 'fixed top-20 right-4 bg-white shadow-xl border-l-4 border-[#e36d3b] px-5 py-4 z-50 flex items-center gap-3 rounded-md translate-x-[200%] transition-transform duration-500';
  popup.innerHTML = `
    <i class="ph ph-check-circle text-[#e36d3b] text-2xl"></i>
    <p class="font-poppins font-semibold text-sm">${message}</p>
    <button id="closePopup" class="ml-4 text-gray-400 hover:text-black"><i class="ph ph-x"></i></button>
  `;
  document.body.appendChild(popup);

  requestAnimationFrame(() => {
    popup.classList.remove('translate-x-[200%]');
    popup.classList.add('translate-x-0');
  });

  document.getElementById('closePopup').addEventListener('click', () => {
    popup.classList.add('translate-x-[200%]');
    setTimeout(() => popup.remove(), 500);
  });

  setTimeout(() => {
    if (document.getElementById('wishlistPopup')) {
      popup.classList.add('translate-x-[200%]');
      setTimeout(() => popup.remove(), 500);
    }
  }, 4000);
}

document.addEventListener('click', async e => {
  const btn = e.target.closest('.wishlist-btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const productId = btn.dataset.id;

  if (action === 'remove') {
    await removeFromWishlist(productId);
  }

  if (action === 'addtocart') {
    const title = btn.dataset.title;
    const price = parseFloat(btn.dataset.price);
    const image = btn.dataset.image;
    await addToCartFromWishlist(productId, title, price, image, btn);
  }
});

fetchWishlist();