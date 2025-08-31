// ===========================================
// SIA ANGAVA UZLABOTA MEKLĒŠANAS SISTĒMA
// ===========================================

class AdvancedProductSearchSystem {
    constructor() {
        this.products = [];
        this.currentFilters = {
            category: '',
            brand: '',
            minPrice: 0,
            maxPrice: 9999,
            searchQuery: '',
            sortBy: 'relevance'
        };
        this.searchHistory = [];
        this.init();
    }

    init() {
        this.loadExistingProducts();
        this.setupSearchInterface();
        this.bindEvents();
        this.loadSearchHistory();
    }

    // Ielādē esošos produktus no HTML
    loadExistingProducts() {
        const productElements = document.querySelectorAll('.single-product-wrap');
        
        productElements.forEach((element, index) => {
            const productName = element.querySelector('.product_name');
            const priceElement = element.querySelector('.new-price');
            const manufacturerElement = element.querySelector('.manufacturer a');
            const imageElement = element.querySelector('.product-image img');
            
            if (productName && priceElement) {
                const productId = `product_${index + 1}`;
                const name = productName.textContent.trim();
                const priceText = priceElement.textContent.replace(/[€\s,]/g, '');
                const price = parseFloat(priceText) || 0;
                const brand = manufacturerElement ? manufacturerElement.textContent.trim() : 'Nav norādīts';
                const image = imageElement ? imageElement.src : 'images/product/default.jpg';
                const productUrl = productName.href || '#';
                
                // Kategorijas noteikšana
                const category = this.determineCategory(name);
                const subcategory = this.determineSubcategory(name);
                const keywords = this.generateKeywords(name, brand, category);

                const product = {
                    id: productId,
                    name: name,
                    price: price,
                    brand: brand,
                    category: category,
                    subcategory: subcategory,
                    keywords: keywords,
                    image: image,
                    url: productUrl,
                    element: element,
                    availability: 'pieejams',
                    rating: 0,
                    description: this.generateDescription(name, brand)
                };

                this.addDataAttributes(element, product);
                this.products.push(product);
            }
        });

        console.log(`Ielādēti ${this.products.length} produkti`);
    }

    // Kategoriju noteikšana
    determineCategory(name) {
        const nameLC = name.toLowerCase();
        
        if (nameLC.includes('galvu') && nameLC.includes('atslēgu') || 
            nameLC.includes('komplekts') || nameLC.includes('yato')) {
            return 'instrumenti';
        } else if (nameLC.includes('dzīvžogu') || nameLC.includes('climer')) {
            return 'dārza-tehnika';
        } else if (nameLC.includes('mug') || nameLC.includes('accusantium')) {
            return 'elektronika';
        } else {
            return 'citi';
        }
    }

    determineSubcategory(name) {
        const nameLC = name.toLowerCase();
        
        if (nameLC.includes('atslēgu') && nameLC.includes('komplekts')) {
            return 'atslēgu-komplekti';
        } else if (nameLC.includes('climer')) {
            return 'dārza-instrumenti';
        } else if (nameLC.includes('mug')) {
            return 'virtuves-piederumi';
        } else {
            return 'vispārīgi';
        }
    }

    generateKeywords(name, brand, category) {
        const keywords = new Set();
        
        name.toLowerCase().split(/[\s,.-]+/).forEach(word => {
            if (word.length > 2) keywords.add(word);
        });
        
        keywords.add(brand.toLowerCase());
        category.split('-').forEach(word => keywords.add(word));
        
        return Array.from(keywords);
    }

    generateDescription(name, brand) {
        return `${name} no ${brand} zīmola. Kvalitatīvs produkts labākajā cenā.`;
    }

