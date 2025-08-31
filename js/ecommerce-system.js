// Uzlabots e-komercijas sistēma ar INSTANT UPDATE
class ECommerceSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('angava-cart')) || [];
        this.wishlist = JSON.parse(localStorage.getItem('angava-wishlist')) || [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateCartDisplay();
        this.updateWishlistDisplay();
        this.fixWishlistNavigation();
        
        // JAUNS: Regulāra atjaunināšana, lai nodrošinātu sinhronizāciju
        this.startPeriodicUpdate();
    }
    
    // JAUNS: Periodiski atjauno displaju
    startPeriodicUpdate() {
        setInterval(() => {
            this.updateCartDisplay();
            this.updateWishlistDisplay();
        }, 500); // Atjauno katras 0.5 sekundes
    }
    
    // Event delegation sistēma - labojums dinamiskiem elementiem
    bindEvents() {
        // Event delegation visam dokumentam - strādā ar dinamiskiem elementiem
        document.addEventListener('click', (e) => {
            // Grozu pievienošana
            if (e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart')) {
                e.preventDefault();
                this.addToCart(e.target.closest('.add-to-cart-btn') || e.target.closest('.add-to-cart'));
            }
            
            // Vēlmju saraksts
            if (e.target.closest('.wishlist-btn') || e.target.closest('.add-to-wishlist')) {
                e.preventDefault();
                this.toggleWishlist(e.target.closest('.wishlist-btn') || e.target.closest('.add-to-wishlist'));
            }
            
            // Noņemt no groza - FIKSĒTS
            if (e.target.closest('.minicart .close') || e.target.closest('.remove-from-cart')) {
                e.preventDefault();
                this.removeFromCart(e.target.closest('.minicart li'));
            }
            
            // Vēlmju saraksta navigācija - FIKSĒTS
            if (e.target.closest('.hm-wishlist a:not(.wishlist-btn):not(.add-to-wishlist)')) {
                e.preventDefault();
                window.location.href = 'wishlist.html';
            }
            
            // Vēlmju saraksta ikona navigācija
            if (e.target.matches('.fa-heart-o') || e.target.closest('.hm-wishlist')) {
                // Pārbauda vai tas nav produkta wishlist poga
                if (!e.target.closest('.add-actions') && !e.target.closest('.add-to-wishlist')) {
                    e.preventDefault();
                    window.location.href = 'wishlist.html';
                }
            }
        });
        
        // Meklēšanas forma
        const searchForm = document.querySelector('.hm-searchbox');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                const searchInput = e.target.querySelector('input[type="text"]');
                if (searchInput.value.trim() === '') {
                    e.preventDefault();
                    alert('Lūdzu ievadiet meklēšanas vārdu');
                }
            });
        }
    }
    
    // Pievienot grozam - UZLABOTS ar instant update
    addToCart(button) {
        console.log('Adding to cart...', button);
        const productData = this.extractProductData(button);
        console.log('Product data:', productData);
        
        const existingItem = this.cart.find(item => item.id === productData.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showNotification(`"${productData.name}" daudzums palielināts grozā`, 'success');
        } else {
            productData.quantity = 1;
            this.cart.push(productData);
            this.showNotification(`"${productData.name}" pievienots grozam`, 'success');
        }
        
        this.saveCart();
        
        // GALVENAIS LABOJUMS: Uzreiz atjauno visus display elementus
        setTimeout(() => {
            this.forceUpdateDisplay();
        }, 10);
        
        this.animateButton(button);
    }
    
    // JAUNS: Forsēta displaja atjaunināšana
    forceUpdateDisplay() {
        this.updateCartDisplay();
        this.updateWishlistDisplay();
        
        // Dublē atjaunināšanu, lai nodrošinātu, ka viss darbojas
        setTimeout(() => {
            this.updateCartDisplay();
        }, 100);
    }
    
    // Noņemt no groza - FIKSĒTS
    removeFromCart(listItem) {
        if (!listItem || listItem.classList.contains('empty-cart')) return;
        
        // Atrod pozīciju sarakstā
        const allItems = Array.from(document.querySelectorAll('.minicart-product-list li:not(.empty-cart)'));
        const itemIndex = allItems.indexOf(listItem);
        
        if (itemIndex >= 0 && itemIndex < this.cart.length) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.forceUpdateDisplay(); // Uzreiz atjauno
            this.showNotification(`"${removedItem.name}" noņemts no groza`, 'success');
        }
    }
    
    // Vēlmju saraksts toggle - UZLABOTS
    toggleWishlist(button) {
        const productData = this.extractProductData(button);
        const existingIndex = this.wishlist.findIndex(item => item.id === productData.id);
        
        if (existingIndex >= 0) {
            this.wishlist.splice(existingIndex, 1);
            this.updateWishlistIcon(button, false);
            this.showNotification(`"${productData.name}" noņemts no vēlmju saraksta`, 'info');
        } else {
            this.wishlist.push(productData);
            this.updateWishlistIcon(button, true);
            this.showNotification(`"${productData.name}" pievienots vēlmju sarakstam`, 'info');
        }
        
        this.saveWishlist();
        this.forceUpdateDisplay(); // Uzreiz atjauno
    }
    
    // Produkta datu iegūšana - UZLABOTS
    extractProductData(button) {
        return {
            id: button.dataset.productId || 
                button.dataset.id || 
                button.getAttribute('data-id') || 
                this.generateId(button),
            name: button.dataset.productName || 
                  button.dataset.name || 
                  button.getAttribute('data-name') || 
                  this.getProductName(button),
            price: parseFloat(
                (button.dataset.productPrice || 
                 button.dataset.price || 
                 button.getAttribute('data-price') || '0')
                .toString().replace(/[^\d.,]/g, '').replace(',', '.')
            ) || 0,
            image: button.dataset.productImage || 
                   button.dataset.image || 
                   button.getAttribute('data-image') || 
                   this.getProductImage(button),
            url: this.getProductUrl(button)
        };
    }
    
    // Palīgfunkcijas produkta datiem
    generateId(button) {
        const productWrap = button.closest('.single-product-wrap') || 
                           button.closest('.product-item') || 
                           button.closest('[class*="product"]');
        const nameElement = productWrap?.querySelector('.product_name') || 
                           productWrap?.querySelector('h3') || 
                           productWrap?.querySelector('h4');
        const name = nameElement?.textContent?.trim() || 'product';
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();
    }
    
    getProductName(button) {
        const productWrap = button.closest('.single-product-wrap') || 
                           button.closest('.product-item') || 
                           button.closest('[class*="product"]');
        const nameElement = productWrap?.querySelector('.product_name') || 
                           productWrap?.querySelector('h3') || 
                           productWrap?.querySelector('h4');
        return nameElement?.textContent?.trim() || 'Nezināma prece';
    }
    
    getProductImage(button) {
        const productWrap = button.closest('.single-product-wrap') || 
                           button.closest('.product-item') || 
                           button.closest('[class*="product"]');
        const imageElement = productWrap?.querySelector('.product-image img') || 
                            productWrap?.querySelector('img');
        return imageElement?.src || 'images/product/default.jpg';
    }
    
    getProductUrl(button) {
        const productWrap = button.closest('.single-product-wrap') || 
                           button.closest('.product-item') || 
                           button.closest('[class*="product"]');
        const linkElement = productWrap?.querySelector('.product_name') || 
                           productWrap?.querySelector('a');
        return linkElement?.href || '#';
    }
    
    // Grozu attēlošana - UZLABOTS
    updateCartDisplay() {
        this.updateCartCount();
        this.updateMiniCart();
        this.updateCartTotal();
        this.updateHeaderCartDisplay(); // JAUNS
    }
    
    // JAUNS: Atjauno header cart attēlojumu
    updateHeaderCartDisplay() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Atjauno header item-text
        const itemTextElements = document.querySelectorAll('.item-text');
        itemTextElements.forEach(element => {
            element.innerHTML = `€${total.toFixed(2)}<span class="cart-item-count">${totalItems}</span>`;
        });
    }
    
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const countElements = document.querySelectorAll('.cart-item-count');
        
        console.log('Updating cart count:', totalItems);
        
        countElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline-block' : 'none';
            
            // Pievienojam animāciju
            if (totalItems > 0) {
                element.style.backgroundColor = '#ff4757';
                element.style.color = 'white';
                element.style.borderRadius = '50%';
                element.style.padding = '2px 6px';
                element.style.fontSize = '12px';
                element.style.minWidth = '18px';
                element.style.textAlign = 'center';
                element.style.lineHeight = '1';
            }
        });
    }
    
    updateMiniCart() {
        const miniCartList = document.querySelector('.minicart-product-list');
        if (!miniCartList) return;
        
        if (this.cart.length === 0) {
            miniCartList.innerHTML = '<li class="empty-cart"><p>Grozs ir tukšs</p></li>';
            return;
        }
        
        miniCartList.innerHTML = this.cart.map((item, index) => `
            <li data-cart-index="${index}">
                <a href="${item.url}" class="minicart-product-image">
                    <img src="${item.image}" alt="${item.name}" style="max-width: 60px;">
                </a>
                <div class="minicart-product-details">
                    <h6><a href="${item.url}">${item.name}</a></h6>
                    <span>${item.quantity} x €${item.price.toFixed(2)}</span>
                </div>
                <button class="close remove-from-cart" title="Noņemt" type="button">
                    <i class="fa fa-close"></i>
                </button>
            </li>
        `).join('');
    }
    
    updateCartTotal() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElements = document.querySelectorAll('.minicart-total span');
        totalElements.forEach(element => {
            element.textContent = `€${total.toFixed(2)}`;
        });
    }
    
    // Vēlmju saraksta attēlošana - UZLABOTS
    updateWishlistDisplay() {
        const countElements = document.querySelectorAll('.wishlist-item-count');
        countElements.forEach(element => {
            element.textContent = this.wishlist.length;
            element.style.display = this.wishlist.length > 0 ? 'inline-block' : 'none';
            
            // Pievienojam stilu
            if (this.wishlist.length > 0) {
                element.style.backgroundColor = '#e91e63';
                element.style.color = 'white';
                element.style.borderRadius = '50%';
                element.style.padding = '2px 6px';
                element.style.fontSize = '12px';
                element.style.minWidth = '18px';
                element.style.textAlign = 'center';
                element.style.lineHeight = '1';
            }
        });
        
        // Atjaunina visas vēlmju ikonas
        document.querySelectorAll('.wishlist-btn, .add-to-wishlist').forEach(btn => {
            const productData = this.extractProductData(btn);
            const isInWishlist = this.wishlist.some(item => item.id === productData.id);
            this.updateWishlistIcon(btn, isInWishlist);
        });
    }
    
    updateWishlistIcon(button, isActive) {
        const icon = button.querySelector('i');
        if (icon) {
            if (isActive) {
                icon.className = 'fa fa-heart';
                icon.style.color = '#e91e63';
                button.style.color = '#e91e63';
            } else {
                icon.className = 'fa fa-heart-o';
                icon.style.color = '';
                button.style.color = '';
            }
        }
    }
    
    // FIKSĒ vēlmju saraksta navigāciju
    fixWishlistNavigation() {
        // Nodrošina, ka vēlmju saraksta ikona ved uz pareizo lapu
        const wishlistLinks = document.querySelectorAll('.hm-wishlist a');
        wishlistLinks.forEach(link => {
            // Ja tas nav produkta wishlist poga
            if (!link.closest('.add-actions') && !link.classList.contains('add-to-wishlist')) {
                link.href = 'wishlist.html';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'wishlist.html';
                });
            }
        });
    }
    
    // Datu saglabāšana
    saveCart() {
        localStorage.setItem('angava-cart', JSON.stringify(this.cart));
        console.log('Cart saved:', this.cart);
    }
    
    saveWishlist() {
        localStorage.setItem('angava-wishlist', JSON.stringify(this.wishlist));
        console.log('Wishlist saved:', this.wishlist);
    }
    
    // Paziņojumi - UZLABOTS
    showNotification(message, type = 'success') {
        // Izmanto esošos notification elementus
        let notificationId = type === 'info' ? 'wishlistNotification' : 'cartNotification';
        let notification = document.getElementById(notificationId);
        
        if (!notification) {
            // Izveido notification, ja neeksistē
            notification = document.createElement('div');
            notification.id = notificationId;
            notification.className = type === 'info' ? 'wishlist-notification' : 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: ${type === 'info' ? '70px' : '20px'};
                right: 20px;
                background: ${type === 'info' ? '#e91e63' : '#28a745'};
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                z-index: 9999;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                max-width: 300px;
            `;
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            notification.classList.remove('show');
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
        }, 3000);
    }
    
    // Pogas animācija - UZLABOTS
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        button.style.transition = 'transform 0.15s ease';
        
        // Pievienojam bounce efektu
        setTimeout(() => {
            button.style.transform = 'scale(1.05)';
        }, 75);
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    // Publiskas metodes grozu pārvaldībai
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.forceUpdateDisplay();
        this.showNotification('Grozs iztukšots', 'success');
    }
    
    getCartTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    getCartItems() {
        return [...this.cart];
    }
    
    getWishlistItems() {
        return [...this.wishlist];
    }
}

// Palaiž sistēmu, kad lapa ir ielādēta
document.addEventListener('DOMContentLoaded', function() {
    window.ecommerceSystem = new ECommerceSystem();
    
    // Debug informācija
    console.log('E-commerce system initialized');
    
    // Pievienots CSS stilu uzlabojums
    const style = document.createElement('style');
    style.textContent = `
        .fa-heart {
            color: #e91e63 !important;
        }
        
        .cart-notification, .wishlist-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
        }
        
        .wishlist-notification {
            background: #e91e63;
            top: 70px;
        }
        
        .cart-notification.show, .wishlist-notification.show {
            opacity: 1 !important;
            transform: translateX(0) !important;
        }
        
        .minicart-product-details h6 {
            margin: 0 0 5px 0;
            font-size: 13px;
            line-height: 1.2;
        }
        
        .minicart-product-details span {
            font-size: 12px;
            color: #666;
        }
        
        .empty-cart p {
            text-align: center;
            color: #666;
            font-style: italic;
            padding: 20px;
        }
        
        .close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
        }
        
        .close:hover {
            background: #f5f5f5;
            border-radius: 3px;
        }
        
        .cart-item-count, .wishlist-item-count {
            display: inline-block;
            background: #ff4757;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 12px;
            min-width: 18px;
            text-align: center;
            line-height: 1;
            font-weight: bold;
        }
        
        .wishlist-item-count {
            background: #e91e63;
        }
    `;
    document.head.appendChild(style);
});

// Eksportē globāli pieejamas funkcijas
window.addToCart = function(productId, name, price, image) {
    if (window.ecommerceSystem) {
        const mockButton = {
            dataset: {
                productId: productId,
                productName: name,
                productPrice: price,
                productImage: image
            }
        };
        window.ecommerceSystem.addToCart(mockButton);
    }
};

window.removeFromCart = function(productId) {
    if (window.ecommerceSystem) {
        window.ecommerceSystem.cart = window.ecommerceSystem.cart.filter(item => item.id !== productId);
        window.ecommerceSystem.saveCart();
        window.ecommerceSystem.forceUpdateDisplay();
    }
};

window.clearCart = function() {
    if (window.ecommerceSystem) {
        window.ecommerceSystem.clearCart();
    }
};