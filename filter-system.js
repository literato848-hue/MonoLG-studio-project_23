// Uzlabota produktu filtrēšanas sistēma
class ProductFilter {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.activeFilters = {
            brands: [],
            battery: [],
            categories: [],
            priceRange: { min: 0, max: 1000 }
        };
        this.sortBy = 'relevance';
        this.searchTerm = '';
        this.currentPage = 1;
        this.itemsPerPage = 9;
        
        this.init();
    }
    
    init() {
        this.collectProducts();
        this.createPriceFilter();
        this.bindEvents();
        this.loadFiltersFromURL();
        this.applyFiltersAndSort();
    }
    
    // Savāc produktus no HTML
    collectProducts() {
        const productElements = document.querySelectorAll('.single-product-wrap');
        
        productElements.forEach((element, index) => {
            const nameElement = element.querySelector('.product_name');
            const priceElement = element.querySelector('.new-price');
            const manufacturerElement = element.querySelector('.manufacturer a');
            const imageElement = element.querySelector('.product-image img');
            
            if (nameElement && priceElement) {
                const productName = nameElement.textContent.trim();
                const priceText = priceElement.textContent.replace(/[^\d.,]/g, '');
                const price = parseFloat(priceText.replace(',', '.')) || 0;
                let manufacturer = manufacturerElement ? manufacturerElement.textContent.trim() : 'Nav norādīts';
                
                // Automātiski nosaka zīmolu no produkta nosaukuma, ja nav norādīts
                if (manufacturer === 'Graphic Corner' || manufacturer === 'Nav norādīts') {
                    manufacturer = this.extractBrandFromName(productName);
                }
                
                this.products.push({
                    id: `product_${index}`,
                    element: element,
                    name: productName,
                    price: price,
                    manufacturer: manufacturer,
                    category: this.determineCategory(productName),
                    batteryInfo: this.extractBatteryInfo(productName)
                });
            }
        });
        
        console.log('Savākti produkti:', this.products);
    }
    
    // Izvelk zīmolu no produkta nosaukuma
    extractBrandFromName(productName) {
        const name = productName.toLowerCase();
        if (name.includes('yato')) return 'Yato';
        if (name.includes('sthor')) return 'Sthor';
        if (name.includes('power up')) return 'Power Up';
        if (name.includes('brenar')) return 'Brenar';
        if (name.includes('tresnar')) return 'Tresnar';
        if (name.includes('geko')) return 'Geko';
        if (name.includes('hurry up')) return 'Hurry Up';
        if (name.includes('flo')) return 'Flo';
        return 'Nav norādīts';
    }
    
    determineCategory(productName) {
        const name = productName.toLowerCase();
        if (name.includes('urbj') || name.includes('triecienurb')) return 'urbjmasinas';
        if (name.includes('zāģis') || name.includes('ķēdes')) return 'zagi';
        if (name.includes('slīp')) return 'slipmasinas';
        if (name.includes('frēz')) return 'frezes';
        if (name.includes('skrūvgriezis')) return 'skruvgriexi';
        return 'citi';
    }
    
    extractBatteryInfo(productName) {
        const name = productName.toLowerCase();
        const info = {
            hasWithBattery: name.includes('akumulators') || name.includes('1 ×') || name.includes('2 ×'),
            withoutBattery: name.includes('bez akumulatora'),
            capacity: null
        };
        
        const capacityMatch = name.match(/(\d+)\s*ah/);
        if (capacityMatch) {
            info.capacity = parseInt(capacityMatch[1]);
        } else {
            // Mēģina atrast kapacitāti produkta nosaukumā
            const capacityMatch2 = name.match(/(\d+)\s*(ah|a-h)/);
            if (capacityMatch2) {
                info.capacity = parseInt(capacityMatch2[1]);
            }
        }
        
        return info;
    }
    
    // Izveido cenu filtru
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
            this.updateURL();
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
        // LABOTAIS ZĪMOLU FILTRS - meklē pareizos input elementus
        document.querySelectorAll('input[name="product-brand"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.handleFilters());
        });
        
        // Akumulatoru filtri
        document.addEventListener('change', (e) => {
            if (e.target.name === 'battery-filter') {
                this.handleFilters();
            }
        });
        
        // Kārtošanas select
        const sortSelect = document.querySelector('.product-short select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.applyFiltersAndSort();
                this.updateURL();
            });
        }
        
        // Kategoriju navigācija sānjoslā
        document.querySelectorAll('.category-sub-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const categoryText = e.target.textContent.trim();
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
                this.searchTerm = e.target.value;
                this.handleFilters();
            });
        }
        
        // URL izmaiņas
        window.addEventListener('popstate', () => {
            this.loadFiltersFromURL();
            this.applyFiltersAndSort();
        });
    }
    
    handleFilters() {
        // LABOTAIS ZĪMOLU FILTRS
        this.activeFilters.brands = Array.from(
            document.querySelectorAll('input[name="product-brand"]:checked')
        ).map(cb => {
            // Meklē zīmola nosaukumu no blakus esošā img vai teksta
            const brandLink = cb.nextElementSibling;
            if (brandLink && brandLink.classList.contains('brand-link')) {
                return brandLink.textContent.trim();
            }
            return cb.value; // Fallback uz value
        }).filter(brand => brand && brand !== '------');
        
        // Akumulatori
        this.activeFilters.battery = Array.from(
            document.querySelectorAll('input[name="battery-filter"]:checked')
        ).map(cb => cb.value);
        
        this.currentPage = 1;
        this.applyFiltersAndSort();
        this.updateURL();
    }
    
    applyFiltersAndSort() {
        // Filtrē produktus
        this.filteredProducts = this.products.filter(product => {
            return this.matchesBrandFilter(product) && 
                   this.matchesBatteryFilter(product) && 
                   this.matchesPriceFilter(product) &&
                   this.matchesCategoryFilter(product) &&
                   this.matchesSearchTerm(product);
        });
        
        // Kārto produktus
        this.sortProducts();
        
        // Attēlo rezultātus
        this.displayProducts();
        this.updateProductCount();
    }
    
    matchesSearchTerm(product) {
        if (!this.searchTerm) return true;
        const term = this.searchTerm.toLowerCase();
        return product.name.toLowerCase().includes(term) ||
               product.manufacturer.toLowerCase().includes(term);
    }
    
    matchesBrandFilter(product) {
        if (this.activeFilters.brands.length === 0) return true;
        
        // Pārbauda vai produkta zīmols ir filtru sarakstā
        return this.activeFilters.brands.some(brand => 
            product.manufacturer.toLowerCase() === brand.toLowerCase()
        );
    }
    
    matchesBatteryFilter(product) {
        if (this.activeFilters.battery.length === 0) return true;
        
        return this.activeFilters.battery.some(filter => {
            switch (filter) {
                case 'with-battery':
                    return product.batteryInfo.hasWithBattery;
                case 'without-battery':
                    return product.batteryInfo.withoutBattery;
                case '2ah':
                    return product.batteryInfo.capacity === 2;
                case '3ah':
                    return product.batteryInfo.capacity === 3;
                case '4ah':
                    return product.batteryInfo.capacity === 4;
                case '6ah':
                    return product.batteryInfo.capacity === 6;
                case '9ah':
                    return product.batteryInfo.capacity === 9;
                default:
                    return false;
            }
        });
    }
    
    matchesPriceFilter(product) {
        if (product.price <= 0) return false;
        return product.price >= this.activeFilters.priceRange.min && 
               product.price <= this.activeFilters.priceRange.max;
    }
    
    matchesCategoryFilter(product) {
        if (this.activeFilters.categories.length === 0) return true;
        
        return this.activeFilters.categories.some(category => {
            const categoryLower = category.toLowerCase();
            const productName = product.name.toLowerCase();
            const productCategory = product.category.toLowerCase();
            
            // Pārbauda kategoriju atbilstību
            switch (categoryLower) {
                case 'urbjmašīnas':
                case 'tiecienurbjmašīnas':
                    return productCategory === 'urbjmasinas' || productName.includes('urbj');
                case 'zāģi':
                case 'ķēdes zāģi':
                case 'ripzāģi':
                case 'zobenzāģi':
                    return productCategory === 'zagi' || productName.includes('zāģ');
                case 'slīpmašīnas':
                case 'leņķa slīpmašīnas':
                case 'orbitālās slīpmašīnas':
                    return productCategory === 'slipmasinas' || productName.includes('slīp');
                case 'skrūvgrieži':
                case 'urbji-skrūvgrieži':
                    return productCategory === 'skruvgriexi' || productName.includes('skrūv');
                case 'komplekti':
                    return productName.includes('komplekt');
                default:
                    return true;
            }
        });
    }
    
    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            switch (this.sortBy) {
                case 'trending':
                    return 0; // Relevance - nav kārtošana
                case 'sales':
                    return a.name.localeCompare(b.name, 'lv'); // Name (A - Z)
                case 'name-desc':
                    return b.name.localeCompare(a.name, 'lv'); // Name (Z - A)
                case 'rating':
                    return a.price - b.price; // Price (Low > High)
                case 'date':
                    return b.price - a.price; // Price (High > Low)
                case 'price-asc':
                    return a.manufacturer.localeCompare(b.manufacturer, 'lv'); // Manufacturer
                default:
                    return 0;
            }
        });
    }
    
    // Kategoriju filtrēšana
    handleCategoryFilter(categoryName) {
        // Notīra esošos filtrus
        this.clearAllFilters();
        
        // Pielieto kategoriju filtru
        this.activeFilters.categories = [categoryName];
        
        this.applyFiltersAndSort();
        this.updateURL();
    }
    
    displayProducts() {
        const productContainer = document.querySelector('#grid-view .row');
        if (!productContainer) return;
        
        // Paslēpj visas produktu kolonnas
        const allColumns = productContainer.querySelectorAll('.col-lg-4, .col-lg-3');
        allColumns.forEach(col => {
            col.style.display = 'none';
        });
        
        // Parāda filtrētos produktus
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        pageProducts.forEach((product) => {
            const parentCol = product.element.closest('.col-lg-4, .col-lg-3, .col-md-4, .col-sm-6');
            if (parentCol) {
                parentCol.style.display = 'block';
                
                // Optimizē produkta kartītes
                this.optimizeProductCard(product.element);
            }
        });
        
        this.showNoResultsMessage();
        this.updatePagination();
    }
    
    optimizeProductCard(element) {
        // Samazina produkta tekstu un izmērus
        const productDesc = element.querySelector('.product_desc_info h4 a');
        if (productDesc) {
            productDesc.style.fontSize = '13px';
            productDesc.style.lineHeight = '1.2';
            productDesc.style.display = '-webkit-box';
            productDesc.style.webkitLineClamp = '2';
            productDesc.style.webkitBoxOrient = 'vertical';
            productDesc.style.overflow = 'hidden';
            productDesc.style.height = '32px';
        }
        
        // Samazina produkta attēlu
        const productImage = element.querySelector('.product-image img');
        if (productImage) {
            productImage.style.maxHeight = '160px';
            productImage.style.objectFit = 'contain';
        }
        
        // Samazina cenu tekstu
        const priceBox = element.querySelector('.price-box');
        if (priceBox) {
            priceBox.style.fontSize = '14px';
            priceBox.style.marginTop = '8px';
        }
        
        // Samazina zīmola tekstu
        const manufacturer = element.querySelector('.manufacturer');
        if (manufacturer) {
            manufacturer.style.fontSize = '12px';
            manufacturer.style.marginBottom = '5px';
        }
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
                        <button onclick="productFilter.clearAllFilters()" 
                                style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                            Notīrīt filtrus
                        </button>
                    </div>
                `;
                document.querySelector('#grid-view .row').appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
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
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const paginationElement = document.querySelector('.pagination-box');
        
        if (!paginationElement || totalPages <= 1) {
            if (paginationElement) paginationElement.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous poga
        if (this.currentPage > 1) {
            paginationHTML += `<li><a href="#" class="Previous" data-page="${this.currentPage - 1}">
                <i class="fa fa-chevron-left"></i> Previous</a></li>`;
        }
        
        // Lapas numuri
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            const isActive = i === this.currentPage ? 'active' : '';
            paginationHTML += `<li class="${isActive}"><a href="#" data-page="${i}">${i}</a></li>`;
        }
        
        // Next poga
        if (this.currentPage < totalPages) {
            paginationHTML += `<li><a href="#" class="Next" data-page="${this.currentPage + 1}">
                Next <i class="fa fa-chevron-right"></i></a></li>`;
        }
        
        paginationElement.innerHTML = paginationHTML;
        
        // Pievieno notikumu klausītājus
        paginationElement.querySelectorAll('a[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = parseInt(e.target.dataset.page);
                this.displayProducts();
                this.updateProductCount();
                this.updateURL();
            });
        });
    }
    
    // URL pārvaldība
    updateURL() {
        const params = new URLSearchParams();
        
        if (this.activeFilters.brands.length > 0) {
            params.set('brands', this.activeFilters.brands.join(','));
        }
        if (this.activeFilters.battery.length > 0) {
            params.set('battery', this.activeFilters.battery.join(','));
        }
        if (this.activeFilters.priceRange.min > 0 || this.activeFilters.priceRange.max < 1000) {
            params.set('priceMin', this.activeFilters.priceRange.min);
            params.set('priceMax', this.activeFilters.priceRange.max);
        }
        if (this.searchTerm) {
            params.set('search', this.searchTerm);
        }
        if (this.sortBy !== 'relevance') {
            params.set('sort', this.sortBy);
        }
        if (this.currentPage > 1) {
            params.set('page', this.currentPage);
        }
        
        const newURL = params.toString() ? `${location.pathname}?${params.toString()}` : location.pathname;
        history.replaceState({}, '', newURL);
    }
    
    loadFiltersFromURL() {
        const params = new URLSearchParams(location.search);
        
        // Ielādē zīmolus
        if (params.get('brands')) {
            this.activeFilters.brands = params.get('brands').split(',');
            this.activeFilters.brands.forEach(brand => {
                const checkbox = Array.from(document.querySelectorAll('input[name="product-brand"]'))
                    .find(cb => {
                        const brandLink = cb.nextElementSibling;
                        return brandLink && brandLink.textContent.trim() === brand;
                    });
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Ielādē akumulatorus
        if (params.get('battery')) {
            this.activeFilters.battery = params.get('battery').split(',');
            this.activeFilters.battery.forEach(battery => {
                const checkbox = document.querySelector(`input[name="battery-filter"][value="${battery}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
        
        // Ielādē cenu
        if (params.get('priceMin')) {
            this.activeFilters.priceRange.min = parseFloat(params.get('priceMin'));
        }
        if (params.get('priceMax')) {
            this.activeFilters.priceRange.max = parseFloat(params.get('priceMax'));
        }
        
        // Ielādē meklēšanu
        if (params.get('search')) {
            this.searchTerm = params.get('search');
            const searchInput = document.querySelector('.hm-searchbox input[type="text"]');
            if (searchInput) searchInput.value = this.searchTerm;
        }
        
        // Ielādē kārtošanu
        if (params.get('sort')) {
            this.sortBy = params.get('sort');
        }
        
        // Ielādē lapu
        if (params.get('page')) {
            this.currentPage = parseInt(params.get('page'));
        }
    }
    
    clearAllFilters() {
        // Notīra checkboxes
        document.querySelectorAll('input[name="product-brand"], input[name="battery-filter"]')
            .forEach(checkbox => checkbox.checked = false);
        
        // Notīra meklēšanu
        const searchInput = document.querySelector('.hm-searchbox input[type="text"]');
        if (searchInput) searchInput.value = '';
        
        // Atjauno cenu filtru
        if (document.getElementById('priceRangeMin')) {
            const prices = this.products.map(p => p.price).filter(p => p > 0);
            if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                
                document.getElementById('priceRangeMin').value = minPrice;
                document.getElementById('priceRangeMax').value = maxPrice;
                document.getElementById('priceMin').value = minPrice;
                document.getElementById('priceMax').value = maxPrice;
                document.getElementById('currentMinPrice').textContent = minPrice;
                document.getElementById('currentMaxPrice').textContent = maxPrice;
                
                this.activeFilters.priceRange = { min: minPrice, max: maxPrice };
            }
        }
        
        // Atjauno mainīgos
        this.activeFilters.brands = [];
        this.activeFilters.battery = [];
        this.activeFilters.categories = [];
        this.searchTerm = '';
        this.sortBy = 'relevance';
        this.currentPage = 1;
        
        this.applyFiltersAndSort();
        this.updateURL();
    }
}

// Palaiž sistēmu
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.productFilter = new ProductFilter();
    }, 500);
});