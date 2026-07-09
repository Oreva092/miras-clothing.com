const header = document.getElementById('mainHeader');

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if(currentScrollY > lastScrollY && currentScrollY > 100){
        header.classList.add('opacity-0', 'translate-y-full');
    }

    if(currentScrollY < lastScrollY){
        header.classList.remove('opacity-0', 'translate-y-full');
    }

    lastScrollY = currentScrollY;
});

// Generate or get session ID for guest cart
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = 'guest_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('sessionId', sessionId);
}

const User = JSON.parse(localStorage.getItem('user'));





let currentView = 'grid';

function applyLayout(){
    container.className = 'gap-8 md:max-w-5xl md:m-auto';

    if(window.innerWidth < 640){
        container.classList.add('flex', 'flex-col');
    } else{
        if(currentView === 'grid'){
            container.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
        } else{
            container.classList.add('flex', 'flex-col');
        }
    }

    updateCardsLayout();
}


const gridBtn = document.getElementById('gridBtn');
const listBtn = document.getElementById('listBtn');

gridBtn.addEventListener('click', () => {
    currentView = 'grid';
    gridBtn.classList.add('bg-black', 'text-white');
    listBtn.classList.remove('bg-black', 'text-white');
    applyLayout();
});

listBtn.addEventListener('click', () => {
    currentView = 'list';
    listBtn.classList.add('bg-black', 'text-white');
    gridBtn.classList.remove('bg-black', 'text-white');
    applyLayout();
});


function updateCardsLayout(){
    const cards = document.querySelectorAll('#productContainer > div');

    cards.forEach(card => {
        const imageWrapper = card.querySelector('.image-wrapper');
        const contentWrapper = card.querySelector('.content-wrapper');
        const hoverIcons = card.querySelector('.hover-icons');
        const description = card.querySelector('.description');

        card.classList.remove('flex', 'gap-6');

        if(window.innerWidth >= 640 && currentView === 'list'){
            card.classList.add('flex', 'gap-6');

            imageWrapper.classList.add('w-1/3');
            contentWrapper.classList.add('w-2/3', 'text-left');
            contentWrapper.classList.remove('text-center');

            description.classList.remove('hidden');

            if(hoverIcons) hoverIcons.classList.add('hidden');
        } else{
            imageWrapper.classList.remove('w-1/3');
            contentWrapper.classList.remove('w-2/3', 'text-left');
            contentWrapper.classList.add('text-center');

            description.classList.add('hidden');

            if(hoverIcons) hoverIcons.classList.remove('hidden');
        }
    });
}


// Add this near the top of your shop script, with your other setup code
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



function renderSkeletons(count = 6) {
  container.innerHTML = Array(count).fill(`
    <div class="animate-pulse px-4 py-5">
      <div class="w-full h-[400px] bg-gray-200"></div>
      <div class="mt-4 space-y-2 text-center">
        <div class="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
        <div class="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        <div class="h-3 bg-gray-200 rounded w-1/4 mx-auto"></div>
      </div>
    </div>
  `).join('');
}




let products = [];

async function fetchProducts() {
  renderSkeletons();

  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    if (data.success) {
      products = data.products.map(p => ({
        id: p._id,
        title: p.title,
        brand: p.brand,
        price: p.price,
        image: p.image,
        rating: p.rating,
        badges: p.badges,
        description: p.description,
        soldOut: p.soldOut,
        isNewArrival: p.isNewArrival
      }));
      renderProducts(products);
      applyLayout();
    }
  } catch (error) {
    console.error('Fetch products error:', error);
  }
}

const container = document.getElementById('productContainer');

