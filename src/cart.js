async function loadCartCount() {
  const user = JSON.parse(localStorage.getItem('user'));
  let sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }

  try {
    const query = (user && user.id) ? `userId=${user.id}` : `sessionId=${sessionId}`;
    const response = await fetch(`/api/cart?${query}`);
    const data = await response.json();

    if (data.success && data.cart && data.cart.items) {
      const totalCount = data.cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      let badge = document.getElementById('cartBadge');
      const cartIcon = document.querySelector('.ph-bag');

      if (cartIcon && !badge) {
        const wrapper = document.createElement('div');
        wrapper.className = 'relative inline-block';
        cartIcon.parentNode.insertBefore(wrapper, cartIcon);
        wrapper.appendChild(cartIcon);

        badge = document.createElement('span');
        badge.id = 'cartBadge';
        badge.className = 'absolute -top-2 -right-2 bg-[#e36d3b] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-poppins';
        wrapper.appendChild(badge);
      }

      if (badge) {
        if (totalCount > 0) {
          badge.textContent = totalCount;
          badge.classList.remove('hidden');
        } else {
          badge.textContent = '';
          badge.classList.add('hidden');
        }
      }
    }
  } catch (error) {
    console.error('Cart count error:', error);
  }
}

loadCartCount();