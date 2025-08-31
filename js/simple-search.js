// ====================================
// VIENKĀRŠĀ MEKLĒŠANAS SISTĒMA
// ====================================

class SimpleSearchSystem {
    constructor() {
        this.products = [];
        this.init();
    }

    init() {
        console.log('Inicializējam meklēšanas sistēmu...');
        
        // Gaida DOM ielādi
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('Sākam setup...');
        
        setTimeout(() => {
            this.findSearchInput();
            this.loadProducts();
            this.setupEvents();
            console.log('Setup pabeigts!');
        }, 1000); // Gaida 1 sekundi
    }

    findSearchInput() {
        // Meklē meklēšanas lauku
        this.searchInput = document.querySelector('input[type="text"][placeholder*="Ievadiet"], input[type="text"][placeholder*="Enter"], input[placeholder*="search"]');
        
        if (this.searchInput) {
            console.log('Atrasts meklēšanas lauks:', this.searchInput);
            this.setupSuggestions();
        } else {
            console.log('Nav atrasts meklēšanas lauks!');
            // Mēģina atrast jebkuru text input
            this.searchInput = document.querySelector('.hm-searchbox input[type="text"]');
            if (this.searchInput) {
                console.log('Atrasts alternatīvs meklēšanas lauks');
                this.setupSuggestions();
            }
        }
    }

