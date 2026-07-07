const user = JSON.parse(localStorage.getItem('user'));
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
}

const userId = (user && user.id) ? user.id : null;

let cartData = [];

function renderLoading(el) {
  el.innerHTML = `
    <div class="flex flex-col items-center justify-center py-20">
      <svg class="animate-spin h-8 w-8 text-[#e36d3b]" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <p class="font-poppins text-gray-400 text-sm mt-4">Loading your cart...</p>
    </div>`;
}

function setButtonLoading(button, isLoading, loadingText = 'Loading...') {
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

async function fetchCart() {
  const el = document.getElementById('cartContent');
  if (el) renderLoading(el);

  try {
    const query = userId ? `userId=${userId}` : `sessionId=${sessionId}`;
    const res = await fetch(`/api/cart?${query}`);
    const data = await res.json();
    if (data.success && data.cart && data.cart.items.length > 0) {
      cartData = data.cart.items;
    } else {
      cartData = [];
    }
    render();
  } catch (error) {
    console.error('Fetch cart error:', error);
    if (el) {
      el.innerHTML = `<p class="font-poppins text-center text-gray-400 py-20">Couldn't load your cart. Please refresh the page.</p>`;
    }
  }
}

function render() {
  const el = document.getElementById('cartContent');
  if (!el) return;

  if (cartData.length === 0) {
    el.innerHTML = `
      <div class="text-center py-20">
        <i class="ph ph-shopping-cart text-6xl text-gray-300"></i>
        <p class="font-poppins text-gray-500 mt-4 text-lg">Your cart is empty</p>
        <a href="shop.html" class="inline-block mt-6 bg-[#e36d3b] text-white font-poppins py-3 px-8 hover:bg-orange-700 transition">CONTINUE SHOPPING</a>
      </div>`;
    return;
  }

  const total = cartData.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  el.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10 px-4 md:max-w-5xl md:mx-auto">
      <div class="lg:col-span-2">
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="font-poppins text-left py-3 text-sm font-semibold">PRODUCT</th>
              <th class="font-poppins text-center py-3 text-sm font-semibold">QTY</th>
              <th class="font-poppins text-right py-3 text-sm font-semibold">TOTAL</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${cartData.map(item => {
              const qty = item.quantity || 1;
              const price = item.price || 0;
              return `
                <tr class="border-b">
                  <td class="py-4">
                    <div class="flex items-center gap-4">
                      <img src="${item.image}" class="w-16 h-20 object-cover rounded">
                      <div>
                        <p class="font-poppins font-medium text-sm">${item.title}</p>
                        <p class="font-poppins text-[#e36d3b] text-sm mt-1">₦${price.toLocaleString()},000</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4">
                    <div class="flex items-center justify-center gap-2">
                      <button data-id="${item.productId}" data-action="dec" class="qty-btn w-7 h-7 border flex items-center justify-center hover:bg-black hover:text-white transition font-poppins text-lg">−</button>
                      <span class="font-poppins text-sm w-6 text-center">${qty}</span>
                      <button data-id="${item.productId}" data-action="inc" class="qty-btn w-7 h-7 border flex items-center justify-center hover:bg-black hover:text-white transition font-poppins text-lg">+</button>
                    </div>
                  </td>
                  <td class="py-4 text-right">
                    <p class="font-poppins font-medium text-sm">₦${(price * qty).toLocaleString()},000</p>
                  </td>
                  <td class="py-4 text-right">
                    <button data-id="${item.productId}" data-action="remove" class="qty-btn text-gray-300 hover:text-red-500 transition">
                      <i class="ph ph-trash text-xl"></i>
                    </button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="mt-6">
          <a href="shop.html" class="font-poppins text-sm underline text-gray-500 hover:text-black transition">← Continue Shopping</a>
        </div>
      </div>

      <div class="bg-[#fafafa] p-6 h-fit">
        <h3 class="font-poppins font-semibold text-lg mb-6 border-b pb-4">ORDER SUMMARY</h3>
        <div class="flex justify-between mb-3">
          <p class="font-poppins text-sm text-gray-500">Subtotal</p>
          <p class="font-poppins text-sm font-medium">₦${total.toLocaleString()},000</p>
        </div>
        <div class="flex justify-between mb-3">
          <p class="font-poppins text-sm text-gray-500">Shipping</p>
          <p class="font-poppins text-sm text-green-500">FREE</p>
        </div>
        <div class="flex justify-between border-t pt-4 mt-4">
          <p class="font-poppins font-semibold">Total</p>
          <p class="font-poppins font-semibold text-[#e36d3b]">₦${total.toLocaleString()},000</p>
        </div>
        <button data-action="checkout" class="qty-btn w-full mt-6 bg-[#e36d3b] text-white font-poppins py-3 hover:bg-orange-700 transition tracking-wider">
          PROCEED TO CHECKOUT
        </button>
        <p class="font-poppins text-xs text-gray-400 text-center mt-3">Secure checkout powered by Paystack</p>
      </div>
    </div>`;
}

document.addEventListener('click', async e => {
  const btn = e.target.closest('.qty-btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const productId = btn.dataset.id;

  if (action === 'inc') {
    const item = cartData.find(i => i.productId == productId);
    if (item) item.quantity = (item.quantity || 1) + 1;
    render();
    await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, change: 1, userId, sessionId: userId ? null : sessionId })
    });
  }

  if (action === 'dec') {
    const item = cartData.find(i => i.productId == productId);
    if (item && (item.quantity || 1) > 1) {
      item.quantity = (item.quantity || 1) - 1;
      render();
      await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, change: -1, userId, sessionId: userId ? null : sessionId })
      });
    }
  }

  if (action === 'remove') {
    cartData = cartData.filter(i => i.productId != productId);
    render();
    await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, userId, sessionId: userId ? null : sessionId })
    });
    loadCartCount();
  }

  if (action === 'checkout') {
    if (!user) {
      window.location.href = '/signin.html';
      return;
    }

    setButtonLoading(btn, true, 'Processing...');

    const total = cartData.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

    localStorage.setItem('pendingOrderTotal', total * 1000);
    localStorage.setItem('pendingCartItems', JSON.stringify(cartData));

    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          amount: total * 1000,
          cartItems: cartData.map(item => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity || 1
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.data.authorization_url;
      } else {
        setButtonLoading(btn, false);
        alert('Payment initialization failed. Please try again.');
      }

    } catch (error) {
      setButtonLoading(btn, false);
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
    }
  }
});

fetchCart();


window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    fetchCart();
  }
});