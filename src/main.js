import './style.css'

// Mobile menu
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (openBtn && closeBtn && mobileMenu) {
  function openMenu() {
    mobileMenu.classList.remove('max-h-0', 'opacity-0');
    mobileMenu.classList.add('max-h-[500px]', 'opacity-100');
    document.body.classList.add('overflow-hidden');
    openBtn.classList.add('hidden');
    closeBtn.classList.remove('hidden');
  }

  function closeMenu() {
    mobileMenu.classList.add('max-h-0', 'opacity-0');
    mobileMenu.classList.remove('max-h-[500px]', 'opacity-100');
    document.body.classList.remove('overflow-hidden');
    closeBtn.classList.add('hidden');
    openBtn.classList.remove('hidden');
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  const menuLinks = mobileMenu.querySelectorAll('a');
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Promo bar
const promoBar = document.getElementById('promoBar');
const closePromo = document.getElementById('closePromo');
const header = document.getElementById('mainHeader');

function adjustHeader() {
  if (promoBar && promoBar.offsetHeight) {
    header.style.top = promoBar.offsetHeight + 'px';
  }
}

if (promoBar) adjustHeader();

if (closePromo) {
  closePromo.addEventListener('click', () => {
    promoBar.remove();
    header.style.top = '0px';
  });
}

window.addEventListener('resize', adjustHeader);

// Scroll hide/show header
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



// Scroll to top button
const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.remove('opacity-0', 'pointer-events-none');
      scrollTopBtn.classList.add('opacity-100');
    } else {
      scrollTopBtn.classList.add('opacity-0', 'pointer-events-none');
      scrollTopBtn.classList.remove('opacity-100');
    }
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}




// New arrivals title animation
const title = document.getElementById('newArrivalTitle');
if (title) {
  const Observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        title.classList.remove('opacity-0', 'scale-50', '-rotate-180');
        title.classList.add('opacity-100', 'scale-100', '-rotate-12');
      }
    });
  }, { threshold: 0.5 });
  Observer.observe(title);
}


// Scroll reveal system
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal-active');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

function observeReveals() {
  document.querySelectorAll('.reveal:not(.reveal-active)').forEach(el => {
    revealObserver.observe(el);
  });
}

observeReveals();




// Homepage products
let products = [];

async function fetchHomeProducts() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    if (data.success) {
      products = data.products.map(p => ({
        id: p._id,
        name: p.title,
        brand: p.brand,
        price: p.price,
        image: p.image,
        rating: p.rating,
        isNew: p.isNewArrival,
        soldOut: p.soldOut
      }));
      renderProducts(getNewArrivals());
    }
  } catch (error) {
    console.error('Fetch products error:', error);
  }
}

function getNewArrivals() {
  return products.filter(p => p.isNew && !p.soldOut);
}

function getHomepageAllView() {
  const newArrivals = getNewArrivals();
  const others = products.filter(p => !p.isNew && !p.soldOut);
  return [...newArrivals, ...others].slice(0, 6);
}

const productGrid = document.getElementById("productGrid");

function renderProducts(list) {
  if (!productGrid) return;
  productGrid.innerHTML = "";
  list.forEach((product, index) => {
    const isSold = product.soldOut;

    productGrid.innerHTML += `
      <div class="group relative reveal ${isSold ? 'opacity-60 pointer-events-none' : ''}" style="transition-delay: ${index * 60}ms">
        <div class="relative overflow-hidden">
          <img src="${product.image}" class="w-full object-cover" />
          ${isSold ? `<span class="absolute top-3 left-3 bg-gray-800 text-white text-xs px-2 py-1">SOLD OUT</span>` : product.isNew ? `<span class="absolute top-3 left-3 bg-teal-500 text-white text-xs px-2 py-1">NEW STOCK</span><span class="absolute top-12 left-3 bg-[#ff8e78] text-white text-xs px-2 py-1">SALE 13%</span>` : ""}
          ${!isSold ? `
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition">
            <button class="add-to-cart-btn bg-white py-2 px-3 rounded-full" data-id="${product.id}" data-title="${product.name}" data-price="${product.price}" data-image="${product.image}">
              <i class="ph ph-bag"></i>
            </button>
            <button class="add-to-wishlist-btn bg-white py-2 px-3 rounded-full" data-id="${product.id}" data-title="${product.name}" data-price="${product.price}" data-image="${product.image}">
              <i class="ph ph-heart"></i>
            </button>
          </div>
          ` : ""}
        </div>
        <div class="text-center mt-4">
          <p class="text-xs text-gray-400 font-poppins">BRAND: ${product.brand}</p>
          <div class="flex justify-center my-2 text-yellow-500 text-xl">${"★".repeat(product.rating)}${"☆".repeat(5 - product.rating)}</div>
          <h3 class="font-medium font-poppins">${product.name}</h3>
          <p class="font-poppins font-medium text-red-500 mt-1">₦${product.price},000</p>
        </div>
      </div>
    `;
  });
  observeReveals();
}

