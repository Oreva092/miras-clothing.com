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



// Comments
const form = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');

if (form && commentList) {
  function getInitials(name) {
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
  }

  function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
  }

  function loadComments() {
    const stored = localStorage.getItem('comments');
    return stored ? JSON.parse(stored) : [];
  }

  window.deleteComment = function(index) {
    const comments = loadComments();
    comments.splice(index, 1);
    saveComments(comments);
    renderComments();
  }

  function displayComment(comment, index) {
    const newComment = `
      <div class="flex gap-4 border-b pb-6 pt-5">
        <div class="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
          ${getInitials(comment.name)}
        </div>
        <div class="flex-1 min-w-0 relative">
          <h3 class="font-semibold">${comment.name}</h3>
          <button onclick="deleteComment(${index})" class="text-red-500 text-xl absolute bottom-0 right-0">
            <i class="ph ph-trash"></i>
          </button>
          <p class="text-gray-600 text-sm mt-1 break-words">${comment.text}</p>
          <p class="text-gray-400 text-sm mt-2">${comment.date}</p>
        </div>
      </div>
    `;
    commentList.insertAdjacentHTML('beforeend', newComment);
  }

  function renderComments() {
    const comments = loadComments();
    commentList.innerHTML = "";
    comments.forEach((comment, index) => displayComment(comment, index));
  }

  renderComments();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const commentText = document.getElementById('comment').value.trim();

    if (!name || !commentText) return;

    const comments = loadComments();
    comments.push({ name, text: commentText, date: new Date().toLocaleString() });
    saveComments(comments);
    renderComments();
    form.reset();
  });
}

// Instagram slider
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

  if (!track || !prevBtn || !nextBtn) return;

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
        requestAnimationFrame(() => track.classList.add("transition-transform"));
      }, 500);
    }
  });

  prevBtn.addEventListener("click", () => {
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