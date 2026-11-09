// app.js - Main Application Orchestrator for ScrapXtrade

const App = {
  data: {
    siteInfo: {},
    categories: [],
    allListings: [],
    prices: [],
    blogs: [],
    news: [],
    videos: []
  },

  filters: {
    query: '',
    category: 'all',
    type: 'all', // all, Sell, Buy
    location: '',
    sort: 'newest'
  },

  async init() {
    console.log('ScrapXtrade Initializing (GitHub Pages & Static Ready)...');
    this.initToast();

    try {
      // Fetch bundled dataset directly (works 100% on GitHub Pages & local servers)
      const res = await fetch('./data/data.json');
      const rootData = await res.json();

      // Retrieve any locally created user listings
      const customListings = JSON.parse(localStorage.getItem('scrap_custom_listings') || '[]');

      this.data.rawListings = [...customListings, ...(rootData.listings || [])];
      this.data.allListings = [...this.data.rawListings];
      this.data.prices = rootData.prices || [];
      this.data.categories = rootData.categories || [];
      this.data.blogs = rootData.blogs || [];
      this.data.news = rootData.news || [];
      this.data.videos = rootData.videos || [];
      this.data.siteInfo = rootData.siteInfo || {};

      // Initialize component managers
      ListingsManager.init(this.data.allListings);
      PricesManager.init(this.data.prices);
      PostModalManager.init();
      AuthManager.init();

      // Render supplementary sections
      this.renderCategories();
      this.renderBlogs();
      this.renderNews();
      this.renderVideos();
      this.bindAppEvents();

    } catch (err) {
      console.error('Initialization error:', err);
      this.toast('Welcome to ScrapXtrade!', 'info');
    }
  },

  loadListings() {
    let list = [...(this.data.rawListings || [])];

    // Search query filter
    if (this.filters.query && this.filters.query.trim()) {
      const q = this.filters.query.trim().toLowerCase();
      list = list.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (this.filters.category && this.filters.category !== 'all') {
      const cat = this.filters.category.toLowerCase();
      list = list.filter(item => item.category && item.category.toLowerCase().includes(cat));
    }

    // Type filter (All, Sell, Buy)
    if (this.filters.type && this.filters.type !== 'all') {
      const typeLower = this.filters.type.toLowerCase();
      if (typeLower === 'sell') {
        list = list.filter(item => item.type && (item.type.toLowerCase().includes('sale') || item.type.toLowerCase().includes('sell')));
      } else if (typeLower === 'buy') {
        list = list.filter(item => item.type && (item.type.toLowerCase().includes('buy') || item.type.toLowerCase().includes('wanted')));
      }
    }

    // Location filter
    if (this.filters.location && this.filters.location.trim()) {
      const loc = this.filters.location.trim().toLowerCase();
      list = list.filter(item => item.location && item.location.toLowerCase().includes(loc));
    }

    this.data.allListings = list;
    ListingsManager.setListings(list);
  },

  renderCategories() {
    const container = document.getElementById('category-scroll-container');
    const heroCategorySelect = document.getElementById('hero-search-category');
    if (!container) return;

    if (heroCategorySelect) {
      heroCategorySelect.innerHTML = `<option value="all">All Categories</option>` + 
        this.data.categories.map(c => `<option value="${c.title}">${c.title}</option>`).join('');
    }

    container.innerHTML = this.data.categories.map((cat, idx) => {
      const isActive = this.filters.category.toLowerCase() === cat.title.toLowerCase();
      return `
        <div class="cat-item w-[145px] sm:w-[168px] md:w-[182px] flex-shrink-0 snap-start group h-full cursor-pointer ${isActive ? 'active' : ''}" 
             onclick="App.selectCategory('${cat.title}')">
          <div class="cat-card-inner relative h-full p-3 sm:p-4 text-center bg-white border-2 border-slate-200 rounded-2xl shadow-xs transition-all duration-300 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-between">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center text-xl sm:text-2xl shadow-md mb-2 group-hover:scale-110 transition-transform">
              <i class="bi ${cat.icon}"></i>
            </div>
            <h3 class="font-bold text-slate-900 text-xs sm:text-sm mb-1">${cat.title}</h3>
            <span class="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">${cat.count}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectCategory(catName) {
    if (this.filters.category.toLowerCase() === catName.toLowerCase()) {
      this.filters.category = 'all'; // toggle off
    } else {
      this.filters.category = catName;
    }

    this.renderCategories();
    this.updateMarketplacePillActive();
    this.loadListings();

    // Scroll to marketplace smoothly
    const marketSection = document.getElementById('marketplace-section');
    if (marketSection) {
      marketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  setMarketplaceTab(type) {
    this.filters.type = type;
    const tabs = ['all', 'Sell', 'Buy'];
    tabs.forEach(t => {
      const el = document.getElementById(`tab-type-${t.toLowerCase()}`);
      if (el) {
        if (t === type) {
          el.className = 'tab-pill px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-sm';
        } else {
          el.className = 'tab-pill px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900';
        }
      }
    });

    this.loadListings();
  },

  updateMarketplacePillActive() {
    const pills = document.querySelectorAll('.cat-filter-chip');
    pills.forEach(p => {
      const cat = p.dataset.category || 'all';
      if (cat.toLowerCase() === this.filters.category.toLowerCase()) {
        p.className = 'cat-filter-chip px-3.5 py-1.5 rounded-md text-xs font-bold bg-slate-900 text-white shadow-xs transition-all';
      } else {
        p.className = 'cat-filter-chip px-3.5 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all';
      }
    });
  },

  filterByChip(catName) {
    this.filters.category = catName;
    this.renderCategories();
    this.updateMarketplacePillActive();
    this.loadListings();
  },

  filterBySearch(term) {
    const heroInput = document.getElementById('hero-search-input');
    if (heroInput) heroInput.value = term;
    this.filters.query = term;
    this.loadListings();

    const marketSection = document.getElementById('marketplace-section');
    if (marketSection) {
      marketSection.scrollIntoView({ behavior: 'smooth' });
    }
  },

  resetFilters() {
    this.filters = {
      query: '',
      category: 'all',
      type: 'all',
      location: '',
      sort: 'newest'
    };

    const heroInput = document.getElementById('hero-search-input');
    const heroCat = document.getElementById('hero-search-category');
    const heroLoc = document.getElementById('hero-search-location');
    if (heroInput) heroInput.value = '';
    if (heroCat) heroCat.value = 'all';
    if (heroLoc) heroLoc.value = '';

    this.renderCategories();
    this.setMarketplaceTab('all');
    this.updateMarketplacePillActive();
    this.loadListings();
    this.toast('All filters cleared', 'info');
  },

  renderBlogs() {
    const container = document.getElementById('blogs-grid');
    if (!container || !this.data.blogs.length) return;

    container.innerHTML = this.data.blogs.slice(0, 3).map(b => `
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group">
        <div class="h-44 overflow-hidden relative">
          <img src="${b.image}" alt="${b.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-emerald-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
            ${b.category || 'Guide'}
          </span>
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <div class="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <span><i class="bi bi-calendar3"></i> ${b.date}</span>
            <span>•</span>
            <span><i class="bi bi-clock"></i> ${b.readTime || '5 min'}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm sm:text-base leading-snug mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
            ${b.title}
          </h4>
          <p class="text-slate-500 text-xs line-clamp-2 mb-4">
            ${b.snippet}
          </p>
          <button onclick="App.openArticleModal('${b.title}', '${b.date}', '${b.snippet}')" 
                  class="text-emerald-600 font-bold text-xs hover:text-emerald-700 flex items-center gap-1 mt-auto">
            Read Full Article <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  renderNews() {
    const container = document.getElementById('news-grid');
    if (!container || !this.data.news.length) return;

    container.innerHTML = this.data.news.slice(0, 3).map(n => `
      <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex gap-3.5 group cursor-pointer"
           onclick="App.openArticleModal('${n.title}', '${n.date}', '${n.snippet}')">
        <div class="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
          <img src="${n.image}" alt="${n.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform">
        </div>
        <div class="flex flex-col justify-between">
          <div>
            <span class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
              ${n.source || 'Industry News'}
            </span>
            <h5 class="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
              ${n.title}
            </h5>
          </div>
          <span class="text-[11px] text-slate-400"><i class="bi bi-clock mr-1"></i>${n.date}</span>
        </div>
      </div>
    `).join('');
  },

  renderVideos() {
    const container = document.getElementById('videos-grid');
    if (!container || !this.data.videos.length) return;

    container.innerHTML = this.data.videos.slice(0, 4).map(v => `
      <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all group flex flex-col cursor-pointer"
           onclick="App.openVideoPlayer('${v.title}')">
        <div class="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
          <img src="${v.image}" alt="${v.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80">
          <div class="absolute w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition-transform">
            <i class="bi bi-play-fill ml-0.5"></i>
          </div>
          <span class="absolute bottom-2 right-2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
            ${v.duration}
          </span>
        </div>
        <div class="p-3.5 flex-grow">
          <h5 class="font-bold text-slate-900 text-xs leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors mb-1">
            ${v.title}
          </h5>
          <span class="text-[10px] text-slate-400"><i class="bi bi-eye mr-1"></i>${v.views}</span>
        </div>
      </div>
    `).join('');
  },

  openArticleModal(title, date, snippet) {
    const modal = document.getElementById('article-modal');
    if (!modal) return;
    document.getElementById('article-modal-title').textContent = title;
    document.getElementById('article-modal-date').textContent = date;
    document.getElementById('article-modal-body').textContent = snippet + ' Full editorial insights and global trade analysis provided by ScrapXtrade Bureau.';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  closeArticleModal() {
    const modal = document.getElementById('article-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  },

  openVideoPlayer(title) {
    this.toast(`Now streaming: ${title}`, 'info');
  },

  bindAppEvents() {
    // Hero search submission
    const heroForm = document.getElementById('hero-search-form');
    if (heroForm) {
      heroForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = document.getElementById('hero-search-input').value.trim();
        const cat = document.getElementById('hero-search-category').value;
        const loc = document.getElementById('hero-search-location').value;

        this.filters.query = q;
        this.filters.category = cat;
        this.filters.location = loc;
        this.loadListings();

        const marketSection = document.getElementById('marketplace-section');
        if (marketSection) {
          marketSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Hero Buy/Sell Mode toggle buttons
    const buySwitch = document.getElementById('hero-tab-buy');
    const sellSwitch = document.getElementById('hero-tab-sell');
    if (buySwitch && sellSwitch) {
      buySwitch.addEventListener('click', () => {
        this.filters.type = 'Buy';
        buySwitch.className = 'px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-xs';
        sellSwitch.className = 'px-4 py-2 rounded-xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200';
        this.loadListings();
      });
      sellSwitch.addEventListener('click', () => {
        this.filters.type = 'Sell';
        sellSwitch.className = 'px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-xs';
        buySwitch.className = 'px-4 py-2 rounded-xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200';
        this.loadListings();
      });
    }

    // Category Carousel left/right buttons
    const catPrev = document.getElementById('cat-scroll-prev');
    const catNext = document.getElementById('cat-scroll-next');
    const catContainer = document.getElementById('category-scroll-container');
    if (catPrev && catNext && catContainer) {
      catPrev.addEventListener('click', () => {
        catContainer.scrollBy({ left: -260, behavior: 'smooth' });
      });
      catNext.addEventListener('click', () => {
        catContainer.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }

    // Mobile Bottom Nav Tabs
    const mobileNavItems = document.querySelectorAll('.mobile-nav-btn');
    mobileNavItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        mobileNavItems.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.dataset.target;
        if (target === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (target === 'seller') {
          this.setMarketplaceTab('Sell');
          document.getElementById('marketplace-section').scrollIntoView({ behavior: 'smooth' });
        } else if (target === 'buyer') {
          this.setMarketplaceTab('Buy');
          document.getElementById('marketplace-section').scrollIntoView({ behavior: 'smooth' });
        } else if (target === 'prices') {
          document.getElementById('live-prices-section').scrollIntoView({ behavior: 'smooth' });
        } else if (target === 'directory') {
          this.toast('Connecting to Global Verified Directory...', 'info');
          document.getElementById('browse-materials').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Mobile Drawer Menu
    const drawerOpenBtn = document.getElementById('drawer-toggle-btn');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (drawerOpenBtn && drawer) {
      drawerOpenBtn.addEventListener('click', () => {
        drawer.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
      });
    }
    if (drawerCloseBtn && drawer) {
      drawerCloseBtn.addEventListener('click', () => {
        drawer.classList.add('translate-x-full');
        document.body.style.overflow = '';
      });
    }
  },

  initToast() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
  },

  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '<i class="bi bi-check-circle-fill text-emerald-600 text-lg"></i>',
      error: '<i class="bi bi-exclamation-triangle-fill text-rose-600 text-lg"></i>',
      warning: '<i class="bi bi-exclamation-circle-fill text-amber-500 text-lg"></i>',
      info: '<i class="bi bi-info-circle-fill text-sky-600 text-lg"></i>'
    };

    const item = document.createElement('div');
    item.className = 'toast-item';
    item.innerHTML = `
      ${icons[type] || icons.info}
      <span class="text-xs sm:text-sm font-semibold text-slate-800 flex-grow leading-snug">${message}</span>
      <button class="text-slate-400 hover:text-slate-600 text-sm ml-2">&times;</button>
    `;

    item.querySelector('button').onclick = () => item.remove();
    container.appendChild(item);

    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(-10px)';
      setTimeout(() => item.remove(), 300);
    }, 3800);
  }
};

// Auto start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

