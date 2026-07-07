const header = document.getElementById('mainHeader');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    header.classList.add('opacity-0', 'translate-y-full');
  }
  if (currentScrollY < lastScrollY) {
    header.classList.remove('opacity-0', 'translate-y-full');
  }
  lastScrollY = currentScrollY;
});

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

// If not logged in, redirect to signin
if (!user) {
  window.location.href = '/signin.html';
}

// Display user info
const accountName = document.getElementById('accountName');
const accountEmail = document.getElementById('accountEmail');
const accountImage = document.getElementById('accountImage');

if (user) {
  document.getElementById('accountName').textContent = user.name;
  document.getElementById('accountEmail').textContent = user.email;

  if (user.avatar) {
    const img = document.getElementById('accountImage');
    img.src = user.avatar;
    img.classList.remove('hidden');
    document.getElementById('accountInitials').style.display = 'none';
    
    // Fallback to initials if image fails to load
    img.onerror = () => {
      img.classList.add('hidden');
      document.getElementById('accountInitials').style.display = 'block';
      document.getElementById('accountInitials').textContent = user.name.charAt(0).toUpperCase();
    };
  } else {
    document.getElementById('accountInitials').textContent = user.name.charAt(0).toUpperCase();
  }
}


// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = '/signin.html';
  });
}


// Show admin link if admin
const navAdminBtn = document.getElementById('navAdminBtn');
if (navAdminBtn && user && user.isAdmin) {
  navAdminBtn.classList.remove('hidden');
}


// Load cart count on every page
async function loadCartCount() {
  const user = JSON.parse(localStorage.getItem('user'));
  let sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }

  try {
    const query = user ? `userId=${user.id}` : `sessionId=${sessionId}`;
    const response = await fetch(`/api/cart?${query}`);
    const data = await response.json();

    if (data.success && data.cart && data.cart.items) {
      const totalCount = data.cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      if (totalCount > 0) {
        const cartIcon = document.querySelector('.ph-bag');

        if (cartIcon) {
          const wrapper = document.createElement('div');
          wrapper.className = 'relative inline-block';
          cartIcon.parentNode.insertBefore(wrapper, cartIcon);
          wrapper.appendChild(cartIcon);

          const badge = document.createElement('span');
          badge.id = 'cartBadge';
          badge.className = 'absolute -top-2 -right-2 bg-[#e36d3b] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-poppins';
          badge.textContent = totalCount;
          wrapper.appendChild(badge);
        }
      }
    }
  } catch (error) {
    console.error('Cart count error:', error);
  }
}

loadCartCount();



// Load orders
async function loadOrders() {
  if (!user || !user.id) return;

  try {
    const response = await fetch(`/api/orders?userId=${user.id}`);
    const data = await response.json();

    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    if (!data.success || data.orders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="text-center py-10">
          <i class="ph ph-package text-5xl text-gray-200"></i>
          <p class="font-poppins text-gray-400 mt-3 text-sm">No orders yet</p>
          <a href="shop.html" class="inline-block mt-4 bg-[#e36d3b] text-white font-poppins text-sm py-2 px-6 rounded-full hover:bg-orange-700 transition">Start Shopping</a>
        </div>`;
      return;
    }

    ordersContainer.innerHTML = `
      <div class="flex justify-between items-center mb-4 px-5">
        <p class="font-poppins text-sm text-gray-500">${data.orders.length} order${data.orders.length > 1 ? 's' : ''}</p>
        <button id="clearOrdersBtn" class="font-poppins text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-full transition">
          Clear All Orders
        </button>
      </div>
      ${data.orders.map(order => `
        <div class="border border-gray-100 rounded-xl p-4 mb-4">
          <div class="flex justify-between items-center mb-3">
            <span class="font-poppins text-xs text-gray-400">${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span class="bg-green-100 text-green-600 text-xs font-poppins px-3 py-1 rounded-full">✓ ${order.status}</span>
          </div>
          <div class="space-y-2 mb-3">
            ${order.items.map(item => `
              <div class="flex justify-between text-sm font-poppins">
                <span class="text-gray-600">${item.title} x${item.quantity}</span>
                <span class="text-gray-800">₦${(item.price * item.quantity).toLocaleString()},000</span>
              </div>
            `).join('')}
          </div>
          <div class="flex justify-between border-t pt-3">
            <span class="font-poppins text-sm font-semibold">Total</span>
            <span class="font-poppins text-sm font-semibold text-[#e36d3b]">₦${order.totalAmount.toLocaleString()},000</span>
          </div>
          <p class="font-poppins text-xs text-gray-400 mt-2">Ref: ${order.paystackReference}</p>
        </div>
      `).join('')}
    `;

    document.getElementById('clearOrdersBtn').addEventListener('click', async () => {
      if (!confirm('Are you sure you want to clear all orders?')) return;
      try {
        const res = await fetch('/api/orders/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        const result = await res.json();
        if (result.success) loadOrders();
      } catch (error) {
        console.error('Clear orders error:', error);
      }
    });

  } catch (error) {
    console.error('Load orders error:', error);
  }
}

loadOrders();