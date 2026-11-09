const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Load mock dataset
const dataFilePath = path.join(__dirname, 'data', 'data.json');
let siteData = {
  categories: [],
  listings: [],
  prices: [],
  blogs: [],
  news: [],
  videos: [],
  siteInfo: {}
};

try {
  if (fs.existsSync(dataFilePath)) {
    siteData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  }
} catch (err) {
  console.error('Error loading initial data:', err);
}

// REST API Endpoints

// GET /api/categories
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: siteData.categories });
});

// GET /api/listings
app.get('/api/listings', (req, res) => {
  let list = [...siteData.listings];
  const { q, category, type, location, sort } = req.query;

  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    list = list.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term) ||
      (item.subcategory && item.subcategory.toLowerCase().includes(term)) ||
      item.location.toLowerCase().includes(term)
    );
  }

  if (category && category !== 'all') {
    const catLower = category.toLowerCase();
    list = list.filter(item => item.category.toLowerCase().includes(catLower));
  }

  if (type && type !== 'all') {
    const typeLower = type.toLowerCase();
    if (typeLower === 'sell') {
      list = list.filter(item => item.type.toLowerCase().includes('sale') || item.type.toLowerCase().includes('sell'));
    } else if (typeLower === 'buy') {
      list = list.filter(item => item.type.toLowerCase().includes('buy') || item.type.toLowerCase().includes('wanted'));
    }
  }

  if (location && location.trim()) {
    const locLower = location.trim().toLowerCase();
    list = list.filter(item => item.location.toLowerCase().includes(locLower));
  }

  // Sort
  if (sort === 'price_asc') {
    // numeric price check
  } else if (sort === 'oldest') {
    list.reverse();
  } // default newest first

  res.json({
    success: true,
    total: list.length,
    data: list
  });
});

// GET /api/listings/:id
app.get('/api/listings/:id', (req, res) => {
  const item = siteData.listings.find(l => l.id == req.params.id || l.slug === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Listing not found' });
  }
  res.json({ success: true, data: item });
});

// POST /api/listings
app.post('/api/listings', (req, res) => {
  const { title, type, category, subcategory, price, quantity, location, description, phone, companyName, image } = req.body;

  if (!title || !category) {
    return res.status(400).json({ success: false, message: 'Title and category are required' });
  }

  const newId = siteData.listings.length > 0 ? Math.max(...siteData.listings.map(l => l.id)) + 1 : 1;
  const newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

  const newListing = {
    id: newId,
    title: title.trim(),
    type: type === 'Buy' ? 'Buy Lead' : 'For Sale',
    category: category,
    subcategory: subcategory || `${category} Scrap`,
    price: price ? price : 'Price on Request',
    quantity: quantity ? quantity : 'Contact for Qty',
    location: location ? location : 'Mumbai, India',
    flag: 'https://flagcdn.com/24x18/in.png',
    image: image || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop',
    slug: newSlug,
    likes: 1,
    isLiked: false,
    isSaved: false,
    specs: {
      "Grade / Spec": subcategory || "Commercial Standard Grade",
      "Origin": location ? location.split(',').pop().trim() : "India",
      "Packaging": "Standard Export Packaging",
      "Inspection": "Third-Party Certified"
    },
    seller: {
      companyName: companyName || "Verified Scrap Partner",
      verified: true,
      rating: 5.0,
      phone: phone || "+91 91041 43448",
      whatsapp: phone ? phone.replace(/[^0-9]/g, '') : "919104143448"
    },
    dateAdded: 'Just now',
    description: description || `Verified scrap offer for ${title}. Ready for immediate inspection and dispatch.`
  };

  // Prepend to top of listings
  siteData.listings.unshift(newListing);

  res.status(201).json({
    success: true,
    message: 'Listing published successfully!',
    data: newListing
  });
});

// POST /api/listings/:id/like
app.post('/api/listings/:id/like', (req, res) => {
  const item = siteData.listings.find(l => l.id == req.params.id);
  if (item) {
    item.isLiked = !item.isLiked;
    item.likes += item.isLiked ? 1 : -1;
    return res.json({ success: true, likes: item.likes, isLiked: item.isLiked });
  }
  res.status(404).json({ success: false, message: 'Listing not found' });
});

// GET /api/prices
app.get('/api/prices', (req, res) => {
  const { category } = req.query;
  let prices = [...siteData.prices];
  if (category && category !== 'all') {
    prices = prices.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
  }
  res.json({ success: true, data: prices });
});

// GET /api/content
app.get('/api/content', (req, res) => {
  res.json({
    success: true,
    data: {
      blogs: siteData.blogs,
      news: siteData.news,
      videos: siteData.videos,
      siteInfo: siteData.siteInfo
    }
  });
});

// POST /api/inquiries
app.post('/api/inquiries', (req, res) => {
  const { listingId, listingTitle, name, phone, message } = req.body;
  console.log(`[INQUIRY] New inquiry for "${listingTitle}" from ${name} (${phone}): ${message}`);
  res.json({
    success: true,
    message: 'Inquiry sent directly to seller. The seller will contact you via WhatsApp / Phone shortly.'
  });
});

// Serve static frontend files from project root
app.use(express.static(__dirname));
if (fs.existsSync(path.join(__dirname, 'public'))) {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Legal page routes (must be before catch-all)
const sendLegalFile = (res, filename) => {
  const rootPath = path.join(__dirname, filename);
  const publicPath = path.join(__dirname, 'public', filename);
  if (fs.existsSync(rootPath)) {
    return res.sendFile(rootPath);
  } else if (fs.existsSync(publicPath)) {
    return res.sendFile(publicPath);
  }
  res.status(404).send('Page not found');
};

app.get(['/terms', '/terms.html'], (req, res) => {
  sendLegalFile(res, 'terms.html');
});

app.get(['/privacy', '/privacy.html'], (req, res) => {
  sendLegalFile(res, 'privacy.html');
});

// Favicon route
app.get('/favicon.ico', (req, res) => {
  sendLegalFile(res, 'favicon.ico');
});

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Auto-finding available port if 3000 is occupied
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(` ScrapXtrade Global Marketplace running at:`);
    console.log(` http://localhost:${port}`);
    console.log(` Optimized for mobile and desktop!`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is currently busy, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);

