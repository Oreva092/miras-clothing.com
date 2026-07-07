const user = JSON.parse(localStorage.getItem('user'));

// Redirect if not admin
if (!user || !user.isAdmin) {
  window.location.href = '/index.html';
}

// Tab switching
const tabs = document.querySelectorAll('.admin-tab');
const contents = document.querySelectorAll('.admin-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => {
      t.classList.remove('border-b-2', 'border-[#e36d3b]', 'text-[#e36d3b]');
      t.classList.add('text-gray-400');
    });
    tab.classList.add('border-b-2', 'border-[#e36d3b]', 'text-[#e36d3b]');
    tab.classList.remove('text-gray-400');

    contents.forEach(c => c.classList.add('hidden'));
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');

    if (tab.dataset.tab === 'orders') loadOrders();
    if (tab.dataset.tab === 'subscribers') loadSubscribers();
    if (tab.dataset.tab === 'users') loadUsers();
  });
});

// Load stats
async function loadStats() {
  try {
    const [products, orders, subscribers] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/admin/orders').then(r => r.json()),
      fetch('/api/admin/subscribers').then(r => r.json())
    ]);

    document.getElementById('totalProducts').textContent = products.products?.length || 0;
    document.getElementById('totalOrders').textContent = orders.orders?.length || 0;
    document.getElementById('totalSubscribers').textContent = subscribers.subscribers?.length || 0;

    const revenue = orders.orders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0;
    document.getElementById('totalRevenue').textContent = `₦${revenue.toLocaleString()}k`;
  } catch (error) {
    console.error('Stats error:', error);
  }
}

// Load products
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();

    const el = document.getElementById('productsList');
    if (!data.success || data.products.length === 0) {
      el.innerHTML = `<p class="font-poppins text-gray-400 text-center py-10">No products found</p>`;
      return;
    }

    el.innerHTML = `
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">PRODUCT</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">BRAND</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">PRICE</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">STATUS</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${data.products.map(product => `
            <tr class="border-t border-gray-50 hover:bg-gray-50 transition">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img src="${product.image}" class="w-10 h-12 object-cover rounded">
                  <p class="font-poppins text-sm font-medium">${product.title}</p>
                </div>
              </td>
              <td class="px-4 py-3 font-poppins text-sm text-gray-500">${product.brand}</td>
              <td class="px-4 py-3 font-poppins text-sm text-[#e36d3b]">₦${product.price},000</td>
              <td class="px-4 py-3">
                <span class="font-poppins text-xs px-2 py-1 rounded-full ${product.soldOut ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}">
                  ${product.soldOut ? 'Sold Out' : 'Active'}
                </span>
              </td>
              <td class="px-4 py-3">
                <button onclick="deleteProduct('${product._id}')" class="font-poppins text-xs text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-full transition">
                  Delete
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load products error:', error);
  }
}

// Delete product
window.deleteProduct = async function(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (data.success) {
      showToast('Product deleted!');
      loadProducts();
      loadStats();
    }
  } catch (error) {
    console.error('Delete error:', error);
  }
};

// Add product
document.getElementById('addProductBtn').addEventListener('click', () => {
  document.getElementById('addProductForm').classList.toggle('hidden');
});

document.getElementById('cancelProductBtn').addEventListener('click', () => {
  document.getElementById('addProductForm').classList.add('hidden');
});

document.getElementById('saveProductBtn').addEventListener('click', async () => {
  const title = document.getElementById('pTitle').value;
  const brand = document.getElementById('pBrand').value;
  const price = document.getElementById('pPrice').value;
  const image = document.getElementById('pImage').value;
  const category = document.getElementById('pCategory').value;
  const rating = document.getElementById('pRating').value;
  const description = document.getElementById('pDescription').value;
  const isNewArrival = document.getElementById('pIsNew').checked;
  const soldOut = document.getElementById('pSoldOut').checked;

  if (!title || !brand || !price || !image) {
    showToast('Please fill all required fields!', true);
    return;
  }

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, brand, price: parseFloat(price), image, category, rating: parseInt(rating), description, isNewArrival, soldOut })
    });
    const data = await response.json();
    if (data.success) {
      showToast('Product added successfully!');
      document.getElementById('addProductForm').classList.add('hidden');
      loadProducts();
      loadStats();
    }
  } catch (error) {
    console.error('Add product error:', error);
  }
});