    addDataAttributes(element, product) {
        element.setAttribute('data-product-id', product.id);
        element.setAttribute('data-category', product.category);
        element.setAttribute('data-subcategory', product.subcategory);
        element.setAttribute('data-brand', product.brand.toLowerCase());
        element.setAttribute('data-keywords', product.keywords.join(','));
        element.setAttribute('data-price', product.price);
        element.setAttribute('data-availability', product.availability);
        element.setAttribute('data-search-text', 
            `${product.name} ${product.brand} ${product.category} ${product.subcategory} ${product.keywords.join(' ')}`
            .toLowerCase());
    }

    // Izveido meklēšanas saskarni
    setupSearchInterface() {
        const existingSearchInput = document.querySelector('input[placeholder*="Ievadiet"], input[placeholder*="Enter"]');
        if (existingSearchInput) {
            this.searchInput = existingSearchInput;
            
            const searchContainer = existingSearchInput.closest('.hm-searchbox');
            if (searchContainer && !searchContainer.querySelector('.search-suggestions')) {
                this.enhanceExistingSearch(searchContainer);
            }
        }
    }

    // Uzlabo esošo meklēšanas lauku
    enhanceExistingSearch(container) {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'search-suggestions';
        suggestionDiv.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
            z-index: 1000;
            max-height: 400px;
            overflow-y: auto;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        container.style.position = 'relative';
        container.appendChild(suggestionDiv);

        const resultCount = document.createElement('div');
        resultCount.className = 'search-result-count';
        resultCount.style.cssText = `
            position: absolute;
            top: -25px;
            right: 0;
            font-size: 12px;
            color: #666;
            display: none;
        `;
        container.appendChild(resultCount);
    }

