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



const video = document.getElementById('fashionVideo');
const btn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const overlay = document.getElementById('videoOverlay');



function showPlayUI() {
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  btn.classList.remove('opacity-0');
  overlay.classList.remove('pointer-events-none');
}

function showPauseUI() {
  playIcon.classList.add('hidden');
  pauseIcon.classList.remove('hidden');
  btn.classList.add('opacity-0');
  overlay.classList.add('pointer-events-none');
}

btn.addEventListener('click', (e) => {
  e.stopPropagation();
  return;

  video.paused ? video.play() : video.pause();
});

video.addEventListener('click', () => {
  if (!video.paused) {
    video.pause();
  }
});

/* ---------- Sync UI ---------- */
video.addEventListener('play', showPauseUI);
video.addEventListener('pause', showPlayUI);

/* ---------- Pause when scrolled away ---------- */
const observer = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting && !video.paused) {
      video.pause();
    }
  },
  { threshold: 0.4 }
);

observer.observe(video);


const modal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const closeBtn = document.getElementById('closeVideo');

btn.addEventListener('click', (e) => {
  e.stopPropagation();

  video.pause();

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // trigger animation (next frame)
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    document.getElementById('videoWrapper').classList.remove('scale-95');
  }, 10);

  modalVideo.currentTime = 0;
  modalVideo.play();
});

function closeModal() {
  modal.classList.add('opacity-0');
  document.getElementById('videoWrapper').classList.add('scale-95');

  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');

    modalVideo.pause();
    modalVideo.currentTime = 0;

    showPlayUI();
  }, 300); // match duration
}

closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});



// team slider
const track = document.querySelector('.carousel-track');
const cards = document.querySelectorAll('.card');
const indicatorsContainer = document.querySelector('.indicators');

let currentSlide = 0;
let cardsPerSlide = 1;
let totalSlides = 1;

// Determine how many cards per slide based on screen width
function getCardsPerSlide() {
  if (window.innerWidth >= 1024) return 4; // lg
  if (window.innerWidth >= 768) return 2;  // md
  return 1;                                 // sm
}

// Calculate total slides
function calculateSlides() {
  cardsPerSlide = getCardsPerSlide();
  totalSlides = Math.ceil(cards.length / cardsPerSlide);
}

// Create indicators dynamically with Tailwind classes
function createIndicators() {
  indicatorsContainer.innerHTML = "";

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.classList.add(
      'w-8',            // 12px
      'h-1.5',
      'rounded-full',
      'border-0',
      'bg-black',
      'transition-colors',
      'duration-300'
    );

    if (i === currentSlide) {
      dot.classList.remove('bg-black');
      dot.classList.add('bg-[#ff8e78]');
    }

    dot.addEventListener('click', () => goToSlide(i));

    indicatorsContainer.appendChild(dot);
  }
}

// Go to a specific slide
function goToSlide(slideIndex) {
  currentSlide = slideIndex;

  // Calculate the percentage shift
  const slideWidth = 100 / cardsPerSlide; // width of each card relative to track
  track.style.transform = `translateX(-${slideIndex * 100}%)`;

  updateIndicators();
}

// Update indicators dynamically
function updateIndicators() {
  const dots = document.querySelectorAll('.indicators button');
  dots.forEach((dot, index) => {
    dot.classList.toggle('bg-[#ff8e78]', index === currentSlide);
    dot.classList.toggle('bg-black', index !== currentSlide);
  });
}

// Initialize carousel
function initCarousel() {
  calculateSlides();
  createIndicators();
  goToSlide(0);
}

initCarousel();

// Recalculate on window resize
window.addEventListener('resize', () => {
  currentSlide = 0;
  initCarousel();
});



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