// Load orders
async function loadOrders() {
  try {
    const response = await fetch('/api/admin/orders');
    const data = await response.json();

    const el = document.getElementById('ordersList');
    if (!data.success || data.orders.length === 0) {
      el.innerHTML = `<p class="font-poppins text-gray-400 text-center py-10">No orders yet</p>`;
      return;
    }

    el.innerHTML = `
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">EMAIL</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">ITEMS</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">TOTAL</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">DATE</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">STATUS</th>
          </tr>
        </thead>
        <tbody>
          ${data.orders.map(order => `
            <tr class="border-t border-gray-50 hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-poppins text-sm">${order.email}</td>
              <td class="px-4 py-3 font-poppins text-sm text-gray-500">${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
              <td class="px-4 py-3 font-poppins text-sm text-[#e36d3b]">₦${order.totalAmount?.toLocaleString() || 0},000</td>
              <td class="px-4 py-3 font-poppins text-sm text-gray-500">${new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
              <td class="px-4 py-3">
                <span class="bg-green-100 text-green-600 text-xs font-poppins px-2 py-1 rounded-full">✓ ${order.status}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load orders error:', error);
  }
}

// Load subscribers
async function loadSubscribers() {
  try {
    const response = await fetch('/api/admin/subscribers');
    const data = await response.json();

    const el = document.getElementById('subscribersList');
    if (!data.success || data.subscribers.length === 0) {
      el.innerHTML = `<p class="font-poppins text-gray-400 text-center py-10">No subscribers yet</p>`;
      return;
    }

    el.innerHTML = `
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">EMAIL</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">DATE SUBSCRIBED</th>
          </tr>
        </thead>
        <tbody>
          ${data.subscribers.map(sub => `
            <tr class="border-t border-gray-50 hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-poppins text-sm">${sub.email}</td>
              <td class="px-4 py-3 font-poppins text-sm text-gray-500">${new Date(sub.subscribedAt).toLocaleDateString('en-GB')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load subscribers error:', error);
  }
}

// Load users
async function loadUsers() {
  try {
    const response = await fetch('/api/admin/users');
    const data = await response.json();

    const el = document.getElementById('usersList');
    if (!data.success || data.users.length === 0) {
      el.innerHTML = `<p class="font-poppins text-gray-400 text-center py-10">No users yet</p>`;
      return;
    }

    el.innerHTML = `
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">NAME</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">EMAIL</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">ROLE</th>
            <th class="font-poppins text-left px-4 py-3 text-xs text-gray-500">JOINED</th>
          </tr>
        </thead>
        <tbody>
          ${data.users.map(u => `
            <tr class="border-t border-gray-50 hover:bg-gray-50 transition">
              <td class="px-4 py-3 font-poppins text-sm font-medium">${u.name}</td>
              <td class="px-4 py-3 font-poppins text-sm text-gray-500">${u.email}</td>
              <td class="px-4 py-3">
                <span class="font-poppins text-xs px-2 py-1 rounded-full ${u.isAdmin ? 'bg-[#fff0eb] text-[#e36d3b]' : 'bg-gray-100 text-gray-500'}">
                  ${u.isAdmin ? 'Admin' : 'User'}
                </span>
              </td>
              <td class="px-4 py-3 font-poppins text-sm text-gray-500">${new Date(u.createdAt).toLocaleDateString('en-GB')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Load users error:', error);
  }
}

// Toast notification
function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `fixed top-5 left-1/2 -translate-x-1/2 ${isError ? 'bg-red-500' : 'bg-[#e36d3b]'} text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-sm`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Initialize
loadStats();
loadProducts();