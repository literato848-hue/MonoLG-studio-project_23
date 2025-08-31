/**
 * SIA ANGAVA - Optimizēts E-komercijas sistēmas JS
 * Speciāli pielāgots akum-tools_1.html struktūrai
 * Versija: 2.0
 */

class AngavaECommerceSystem {
    constructor() {
        // Konfigurācija
        this.CART_KEY = 'angava-cart';
        this.WISHLIST_KEY = 'angava-wishlist';
        
        // Datu ielāde
        this.cart = this.loadData(this.CART_KEY);
        this.wishlist = this.loadData(this.WISHLIST_KEY);
        
        // Inicializācijas flag
        this.initialized = false;
        
        // Autoinitialization
        this.init();
    }
    
    init() {
        if (this.initialized) return;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        try {
            console.log('🛒 ANGAVA E-komercijas sistēma startē...');
            
            this.setupEventListeners();
            this.updateAllDisplays();
            this.initializeButtons();
            this.createModalStructure();
            this.addRequiredStyles();
            
            this.initialized = true;
            console.log('✅ ANGAVA E-komercijas sistēma gatava!');
        } catch (error) {
            console.error('❌ Kļūda inicializācijā:', error);
        }
    }
    
    // === DATU PĀRVALDĪBA ===
    loadData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.warn(`Kļūda ielādējot ${key}:`, error);
            return [];
        }
    }
    
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Kļūda saglabājot ${key}:`, error);
            this.showNotification('Kļūda saglabājot datus', 'error');
            return false;
        }
    }
    
    // === EVENT SYSTEM ===
    setupEventListeners() {
        // Single event listener for entire document
        document.removeEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        
        // Keyboard support for cart modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.hideCartModal();
            }
        });
    }
    
    handleDocumentClick(e) {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (!action) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const element = e.target.closest('[data-action]');
        
        switch (action) {
            case 'add-to-cart':
                this.addToCart(element);
                break;
            case 'remove-from-cart':
                this.removeFromCart(element);
                break;
            case 'toggle-wishlist':
                this.toggleWishlist(element);
                break;
            case 'show-cart':
                this.showCartModal();
                break;
            case 'update-quantity':
                this.updateQuantity(element);
                break;
            case 'clear-cart':
                this.clearCart();
                break;
            default:
                console.warn('Nezināma darbība:', action);
        }
    }
    
    // === PRODUKTA DATU IEGŪŠANA ===
    getProductData(element) {
        try {
            // Pirmais mēģinājums - data atribūti no elementa
            let productData = this.getDataFromElement(element);
            
            if (this.isValidProductData(productData)) {
                return productData;
            }
            
            // Otrais mēģinājums - meklēt produkta konteineru
            const container = element.closest('.single-product-wrap') || 
                            element.closest('.product-layout-list') ||
                            element.closest('[data-product-id]');
            
            if (container) {
                productData = this.getDataFromContainer(container);
                
                if (this.isValidProductData(productData)) {
                    return productData;
                }
            }
            
            console.error('Neizdevās iegūt produkta datus:', element);
            return null;
        } catch (error) {
            console.error('Kļūda iegūstot produkta datus:', error);
            return null;
        }
    }
    
    getDataFromElement(element) {
        return {
            id: element.dataset.productId,
            name: element.dataset.productName,
            price: parseFloat(element.dataset.productPrice) || 0,
            image: element.dataset.productImage || this.getDefaultImage(),
            url: element.dataset.productUrl || '#'
        };
    }
    
    getDataFromContainer(container) {
        const nameElement = container.querySelector('.product_name, h4 a, .product-name');
        const priceElement = container.querySelector('.new-price, .price, .amount');
        const imageElement = container.querySelector('img');
        
        return {
            id: container.dataset.productId || this.generateId(nameElement?.textContent),
            name: nameElement?.textContent?.trim() || 'Nezināms produkts',
            price: this.extractPrice(priceElement?.textContent),
            image: imageElement?.src || this.getDefaultImage(),
            url: nameElement?.href || '#'
        };
    }
    
    isValidProductData(data) {
        return data && data.id && data.name && data.price >= 0;
    }
    
    extractPrice(priceText) {
        if (!priceText) return 0;
        const cleanPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
        return parseFloat(cleanPrice) || 0;
    }
    
    generateId(name) {
        if (!name) return 'product_' + Date.now();
        return name.toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9\s]/g, '')
                  .replace(/\s+/g, '_') + '_' + Date.now();
    }
    
    getDefaultImage() {
        return 'images/product/default.jpg';
    }
    
    // === CART FUNKCIJAS ===
    addToCart(element) {
        try {
            const product = this.getProductData(element);
            if (!product) {
                this.showNotification('Kļūda pievienojot produktu grozam', 'error');
                return;
            }
            
            const existingItem = this.cart.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 1) + 1;
                this.showNotification(`"${product.name}" daudzums palielināts`, 'success');
            } else {
                product.quantity = 1;
                product.addedAt = Date.now();
                this.cart.push(product);
                this.showNotification(`"${product.name}" pievienots grozam`, 'success');
            }
            
            this.saveData(this.CART_KEY, this.cart);
            this.updateAllDisplays();
            this.animateElement(element);
            
        } catch (error) {
            console.error('Kļūda pievienojot grozam:', error);
            this.showNotification('Kļūda pievienojot grozam', 'error');
        }
    }
    
    removeFromCart(element) {
        try {
            const productId = element.dataset.productId || 
                            element.closest('[data-product-id]')?.dataset.productId;
            const index = parseInt(element.dataset.index);
            
            let removedItem = null;
            
            // Remove by index (mini cart items)
            if (!isNaN(index) && index >= 0 && index < this.cart.length) {
                removedItem = this.cart.splice(index, 1)[0];
            }
            // Remove by product ID
            else if (productId) {
                const itemIndex = this.cart.findIndex(item => item.id === productId);
                if (itemIndex >= 0) {
                    removedItem = this.cart.splice(itemIndex, 1)[0];
                }
            }
            
            if (removedItem) {
                this.saveData(this.CART_KEY, this.cart);
                this.updateAllDisplays();
                this.showNotification(`"${removedItem.name}" noņemts no groza`, 'info');
            }
            
        } catch (error) {
            console.error('Kļūda noņemot no groza:', error);
            this.showNotification('Kļūda noņemot no groza', 'error');
        }
    }
    
    updateQuantity(productId, newQuantity) {
        try {
            const item = this.cart.find(item => item.id === productId);
            if (!item) return;
            
            if (newQuantity <= 0) {
                const index = this.cart.findIndex(item => item.id === productId);
                const removedItem = this.cart.splice(index, 1)[0];
                this.showNotification(`"${removedItem.name}" noņemts no groza`, 'info');
            } else {
                item.quantity = newQuantity;
            }
            
            this.saveData(this.CART_KEY, this.cart);
            this.updateAllDisplays();
            
        } catch (error) {
            console.error('Kļūda atjauninot daudzumu:', error);
        }
    }
    
    clearCart() {
        if (this.cart.length === 0) {
            this.showNotification('Grozs jau ir tukšs', 'info');
            return;
        }
        
        if (confirm('Vai tiešām vēlaties iztukšot grozu?')) {
            this.cart = [];
            this.saveData(this.CART_KEY, this.cart);
            this.updateAllDisplays();
            this.showNotification('Grozs iztukšots', 'success');
        }
    }
    
    // === WISHLIST FUNKCIJAS ===
    toggleWishlist(element) {
        try {
            const product = this.getProductData(element);
            if (!product) {
                this.showNotification('Kļūda pievienojot vēlmju sarakstam', 'error');
                return;
            }
            
            const existingIndex = this.wishlist.findIndex(item => item.id === product.id);
            
            if (existingIndex >= 0) {
                const removedItem = this.wishlist.splice(existingIndex, 1)[0];
                this.showNotification(`"${removedItem.name}" noņemts no vēlmju saraksta`, 'wishlist');
                this.updateWishlistButton(element, false);
            } else {
                product.addedAt = Date.now();
                this.wishlist.push(product);
                this.showNotification(`"${product.name}" pievienots vēlmju sarakstam`, 'wishlist');
                this.updateWishlistButton(element, true);
            }
            
            this.saveData(this.WISHLIST_KEY, this.wishlist);
            this.updateAllDisplays();
            
        } catch (error) {
            console.error('Kļūda ar vēlmju sarakstu:', error);
            this.showNotification('Kļūda ar vēlmju sarakstu', 'error');
        }
    }
    
    updateWishlistButton(button, isActive) {
        const icon = button.querySelector('i');
        if (!icon) return;
        
        if (isActive) {
            icon.className = 'fa fa-heart';
            icon.style.color = '#e91e63';
            button.classList.add('in-wishlist');
        } else {
            icon.className = 'fa fa-heart-o';
            icon.style.color = '';
            button.classList.remove('in-wishlist');
        }
    }
    
    // === DISPLEJA ATJAUNINĀŠANA ===
    updateAllDisplays() {
        this.updateCartDisplay();
        this.updateWishlistDisplay();
        this.updateMiniCart();
    }
    
    updateCartDisplay() {
        const totalItems = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        
        // Update cart counters
        document.querySelectorAll('.cart-item-count').forEach(el => {
            el.textContent = totalItems;
            el.style.display = totalItems > 0 ? 'inline-block' : 'none';
        });
        
        // Update cart trigger text
        document.querySelectorAll('.item-text').forEach(el => {
            if (el.closest('.hm-minicart-trigger')) {
                el.innerHTML = `€${totalPrice.toFixed(2)} <span class="cart-item-count">${totalItems}</span>`;
            }
        });
        
        // Update total displays
        document.querySelectorAll('.cart-total').forEach(el => {
            el.textContent = `€${totalPrice.toFixed(2)}`;
        });
    }
    
    updateWishlistDisplay() {
        const count = this.wishlist.length;
        
        document.querySelectorAll('.wishlist-item-count').forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'inline-block' : 'none';
        });
        
        // Update all wishlist buttons on page
        document.querySelectorAll('[data-action="toggle-wishlist"]').forEach(button => {
            const product = this.getProductData(button);
            if (product) {
                const isInWishlist = this.wishlist.some(item => item.id === product.id);
                this.updateWishlistButton(button, isInWishlist);
            }
        });
    }
    
    updateMiniCart() {
        const miniCartList = document.querySelector('.minicart-product-list');
        if (!miniCartList) return;
        
        if (this.cart.length === 0) {
            miniCartList.innerHTML = '<li class="empty-state"><p style="text-align: center; padding: 20px; color: #666; margin: 0;">Grozs ir tukšs</p></li>';
        } else {
            miniCartList.innerHTML = this.cart.slice(0, 5).map((item, index) => `
                <li class="minicart-item">
                    <a href="${item.url}" class="minicart-product-image">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 3px;">
                    </a>
                    <div class="minicart-product-details">
                        <h6><a href="${item.url}">${this.truncateText(item.name, 30)}</a></h6>
                        <span>${item.quantity || 1} × €${item.price.toFixed(2)}</span>
                    </div>
                    <button class="close" data-action="remove-from-cart" data-index="${index}" title="Noņemt" type="button">
                        <i class="fa fa-close"></i>
                    </button>
                </li>
            `).join('');
        }
        
        // Update total in mini cart
        const total = this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        document.querySelectorAll('.minicart-total span').forEach(el => {
            el.textContent = `€${total.toFixed(2)}`;
        });
    }
    
    // === MODAL SISTĒMA ===
    createModalStructure() {
        if (document.getElementById('angavaCartModal')) return;
        
        const modalHTML = `
            <div id="angavaCartModal" class="angava-modal">
                <div class="angava-modal-overlay" onclick="angavaEcommerce.hideCartModal()"></div>
                <div class="angava-modal-container">
                    <div class="angava-modal-header">
                        <h3><i class="fa fa-shopping-cart"></i> Iepirkumu grozs</h3>
                        <button class="angava-modal-close" onclick="angavaEcommerce.hideCartModal()">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                    <div class="angava-modal-body" id="angavaCartModalBody">
                        <!-- Content will be loaded dynamically -->
                    </div>
                    <div class="angava-modal-footer" id="angavaCartModalFooter">
                        <!-- Footer will be loaded dynamically -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    showCartModal() {
        this.renderCartModal();
        const modal = document.getElementById('angavaCartModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideCartModal() {
        const modal = document.getElementById('angavaCartModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    isModalOpen() {
        const modal = document.getElementById('angavaCartModal');
        return modal && modal.style.display === 'flex';
    }
    
    renderCartModal() {
        const body = document.getElementById('angavaCartModalBody');
        const footer = document.getElementById('angavaCartModalFooter');
        
        if (!body || !footer) return;
        
        if (this.cart.length === 0) {
            body.innerHTML = `
                <div class="angava-empty-state">
                    <div class="empty-icon">
                        <i class="fa fa-shopping-cart"></i>
                    </div>
                    <h4>Jūsu grozs ir tukšs</h4>
                    <p>Pievienojiet produktus, lai sāktu iepirkšanos!</p>
                    <button class="angava-btn angava-btn-primary" onclick="angavaEcommerce.hideCartModal()">
                        Turpināt iepirkšanos
                    </button>
                </div>
            `;
            footer.innerHTML = '';
        } else {
            body.innerHTML = `
                <div class="angava-cart-items">
                    ${this.cart.map((item, index) => `
                        <div class="angava-cart-item" data-product-id="${item.id}">
                            <div class="item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            <div class="item-details">
                                <h6>${item.name}</h6>
                                <div class="item-price">€${item.price.toFixed(2)}</div>
                                <div class="quantity-controls">
                                    <button onclick="angavaEcommerce.updateQuantity('${item.id}', ${(item.quantity || 1) - 1})" class="qty-btn">−</button>
                                    <span class="qty-display">${item.quantity || 1}</span>
                                    <button onclick="angavaEcommerce.updateQuantity('${item.id}', ${(item.quantity || 1) + 1})" class="qty-btn">+</button>
                                </div>
                            </div>
                            <div class="item-total">
                                €${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </div>
                            <button class="angava-remove-btn" data-action="remove-from-cart" data-index="${index}">
                                <i class="fa fa-trash"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
            
            const total = this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
            const itemsCount = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            
            footer.innerHTML = `
                <div class="angava-cart-summary">
                    <div class="summary-line">
                        <span>Produkti (${itemsCount}):</span>
                        <span>€${total.toFixed(2)}</span>
                    </div>
                    <div class="summary-line total">
                        <span><strong>KOPĀ:</strong></span>
                        <span><strong>€${total.toFixed(2)}</strong></span>
                    </div>
                </div>
                <div class="angava-modal-actions">
                    <button class="angava-btn angava-btn-secondary" onclick="angavaEcommerce.hideCartModal()">
                        Turpināt iepirkšanos
                    </button>
                    <button class="angava-btn angava-btn-outline" data-action="clear-cart">
                        Iztukšot grozu
                    </button>
                    <button class="angava-btn angava-btn-primary" onclick="angavaEcommerce.checkout()">
                        Pasūtīt (€${total.toFixed(2)})
                    </button>
                </div>
            `;
        }
    }
    
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('Grozs ir tukšs!', 'error');
            return;
        }
        
        const total = this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        const itemsCount = this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        // Simulate checkout process
        this.showNotification('Pārsūta uz pasūtīšanu...', 'info');
        
        setTimeout(() => {
            if (confirm(`Apstiprināt pasūtījumu?\n\nProduktus: ${itemsCount}\nKopā: €${total.toFixed(2)}`)) {
                this.showNotification(`Paldies par pasūtījumu! Kopā: €${total.toFixed(2)}`, 'success');
                this.clearCart();
                this.hideCartModal();
                
                // Redirect to checkout page in real implementation
                // window.location.href = 'checkout.html';
            }
        }, 500);
    }
    
    // === UTILĪTES ===
    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
    
    animateElement(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.15s ease';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }
    
    showNotification(message, type = 'success') {
        // Remove existing notifications
        document.querySelectorAll('.angava-notification').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `angava-notification angava-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fa ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            wishlist: 'fa-heart'
        };
        return icons[type] || icons.info;
    }
    
    initializeButtons() {
        // Initialize existing wishlist buttons
        document.querySelectorAll('[data-action="toggle-wishlist"]').forEach(button => {
            const product = this.getProductData(button);
            if (product) {
                const isInWishlist = this.wishlist.some(item => item.id === product.id);
                this.updateWishlistButton(button, isInWishlist);
            }
        });
    }
    
    addRequiredStyles() {
        if (document.getElementById('angava-ecommerce-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'angava-ecommerce-styles';
        style.textContent = `
            .angava-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .angava-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 1;
            }
            
            .angava-modal-container {
                position: relative;
                background: white;
                border-radius: 12px;
                max-width: 700px;
                width: 100%;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                z-index: 2;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            
            .angava-modal-header {
                padding: 24px;
                border-bottom: 1px solid #e9ecef;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8f9fa;
                border-radius: 12px 12px 0 0;
            }
            
            .angava-modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 20px;
                font-weight: 600;
            }
            
            .angava-modal-header h3 i {
                margin-right: 8px;
                color: #007bff;
            }
            
            .angava-modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 5px;
                border-radius: 4px;
                transition: all 0.2s ease;
            }
            
            .angava-modal-close:hover {
                background: #e9ecef;
                color: #333;
            }
            
            .angava-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 0;
            }
            
            .angava-modal-footer {
                padding: 24px;
                border-top: 1px solid #e9ecef;
                background: #f8f9fa;
                border-radius: 0 0 12px 12px;
            }
            
            .angava-cart-items {
                padding: 20px;
            }
            
            .angava-cart-item {
                display: flex;
                gap: 16px;
                padding: 16px 0;
                border-bottom: 1px solid #e9ecef;
                align-items: center;
            }
            
            .angava-cart-item:last-child {
                border-bottom: none;
            }
            
            .item-image img {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-details h6 {
                margin: 0 0 8px 0;
                font-size: 16px;
                font-weight: 500;
                color: #333;
                line-height: 1.3;
            }
            
            .item-price {
                color: #28a745;
                font-weight: 600;
                font-size: 14px;
                margin-bottom: 12px;
            }
            
            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .qty-btn {
                width: 32px;
                height: 32px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .qty-btn:hover {
                background: #f8f9fa;
                border-color: #007bff;
            }
            
            .qty-display {
                min-width: 40px;
                text-align: center;
                font-weight: 600;
                font-size: 16px;
            }
            
            .item-total {
                font-weight: 600;
                font-size: 16px;
                color: #333;
                min-width: 80px;
                text-align: right;
            }
            
            .angava-remove-btn {
                background: #dc3545;
                color: white;
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .angava-remove-btn:hover {
                background: #c82333;
                transform: scale(1.05);
            }
            
            .angava-cart-summary {
                margin-bottom: 20px;
            }
            
            .summary-line {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 16px;
            }
            
            .summary-line.total {
                border-top: 2px solid #dee2e6;
                padding-top: 12px;
                margin-top: 12px;
                font-size: 18px;
            }
            
            .angava-modal-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .angava-btn {
                padding: 12px 24px;
                border: 2px solid transparent;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 44px;
            }
            
            .angava-btn-primary {
                background: #007bff;
                color: white;
                flex: 1;
            }
            
            .angava-btn-primary:hover {
                background: #0056b3;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }
            
            .angava-btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .angava-btn-secondary:hover {
                background: #545b62;
            }
            
            .angava-btn-outline {
                background: transparent;
                color: #dc3545;
                border-color: #dc3545;
            }
            
            .angava-btn-outline:hover {
                background: #dc3545;
                color: white;
            }
            
            .angava-empty-state {
                text-align: center;
                padding: 60px 40px;
                color: #666;
            }
            
            .empty-icon {
                font-size: 64px;
                color: #dee2e6;
                margin-bottom: 24px;
            }
            
            .angava-empty-state h4 {
                margin: 0 0 12px 0;
                font-size: 24px;
                color: #333;
            }
            
            .angava-empty-state p {
                margin: 0 0 32px 0;
                font-size: 16px;
                line-height: 1.5;
            }
            
            .angava-notification {
                position: fixed;
                top: 24px;
                right: 24px;
                z-index: 10001;
                min-width: 300px;
                max-width: 400px;
                padding: 16px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }
            
            .angava-notification.show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-content i {
                font-size: 18px;
                flex-shrink: 0;
            }
            
            .angava-notification-success {
                background: linear-gradient(135deg, #28a745, #20c997);
            }
            
            .angava-notification-error {
                background: linear-gradient(135deg, #dc3545, #e74c3c);
            }
            
            .angava-notification-info {
                background: linear-gradient(135deg, #17a2b8, #3498db);
            }
            
            .angava-notification-wishlist {
                background: linear-gradient(135deg, #e91e63, #f39c12);
            }
            
            .in-wishlist {
                animation: wishlistPulse 0.3s ease;
            }
            
            @keyframes wishlistPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                .angava-modal {
                    padding: 10px;
                }
                
                .angava-modal-container {
                    max-height: 90vh;
                }
                
                .angava-modal-header, .angava-modal-footer {
                    padding: 16px;
                }
                
                .angava-cart-items {
                    padding: 16px;
                }
                
                .angava-cart-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 12px;
                }
                
                .item-details {
                    width: 100%;
                }
                
                .angava-modal-actions {
                    flex-direction: column;
                }
                
                .angava-notification {
                    left: 10px;
                    right: 10px;
                    max-width: none;
                }
            }
            
            /* Additional improvements for existing elements */
            .minicart-item {
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
                padding: 12px !important;
                border-bottom: 1px solid #eee !important;
            }
            
            .minicart-product-details h6 {
                margin: 0 0 4px 0 !important;
                font-size: 14px !important;
                line-height: 1.2 !important;
            }
            
            .minicart-product-details span {
                font-size: 12px !important;
                color: #666 !important;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // === PUBLISKĀS METODES ===
    getCartItems() { return [...this.cart]; }
    getWishlistItems() { return [...this.wishlist]; }
    getCartTotal() { return this.cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0); }
    getCartItemsCount() { return this.cart.reduce((sum, item) => sum + (item.quantity || 1), 0); }
}

// Globālā inicializācija
let angavaEcommerce = null;

document.addEventListener('DOMContentLoaded', function() {
    try {
        angavaEcommerce = new AngavaECommerceSystem();
        window.angavaEcommerce = angavaEcommerce;
        
        // Backward compatibility functions
        window.addToCart = function(id, name, price, image) {
            const mockElement = {
                dataset: {
                    productId: id,
                    productName: name,
                    productPrice: price,
                    productImage: image
                }
            };
            angavaEcommerce.addToCart(mockElement);
        };
        
        console.log('🎉 ANGAVA E-komercijas sistēma veiksmīgi ielādēta!');
        
    } catch (error) {
        console.error('❌ Kļūda ielādējot ANGAVA E-komercijas sistēmu:', error);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AngavaECommerceSystem;
}