    // Pievieno event listeners
    bindEvents() {
        if (this.searchInput) {
            // Ievades apstrāde
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Enter taustiņš - atver rezultātu lapu
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.openSearchResultsPage(e.target.value);
                }
            });

            // Fokuss
            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.length < 2) {
                    this.showPopularSearches();
                }
            });

            // Kliks ārpus meklēšanas
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.hm-searchbox')) {
                    this.hideSuggestions();
                }
            });
        }

        // Meklēšanas poga - atver rezultātu lapu
        const searchButton = document.querySelector('.hm-searchbox .li-btn, .hm-searchbox button[type="submit"]');
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                const query = this.searchInput.value;
                this.openSearchResultsPage(query);
            });
        }
    }

    // Apstrādā meklēšanas ievadi
    handleSearchInput(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const suggestions = this.getSuggestions(query);
        this.showSuggestions(suggestions);
    }

    // Iegūst ieteikumus
    getSuggestions(query) {
        const queryLC = query.toLowerCase();
        const suggestions = [];
        const seen = new Set();

        // Produktu nosaukumi
        this.products.forEach(product => {
            if (product.name.toLowerCase().includes(queryLC) && 
                !seen.has(product.name.toLowerCase())) {
                suggestions.push({
                    type: 'product',
                    text: product.name,
                    value: product.name,
                    price: product.price,
                    image: product.image,
                    url: product.url,
                    product: product
                });
                seen.add(product.name.toLowerCase());
            }
        });

        // Kategorijas
        const categories = [...new Set(this.products.map(p => p.category))];
        categories.forEach(cat => {
            if (cat.toLowerCase().includes(queryLC)) {
                suggestions.push({
                    type: 'category',
                    text: `Kategorija: ${this.formatCategoryName(cat)}`,
                    value: cat
                });
            }
        });

        // Zīmoli
        const brands = [...new Set(this.products.map(p => p.brand))];
        brands.forEach(brand => {
            if (brand.toLowerCase().includes(queryLC)) {
                suggestions.push({
                    type: 'brand',
                    text: `Zīmols: ${brand}`,
                    value: brand
                });
            }
        });

        return suggestions.slice(0, 6);
    }

    // Formatē kategorijas nosaukumu
    formatCategoryName(category) {
        const categoryNames = {
            'instrumenti': 'Instrumenti',
            'dārza-tehnika': 'Dārza tehnika',
            'elektronika': 'Elektronika',
            'citi': 'Citi'
        };
        return categoryNames[category] || category;
    }

    // Rāda ieteikumus
    showSuggestions(suggestions) {
        const suggestionDiv = document.querySelector('.search-suggestions');
        if (!suggestionDiv) return;

        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionDiv.innerHTML = suggestions.map(item => {
            let html = `<div class="suggestion-item" data-type="${item.type}" data-value="${item.value}">`;

            if (item.type === 'product') {
                html += `
                    <div class="suggestion-content" style="display: flex; align-items: center; padding: 10px; cursor: pointer;">
                        <img src="${item.image}" alt="" style="width: 40px; height: 40px; margin-right: 10px; border-radius: 3px;">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; color: #333;">${item.text}</div>
                            <div style="font-size: 12px; color: #666;">Produkts</div>
                        </div>
                        <span style="font-weight: bold; color: #28a745;">€${item.price}</span>
                    </div>
                `;
            } else {
                const icon = item.type === 'category' ? '📁' : '🏷️';
                html += `
                    <div class="suggestion-content" style="display: flex; align-items: center; padding: 10px; cursor: pointer;">
                        <span style="margin-right: 10px; font-size: 18px;">${icon}</span>
                        <span style="color: #555;">${item.text}</span>
                    </div>
                `;
            }

            html += `</div>`;
            return html;
        }).join('');

        // Pievienojam click events
        suggestionDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const value = item.dataset.value;
                
                if (type === 'product') {
                    // Atver konkrēto produktu
                    const suggestion = suggestions.find(s => s.value === value && s.type === 'product');
                    if (suggestion && suggestion.url && suggestion.url !== '#') {
                        window.location.href = suggestion.url;
                    } else {
                        // Ja nav URL, meklē pēc nosaukuma
                        this.openSearchResultsPage(value);
                    }
                } else if (type === 'category') {
                    this.openSearchResultsPage('', { category: value });
                } else if (type === 'brand') {
                    this.openSearchResultsPage('', { brand: value });
                }
                
                this.hideSuggestions();
            });

            // Hover effects
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });
        });

        suggestionDiv.style.display = 'block';
    }

    // Slēpj ieteikumus
    hideSuggestions() {
        const suggestionDiv = document.querySelector('.search-suggestions');
        if (suggestionDiv) {
            suggestionDiv.style.display = 'none';
        }
    }

    // Rāda populārus meklējumus
    showPopularSearches() {
        const popular = [
            { text: 'Yato instrumenti', value: 'yato', type: 'brand' },
            { text: 'Atslēgu komplekti', value: 'atslēgu komplekti', type: 'search' },
            { text: 'Dzīvžogu climeri', value: 'dzīvžogu climer', type: 'search' },
            { text: 'Instrumenti', value: 'instrumenti', type: 'category' }
        ];

        this.showSuggestions(popular.map(item => ({
            type: item.type,
            text: `🔥 ${item.text}`,
            value: item.value
        })));
    }

    // **GALVENĀ FUNKCIJA** - Atver meklēšanas rezultātu lapu
    openSearchResultsPage(query, filters = {}) {
        // Saglabā meklēšanas parametrus
        const searchParams = new URLSearchParams();
        
        if (query) {
            searchParams.set('q', query);
            this.saveSearchHistory(query);
        }
        
        if (filters.category) {
            searchParams.set('category', filters.category);
        }
        
        if (filters.brand) {
            searchParams.set('brand', filters.brand);
        }

        // Pārbauda, vai esam uz shop lapas
        const currentPage = window.location.pathname;
        const isShopPage = currentPage.includes('shop-list') || 
                          currentPage.includes('shop-left') || 
                          currentPage.includes('shop-right');

        if (isShopPage) {
            // Ja jau esam uz shop lapas, filtrē produktus
            this.filterProductsOnCurrentPage(query, filters);
        } else {
            // Pāriet uz shop-list-left-sidebar.html ar parametriem
            const targetUrl = `shop-list-left-sidebar.html?${searchParams.toString()}`;
            window.location.href = targetUrl;
        }
    }

    // Filtrē produktus esošajā lapā
    filterProductsOnCurrentPage(query, filters) {
        const results = this.searchProducts(query, filters);
        this.displayResultsOnShopPage(results, query, filters);
        this.updateUrlParams(query, filters);
    }

    // Meklē produktus
    searchProducts(query, filters = {}) {
        const queryLC = query ? query.toLowerCase() : '';
        const results = [];

        this.products.forEach(product => {
            let score = 0;

            // Kategorijas filtrs
            if (filters.category && product.category !== filters.category) {
                return;
            }

            // Zīmola filtrs
            if (filters.brand && !product.brand.toLowerCase().includes(filters.brand.toLowerCase())) {
                return;
            }

            // Teksta meklēšana
            if (query) {
                if (product.name.toLowerCase().includes(queryLC)) {
                    score += 100;
                    if (product.name.toLowerCase().startsWith(queryLC)) {
                        score += 50;
                    }
                }

                if (product.brand.toLowerCase().includes(queryLC)) {
                    score += 80;
                }

                if (product.category.toLowerCase().includes(queryLC)) {
                    score += 60;
                }

                product.keywords.forEach(keyword => {
                    if (keyword.includes(queryLC)) {
                        score += 40;
                    }
                });

                if (score === 0) {
                    return; // Nav atbilstības
                }
            } else {
                score = 10; // Ja nav query, rāda visus ar zemāku prioritāti
            }

            results.push({ product, score });
        });

        return results.sort((a, b) => b.score - a.score).map(item => item.product);
    }

    // Rāda rezultātus shop lapā
    displayResultsOnShopPage(results, query, filters) {
        // Atjaunina galveno saturu
        this.updateShopPageContent(results, query, filters);
        
        // Atjaunina sidebar filtrus
        this.updateSidebarFilters(results);
        
        // Atjaunina rezultātu skaitu
        this.updateResultCount(results.length, query);
    }

    // Atjaunina shop lapas saturu
    updateShopPageContent(results, query, filters) {
        const productContainer = document.querySelector('#list-view .col, .shop-products-wrapper');
        if (!productContainer) return;

        const listContainer = productContainer.querySelector('#list-view .col') || 
                             productContainer;

        if (results.length === 0) {
            listContainer.innerHTML = this.createNoResultsHTML(query);
            return;
        }

        // Izveido HTML sarakstu
        const resultsHTML = results.map(product => this.createProductListHTML(product)).join('');
        
        listContainer.innerHTML = `<div class="row">${resultsHTML}</div>`;
        
        // Pievienojam produktu funkcionalitāti
        this.bindProductEvents();
    }

    // Izveido produkta HTML saraksta skatījumam
    createProductListHTML(product) {
        return `
            <div class="row product-layout-list">
                <div class="col-lg-3 col-md-5">
                    <div class="product-image">
                        <a href="${product.url || '#'}">
                            <img src="${product.image}" alt="${product.name}">
                        </a>
                        <span class="sticker">${product.availability === 'pieejams' ? 'Pieejams' : 'Nav pieejams'}</span>
                    </div>
                </div>
                <div class="col-lg-5 col-md-7">
                    <div class="product_desc">
                        <div class="product_desc_info">
                            <div class="product-review">
                                <h5 class="manufacturer">
                                    <a href="#" data-brand="${product.brand}">${product.brand}</a>
                                </h5>
                                <div class="rating-box">
                                    <ul class="rating">
                                        ${Array(5).fill(0).map((_, i) => 
                                            `<li class="${i >= product.rating ? 'no-star' : ''}"><i class="fa fa-star-o"></i></li>`
                                        ).join('')}
                                    </ul>
                                </div>
                            </div>
                            <h4><a class="product_name" href="${product.url || '#'}">${product.name}</a></h4>
                            <div class="price-box">
                                <span class="new-price">€${product.price}</span>
                            </div>
                            <p>${product.description}</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="shop-add-action mb-xs-30">
                        <ul class="add-actions-link">
                            <li class="add-cart">
                                <a href="#" class="add-to-cart-btn" 
                                   data-product-id="${product.id}"
                                   data-product-name="${product.name}"
                                   data-product-price="${product.price}">Pievienot grozam</a>
                            </li>
                            <li class="wishlist">
                                <a href="wishlist.html" class="wishlist-btn"
                                   data-product-id="${product.id}">
                                   <i class="fa fa-heart-o"></i>Pievienot vēlmju sarakstam</a>
                            </li>
                            <li>
                                <a class="quick-view" href="${product.url || '#'}">
                                    <i class="fa fa-eye"></i>Apskatīt
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Izveido "nav rezultātu" HTML
    createNoResultsHTML(query) {
        return `
            <div style="text-align: center; padding: 50px 20px; border: 1px dashed #ddd; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #666; margin-bottom: 15px;">Nav atrasti rezultāti</h3>
                <p style="color: #888;">Meklējumam "${query}" netika atrasti produkti.</p>
                <div style="margin-top: 20px;">
                    <button onclick="window.location.href='index.html'" 
                            style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Atgriezties sākumā
                    </button>
                </div>
            </div>
        `;
    }

    // Atjaunina URL parametrus
    updateUrlParams(query, filters) {
        const url = new URL(window.location);
        
        if (query) {
            url.searchParams.set('q', query);
        } else {
            url.searchParams.delete('q');
        }
        
        if (filters.category) {
            url.searchParams.set('category', filters.category);
        }
        
        if (filters.brand) {
            url.searchParams.set('brand', filters.brand);
        }
        
        window.history.replaceState({}, '', url);
    }

    // Atjaunina rezultātu skaitu
    updateResultCount(count, query) {
        const toolbarAmount = document.querySelector('.toolbar-amount span');
        if (toolbarAmount) {
            if (query) {
                toolbarAmount.textContent = `Atrasti ${count} rezultāti meklējumam "${query}"`;
            } else {
                toolbarAmount.textContent = `Rāda 1 līdz ${count} no ${count}`;
            }
        }
    }

    // Pievieno produktu events
    bindProductEvents() {
        // Grozu pogas
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productData = {
                    id: btn.dataset.productId,
                    name: btn.dataset.productName,
                    price: parseFloat(btn.dataset.productPrice)
                };
                this.addToCart(productData);
            });
        });

        // Vēlmju saraksta pogas
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productId = btn.dataset.productId;
                this.addToWishlist(productId);
            });
        });
    }

    // Pievienot grozam (vienkārša versija)
    addToCart(product) {
        console.log('Pievienots grozam:', product);
        this.showNotification(`"${product.name}" pievienots grozam!`, 'success');
    }

    // Pievienot vēlmju sarakstam
    addToWishlist(productId) {
        console.log('Pievienots vēlmju sarakstam:', productId);
        this.showNotification('Produkts pievienots vēlmju sarakstam!', 'info');
    }

    // Rāda paziņojumu
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `search-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 9999;
            font-size: 14px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Saglabā meklēšanas vēsturi
    saveSearchHistory(query) {
        if (!query || query.trim() === '') return;
        
        let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        history = history.filter(item => item !== query);
        history.unshift(query);
        history = history.slice(0, 10);
        
        localStorage.setItem('searchHistory', JSON.stringify(history));
        this.searchHistory = history;
    }

    // Ielādē meklēšanas vēsturi
    loadSearchHistory() {
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }

    // Inicializē no URL parametriem (shop lapām)
    initFromURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        const category = urlParams.get('category');
        const brand = urlParams.get('brand');

        if (query || category || brand) {
            setTimeout(() => {
                this.filterProductsOnCurrentPage(query || '', { category, brand });
            }, 500);
        }
    }

    // Atjaunina sidebar filtrus (pēc vajadzības)
    updateSidebarFilters(results) {
        // Šeit var implementēt sidebar filtru atjaunināšanu
        console.log('Atjaunina sidebar filtrus ar', results.length, 'rezultātiem');
    }
}

