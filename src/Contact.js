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

// ✅ CONTACT FORM
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('full-name').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    const button = contactForm.querySelector('button');

    button.textContent = 'Sending...';
    button.disabled = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message })
      });

      const data = await response.json();

      const popup = document.createElement('div');
      popup.className = `fixed top-5 left-1/2 -translate-x-1/2 ${data.success ? 'bg-[#e36d3b]' : 'bg-red-500'} text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-center`;
      popup.textContent = data.message;
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 4000);

      if (data.success) contactForm.reset();

    } catch (error) {
      const popup = document.createElement('div');
      popup.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-center';
      popup.textContent = 'Something went wrong. Please try again.';
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 4000);
    } finally {
      button.textContent = 'SEND';
      button.disabled = false;
    }
  });
}


document.addEventListener("DOMContentLoaded", function () {

    const instaImages = [
      "src/images/slide1.png",
      "src/images/slide2.png",
      "src/images/slide3.png",
      "src/images/slide4.png",
      "src/images/slide5.png",
      "src/images/hero-image.png",
    ];
  
    const track = document.getElementById("instaTrack");
    const prevBtn = document.getElementById("instaPrev");
    const nextBtn = document.getElementById("instaNext");
  
    let index = 0;
    const imageWidth = 250;
  
    const allImages = [...instaImages, ...instaImages];
  
    allImages.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.className = "w-[250px] h-[300px] object-cover";
      track.appendChild(img);
    });
  
    function moveSlider() {
      track.style.transform = `translateX(-${index * (imageWidth + 24)}px)`;
    }
  
    nextBtn.addEventListener("click", () => {
      index++;
      moveSlider();
  
      if (index === instaImages.length) {
        setTimeout(() => {
          track.classList.remove("transition-transform");
          index = 0;
          moveSlider();
          requestAnimationFrame(() => {
            track.classList.add("transition-transform");
          });
        }, 500);
      }
    });
  
    prevBtn.addEventListener("click", () => {
      if (index === 0) {
        track.classList.remove("transition-transform");
        index = instaImages.length;
        moveSlider();
        requestAnimationFrame(() => {
          track.classList.add("transition-transform");
        });
      }
  
      index--;
      moveSlider();
    });
});





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