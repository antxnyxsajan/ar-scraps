// prices.js - ScrapXtrade Live Price Board, Sparkline Rendering, and Currency Switcher

const PricesManager = {
  rawPrices: [],
  selectedCategory: 'all',
  currentCurrency: 'INR', // default INR or USD
  currencyRates: {
    'INR': { symbol: '₹', rate: 1.0, unitKg: '/ KG', unitMt: '/ MT' },
    'USD': { symbol: '$', rate: 0.0116, unitKg: '/ KG', unitMt: '/ MT' },
    'EUR': { symbol: '€', rate: 0.0108, unitKg: '/ KG', unitMt: '/ MT' },
    'AED': { symbol: 'AED ', rate: 0.0426, unitKg: '/ KG', unitMt: '/ MT' }
  },

  init(prices) {
    this.rawPrices = prices || [];
    this.render();
    this.renderTicker();
  },

  setCategory(cat) {
    this.selectedCategory = cat.toLowerCase();
    this.render();
  },

  setCurrency(curr) {
    if (this.currencyRates[curr]) {
      this.currentCurrency = curr;
      this.render();
      this.renderTicker();
      App.toast(`Currency switched to ${curr}`, 'info');
    }
  },

  convertPrice(rawStr) {
    if (!rawStr) return { formatted: 'N/A', numVal: 0 };
    
    // Parse numeric value (e.g. ₹43.30 or $380)
    let isMt = rawStr.toUpperCase().includes('MT');
    let cleaned = rawStr.replace(/[^\d.]/g, '');
    let val = parseFloat(cleaned) || 0;

    // Convert based on active currency
    const rateInfo = this.currencyRates[this.currentCurrency];
    let convertedVal = val * rateInfo.rate;

    let formatted = rateInfo.symbol + (convertedVal >= 100 ? Math.round(convertedVal).toLocaleString() : convertedVal.toFixed(2)) + (isMt ? ' ' + rateInfo.unitMt : ' ' + rateInfo.unitKg);
    return { formatted, numVal: convertedVal };
  },

  renderSparkline(points, isUp) {
    if (!points || points.length < 2) return '';
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = (max - min) || 1;
    const width = 80;
    const height = 24;
    const padding = 2;

    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * (width - padding * 2) + padding;
      const y = height - (((p - min) / range) * (height - padding * 2) + padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = isUp ? '#10b981' : '#f43f5e';
    const fillColor = isUp ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="overflow-visible">
        <polyline fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${coords}"/>
      </svg>
    `;
  },

  render() {
    const tableBody = document.getElementById('price-table-body');
    const cardsGrid = document.getElementById('mobile-price-cards');
    if (!tableBody) return;

    let filtered = [...this.rawPrices];
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(this.selectedCategory));
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-slate-400">No prices available in this category today.</td></tr>`;
      if (cardsGrid) cardsGrid.innerHTML = `<div class="text-center py-6 text-slate-400">No prices found.</div>`;
      return;
    }

    // Render desktop table rows
    tableBody.innerHTML = filtered.map(item => {
      const converted = this.convertPrice(item.price);
      const isUp = item.is_up;
      const isDown = item.is_down;
      const changeClass = isUp ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : (isDown ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-slate-500 bg-slate-50 border-slate-200');
      const changeIcon = isUp ? 'bi-arrow-up-right' : (isDown ? 'bi-arrow-down-right' : 'bi-dash');

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
          <td class="font-bold text-slate-900 py-3.5 px-4 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
            ${item.name}
          </td>
          <td class="text-slate-600 text-xs py-3.5 px-4">
            <span class="px-2 py-1 rounded-md bg-slate-100 font-medium text-slate-700">${item.country || 'Global Benchmark'}</span>
          </td>
          <td class="text-slate-600 text-xs py-3.5 px-4">
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">${item.category}</span>
          </td>
          <td class="font-extrabold text-slate-900 text-sm py-3.5 px-4">
            ${converted.formatted}
          </td>
          <td class="py-3.5 px-4">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${changeClass}">
              <i class="bi ${changeIcon}"></i> ${item.change}
            </span>
          </td>
          <td class="py-3.5 px-4">
            <div class="flex items-center justify-center">
              ${this.renderSparkline(item.sparkline, isUp)}
            </div>
          </td>
          <td class="text-right py-3.5 px-4">
            <button onclick="App.filterBySearch('${item.name}')" 
                    class="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 text-xs font-bold transition-all">
              Trade <i class="bi bi-chevron-right text-[10px]"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Render mobile price cards view
    if (cardsGrid) {
      cardsGrid.innerHTML = filtered.map(item => {
        const converted = this.convertPrice(item.price);
        const isUp = item.is_up;
        const isDown = item.is_down;
        const changeClass = isUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50';
        const changeIcon = isUp ? 'bi-arrow-up-right' : 'bi-arrow-down-right';

        return `
          <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <div>
                <h5 class="font-bold text-slate-900 text-sm mb-0.5">${item.name}</h5>
                <span class="text-slate-400 text-[11px]">${item.category} • ${item.country}</span>
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${changeClass}">
                <i class="bi ${changeIcon}"></i> ${item.change}
              </span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold block">Today's Benchmark</span>
                <span class="text-base font-black text-slate-900">${converted.formatted}</span>
              </div>
              <button onclick="App.filterBySearch('${item.name}')" 
                      class="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all">
                Trade Now
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  renderTicker() {
    const tickerContainer = document.getElementById('live-ticker-marquee');
    if (!tickerContainer) return;

    const rateInfo = this.currencyRates[this.currentCurrency];
    const tickerItems = this.rawPrices.slice(0, 8).map(p => {
      const converted = this.convertPrice(p.price);
      const isUp = p.is_up;
      return `
        <span class="inline-flex items-center gap-2 mx-4 cursor-pointer hover:underline" onclick="App.filterBySearch('${p.name}')">
          <span class="font-bold text-white text-xs">${p.name}:</span>
          <span class="font-black text-emerald-300 text-xs">${converted.formatted}</span>
          <span class="text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'} flex items-center">
            <i class="bi ${isUp ? 'bi-caret-up-fill' : 'bi-caret-down-fill'} text-[9px] mr-0.5"></i> ${p.change}
          </span>
        </span>
      `;
    }).join('');

    // Duplicate for seamless 100% infinite scroll loop
    tickerContainer.innerHTML = tickerItems + tickerItems;
  }
};

