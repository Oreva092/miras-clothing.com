window.loadWishlistCount = async function() {
    const user = JSON.parse(localStorage.getItem('user'));
    let sessionId = localStorage.getItem('sessionId');
  
    if (!sessionId) {
      sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
  
    try {
      const query = (user && user.id) ? `userId=${user.id}` : `sessionId=${sessionId}`;
      const response = await fetch(`/api/wishlist?${query}`);
      const data = await response.json();
  
      if (data.success && data.wishlist && data.wishlist.items) {
        const totalCount = data.wishlist.items.length;
        const heartIcon = document.getElementById('navHeart');
  
        let badge = document.getElementById('wishlistBadge');
  
        if (heartIcon && !badge) {
          const wrapper = document.createElement('div');
          wrapper.className = 'relative inline-block';
          heartIcon.parentNode.insertBefore(wrapper, heartIcon);
          wrapper.appendChild(heartIcon);
  
          badge = document.createElement('span');
          badge.id = 'wishlistBadge';
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
      console.error('Wishlist count error:', error);
    }
}
  
loadWishlistCount();