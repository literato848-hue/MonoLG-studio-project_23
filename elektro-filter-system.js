// Elektroinstrumentu filtru sistēma
class ElektroFilterSystem {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.activeFilters = {
            brands: [],
            power: [],
            toolType: [],
            features: [],
            priceRange: { min: 0, max: 500 }
        };
        this.sortBy = 'relevance';
        this.searchTerm = '';
        this.currentPage = 1;
        this.itemsPerPage = 6;
        
        this.init();
    }
    
    init() {
        // Gaida DOM ielādi
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.collectProducts();
        this.createPriceFilter();
        this.bindEvents();
        this.applyFiltersAndSort();
        console.log('ElektroFilterSystem inicializēts ar', this.products.length, 'produktiem');
    }
    
    collectProducts() {
        const productElements = document.querySelectorAll('.single-product-wrap');
        
        productElements.forEach((element, index) => {
            const nameElement = element.querySelector('.product_name');
            const priceElement = element.querySelector('.new-price');
            const manufacturerElement = element.querySelector('.manufacturer a');
            
            if (nameElement && priceElement) {
                const productName = nameElement.textContent.trim();
                const priceText = priceElement.textContent.replace(/[^\d.,]/g, '');
                const price = parseFloat(priceText.replace(',', '.')) || 0;
                const manufacturer = manufacturerElement ? manufacturerElement.textContent.trim() : 'Nav norādīts';
                
                this.products.push({
                    id: `product_${index}`,
                    element: element,
                    name: productName,
                    price: price,
                    manufacturer: manufacturer,
                    category: this.determineCategory(productName),
                    power: this.extractPowerInfo(productName),
                    features: this.extractFeatures(productName)
                });
            }
        });
        
        console.log('Savākti produkti:', this.products);
    }
    
    determineCategory(productName) {
        const name = productName.toLowerCase();
        if (name.includes('urbj') || name.includes('drill')) return 'drills';
        if (name.includes('slīp') || name.includes('grinder')) return 'grinders';
        if (name.includes('zāģ') || name.includes('saw')) return 'saws';
        if (name.includes('frēz') || name.includes('router')) return 'routers';
        if (name.includes('plān') || name.includes('planer')) return 'planers';
        if (name.includes('perfora') || name.includes('hammer')) return 'hammers';
        if (name.includes('pistol') || name.includes('heat')) return 'heat-guns';
        return 'other';
    }
    
    extractPowerInfo(productName) {
        const powerMatch = productName.match(/(\d+)W/);
        const power = powerMatch ? parseInt(powerMatch[1]) : 0;
        
        if (power <= 500) return '500w';
        if (power <= 1000) return '500-1000w';
        if (power <= 1500) return '1000-1500w';
        if (power <= 2000) return '1500-2000w';
        if (power <= 2500) return '2000-2500w';
        return '2500w-plus';
    }
    
    extractFeatures(productName) {
        const features = [];
        const name = productName.toLowerCase();
        
        if (name.includes('regulē') || name.includes('variable')) features.push('variable-speed');
        if (name.includes('led')) features.push('led-light');
        if (name.includes('putekļ') || name.includes('dust')) features.push('dust-extraction');
        if (name.includes('mīkst') || name.includes('soft')) features.push('soft-start');
        if (name.includes('bremz') || name.includes('brake')) features.push('electronic-brake');
        if (name.includes('vibrāc') || name.includes('vibrat')) features.push('vibration-control');
        
        return features;
    }
    
    createPriceFilter() {
        const sidebarBox = document.querySelector('.sidebar-categores-box:last-child');
        if (!sidebarBox) return;
        
        const prices = this.products.map(p => p.price).filter(p => p > 0);
        if (prices.length === 0) return;
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const priceFilterHTML = `
            <div class="filter-sub-area pt-sm-10 pt-xs-10">
                <h5 class="filter-sub-titel">Cena (€)</h5>
                <div class="price-range-filter">
                    <div class="price-inputs" style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <input type="number" id="priceMin" placeholder="No" min="${minPrice}" max="${maxPrice}" 
                               style="width: 48%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <input type="number" id="priceMax" placeholder="Līdz" min="${minPrice}" max="${maxPrice}"
                               style="width: 48%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div class="price-range-slider" style="margin-bottom: 10px;">
                        <input type="range" id="priceRangeMin" min="${minPrice}" max="${maxPrice}" value="${minPrice}"
                               style="width: 100%; margin-bottom: 5px;">
                        <input type="range" id="priceRangeMax" min="${minPrice}" max="${maxPrice}" value="${maxPrice}"
                               style="width: 100%;">
                    </div>
                    <div class="price-display" style="text-align: center; font-size: 14px; color: #666;">
                        €<span id="currentMinPrice">${minPrice}</span> - €<span id="currentMaxPrice">${maxPrice}</span>
                    </div>
                </div>
            </div>
        `;
        
        sidebarBox.insertAdjacentHTML('beforeend', priceFilterHTML);
        this.activeFilters.priceRange = { min: minPrice, max: maxPrice };
        this.bindPriceEvents();
    }
    
    bindPriceEvents() {
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const rangeMin = document.getElementById('priceRangeMin');
        const rangeMax = document.getElementById('priceRangeMax');
        const displayMin = document.getElementById('currentMinPrice');
        const displayMax = document.getElementById('currentMaxPrice');
        
        if (!priceMin || !priceMax || !rangeMin || !rangeMax) return;
        
        const updatePriceFilter = () => {
            const min = Math.min(parseFloat(rangeMin.value), parseFloat(rangeMax.value));
            const max = Math.max(parseFloat(rangeMin.value), parseFloat(rangeMax.value));
            
            this.activeFilters.priceRange = { min, max };
            priceMin.value = min;
            priceMax.value = max;
            displayMin.textContent = min;
            displayMax.textContent = max;
            
            this.applyFiltersAndSort();
        };
        
        rangeMin.addEventListener('input', updatePriceFilter);
        rangeMax.addEventListener('input', updatePriceFilter);
        priceMin.addEventListener('change', () => {
            rangeMin.value = priceMin.value;
            updatePriceFilter();
        });
        priceMax.addEventListener('change', () => {
            rangeMax.value = priceMax.value;
            updatePriceFilter();
        });
    }
    
    bindEvents() {
        // Zīmolu filtri
        document.addEventListener('change', (e) => {
            if (e.target.name === 'product-brand') {
                this.handleFilters();
            }
        });
        
        // Jaudas filtri
        document.addEventListener('change', (e) => {
            if (e.target.name === 'power-filter') {
                this.handleFilters();
            }
        });
        
        // Instrumenta veida filtri
        document.addEventListener('change', (e) => {
            if (e.target.name === 'tool-type') {
                this.handleFilters();
            }
        });
        
        // Īpašību filtri
        document.addEventListener('change', (e) => {
            if (e.target.name === 'features') {
                this.handleFilters();
            }
        });
        
        // Kategoriju navigācija
        document.querySelectorAll('.category-sub-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryText = e.target.textContent.trim().toLowerCase();
                this.handleCategoryFilter(categoryText);
            });
        });
        
        // Notīrīt filtrus
        const clearButton = document.querySelector('.btn-clear-all');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearAllFilters());
        }
        
        // Meklēšana
        const searchInput = document.querySelector('.hm-searchbox input[type="text"]');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.handleFilters();
            });
        }
        
        // View toggle
        document.querySelectorAll('.shop-item-filter-list a').forEach(tab => {
            tab.addEventListener('click', () => {
                setTimeout(() => this.displayProducts(), 100);
            });
        });
    }
    
    handleFilters() {
        // Zīmoli
        this.activeFilters.brands = Array.from(
            document.querySelectorAll('input[name="product-brand"]:checked')
        ).map(cb => cb.value);
        
        // Jauda
        this.activeFilters.power = Array.from(
            document.querySelectorAll('input[name="power-filter"]:checked')
        ).map(cb => cb.value);
        
        // Instrumenta veids
        this.activeFilters.toolType = Array.from(
            document.querySelectorAll('input[name="tool-type"]:checked')
        ).map(cb => cb.value);
        
        // Īpašības
        this.activeFilters.features = Array.from(
            document.querySelectorAll('input[name="features"]:checked')
        ).map(cb => cb.value);
        
        this.currentPage = 1;
        this.applyFiltersAndSort();
    }
    
    handleCategoryFilter(categoryName) {
        this.clearAllFilters();
        
        // Pielietot kategorijas filtru
        let toolTypeFilter = '';
        switch (categoryName) {
            case 'urbjmašīnas':
            case 'elektriskās urbjmašīnas':
            case 'triecienurbjmašīnas':
                toolTypeFilter = 'drills';
                break;
            case 'slīpmašīnas':
            case 'leņķa slīpmašīnas':
                toolTypeFilter = 'grinders';
                break;
            case 'zāģi':
            case 'ripzāģi':
                toolTypeFilter = 'saws';
                break;
            case 'frēzes':
                toolTypeFilter = 'routers';
                break;
            case 'plānotāji':
                toolTypeFilter = 'planers';
                break;
            case 'perforatori':
                toolTypeFilter = 'hammers';
                break;
        }
        
        if (toolTypeFilter) {
            const checkbox = document.querySelector(`input[name="tool-type"][value="${toolTypeFilter}"]`);
            if (checkbox) {
                checkbox.checked = true;
                this.activeFilters.toolType = [toolTypeFilter];
            }
        }
        
        this.applyFiltersAndSort();
    }
    
    applyFiltersAndSort() {
        // Filtrē produktus
        this.filteredProducts = this.products.filter(product => {
            return this.matchesBrandFilter(product) && 
                   this.matchesPowerFilter(product) && 
                   this.matchesToolTypeFilter(product) &&
                   this.matchesFeaturesFilter(product) &&
                   this.matchesPriceFilter(product) &&
                   this.matchesSearchTerm(product);
        });
        
        // Attēlo rezultātus
        this.displayProducts();
        this.updateProductCount();
        
        console.log(`Filtrēti ${this.filteredProducts.length} no ${this.products.length} produktiem`);
    }
    
    matchesBrandFilter(product) {
        if (this.activeFilters.brands.length === 0) return true;
        return this.activeFilters.brands.some(brand => {
            return product.manufacturer.toLowerCase().includes(brand.toLowerCase());
        });
    }
    
    matchesPowerFilter(product) {
        if (this.activeFilters.power.length === 0) return true;
        return this.activeFilters.power.includes(product.power);
    }
    
    matchesToolTypeFilter(product) {
        if (this.activeFilters.toolType.length === 0) return true;
        return this.activeFilters.toolType.includes(product.category);
    }
    
    matchesFeaturesFilter(product) {
        if (this.activeFilters.features.length === 0) return true;
        return this.activeFilters.features.some(feature => 
            product.features.includes(feature)
        );
    }
    
    matchesPriceFilter(product) {
        return product.price >= this.activeFilters.priceRange.min && 
               product.price <= this.activeFilters.priceRange.max;
    }
    
    matchesSearchTerm(product) {
        if (!this.searchTerm) return true;
        return product.name.toLowerCase().includes(this.searchTerm) ||
               product.manufacturer.toLowerCase().includes(this.searchTerm);
    }
    
    displayProducts() {
        const gridContainer = document.querySelector('#grid-view .row');
        if (!gridContainer) return;
        
        // Paslēpj visus produktus
        const allColumns = gridContainer.querySelectorAll('.col-lg-4, .col-md-4, .col-sm-6');
        allColumns.forEach(col => {
            col.style.display = 'none';
        });
        
        // Parāda filtrētos produktus
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        pageProducts.forEach(product => {
            const parentCol = product.element.closest('.col-lg-4, .col-md-4, .col-sm-6');
            if (parentCol) {
                parentCol.style.display = 'block';
            }
        });
        
        this.showNoResultsMessage();
    }
    
    showNoResultsMessage() {
        let noResultsMsg = document.querySelector('.no-results-message');
        
        if (this.filteredProducts.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message col-12';
                noResultsMsg.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-bottom: 15px; color: #666;">Nav atrasts neviens produkts</h4>
                        <p style="margin-bottom: 20px; color: #888;">Mēģiniet mainīt filtra parametrus vai meklēšanas vārdus.</p>
                        <button onclick="elektroFilter.clearAllFilters()" 
                                style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                            Notīrīt filtrus
                        </button>
                    </div>
                `;
                const gridContainer = document.querySelector('#grid-view .row');
                if (gridContainer) {
                    gridContainer.appendChild(noResultsMsg);
                }
            }
            if (noResultsMsg) noResultsMsg.style.display = 'block';
        } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
    
    updateProductCount() {
        const countElement = document.querySelector('.toolbar-amount span');
        if (countElement) {
            const start = this.filteredProducts.length > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
            const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
            countElement.textContent = `Parāda ${start} līdz ${end} no ${this.filteredProducts.length}`;
        }
    }
    
    clearAllFilters() {
        // Notīra checkboxes
        document.querySelectorAll('input[name="product-brand"], input[name="power-filter"], input[name="tool-type"], input[name="features"]')
            .forEach(checkbox => checkbox.checked = false);
        
        // Notīra meklēšanu
        const searchInput = document.querySelector('.hm-searchbox input[type="text"]');
        if (searchInput) searchInput.value = '';
        
        // Atjauno cenu filtru
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const rangeMin = document.getElementById('priceRangeMin');
        const rangeMax = document.getElementById('priceRangeMax');
        
        if (rangeMin && rangeMax && this.products.length > 0) {
            const minPrice = Math.min(...this.products.map(p => p.price).filter(p => p > 0));
            const maxPrice = Math.max(...this.products.map(p => p.price).filter(p => p > 0));
            
            rangeMin.value = minPrice;
            rangeMax.value = maxPrice;
            if (priceMin) priceMin.value = minPrice;
            if (priceMax) priceMax.value = maxPrice;
            
            const displayMin = document.getElementById('currentMinPrice');
            const displayMax = document.getElementById('currentMaxPrice');
            if (displayMin) displayMin.textContent = minPrice;
            if (displayMax) displayMax.textContent = maxPrice;
            
            this.activeFilters.priceRange = { min: minPrice, max: maxPrice };
        }
        
        // Atjauno mainīgos
        this.activeFilters.brands = [];
        this.activeFilters.power = [];
        this.activeFilters.toolType = [];
        this.activeFilters.features = [];
        this.searchTerm = '';
        this.currentPage = 1;
        
        this.applyFiltersAndSort();
    }
}

// Inicializē sistēmu
let elektroFilter;
document.addEventListener('DOMContentLoaded', function() {
    elektroFilter = new ElektroFilterSystem();
});

// Globāli pieejama funkcija
window.elektroFilter = elektroFilter;