function renderProducts(list = products){
  container.innerHTML = '';

  list.forEach((product, index) => {
    const isSold = product.soldOut;

    const badgeHTML = product.badges.map(badge => {
      if(badge.includes('SALE')){
        return `<span class="bg-red-500 text-white text-xs px-2 py-1">${badge}</span>`;
      } 
      if(badge === 'NEW'){
          return `<span class="bg-green-500 text-white text-xs px-2 py-1">${badge}</span>`;
      }
      if(badge == 'SOLD OUT'){
        return `<span class="bg-gray-800 text-white text-xs px-2 py-1">${badge}</span>`;
      }
    }).join('');

    const stars = "★".repeat(product.rating) + "☆".repeat(5 - product.rating);

    const card = document.createElement('div');
    card.className = `group relative bg-white transition-all duration-300 px-4 py-5 sm:px-4 reveal ${isSold ? 'opacity-60 pointer-events-none' : ''}`;
    card.style.transitionDelay = `${index * 80}ms`;

      card.innerHTML = `
          <div class="image-wrapper relative overflow-hidden">
              <img src="${product.image}" class="w-full h-[400px] object-cover">

              <div class="absolute top-3 left-3 flex flex-col gap-2">
                  ${badgeHTML}
              </div>

              ${!isSold ? `
              <div class="hover-icons absolute top-3 right-3 flex flex-col gap-3 
                  translate-y-[-20px] opacity-0 
                  group-hover:translate-y-0 
                  group-hover:opacity-100 
                  transition-all duration-300">
                  <button class="add-to-cart-btn bg-white p-2 shadow" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}"><i class="ph ph-bag"></i></button>
                  <button class="add-to-wishlist-btn bg-white p-2 shadow" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}"><i class="ph ph-heart"></i></button>
              </div>
              ` : ""}
          </div>

          <div class="content-wrapper pt-4 text-center">
              <p class="text-yellow-500 text-xl">${stars}</p>
              <h3 class="font-poppins font-medium mt-2">${product.title}</h3>
              <p class="font-poppins font-medium text-red-500 mt-1">₦${product.price},000</p>

              <p class="description hidden mt-3 font-poppins text-gray-500 text-sm">
                  ${product.description}
              </p>
          </div>
      `;

      container.appendChild(card);
    });

  window.addEventListener('resize', applyLayout);
  observeReveals();
}


fetchProducts();
  


// Wishlist notification
function showWishlistNotification(message, isError = false) {
  const existing = document.getElementById('wishlistNotification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'wishlistNotification';
  notification.className = `fixed top-36 right-4 bg-white shadow-xl border-l-4 ${isError ? 'border-gray-400' : 'border-[#e36d3b]'} px-5 py-4 z-50 flex items-center gap-3 rounded-md translate-x-[200%] transition-transform duration-500`;
  notification.innerHTML = `
    <i class="ph ${isError ? 'ph-warning' : 'ph-heart'} text-[#e36d3b] text-2xl"></i>
    <div>
      <p class="font-poppins font-semibold text-sm">${message}</p>
      <p class="font-poppins text-xs text-gray-500">${isError ? '' : 'Added to wishlist'}</p>
    </div>
    <button id="closeWishlistNotification" class="ml-4 text-gray-400 hover:text-black">
      <i class="ph ph-x"></i>
    </button>
  `;

  document.body.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.remove('translate-x-[200%]');
    notification.classList.add('translate-x-0');
  });

  document.getElementById('closeWishlistNotification').addEventListener('click', () => {
    notification.classList.add('translate-x-[200%]');
    setTimeout(() => notification.remove(), 500);
  });

  setTimeout(() => {
    if (document.getElementById('wishlistNotification')) {
      notification.classList.add('translate-x-[200%]');
      setTimeout(() => notification.remove(), 500);
    }
  }, 4000);
}


// Show smooth notification
function showCartNotification(title) {
  const existing = document.getElementById('cartNotification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'cartNotification';
  notification.className = 'fixed top-20 right-4 bg-white shadow-xl border-l-4 border-[#e36d3b] px-5 py-4 z-50 flex items-center gap-3 rounded-md translate-x-[200%] transition-transform duration-500';
  notification.innerHTML = `
    <i class="ph ph-check-circle text-[#e36d3b] text-2xl"></i>
    <div>
      <p class="font-poppins font-semibold text-sm">${title}</p>
      <p class="font-poppins text-xs text-gray-500">Added to cart</p>
    </div>
    <button id="closeNotification" class="ml-4 text-gray-400 hover:text-black">
      <i class="ph ph-x"></i>
    </button>
  `;
  
  document.body.appendChild(notification);
  
// Slide in
requestAnimationFrame(() => {
  notification.classList.remove('translate-x-[200%]');
  notification.classList.add('translate-x-0');
});
  
// Close button
document.getElementById('closeNotification').addEventListener('click', () => {
  notification.classList.add('translate-x-[200%]');
  setTimeout(() => notification.remove(), 500);
});
  
// Auto close after 4 seconds
setTimeout(() => {
  if (document.getElementById('cartNotification')) {
    notification.classList.add('translate-x-[200%]');
    setTimeout(() => notification.remove(), 500);
  }
  }, 4000);
}
  




const sortSelect = document.getElementById('sortSelect');

sortSelect.addEventListener('change', function() {
    const selectedValue = this.value;

    if(selectedValue === 'low'){
        products.sort((a, b) => a.price - b.price);
    }

    if(selectedValue === 'high'){
        products.sort((a, b) => b.price - a.price);
    }

    renderProducts();
});



document.addEventListener("DOMContentLoaded", function () {

    const instaImages = [
      "/images/slide1.png",
      "/images/slide2.png",
      "/images/slide3.png",
      "/images/slide4.png",
      "/images/slide5.png",
      "/images/hero-image.png",
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


