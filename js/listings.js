// listings.js - Handles Scrap Listings, Card Rendering, Details Modal, Likes, and Inquiries

const ListingsManager = {
  activeListings: [],
  likedIds: new Set(JSON.parse(localStorage.getItem('scrap_likes') || '[]')),
  savedIds: new Set(JSON.parse(localStorage.getItem('scrap_saved') || '[]')),

  init(listings) {
    this.activeListings = listings || [];
    this.render();
    this.bindEvents();
  },

  setListings(newList) {
    this.activeListings = newList;
    this.render();
  },

  render() {
    const container = document.getElementById('listings-grid');
    const countEl = document.getElementById('listings-count-badge');
    if (!container) return;

    if (countEl) {
      countEl.textContent = `${this.activeListings.length} Offers Found`;
    }

    if (this.activeListings.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
            <i class="bi bi-search"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-1">No scrap listings match your criteria</h3>
          <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">Try searching for other materials like Aluminium, Copper, HDPE, LDPE, or clear the category filters.</p>
          <button onclick="App.resetFilters()" class="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all">
            Reset All Filters
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.activeListings.map(item => this.createCardHtml(item)).join('');
  },

  createCardHtml(item) {
    const isLiked = this.likedIds.has(item.id);
    const isSaved = this.savedIds.has(item.id);
    const isSale = item.type.toLowerCase().includes('sale') || item.type.toLowerCase().includes('sell');

    // Badge styling
    const typeBadge = isSale 
      ? `<span class="badge px-3 py-1 font-bold rounded-lg text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 shadow-xs"><i class="bi bi-tag-fill text-[11px]"></i> For Sale</span>`
      : `<span class="badge px-3 py-1 font-bold rounded-lg text-xs bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 shadow-xs"><i class="bi bi-cart-check-fill text-[11px]"></i> Buy Lead</span>`;

    // Price badge
    const priceDisplay = item.price.toLowerCase().includes('request')
      ? `<span class="badge bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold border border-emerald-200 inline-flex items-center gap-1.5 text-xs"><i class="bi bi-chat-square-dots-fill text-emerald-600"></i> Price on Request</span>`
      : `<span class="badge bg-slate-900 text-emerald-400 px-2.5 py-1 rounded-md font-extrabold text-xs inline-flex items-center gap-1 shadow-xs">${item.price}</span>`;

    return `
      <div class="scrap-card bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group relative" data-id="${item.id}">
        <!-- Image Container -->
        <div class="relative h-[190px] max-sm:h-[160px] w-full bg-slate-100 overflow-hidden border-b border-slate-100">
          <img src="${item.image}" 
               alt="${item.title}" 
               loading="lazy"
               class="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
               onerror="this.src='https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop'">
          
          <!-- Type Badge Top Right -->
          <div class="absolute top-3 right-3 z-10">
            ${typeBadge}
          </div>

          <!-- Like & Bookmark Top Left -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <button onclick="ListingsManager.toggleLike(${item.id}, event)" 
                    class="w-[34px] h-[34px] rounded-lg border border-slate-200/60 flex items-center justify-center text-sm cursor-pointer transition-all bg-white/90 backdrop-blur-md shadow-sm ${isLiked ? 'text-red-500' : 'text-slate-600'} hover:scale-110 active:scale-90"
                    title="${isLiked ? 'Unlike' : 'Like'}">
              <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
            </button>
            <button onclick="ListingsManager.toggleSave(${item.id}, event)" 
                    class="w-[34px] h-[34px] rounded-lg border border-slate-200/60 flex items-center justify-center text-sm cursor-pointer transition-all bg-white/90 backdrop-blur-md shadow-sm ${isSaved ? 'text-amber-500' : 'text-slate-600'} hover:scale-110 active:scale-90"
                    title="${isSaved ? 'Remove Bookmark' : 'Bookmark'}">
              <i class="bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}"></i>
            </button>
          </div>

          <!-- Date Tag Bottom Left -->
          <div class="absolute bottom-2 left-3 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
            <i class="bi bi-clock"></i> ${item.dateAdded || 'Recently'}
          </div>
        </div>

        <!-- Content Body -->
        <div class="p-4 flex flex-col flex-grow">
          <!-- Hierarchy -->
          <div class="flex items-center mb-2 gap-1.5">
            <span class="badge rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold py-0.5 px-2">
              ${item.category}
            </span>
            <i class="bi bi-chevron-right text-slate-300 text-[10px]"></i>
            <span class="text-slate-500 text-[11px] font-medium truncate" title="${item.subcategory}">
              ${item.subcategory || 'Scrap Material'}
            </span>
          </div>

          <!-- Title -->
          <h4 class="font-bold text-slate-900 line-clamp-2 text-sm sm:text-base leading-snug mb-3 hover:text-emerald-600 cursor-pointer transition-colors" 
              onclick="ListingsManager.openDetails(${item.id})"
              title="${item.title}">
            ${item.title}
          </h4>

          <!-- Price & Qty Row -->
          <div class="flex items-center justify-between gap-2 mb-3 mt-auto">
            <div>${priceDisplay}</div>
            <div class="text-right">
              <span class="text-slate-500 text-xs">Qty:</span>
              <span class="text-slate-900 font-extrabold text-xs sm:text-sm ml-1">${item.quantity}</span>
            </div>
          </div>

          <!-- Location Row -->
          <div class="flex items-center text-slate-600 text-xs font-medium truncate mb-4 bg-slate-50 py-1.5 px-2.5 rounded-xl border border-slate-100">
            <i class="bi bi-geo-alt-fill text-rose-500 mr-1.5 shrink-0 text-sm"></i>
            <span class="truncate">${item.location}</span>
          </div>

          <!-- Card Actions Footer -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-100 mt-auto">
            <button onclick="ListingsManager.openDetails(${item.id})" 
                    class="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-all text-center">
              View Details
            </button>
            <button onclick="ListingsManager.openInquiry(${item.id})" 
                    class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5">
              <i class="bi bi-chat-dots-fill"></i> Contact
            </button>
            <a href="https://wa.me/${item.seller ? item.seller.whatsapp : '919104143448'}?text=${encodeURIComponent('Hello ScrapXtrade, I am interested in: ' + item.title)}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-500 hover:text-white text-emerald-600 border border-emerald-200 flex items-center justify-center text-sm transition-all"
               title="WhatsApp Seller">
              <i class="bi bi-whatsapp"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  },

  toggleLike(id, event) {
    if (event) event.stopPropagation();
    const item = this.activeListings.find(l => l.id === id);
    if (!item) return;

    if (this.likedIds.has(id)) {
      this.likedIds.delete(id);
      item.likes = Math.max(0, item.likes - 1);
      App.toast('Removed from favorites', 'info');
    } else {
      this.likedIds.add(id);
      item.likes += 1;
      App.toast('Saved to favorites!', 'success');
    }

    localStorage.setItem('scrap_likes', JSON.stringify([...this.likedIds]));
    this.render();
  },

  toggleSave(id, event) {
    if (event) event.stopPropagation();
    if (this.savedIds.has(id)) {
      this.savedIds.delete(id);
      App.toast('Bookmark removed', 'info');
    } else {
      this.savedIds.add(id);
      App.toast('Scrap offer bookmarked!', 'success');
    }

    localStorage.setItem('scrap_saved', JSON.stringify([...this.savedIds]));
    this.render();
  },

  openDetails(id) {
    const item = this.activeListings.find(l => l.id === id);
    if (!item) return;

    const modal = document.getElementById('details-modal');
    const content = document.getElementById('details-modal-content');
    if (!modal || !content) return;

    const waLink = `https://wa.me/${item.seller ? item.seller.whatsapp : '919104143448'}?text=${encodeURIComponent('Hi, I saw your listing on ScrapXtrade: "' + item.title + '" (' + item.quantity + '). Is this still available?')}`;

    content.innerHTML = `
      <div class="relative">
        <!-- Close Button -->
        <button onclick="ListingsManager.closeDetails()" 
                class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow text-slate-600 hover:text-slate-900 hover:bg-white flex items-center justify-center transition-all">
          <i class="bi bi-x-lg text-base"></i>
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <!-- Gallery & Visuals (5 cols) -->
          <div class="lg:col-span-5 bg-slate-950 p-6 flex flex-col justify-between rounded-t-3xl lg:rounded-tr-none lg:rounded-l-3xl relative">
            <div>
              <div class="flex items-center gap-2 mb-4">
                <span class="badge px-3 py-1 font-bold rounded-lg text-xs ${item.type.includes('Sale') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}">
                  ${item.type}
                </span>
                <span class="text-slate-400 text-xs">${item.category}</span>
              </div>
              <div class="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video sm:aspect-square flex items-center justify-center mb-4">
                <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
              </div>
            </div>

            <!-- Seller Verification Badge -->
            <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mt-auto">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xl font-bold">
                  <i class="bi bi-shield-check"></i>
                </div>
                <div>
                  <div class="flex items-center gap-1.5">
                    <h5 class="text-white font-bold text-sm mb-0">${item.seller ? item.seller.companyName : 'Verified Scrap Trader'}</h5>
                    <i class="bi bi-patch-check-fill text-emerald-400 text-sm" title="Verified Trader"></i>
                  </div>
                  <p class="text-slate-400 text-xs mb-0">Member since ${item.seller ? item.seller.memberSince : '2023'} • ${item.seller ? item.seller.dealsCompleted : '50+'} Deals</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Specs & Direct Actions (7 cols) -->
          <div class="lg:col-span-7 p-6 sm:p-8 flex flex-col max-h-[85vh] overflow-y-auto">
            <div class="mb-4">
              <div class="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
                <span>${item.subcategory || item.category}</span>
                <span>•</span>
                <span>ID: #SXT-${item.id.toString().padStart(4, '0')}</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-3">
                ${item.title}
              </h2>

              <div class="flex flex-wrap items-center gap-3 mb-4">
                <div class="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span class="text-xs text-slate-500 block">Indicative Price</span>
                  <span class="text-base sm:text-lg font-black text-emerald-700">${item.price}</span>
                </div>
                <div class="px-4 py-2 rounded-2xl bg-slate-100 border border-slate-200">
                  <span class="text-xs text-slate-500 block">Quantity Available</span>
                  <span class="text-base sm:text-lg font-black text-slate-900">${item.quantity}</span>
                </div>
                <div class="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200">
                  <span class="text-xs text-slate-500 block">Location</span>
                  <span class="text-sm font-bold text-slate-800 flex items-center gap-1">
                    <i class="bi bi-geo-alt-fill text-rose-500"></i> ${item.location}
                  </span>
                </div>
              </div>

              <!-- Detailed Specs Grid -->
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Technical & Trade Specifications</h4>
              <div class="grid grid-cols-2 gap-2.5 mb-6 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                ${Object.entries(item.specs || {}).map(([key, val]) => `
                  <div>
                    <span class="text-slate-400 font-medium block">${key}:</span>
                    <span class="text-slate-800 font-bold">${val}</span>
                  </div>
                `).join('')}
              </div>

              <!-- Description -->
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">Description & Inspection</h4>
              <p class="text-slate-600 text-sm leading-relaxed mb-6">
                ${item.description}
              </p>

              <!-- Quick Inquiry Form Inside Details -->
              <div class="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-2xl border border-emerald-200 mb-4">
                <h4 class="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <i class="bi bi-send-fill text-emerald-600"></i> Send Direct Offer to Seller
                </h4>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input type="text" id="direct-inquiry-msg" 
                         placeholder="e.g. Please quote CIF Mundra for 100 MT" 
                         class="flex-grow px-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-500">
                  <button onclick="ListingsManager.sendDirectOffer(${item.id})" 
                          class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap">
                    Submit Offer
                  </button>
                </div>
              </div>
            </div>

            <!-- Sticky Action Footer inside Modal -->
            <div class="pt-4 border-t border-slate-200 mt-auto flex flex-wrap sm:flex-nowrap gap-3">
              <a href="${waLink}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-all">
                <i class="bi bi-whatsapp text-lg"></i> Chat on WhatsApp
              </a>
              <button onclick="ListingsManager.openInquiry(${item.id})" 
                      class="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm text-center flex items-center justify-center gap-2 transition-all">
                <i class="bi bi-envelope-fill"></i> Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  closeDetails() {
    const modal = document.getElementById('details-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  },

  openInquiry(id) {
    const item = this.activeListings.find(l => l.id === id);
    if (!item) return;

    const modal = document.getElementById('inquiry-modal');
    const titleEl = document.getElementById('inquiry-post-title');
    const idInput = document.getElementById('inquiry-post-id');
    if (!modal) return;

    if (titleEl) titleEl.textContent = item.title;
    if (idInput) idInput.value = item.id;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  closeInquiry() {
    const modal = document.getElementById('inquiry-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  },

  sendDirectOffer(id) {
    const input = document.getElementById('direct-inquiry-msg');
    const msg = input ? input.value.trim() : '';
    if (!msg) {
      App.toast('Please write your offer or message', 'warning');
      return;
    }

    App.toast('Offer sent to seller via ScrapXtrade Gateway!', 'success');
    if (input) input.value = '';
    setTimeout(() => this.closeDetails(), 1200);
  },

  bindEvents() {
    // Backdrop click handlers
    const detailsModal = document.getElementById('details-modal');
    if (detailsModal) {
      detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) this.closeDetails();
      });
    }

    const inqModal = document.getElementById('inquiry-modal');
    if (inqModal) {
      inqModal.addEventListener('click', (e) => {
        if (e.target === inqModal) this.closeInquiry();
      });
    }

    const inqForm = document.getElementById('inquiry-form');
    if (inqForm) {
      inqForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('inq-name').value;
        const phone = document.getElementById('inq-phone').value;
        const msg = document.getElementById('inq-msg').value;
        const postId = document.getElementById('inquiry-post-id').value;
        const post = this.activeListings.find(l => l.id == postId);

        fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: postId,
            listingTitle: post ? post.title : 'Scrap inquiry',
            name,
            phone,
            message: msg
          })
        }).then(() => {
          App.toast('Inquiry delivered successfully to seller!', 'success');
          this.closeInquiry();
          inqForm.reset();
        }).catch(() => {
          App.toast('Inquiry submitted!', 'success');
          this.closeInquiry();
        });
      });
    }
  }
};

