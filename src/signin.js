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

// Toggle between Sign In and Sign Up
const showSignIn = document.getElementById('showSignIn');
const showSignUp = document.getElementById('showSignUp');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

showSignIn.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  showSignIn.classList.add('border-b-2', 'border-black', 'text-black');
  showSignIn.classList.remove('text-gray-400');
  showSignUp.classList.remove('border-b-2', 'border-black', 'text-black');
  showSignUp.classList.add('text-gray-400');
});

showSignUp.addEventListener('click', () => {
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  showSignUp.classList.add('border-b-2', 'border-black', 'text-black');
  showSignUp.classList.remove('text-gray-400');
  showSignIn.classList.remove('border-b-2', 'border-black', 'text-black');
  showSignIn.classList.add('text-gray-400');
});

// ✅ SIGN UP
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const button = registerForm.querySelector('button');

  button.textContent = 'Creating account...';
  button.disabled = true;

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    const popup = document.createElement('div');
    popup.className = `fixed top-5 left-1/2 -translate-x-1/2 ${data.success ? 'bg-[#e36d3b]' : 'bg-red-500'} text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-center`;
    popup.textContent = data.message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 4000);

    if (data.success) {
      setTimeout(() => window.location.href = '/account.html', 2000);
    }

  } catch (error) {
    alert('Something went wrong. Please try again.');
  } finally {
    button.textContent = 'Create Account';
    button.disabled = false;
  }
});

// ✅ SIGN IN
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const button = loginForm.querySelector('button[type="submit"]');

  button.textContent = 'Signing in...';
  button.disabled = true;

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    const popup = document.createElement('div');
    popup.className = `fixed top-5 left-1/2 -translate-x-1/2 ${data.success ? 'bg-[#e36d3b]' : 'bg-red-500'} text-white px-8 py-4 rounded-lg shadow-lg z-50 font-poppins text-center`;
    popup.textContent = data.message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 4000);

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setTimeout(() => window.location.href = '/account.html', 2000);
    }

  } catch (error) {
    alert('Something went wrong. Please try again.');
  } finally {
    button.textContent = 'Sign In';
    button.disabled = false;
  }
});


// Google Identity Services
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "570428582244-0trbkqgat36djb3v48jfno0stau1u33q.apps.googleusercontent.com",
    callback: handleGoogleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById('googleSignIn'),
    { theme: 'outline', size: 'large', width: '100%' }
  );
};

function handleGoogleLogin(response) {
  const data = parseJwt(response.credential);
  const user = {
    name: data.name,
    email: data.email,
    avatar: data.picture
  };
  localStorage.setItem('user', JSON.stringify(user));
  window.location.href = '/account.html';
}

function parseJwt(token) {
  return JSON.parse(atob(token.split('.')[1]));
}



// Show user in navbar
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
  if (navUserGreeting) {
    navUserGreeting.textContent = `Hi, ${user.name.split(' ')[0]}!`;
  }
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