if (productGrid) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('bg-black', 'text-white'));
      btn.classList.add('bg-black', 'text-white');
      const filter = btn.dataset.filter;
      if (filter === "new") {
        renderProducts(getNewArrivals());
      } else {
        renderProducts(getHomepageAllView());
      }
    });
  });
  fetchHomeProducts();
}

// Video player
const video = document.getElementById('fashionVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const overlay = document.getElementById('videoOverlay');

if (video && playPauseBtn) {
  function showPlayUI() {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    playPauseBtn.classList.remove('opacity-0');
    overlay.classList.remove('pointer-events-none');
  }

  function showPauseUI() {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    playPauseBtn.classList.add('opacity-0');
    overlay.classList.add('pointer-events-none');
  }

  playPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.paused ? video.play() : video.pause();
  });

  video.addEventListener('click', () => {
    if (!video.paused) video.pause();
  });

  video.addEventListener('play', showPauseUI);
  video.addEventListener('pause', showPlayUI);

  const videoObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting && !video.paused) video.pause();
    },
    { threshold: 0.4 }
  );
  videoObserver.observe(video);
}

// Brand logo slider
const logoTrack = document.getElementById('logoTrack');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

if (logoTrack && nextBtn && prevBtn) {
  const logos = logoTrack.children;
  const visibleCount = 6;
  let index = 0;
  const logoWidth = logos[0].offsetWidth + 64;

  function moveSlider() {
    logoTrack.style.transform = `translateX(-${index * logoWidth}px)`;
  }

  nextBtn.addEventListener('click', () => {
    index++;
    moveSlider();
    if (index === visibleCount) {
      setTimeout(() => {
        logoTrack.classList.remove('transition-transform');
        index = 0;
        moveSlider();
        requestAnimationFrame(() => logoTrack.classList.add('transition-transform'));
      }, 500);
    }
  });

  prevBtn.addEventListener('click', () => {
    if (index === 0) {
      logoTrack.classList.remove('transition-transform');
      index = visibleCount;
      moveSlider();
      requestAnimationFrame(() => logoTrack.classList.add('transition-transform'));
    }
    index--;
    moveSlider();
  });
}

// Blog cards
const blogData = [
  { date: "Nov 24, 2025", title: "The Return of Tailored Minimalism", desc: "Sharp silhouettes and neutral palettes are redefining everyday elegance. This season is about clean lines, refined fabrics, and effortless confidence.", image: "src/images/blog1.png" },
  { date: "Dec 10, 2025", title: "Statement Accessories That Elevate Any Look", desc: "From sculptural handbags to bold metallic accents, discover the pieces transforming simple outfits into unforgettable statements.", image: "src/images/blog2.png" },
  { date: "Jan 10, 2026", title: "Soft Layers for Transitional Weather", desc: "Lightweight knits, structured blazers, and flowing textures come together for a layered approach that balances comfort with sophistication.", image: "src/images/blog3.png" }
];

const blogContainer = document.getElementById("blogContainer");
if (blogContainer) {
  blogData.forEach(post => {
    const card = document.createElement('div');
    card.className = 'group';
    card.innerHTML = `
      <div class="overflow-hidden">
        <img src="${post.image}" alt="${post.title}" class="w-full h-52 object-cover transition-transform duration-700 ease-out group-hover:scale-110">
      </div>
      <p class="text-gray-500 text-sm mt-6">${post.date}</p>
      <h3 class="font-poppins text-lg font-medium mt-3 leading-snug hover:text-[#e36d3b] transition ease-in cursor-pointer">${post.title}</h3>
      <p class="font-poppins text-sm text-gray-500 mt-4 leading-relaxed">${post.desc}</p>
      <button class="mt-6 px-6 py-2 border hover:bg-[#e36d3b] transition ease-in hover:text-white"><a href="blog.html">Read more</a></button>
    `;
    blogContainer.appendChild(card);
  });
}

// Instagram slider
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
  const instaPrev = document.getElementById("instaPrev");
  const instaNext = document.getElementById("instaNext");

  if (!track || !instaPrev || !instaNext) return;

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

  instaNext.addEventListener("click", () => {
    index++;
    moveSlider();
    if (index === instaImages.length) {
      setTimeout(() => {
        track.classList.remove("transition-transform");
        index = 0;
        moveSlider();
        requestAnimationFrame(() => track.classList.add("transition-transform"));
      }, 500);
    }
  });

  instaPrev.addEventListener("click", () => {
    if (index === 0) {
      track.classList.remove("transition-transform");
      index = instaImages.length;
      moveSlider();
      requestAnimationFrame(() => track.classList.add("transition-transform"));
    }
    index--;
    moveSlider();
  });
});

// Navbar user
const user = JSON.parse(localStorage.getItem('user'));
const icon = document.getElementById('userIcon');
const navUserGreeting = document.getElementById('navUserGreeting');
const navLogoutBtn = document.getElementById('navLogoutBtn');

