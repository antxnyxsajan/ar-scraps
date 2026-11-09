// auth.js - Unified Authentication, OTP Flow, and User State Management

const AuthManager = {
  currentUser: JSON.parse(localStorage.getItem('scrap_user') || 'null'),
  otpStep: false,
  pendingPhone: '',

  init() {
    this.updateUserUI();
    this.bindEvents();
  },

  open() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    this.resetForm();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  },

  resetForm() {
    this.otpStep = false;
    const step1 = document.getElementById('auth-step-1');
    const step2 = document.getElementById('auth-step-2');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');
  },

  sendOTP() {
    const phoneInput = document.getElementById('auth-phone');
    const val = phoneInput ? phoneInput.value.trim() : '';

    if (!val || val.length < 8) {
      App.toast('Please enter a valid mobile number with country code', 'warning');
      return;
    }

    this.pendingPhone = val;
    this.otpStep = true;

    const step1 = document.getElementById('auth-step-1');
    const step2 = document.getElementById('auth-step-2');
    const displayPhone = document.getElementById('auth-display-phone');

    if (displayPhone) displayPhone.textContent = val;
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.remove('hidden');

    // Auto-fill OTP simulation
    const otpInput = document.getElementById('auth-otp-code');
    if (otpInput) {
      otpInput.value = '7890';
    }

    App.toast(`OTP sent to ${val}! Test code: 7890`, 'info');
  },

  verifyOTP() {
    const otp = document.getElementById('auth-otp-code').value.trim();
    const role = document.getElementById('auth-role') ? document.getElementById('auth-role').value : 'Verified Trader';

    if (otp !== '7890' && otp.length < 4) {
      App.toast('Invalid OTP code. Please use 7890.', 'error');
      return;
    }

    this.currentUser = {
      phone: this.pendingPhone,
      name: 'Trade Partner',
      role: role,
      company: 'Global Metal & Polymers',
      verified: true
    };

    localStorage.setItem('scrap_user', JSON.stringify(this.currentUser));
    this.updateUserUI();
    this.close();
    App.toast(`Welcome back, ${this.currentUser.role}!`, 'success');
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('scrap_user');
    this.updateUserUI();
    App.toast('Logged out successfully', 'info');
  },

  updateUserUI() {
    const userContainer = document.getElementById('header-user-status');
    const mobileUserContainer = document.getElementById('mobile-user-status');
    if (!userContainer) return;

    if (this.currentUser) {
      const html = `
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs flex items-center justify-center">
            ${this.currentUser.name.charAt(0)}
          </div>
          <div class="hidden xl:block text-left">
            <span class="text-xs font-bold text-slate-800 block leading-tight">${this.currentUser.name}</span>
            <span class="text-[10px] text-emerald-600 font-semibold block">${this.currentUser.role}</span>
          </div>
          <button onclick="AuthManager.logout()" class="text-slate-400 hover:text-red-500 text-xs ml-1" title="Log Out">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      `;
      userContainer.innerHTML = html;
      if (mobileUserContainer) mobileUserContainer.innerHTML = html;
    } else {
      const html = `
        <button onclick="AuthManager.open()" class="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs">
          <i class="bi bi-person-fill text-slate-500"></i>
          <span>Login / Register</span>
        </button>
      `;
      userContainer.innerHTML = html;
      if (mobileUserContainer) mobileUserContainer.innerHTML = html;
    }
  },

  bindEvents() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }
  }
};

