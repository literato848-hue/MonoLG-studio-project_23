// ===========================================
// SIA ANGAVA VEIKALA MEKLĒŠANAS SISTĒMA
// ===========================================

class ProductSearchSystem {
    constructor() {
        this.products = [];
        this.currentFilters = {
            category: '',
            brand: '',
            minPrice: 0,
            maxPrice: 9999,
            searchQuery: '',
            sortBy: 'name'
        };
        this.init();
    }

    init() {
        this.loadExistingProducts();
        this.setupSearchInterface();
        this.bindEvents();
        this.createAdvancedFilters();
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
                
                // Kategorijas noteikšana pēc produkta nosaukuma
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
                    element: element,
                    availability: 'pieejams',
                    rating: 0,
                    description: this.generateDescription(name, brand)
                };

                // Pievienojam data atribūtus elementam
                this.addDataAttributes(element, product);
                this.products.push(product);
            }
        });

        console.log(`Ielādēti ${this.products.length} produkti`);
    }

    // Pievieno data atribūtus produktu elementiem
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

    // Nosaka kategoriju pēc produkta nosaukuma
    determineCategory(name) {
        const nameLC = name.toLowerCase();
        
        if (nameLC.includes('galvu') && nameLC.includes('atslēgu') || 
            nameLC.includes('komplekts') || nameLC.includes('yato')) {
            return 'instrumenti';
        } else if (nameLC.includes('dzīvžogu') || nameLC.includes('climer')) {
            return 'dārza-tehnika';
        } else if (nameLC.includes('mug') || nameLC.includes('accusantium')) {
            return 'saimniecības-preces';
        } else {
            return 'citi';
        }
    }

    // Nosaka apakškategoriju
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

    // Ģenerē atslēgas vārdus
    generateKeywords(name, brand, category) {
        const keywords = new Set();
        
        // Pievienojam vārdus no nosaukuma
        name.toLowerCase().split(/[\s,.-]+/).forEach(word => {
            if (word.length > 2) keywords.add(word);
        });
        
        // Pievienojam zīmolu
        keywords.add(brand.toLowerCase());
        
        // Pievienojam kategorijas vārdus
        category.split('-').forEach(word => keywords.add(word));
        
        // Specifiskās atslēgas
        if (name.toLowerCase().includes('komplekts')) {
            keywords.add('instruments');
            keywords.add('komplekts');
            keywords.add('darbarīki');
        }
        
        return Array.from(keywords);
    }

    // Ģenerē produkta aprakstu
    generateDescription(name, brand) {
        return `${name} no ${brand} zīmola. Kvalitatīvs produkts labākajā cenā.`;
    }

    // Izveido meklēšanas saskarni
    setupSearchInterface() {
        // Pārbaudām, vai meklēšanas lauks jau eksistē
        const existingSearchInput = document.querySelector('input[placeholder*="Ievadiet"]');
        if (existingSearchInput) {
            this.searchInput = existingSearchInput;
            
            // Pievienojam ikonas un uzlabojumus
            const searchContainer = existingSearchInput.closest('.hm-searchbox');
            if (searchContainer && !searchContainer.querySelector('.search-suggestions')) {
                this.enhanceExistingSearch(searchContainer);
            }
        }
    }

    // Uzlabo esošo meklēšanas lauku
    enhanceExistingSearch(container) {
        // Pievienojam ieteikumu konteineru
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
            max-height: 300px;
            overflow-y: auto;
            display: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        container.style.position = 'relative';
        container.appendChild(suggestionDiv);

        // Pievienojam rezultātu skaita indikātoru
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

    // Pievieno notikumu klausītājus
    bindEvents() {
        if (this.searchInput) {
            // Meklēšanas ievade
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });

            // Enter taustiņš
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                }
            });

            // Fokusa notikumi
            this.searchInput.addEventListener('focus', () => {
                this.showPopularSearches();
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.hm-searchbox')) {
                    this.hideSuggestions();
                }
            });
        }

        // Kategoriju saites
        document.querySelectorAll('.select-search-category option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.filterByCategory(e.target.value);
            });
        });

        // Meklēšanas poga
        const searchButton = document.querySelector('.hm-searchbox .li-btn');
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                const query = this.searchInput.value;
                this.performSearch(query);
            });
        }
    }

    // Apstrādā meklēšanas ievadi
    handleSearchInput(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            this.showAllProducts();
            return;
        }

        const suggestions = this.getSuggestions(query);
        this.showSuggestions(suggestions);
        
        // Ātrie rezultāti
        this.quickFilter(query);
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
                    image: product.image
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
                    text: `Kategorija: ${cat}`,
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

        return suggestions.slice(0, 8);
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
            let html = `
                <div class="suggestion-item" data-type="${item.type}" data-value="${item.value}">
                    <div class="suggestion-content">
            `;

            if (item.type === 'product') {
                html += `
                    <img src="${item.image}" alt="" style="width: 30px; height: 30px; margin-right: 10px;">
                    <span>${item.text}</span>
                    <span class="suggestion-price">€${item.price}</span>
                `;
            } else {
                html += `<span>${item.text}</span>`;
            }

            html += `
                    </div>
                </div>
            `;
            return html;
        }).join('');

        // Pievienojam click notikumus
        suggestionDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const value = item.dataset.value;
                
                if (type === 'product') {
                    this.searchInput.value = value;
                    this.performSearch(value);
                } else if (type === 'category') {
                    this.filterByCategory(value);
                } else if (type === 'brand') {
                    this.filterByBrand(value);
                }
                
                this.hideSuggestions();
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
            { text: 'Yato instrumenti', value: 'yato' },
            { text: 'Atslēgu komplekti', value: 'atslēgu komplekti' },
            { text: 'Dzīvžogu climeri', value: 'dzīvžogu climer' },
            { text: 'Darba instrumenti', value: 'instrumenti' }
        ];

        this.showSuggestions(popular.map(item => ({
            type: 'popular',
            text: `🔥 ${item.text}`,
            value: item.value
        })));
    }

    // Ātrs filtrs
    quickFilter(query) {
        const queryLC = query.toLowerCase();
        let visibleCount = 0;

        this.products.forEach(product => {
            const searchText = product.element.getAttribute('data-search-text') || '';
            const isMatch = searchText.includes(queryLC);
            
            if (isMatch) {
                product.element.style.display = 'block';
                product.element.closest('.col-lg-12').style.display = 'block';
                visibleCount++;
            } else {
                product.element.style.display = 'none';
                product.element.closest('.col-lg-12').style.display = 'none';
            }
        });

        this.updateResultCount(visibleCount, query);
    }

    // Pilns meklējums
    performSearch(query) {
        console.log('Meklēšana:', query);
        
        if (!query) {
            this.showAllProducts();
            return;
        }

        const results = this.searchProducts(query);
        this.displayResults(results, query);
        this.hideSuggestions();
        
        // Saglabājam meklēšanas vēsturi
        this.saveSearchHistory(query);
    }

    // Meklē produktus
    searchProducts(query) {
        const queryLC = query.toLowerCase();
        const results = [];

        this.products.forEach(product => {
            let score = 0;

            // Nosaukuma atbilstība (augstākā prioritāte)
            if (product.name.toLowerCase().includes(queryLC)) {
                score += 100;
                if (product.name.toLowerCase().startsWith(queryLC)) {
                    score += 50;
                }
            }

            // Zīmola atbilstība
            if (product.brand.toLowerCase().includes(queryLC)) {
                score += 80;
            }

            // Kategorijas atbilstība
            if (product.category.toLowerCase().includes(queryLC)) {
                score += 60;
            }

            // Atslēgvārdu atbilstība
            product.keywords.forEach(keyword => {
                if (keyword.includes(queryLC)) {
                    score += 40;
                }
            });

            // Apraksta atbilstība
            if (product.description.toLowerCase().includes(queryLC)) {
                score += 30;
            }

            if (score > 0) {
                results.push({ product, score });
            }
        });

        // Kārtojam pēc rezultātu punktiem
        return results.sort((a, b) => b.score - a.score).map(item => item.product);
    }

    // Rāda rezultātus
    displayResults(results, query) {
        // Paslēpjam visus produktus
        this.products.forEach(product => {
            product.element.style.display = 'none';
            product.element.closest('.col-lg-12').style.display = 'none';
        });

        // Rādām atrastos rezultātus
        results.forEach(product => {
            product.element.style.display = 'block';
            product.element.closest('.col-lg-12').style.display = 'block';
        });

        this.updateResultCount(results.length, query);

        // Ja nav rezultātu, rādām ziņojumu
        if (results.length === 0) {
            this.showNoResults(query);
        } else {
            this.hideNoResults();
        }
    }

    // Rāda visus produktus
    showAllProducts() {
        this.products.forEach(product => {
            product.element.style.display = 'block';
            product.element.closest('.col-lg-12').style.display = 'block';
        });
        this.updateResultCount(this.products.length, '');
        this.hideNoResults();
    }

    // Atjaunina rezultātu skaitu
    updateResultCount(count, query) {
        const countElement = document.querySelector('.search-result-count');
        if (countElement) {
            if (query) {
                countElement.textContent = `Atrasti ${count} rezultāti meklējumam "${query}"`;
                countElement.style.display = 'block';
            } else {
                countElement.style.display = 'none';
            }
        }
    }

    // Rāda "nav rezultātu" ziņojumu
    showNoResults(query) {
        let noResultsDiv = document.querySelector('.no-results-message');
        
        if (!noResultsDiv) {
            noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results-message';
            noResultsDiv.style.cssText = `
                text-align: center;
                padding: 50px 20px;
                color: #666;
                border: 1px dashed #ddd;
                border-radius: 5px;
                margin: 20px 0;
            `;

            const productArea = document.querySelector('.product-area .container .row');
            if (productArea) {
                productArea.appendChild(noResultsDiv);
            }
        }

        noResultsDiv.innerHTML = `
            <h3>Nav atrasti rezultāti</h3>
            <p>Meklējumam "<strong>${query}</strong>" netika atrasti atbilstoši produkti.</p>
            <div style="margin-top: 20px;">
                <button onclick="productSearch.showAllProducts()" class="btn btn-primary">
                    Rādīt visus produktus
                </button>
            </div>
            <div style="margin-top: 20px; font-size: 14px;">
                <p><strong>Ieteikumi:</strong></p>
                <ul style="list-style: none; padding: 0;">
                    <li>• Pārbaudiet, vai vārds ir uzrakstīts pareizi</li>
                    <li>• Izmantojiet mazāk specifiskus atslēgvārdus</li>
                    <li>• Mēģiniet meklēt pēc kategorijas vai zīmola</li>
                </ul>
            </div>
        `;

        noResultsDiv.style.display = 'block';
    }

    // Paslēpj "nav rezultātu" ziņojumu
    hideNoResults() {
        const noResultsDiv = document.querySelector('.no-results-message');
        if (noResultsDiv) {
            noResultsDiv.style.display = 'none';
        }
    }

    // Filtrs pēc kategorijas
    filterByCategory(category) {
        if (!category || category === '0') {
            this.showAllProducts();
            return;
        }

        const results = this.products.filter(product => 
            product.category === category || 
            product.subcategory === category ||
            product.category.includes(category.toLowerCase())
        );

        this.displayResults(results, `Kategorija: ${category}`);
    }

    // Filtrs pēc zīmola
    filterByBrand(brand) {
        const results = this.products.filter(product => 
            product.brand.toLowerCase().includes(brand.toLowerCase())
        );

        this.displayResults(results, `Zīmols: ${brand}`);
    }

    // Izveido papildu filtrus
    createAdvancedFilters() {
        // Šeit var pievienot cenu diapazona filtrus, pieejamības filtrus u.c.
    }

    // Saglabā meklēšanas vēsturi
    saveSearchHistory(query) {
        let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        
        // Noņemam dublicātus
        history = history.filter(item => item !== query);
        
        // Pievienojam jauno meklējumu sākumā
        history.unshift(query);
        
        // Ierobežojam līdz 10 ierakstiem
        history = history.slice(0, 10);
        
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    // Iegūst meklēšanas vēsturi
    getSearchHistory() {
        return JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }
}

