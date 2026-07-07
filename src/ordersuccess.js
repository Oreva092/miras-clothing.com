const user = JSON.parse(localStorage.getItem('user'));
const urlParams = new URLSearchParams(window.location.search);
const reference = urlParams.get('reference') || urlParams.get('trxref');

async function verifyPayment() {
  if (!reference) {
    showError();
    return;
  }

  try {
    const userId = (user && user.id) ? user.id : null;
    const sessionId = localStorage.getItem('sessionId');
    const query = userId ? `userId=${userId}` : `sessionId=${sessionId}`;

    const response = await fetch(`/api/payment/verify/${reference}?${query}`);
    
    if (!response.ok) {
      await showSuccessWithoutOrder(reference);
      return;
    }
    
    const data = await response.json();

    if (data.success) {
      showSuccess(data.order);
    } else {
      await showSuccessWithoutOrder(reference);
    }
  } catch (error) {
    console.error('Verify error:', error);
    await showSuccessWithoutOrder(reference);
  }
}

function clearCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = '';
    badge.classList.add('hidden');
  }
}

async function showSuccessWithoutOrder(ref) {
  const pendingTotal = localStorage.getItem('pendingOrderTotal');
  const pendingItems = JSON.parse(localStorage.getItem('pendingCartItems') || '[]');

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = (user && user.id) ? user.id : null;
  const sessionId = localStorage.getItem('sessionId');

  await fetch('/api/cart/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId: userId ? null : sessionId })
  });

  localStorage.removeItem('pendingOrderTotal');
  localStorage.removeItem('pendingCartItems');

  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('successState').classList.remove('hidden');
  document.getElementById('orderRef').textContent = `Reference: ${ref}`;
  document.getElementById('orderTotal').textContent = pendingTotal ? `₦${(parseInt(pendingTotal) / 1000).toLocaleString()},000` : '';

  const itemsEl = document.getElementById('orderItems');
  if (pendingItems.length > 0) {
    itemsEl.innerHTML = pendingItems.map(item => `
      <div class="flex justify-between items-center text-sm font-poppins">
        <span class="text-gray-600">${item.title} x${item.quantity || 1}</span>
        <span class="text-gray-800 font-medium">₦${(item.price * (item.quantity || 1)).toLocaleString()},000</span>
      </div>
    `).join('');
  } else {
    itemsEl.innerHTML = `<p class="font-poppins text-sm text-gray-500 text-center">Your payment was successful!</p>`;
  }

  clearCartBadge();
  loadCartCount();
}

function showSuccess(order) {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('successState').classList.remove('hidden');
  document.getElementById('orderRef').textContent = `Reference: ${order.paystackReference}`;
  document.getElementById('orderTotal').textContent = `₦${order.totalAmount.toLocaleString()},000`;

  const itemsEl = document.getElementById('orderItems');
  itemsEl.innerHTML = order.items.map(item => `
    <div class="flex justify-between items-center text-sm font-poppins">
      <span class="text-gray-600">${item.title} x${item.quantity}</span>
      <span class="text-gray-800 font-medium">₦${(item.price * item.quantity).toLocaleString()},000</span>
    </div>
  `).join('');

  clearCartBadge();
  loadCartCount();
}

function showError() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
}

verifyPayment();