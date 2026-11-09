// postModal.js - Post Scrap Requirement & Listing Creation Flow

const PostModalManager = {
  selectedType: 'Sell',
  uploadedImageUrl: '',

  init() {
    this.bindEvents();
  },

  open() {
    const modal = document.getElementById('post-scrap-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  },

  close() {
    const modal = document.getElementById('post-scrap-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  },

  setType(type) {
    this.selectedType = type;
    const sellBtn = document.getElementById('post-type-sell');
    const buyBtn = document.getElementById('post-type-buy');

    if (type === 'Sell') {
      sellBtn.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
      buyBtn.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-all';
    } else {
      sellBtn.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center gap-1.5 transition-all';
      buyBtn.className = 'flex-1 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all';
    }
  },

  handleImageUpload(event) {
    const file = event.target.files && event.target.files[0];
    const previewContainer = document.getElementById('post-image-preview');
    if (!file || !previewContainer) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageUrl = e.target.result;
      previewContainer.innerHTML = `
        <div class="relative w-full h-32 rounded-xl overflow-hidden border border-emerald-300 group">
          <img src="${e.target.result}" class="w-full h-full object-cover">
          <button type="button" onclick="PostModalManager.removeImage()" class="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow hover:bg-red-700">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  },

  removeImage() {
    this.uploadedImageUrl = '';
    const previewContainer = document.getElementById('post-image-preview');
    const fileInput = document.getElementById('post-file-input');
    if (fileInput) fileInput.value = '';
    if (previewContainer) {
      previewContainer.innerHTML = `
        <label for="post-file-input" class="cursor-pointer border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all bg-slate-50 hover:bg-emerald-50/40">
          <i class="bi bi-cloud-arrow-up text-2xl text-emerald-600 mb-1"></i>
          <span class="text-xs font-bold text-slate-700">Upload Scrap Photos</span>
          <span class="text-[10px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
        </label>
      `;
    }
  },

  bindEvents() {
    const modal = document.getElementById('post-scrap-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }

    const form = document.getElementById('post-scrap-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitListing();
      });
    }

    // Category change updates subcategory presets
    const catSelect = document.getElementById('post-category');
    const subcatSelect = document.getElementById('post-subcategory');
    if (catSelect && subcatSelect) {
      catSelect.addEventListener('change', () => {
        const cat = catSelect.value;
        const subPresets = {
          'Metal': ['Aluminium Extrusions 6063', 'HMS 1&2 Scrap', 'Copper Wire / Millberry', 'Stainless Steel 304/316', 'Alloy Wheels'],
          'Plastic': ['HDPE Blue Drums / Flakes', 'LDPE Film in Bales', 'PET Bottles in Bales', 'PP Jumbo Bags Scrap', 'PVC Medical Waste'],
          'Electronic': ['Computer Motherboards', 'Server Scrap PCBs', 'Telecom Boards', 'RAM & IC Chips', 'Cable Harnesses'],
          'Battery': ['Lead-Acid Drained Batteries', 'Lithium-Ion / 18650 Cells', 'EV Battery Modules', 'UPS Heavy Duty Batteries'],
          'Paper & Packaging': ['OCC Grade 11/12 Bales', 'ONP Newsprint Waste', 'Kraft Waste Paper', 'White Envelope Trimmings']
        };

        const list = subPresets[cat] || ['Grade A Clean Scrap', 'Unsorted Industrial Scrap', 'Recycled Flakes / Pellets'];
        subcatSelect.innerHTML = list.map(item => `<option value="${item}">${item}</option>`).join('');
      });
    }
  },

  submitListing() {
    const title = document.getElementById('post-title').value.trim();
    const category = document.getElementById('post-category').value;
    const subcategory = document.getElementById('post-subcategory').value;
    const quantity = document.getElementById('post-quantity').value.trim();
    const price = document.getElementById('post-price').value.trim();
    const location = document.getElementById('post-location').value.trim();
    const company = document.getElementById('post-company').value.trim();
    const phone = document.getElementById('post-phone').value.trim();
    const description = document.getElementById('post-desc').value.trim();

    if (!title || !category || !quantity || !location) {
      App.toast('Please fill in title, category, quantity, and location', 'warning');
      return;
    }

    const payload = {
      title,
      type: this.selectedType,
      category,
      subcategory,
      quantity,
      price: price ? price : 'Price on Request',
      location,
      companyName: company || 'Verified Member',
      phone: phone || '+91 91041 43448',
      description,
      image: this.uploadedImageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop'
    };

    const newId = Date.now();
    const newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

    const newPost = {
      id: newId,
      title: title,
      type: this.selectedType === 'Buy' ? 'Buy Lead' : 'For Sale',
      category: category,
      subcategory: subcategory || `${category} Scrap`,
      price: price ? price : 'Price on Request',
      quantity: quantity,
      location: location,
      flag: 'https://flagcdn.com/24x18/in.png',
      image: this.uploadedImageUrl || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop',
      slug: newSlug,
      likes: 1,
      isLiked: false,
      isSaved: false,
      specs: {
        "Grade / Spec": subcategory || "Commercial Standard Grade",
        "Origin": location.split(',').pop().trim() || "India",
        "Packaging": "Standard Export Packaging",
        "Inspection": "Third-Party Certified"
      },
      seller: {
        companyName: company || "Verified Scrap Partner",
        verified: true,
        rating: 5.0,
        phone: phone || "+91 91041 43448",
        whatsapp: phone ? phone.replace(/[^0-9]/g, '') : "919104143448"
      },
      dateAdded: 'Just now',
      description: description || `Verified scrap offer for ${title}. Ready for immediate inspection and dispatch.`
    };

    // Save to LocalStorage (Instant GitHub Pages & Offline Persistence)
    const existingCustom = JSON.parse(localStorage.getItem('scrap_custom_listings') || '[]');
    existingCustom.unshift(newPost);
    localStorage.setItem('scrap_custom_listings', JSON.stringify(existingCustom));

    // Update in-memory app listings
    App.data.rawListings = App.data.rawListings || [];
    App.data.rawListings.unshift(newPost);

    App.toast('🎉 Your scrap post has been published live!', 'success');
    this.close();
    document.getElementById('post-scrap-form').reset();
    this.removeImage();
    App.loadListings();

    const listingsEl = document.getElementById('marketplace-section');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }

    // Optional sync with backend if running locally
    try {
      fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      }).catch(() => {});
    } catch (e) {}
  }
};