// CSS stili
const advancedSearchStyles = `
<style>
.search-suggestions {
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-height: 400px;
    overflow-y: auto;
}

.suggestion-item {
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover {
    background-color: #f8f9fa !important;
}

.suggestion-content {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    cursor: pointer;
}

.search-notification {
    animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

/* Produktu saraksta stili */
.product-layout-list {
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 20px;
    margin-bottom: 20px;
}

.product-layout-list:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.shop-add-action ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.shop-add-action li {
    margin-bottom: 10px;
}

.shop-add-action a {
    display: inline-block;
    padding: 8px 15px;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    font-size: 13px;
    transition: background-color 0.2s;
}

.shop-add-action a:hover {
    background: #0056b3;
    color: white;
    text-decoration: none;
}

.shop-add-action .wishlist a {
    background: #e91e63;
}

.shop-add-action .wishlist a:hover {
    background: #c2185b;
}

/* Responsive */
@media (max-width: 768px) {
    .search-suggestions {
        position: fixed !important;
        left: 10px !important;
        right: 10px !important;
        top: auto !important;
        z-index: 9999;
    }
    
    .suggestion-content {
        padding: 15px 10px;
    }
    
    .search-notification {
        left: 10px;
        right: 10px;
        top: 10px;
    }
    
    .product-layout-list {
        flex-direction: column;
    }
    
    .product-layout-list .col-lg-3,
    .product-layout-list .col-lg-5,
    .product-layout-list .col-lg-4 {
        flex: 0 0 100%;
        max-width: 100%;
        margin-bottom: 15px;
    }
}
</style>
`;