    setupSuggestions() {
        const container = this.searchInput.closest('.hm-searchbox');
        if (!container) return;

        // Izveido suggestions div
        if (!container.querySelector('.suggestions')) {
            const suggestions = document.createElement('div');
            suggestions.className = 'suggestions';
            suggestions.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ccc;
                border-top: none;
                max-height: 300px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            `;
            
            container.style.position = 'relative';
            container.appendChild(suggestions);
            console.log('Suggestions div izveidots');
        }
    }

    loadProducts() {
        console.log('Ielādējam produktus...');
        
        const productElements = document.querySelectorAll('.single-product-wrap');
        console.log('Atrasti produkti:', productElements.length);

        productElements.forEach((el, index) => {
            const nameEl = el.querySelector('.product_name, h4 a');
            const priceEl = el.querySelector('.new-price');
            const imgEl = el.querySelector('img');

            if (nameEl) {
                const product = {
                    id: `prod_${index}`,
                    name: nameEl.textContent.trim(),
                    price: priceEl ? priceEl.textContent.trim() : 'Nav cenas',
                    image: imgEl ? imgEl.src : '',
                    url: nameEl.href || '#',
                    element: el
                };

                this.products.push(product);
                console.log(`Produkts ${index + 1}:`, product.name);
            }
        });

        console.log(`Ielādēti ${this.products.length} produkti`);
    }

    setupEvents() {
        if (!this.searchInput) return;

        console.log('Pievienojam event listeners...');

        // Input event
        this.searchInput.addEventListener('input', (e) => {
            console.log('Input:', e.target.value);
            this.handleInput(e.target.value);
        });

        // Enter key
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter nospiests:', e.target.value);
                this.openResultsPage(e.target.value);
            }
        });

        // Search button
        const searchBtn = document.querySelector('.hm-searchbox button, .hm-searchbox .li-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Meklēšanas poga:', this.searchInput.value);
                this.openResultsPage(this.searchInput.value);
            });
        }

        // Click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.hm-searchbox')) {
                this.hideSuggestions();
            }
        });

        console.log('Event listeners pievienoti');
    }

    handleInput(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const matches = this.products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        this.showSuggestions(matches, query);
    }

    showSuggestions(products, query) {
        const suggestionsDiv = document.querySelector('.suggestions');
        if (!suggestionsDiv) return;

        if (products.length === 0) {
            this.hideSuggestions();
            return;
        }

        const html = products.map(product => `
            <div class="suggestion-item" 
                 style="padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; display: flex; align-items: center;"
                 data-url="${product.url}"
                 data-name="${product.name}">
                <img src="${product.image}" style="width: 40px; height: 40px; margin-right: 10px; object-fit: cover;" 
                     onerror="this.style.display='none'">
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #333;">${product.name}</div>
                    <div style="color: #666; font-size: 12px;">Produkts</div>
                </div>
                <div style="color: #28a745; font-weight: bold;">${product.price}</div>
            </div>
        `).join('');

        suggestionsDiv.innerHTML = html;
        suggestionsDiv.style.display = 'block';

        // Pievienojam click events
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                const name = item.dataset.name;
                
                console.log('Klikšķis uz produktu:', name, url);
                
                if (url && url !== '#') {
                    window.location.href = url;
                } else {
                    // Ja nav URL, meklē pēc nosaukuma
                    this.openResultsPage(name);
                }
            });

            // Hover effects
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f5f5f5';
            });
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });
        });

        console.log(`Rādām ${products.length} ieteikumus`);
    }

    hideSuggestions() {
        const suggestionsDiv = document.querySelector('.suggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
    }

    openResultsPage(query) {
        console.log('Atver rezultātu lapu ar:', query);
        
        if (!query || query.trim() === '') {
            console.log('Tukšs meklējums');
            return;
        }

        // Pārbauda, vai esam uz shop lapas
        const currentPath = window.location.pathname;
        const isShopPage = currentPath.includes('shop-list') || currentPath.includes('shop-');

        if (isShopPage) {
            // Filtrē esošajā lapā
            console.log('Filtrējam esošajā shop lapā');
            this.filterCurrentPage(query);
        } else {
            // Pāriet uz shop lapu
            console.log('Pāriet uz shop-list-left-sidebar.html');
            const url = `shop-list-left-sidebar.html?q=${encodeURIComponent(query)}`;
            window.location.href = url;
        }

        this.hideSuggestions();
    }

    filterCurrentPage(query) {
        console.log('Filtrējam pašreizējo lapu:', query);
        
        const queryLower = query.toLowerCase();
        let visibleCount = 0;

        // Paslēpjam visus produktus
        this.products.forEach(product => {
            const matches = product.name.toLowerCase().includes(queryLower);
            
            if (matches) {
                product.element.style.display = 'block';
                // Ja ir parent container
                const parent = product.element.closest('.col-lg-12, .col-md-4, .col-lg-4');
                if (parent) parent.style.display = 'block';
                visibleCount++;
            } else {
                product.element.style.display = 'none';
                const parent = product.element.closest('.col-lg-12, .col-md-4, .col-lg-4');
                if (parent) parent.style.display = 'none';
            }
        });

        // Atjaunina rezultātu skaitu
        const resultCount = document.querySelector('.toolbar-amount span');
        if (resultCount) {
            resultCount.textContent = `Atrasti ${visibleCount} rezultāti meklējumam "${query}"`;
        }

        console.log(`Atrasti ${visibleCount} produkti`);

        // Ja nav rezultātu
        if (visibleCount === 0) {
            this.showNoResults(query);
        } else {
            this.hideNoResults();
        }
    }

    showNoResults(query) {
        // Pārbauda, vai jau eksistē
        let noResultsDiv = document.querySelector('.no-results-message');
        
        if (!noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results-message';
            noResultsDiv.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                margin: 20px 0;
                border: 1px dashed #ccc;
                border-radius: 8px;
                color: #666;
            `;

            // Meklē vietu, kur ievietot
            const container = document.querySelector('.shop-products-wrapper, .product-area, .tab-content');
            if (container) {
                container.appendChild(noResultsDiv);
            }
        }

        noResultsDiv.innerHTML = `
            <h3>Nav atrasti rezultāti</h3>
            <p>Meklējumam "<strong>${query}</strong>" netika atrasti produkti.</p>
            <button onclick="window.location.href='index.html'" 
                    style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 15px;">
                Atgriezties sākumā
            </button>
        `;
        noResultsDiv.style.display = 'block';
    }

    hideNoResults() {
        const noResultsDiv = document.querySelector('.no-results-message');
        if (noResultsDiv) {
            noResultsDiv.style.display = 'none';
        }
    }
}

// Inicializējam sistēmu
console.log('Sākam ielādēt meklēšanas sistēmu...');

let searchSystem;

// Vairāki veidi, kā inicializēt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM ielādēts');
        searchSystem = new SimpleSearchSystem();
    });
} else {
    console.log('DOM jau ielādēts');
    searchSystem = new SimpleSearchSystem();
}

// Papildu inicializācija, ja nepieciešams
setTimeout(() => {
    if (!searchSystem) {
        console.log('Mēģinam inicializēt atkārtoti...');
        searchSystem = new SimpleSearchSystem();
    }
}, 2000);

// Debug funkcija
window.debugSearch = () => {
    console.log('=== SEARCH DEBUG ===');
    console.log('Search system:', searchSystem);
    console.log('Products:', searchSystem ? searchSystem.products.length : 'Nav');
    console.log('Search input:', document.querySelector('input[type="text"]'));
    console.log('Product elements:', document.querySelectorAll('.single-product-wrap').length);
};