// CSS stili meklēšanas sistēmai
const searchStyles = `
<style>
.search-suggestions {
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    max-height: 400px;
    overflow-y: auto;
}

.suggestion-item {
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;
}

.suggestion-item:hover {
    background-color: #f8f9fa;
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-content {
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
}

.suggestion-price {
    font-weight: bold;
    color: #28a745;
}

.search-result-count {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
}

.no-results-message {
    background: #f8f9fa;
    border: 1px dashed #dee2e6;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    margin: 30px 0;
}

.no-results-message h3 {
    color: #495057;
    margin-bottom: 15px;
}

.no-results-message ul {
    text-align: left;
    max-width: 300px;
    margin: 0 auto;
}

/* Responsive dizains */
@media (max-width: 768px) {
    .search-suggestions {
        position: fixed !important;
        left: 10px !important;
        right: 10px !important;
        top: auto !important;
        z-index: 9999;
    }
    
    .suggestion-content {
        font-size: 14px;
    }
}
</style>
`;

// Pievienojam stilizāciju
document.head.insertAdjacentHTML('beforeend', searchStyles);

// Inicializējam meklēšanas sistēmu, kad lapa ir ielādēta
let productSearch;

document.addEventListener('DOMContentLoaded', function() {
    // Nedaudz kavējam, lai pārliecinātos, ka visi elementi ir ielādēti
    setTimeout(() => {
        productSearch = new ProductSearchSystem();
        console.log('SIA ANGAVA meklēšanas sistēma inicializēta!');
    }, 500);
});

// Eksportējam sistēmu globālai lietošanai
window.ProductSearchSystem = ProductSearchSystem;