// Pievienojam stilizāciju
document.head.insertAdjacentHTML('beforeend', advancedSearchStyles);

// Inicializējam sistēmu
let advancedProductSearch;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        advancedProductSearch = new AdvancedProductSearchSystem();
        
        // Ja esam uz shop lapas, inicializējam no URL parametriem
        const isShopPage = window.location.pathname.includes('shop-list') || 
                          window.location.pathname.includes('shop-left') || 
                          window.location.pathname.includes('shop-right');
        
        if (isShopPage) {
            advancedProductSearch.initFromURLParams();
        }
        
        console.log('SIA ANGAVA uzlabotā meklēšanas sistēma inicializēta!');
    }, 500);
});

// Eksportējam globālai lietošanai
window.AdvancedProductSearchSystem = AdvancedProductSearchSystem;

// Papildu funkcija shop lapām - filtru pievienošana
function initShopPageFilters() {
    // Kategoriju filtri
    document.querySelectorAll('.category-sub-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.textContent.trim().toLowerCase();
            if (advancedProductSearch) {
                advancedProductSearch.openSearchResultsPage('', { category: category });
            }
        });
    });

    // Zīmolu filtri
    document.querySelectorAll('.categori-checkbox input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const brandText = e.target.nextElementSibling.textContent;
            const brand = brandText.split('(')[0].trim();
            
            if (e.target.checked && advancedProductSearch) {
                advancedProductSearch.openSearchResultsPage('', { brand: brand });
            }
        });
    });

    // Kārtošanas filtri
    const sortSelect = document.querySelector('.product-short select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortValue = e.target.value;
            if (advancedProductSearch) {
                // Implementē kārtošanu
                console.log('Kārtošana pēc:', sortValue);
            }
        });
    }
}

// Inicializē shop lapas filtrus, ja esam uz shop lapas
if (window.location.pathname.includes('shop-')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initShopPageFilters, 1000);
    });
}