if (user) {
  if (icon) {
    icon.style.display = 'none';
    const initialsDiv = document.createElement('div');
    initialsDiv.className = 'w-8 h-8 rounded-full bg-[#e36d3b] flex items-center justify-center text-white text-sm font-bold cursor-pointer';
    initialsDiv.textContent = user.name.charAt(0).toUpperCase();
    icon.parentElement.insertBefore(initialsDiv, icon);
  }
  if (navUserGreeting) navUserGreeting.textContent = `Hi, ${user.name.split(' ')[0]}!`;
  if (navLogoutBtn) {
    navLogoutBtn.classList.remove('hidden');
    navLogoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      window.location.href = '/signin.html';
    });
  }
} else {
  if (navLogoutBtn) navLogoutBtn.classList.add('hidden');
}

// Show admin link if admin
const navAdminBtn = document.getElementById('navAdminBtn');
if (navAdminBtn && user && user.isAdmin) {
  navAdminBtn.classList.remove('hidden');
}




// Subscribe form
const subscribeForm = document.getElementById('subscribeForm');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const button = subscribeForm.querySelector('button');
    button.textContent = 'Subscribing...';
    button.disabled = true;

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (data.success) {
        const popup = document.createElement('div');
        popup.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-[#e36d3b] text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-center transition-all duration-500';
        popup.textContent = data.message;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 4000);
        subscribeForm.reset();
      } else {
        const popup = document.createElement('div');
        popup.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-center';
        popup.textContent = data.message;
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 4000);
      }
    } catch (error) {
      const popup = document.createElement('div');
      popup.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-center';
      popup.textContent = 'Something went wrong. Please try again.';
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 4000);
    } finally {
      button.textContent = 'SUBSCRIBE';
      button.disabled = false;
    }
  });
}



// Homepage add to cart
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.add-to-cart-btn');
  if (!btn) return;

  const productId = btn.dataset.id;
  const title = btn.dataset.title;
  const price = parseFloat(btn.dataset.price);
  const image = btn.dataset.image;

  const user = JSON.parse(localStorage.getItem('user'));
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }

  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        title,
        price,
        image,
        userId: (user && user.id) ? user.id : null,
        sessionId: (user && user.id) ? null : sessionId
      })
    });
    const data = await response.json();
    if (data.success) {
      showHomeNotification(title, 'cart');
      updateCartCount(data.cart.items);
    }
  } catch (error) {
    console.error('Add to cart error:', error);
  }
});

// Homepage add to wishlist
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.add-to-wishlist-btn');
  if (!btn) return;

  const productId = btn.dataset.id;
  const title = btn.dataset.title;
  const price = parseFloat(btn.dataset.price);
  const image = btn.dataset.image;

  const user = JSON.parse(localStorage.getItem('user'));
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }

  try {
    const response = await fetch('/api/wishlist/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        title,
        price,
        image,
        userId: (user && user.id) ? user.id : null,
        sessionId: (user && user.id) ? null : sessionId
      })
    });
    const data = await response.json();
    if (data.success) {
      btn.style.color = '#e36d3b';
      btn.style.background = '#fff0eb';
      showHomeNotification(title, 'wishlist');
      loadWishlistCount();
    } else {
      showHomeNotification(data.message, 'error');
    }
  } catch (error) {
    console.error('Wishlist error:', error);
  }
});

// Notification for homepage
function showHomeNotification(message, type) {
  const existing = document.getElementById('homeNotification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'homeNotification';
  notification.className = `fixed top-20 right-4 bg-white shadow-xl border-l-4 ${type === 'error' ? 'border-gray-400' : 'border-[#e36d3b]'} px-5 py-4 z-50 flex items-center gap-3 rounded-md translate-x-[200%] transition-transform duration-500`;
  notification.innerHTML = `
    <i class="ph ${type === 'wishlist' ? 'ph-heart' : type === 'error' ? 'ph-warning' : 'ph-check-circle'} text-[#e36d3b] text-2xl"></i>
    <div>
      <p class="font-poppins font-semibold text-sm">${message}</p>
      <p class="font-poppins text-xs text-gray-500">${type === 'cart' ? 'Added to cart' : type === 'wishlist' ? 'Added to wishlist' : ''}</p>
    </div>
    <button id="closeHomeNotification" class="ml-4 text-gray-400 hover:text-black"><i class="ph ph-x"></i></button>
  `;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.remove('translate-x-[200%]');
    notification.classList.add('translate-x-0');
  });

  document.getElementById('closeHomeNotification').addEventListener('click', () => {
    notification.classList.add('translate-x-[200%]');
    setTimeout(() => notification.remove(), 500);
  });

  setTimeout(() => {
    if (document.getElementById('homeNotification')) {
      notification.classList.add('translate-x-[200%]');
      setTimeout(() => notification.remove(), 500);
    }
  }, 4000);
}

// Update cart count
function updateCartCount(items) {
  if (!items || !Array.isArray(items)) return;
  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

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
    badge.textContent = totalCount;
    totalCount > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
  }
}


// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('nav a, #mobileMenu a');

navLinks.forEach(link => {
  const linkPage = link.getAttribute('href');
  if (linkPage === currentPage) {
    link.classList.add('text-[#e36d3b]', 'font-semibold');
    link.classList.remove('text-white');
  }
});