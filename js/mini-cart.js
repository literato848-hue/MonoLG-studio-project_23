// MINI CART SYSTEM
class MiniCart {
    constructor() {
        // Ja jau ir instance, atgriezt esošo
        if (window.miniCartInstance) {
            return window.miniCartInstance;
        }
        
        this.items = this.loadCartFromStorage();
        this.wishlist = this.loadWishlistFromStorage();
        this.init();
        
        // Saglabāt reference
        window.miniCartInstance = this;
    }

    // Pievienot observer, lai sekotu DOM izmaiņām
    init() {
        this.createCartHTML();
        this.updateCartDisplay();
        this.updateWishlistCount();
        this.bindEvents();
        this.observeDOM();
    }

    observeDOM() {
        // Sekot DOM izmaiņām, ja groza poga tiek dzēsta/pārvietota
        if (typeof MutationObserver !== 'undefined') {
            this.observer = new MutationObserver(() => {
                if (!document.getElementById('mini-cart-dropdown')) {
                    console.log('🔄 Grozu elements dzēsts, atkārtoju inicializāciju...');
                    this.createCartHTML();
                    this.updateCartDisplay();
                }
            });
            
            this.observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Izveidot mini-cart HTML, aizstājot pareizo groza pogu
    createCartHTML() {
        let existingCart = null;

        // Meklēt sarkano grozu ar € summu
        const candidates = document.querySelectorAll('*');
        candidates.forEach(el => {
            const style = window.getComputedStyle(el);
            const bgColor = style.backgroundColor;
            const text = el.textContent || '';
            
            // Meklēt sarkanu fonu UN € simbolu
            if ((bgColor.includes('rgb(220, 53, 69)') || 
                 bgColor.includes('rgb(255,') || 
                 el.style.backgroundColor.includes('red') || 
                 el.className.includes('red')) && 
                text.includes('€')) {
                existingCart = el;
                console.log('Atradu groza pogu:', el);
            }
        });

        // Ja nav atrasts, meklēt pēc teksta ar €
        if (!existingCart) {
            candidates.forEach(el => {
                const text = el.textContent || '';
                if (text.includes('€') && text.includes('0') && 
                    el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                    const rect = el.getBoundingClientRect();
                    if (rect.right > window.innerWidth * 0.7) { // labā pusē
                        existingCart = el;
                        console.log('Atradu grozu pēc € un pozīcijas:', el);
                    }
                }
            });
        }

        const cartHTML = `
            <div class="mini-cart-container" style="position: relative; display: inline-block;">
                <button class="mini-cart-toggle" onclick="toggleMiniCart()" style="
                    background: #dc3545; border: none; color: white; padding: 8px 12px; 
                    border-radius: 4px; cursor: pointer; display: flex; align-items: center; 
                    gap: 6px; font-size: 12px; font-weight: bold; transition: all 0.3s ease; 
                    position: relative; min-height: 32px;">
                    <span class="cart-icon">🛒</span>
                    <span class="cart-total-display" id="cart-total-display">€0.00</span>
                    <span class="cart-count" id="cart-count" style="
                        background: white; color: #dc3545; border-radius: 50%; width: 18px; 
                        height: 18px; display: none; align-items: center; justify-content: center; 
                        font-size: 11px; font-weight: bold; margin-left: 4px;">0</span>
                </button>
                
                <div class="mini-cart-dropdown" id="mini-cart-dropdown" style="
                    position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; 
                    border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); width: 350px; 
                    max-height: 500px; overflow-y: auto; display: none; z-index: 1001; margin-top: 10px;">
                    
                    <div class="mini-cart-header" style="padding: 15px 20px; border-bottom: 1px solid #eee; 
                        background: #f8f9fa; font-weight: bold; color: #333; display: flex; 
                        justify-content: space-between; align-items: center;">
                        <span>Jūsu grozs</span>
                        <button class="close-cart" onclick="closeMiniCart()" style="
                            background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">✕</button>
                    </div>
                    
                    <div class="mini-cart-items" id="cart-items" style="max-height: 300px; overflow-y: auto;">
                        <div class="empty-cart" style="text-align: center; padding: 40px 20px; color: #666;">
                            🛒<br><p>Jūsu grozs ir tukšs</p>
                        </div>
                    </div>
                    
                    <div class="mini-cart-footer" id="cart-footer" style="
                        display: none; padding: 20px; border-top: 1px solid #eee; background: #f8f9fa;">
                        <div class="cart-total" style="
                            display: flex; justify-content: space-between; align-items: center; 
                            margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #333;">
                            <span>Kopā:</span>
                            <span id="cart-total">0.00€</span>
                        </div>
                        <button class="checkout-btn" onclick="checkout()" style="
                            width: 100%; background: #28a745; color: white; border: none; padding: 12px; 
                            border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; 
                            transition: all 0.3s ease;">Noformēt pasūtījumu</button>
                    </div>
                </div>
            </div>
        `;

        if (existingCart) {
            // Aizstāt esošo groza pogu
            existingCart.outerHTML = cartHTML;
            console.log('✅ Aizstāju groza pogu ar mini-cart');
        } else {
            // Ja nav atrasts, pievienot augšējā labajā stūrī
            const body = document.body;
            const tempDiv = document.createElement('div');
            tempDiv.style.cssText = 'position: fixed; top: 60px; right: 20px; z-index: 1000;';
            tempDiv.innerHTML = cartHTML;
            body.appendChild(tempDiv);
            console.log('⚠️ Groza poga nav atrasta, pievienoju augšējā labajā stūrī');
            console.log('💡 Izmantojiet: replaceCartManually(".your-cart-selector")');
        }

        // Pievienot dropdown, ja nav
        if (!document.getElementById('mini-cart-dropdown')) {
            const container = document.querySelector('.mini-cart-container');
            if (container) {
                const dropdownHTML = `
                    <div class="mini-cart-dropdown" id="mini-cart-dropdown" style="
                        position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; 
                        border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); width: 350px; 
                        max-height: 500px; overflow-y: auto; display: none; z-index: 1001; margin-top: 10px;">
                        
                        <div class="mini-cart-header" style="padding: 15px 20px; border-bottom: 1px solid #eee; 
                            background: #f8f9fa; font-weight: bold; color: #333; display: flex; 
                            justify-content: space-between; align-items: center;">
                            <span>Jūsu grozs</span>
                            <button class="close-cart" onclick="closeMiniCart()" style="
                                background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">✕</button>
                        </div>
                        
                        <div class="mini-cart-items" id="cart-items" style="max-height: 300px; overflow-y: auto;">
                            <div class="empty-cart" style="text-align: center; padding: 40px 20px; color: #666;">
                                🛒<br><p>Jūsu grozs ir tukšs</p>
                            </div>
                        </div>
                        
                        <div class="mini-cart-footer" id="cart-footer" style="
                            display: none; padding: 20px; border-top: 1px solid #eee; background: #f8f9fa;">
                            <div class="cart-total" style="
                                display: flex; justify-content: space-between; align-items: center; 
                                margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #333;">
                                <span>Kopā:</span>
                                <span id="cart-total">0.00€</span>
                            </div>
                            <button class="checkout-btn" onclick="checkout()" style="
                                width: 100%; background: #28a745; color: white; border: none; padding: 12px; 
                                border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; 
                                transition: all 0.3s ease;">Noformēt pasūtījumu</button>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', dropdownHTML);
            }
        }

        // Notification konteiners
        if (!document.getElementById('notification')) {
            const notificationHTML = `
                <div id="notification" style="
                    position: fixed; top: 120px; right: 20px; background: #28a745; color: white; 
                    padding: 15px 20px; border-radius: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); 
                    z-index: 1002; transform: translateX(350px); transition: all 0.3s ease;">
                    <span id="notification-text"></span>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', notificationHTML);
        }
    }

    bindEvents() {
        // Noņemt esošos event listeners, lai novērstu dubultošanos
        this.unbindEvents();
        
        // Pievienot grozam - izmantot delegāciju
        this.cartHandler = (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.add-to-cart-btn');
                this.addToCart(btn);
            }
        };
        document.addEventListener('click', this.cartHandler);

        // Wishlist
        this.wishlistHandler = (e) => {
            if (e.target.closest('.wishlist-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const btn = e.target.closest('.wishlist-btn');
                this.toggleWishlist(btn);
            }
        };
        document.addEventListener('click', this.wishlistHandler);

        // Aizvērt grozu, ja klikšķina ārpus tā
        this.outsideClickHandler = (e) => {
            const dropdown = document.getElementById('mini-cart-dropdown');
            if (dropdown && !e.target.closest('.mini-cart-container') && 
                dropdown.style.display === 'block') {
                this.closeMiniCart();
            }
        };
        document.addEventListener('click', this.outsideClickHandler);

        // ESC taustiņš aizvēršanai
        this.escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeMiniCart();
            }
        };
        document.addEventListener('keydown', this.escHandler);
    }

    unbindEvents() {
        if (this.cartHandler) {
            document.removeEventListener('click', this.cartHandler);
        }
        if (this.wishlistHandler) {
            document.removeEventListener('click', this.wishlistHandler);
        }
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
        }
        if (this.escHandler) {
            document.removeEventListener('keydown', this.escHandler);
        }
    }

    addToCart(btn) {
        const productData = {
            id: btn.dataset.productId,
            name: btn.dataset.productName,
            price: parseFloat(btn.dataset.productPrice),
            image: btn.dataset.productImage,
            quantity: 1
        };

        // Validācija
        if (!productData.id || !productData.name || isNaN(productData.price)) {
            this.showNotification('Kļūda: Nepilnīgi produkta dati!', 'error');
            return;
        }

        // Debugging
        console.log('Pievienoju produktu:', productData);
        console.log('Pašreizējie groza elementi:', this.items);

        // Pārbaudīt, vai produkts jau ir grozā
        const existingItem = this.items.find(item => item.id === productData.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
            console.log('Palielināju daudzumu:', existingItem);
            this.showNotification(`Daudzums palielināts grozā!`);
        } else {
            this.items.push(productData);
            console.log('Pievienoju jaunu produktu, kopā elementu:', this.items.length);
            this.showNotification(`Produkts pievienots grozam!`);
        }

        this.saveCartToStorage();
        this.updateCartDisplay();
    }

    removeFromCart(productId) {
        const item = this.items.find(item => item.id === productId);
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartDisplay();
        
        if (item) {
            this.showNotification(`${item.name} izņemts no groza`, 'error');
        }
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item) {
            const oldQuantity = item.quantity;
            item.quantity = parseInt(newQuantity);
            this.saveCartToStorage();
            this.updateCartDisplay();
            
            if (newQuantity > oldQuantity) {
                this.showNotification(`Daudzums palielināts!`);
            } else {
                this.showNotification(`Daudzums samazināts!`);
            }
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartFooter = document.getElementById('cart-footer');
        const cartTotal = document.getElementById('cart-total');

        if (!cartCount || !cartItems) return;

        // Atjaunināt skaitītāju - SVARĪGI: aprēķināt tikai unique produktu skaitu
        const totalItems = this.items.length;
        const totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
        
        console.log('Atjauninu cart display:');
        console.log('Produktu skaits:', totalItems);
        console.log('Kopējais daudzums:', totalQuantity);
        console.log('Items:', this.items);
        
        // Rādīt produktu skaitu, nevis kopējo daudzumu
        cartCount.textContent = totalQuantity;

        // Rādīt/paslēpt skaitītāju
        cartCount.style.display = totalQuantity > 0 ? 'flex' : 'none';

        // Atjaunināt grozu
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart" style="text-align: center; padding: 40px 20px; color: #666;">
                    🛒<br><p>Jūsu grozs ir tukšs</p>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" style="
                    padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; 
                    gap: 15px; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" style="
                        width: 60px; height: 60px; border-radius: 8px; object-fit: cover;" 
                        onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+'">
                    <div style="flex: 1;">
                        <div style="font-size: 14px; color: #333; margin-bottom: 5px; line-height: 1.4;">
                            ${item.name}
                        </div>
                        <div style="color: #007bff; font-weight: bold; font-size: 16px;">
                            ${item.price.toFixed(2)}€
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                            <button onclick="miniCart.updateQuantity('${item.id}', ${item.quantity - 1})" style="
                                background: #f8f9fa; border: 1px solid #ddd; width: 30px; height: 30px; 
                                border-radius: 4px; cursor: pointer; display: flex; align-items: center; 
                                justify-content: center; font-size: 14px;">-</button>
                            <span style="min-width: 30px; text-align: center; font-weight: bold;">${item.quantity}</span>
                            <button onclick="miniCart.updateQuantity('${item.id}', ${item.quantity + 1})" style="
                                background: #f8f9fa; border: 1px solid #ddd; width: 30px; height: 30px; 
                                border-radius: 4px; cursor: pointer; display: flex; align-items: center; 
                                justify-content: center; font-size: 14px;">+</button>
                            <button onclick="miniCart.removeFromCart('${item.id}')" title="Izņemt no groza" style="
                                background: #dc3545; color: white; border: none; width: 30px; height: 30px; 
                                border-radius: 4px; cursor: pointer; display: flex; align-items: center; 
                                justify-content: center; margin-left: 10px;">🗑</button>
                        </div>
                    </div>
                </div>
            `).join('');

            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (cartTotal) cartTotal.textContent = `${total.toFixed(2)}€`;
            if (cartFooter) cartFooter.style.display = 'block';
        }
    }

    toggleWishlist(btn) {
        const productData = {
            id: btn.dataset.productId,
            name: btn.dataset.productName,
            price: parseFloat(btn.dataset.productPrice),
            image: btn.dataset.productImage
        };

        // Validācija
        if (!productData.id || !productData.name) {
            this.showNotification('Kļūda: Nepilnīgi produkta dati!', 'error');
            return;
        }

        const existingIndex = this.wishlist.findIndex(item => item.id === productData.id);
        
        if (existingIndex > -1) {
            this.wishlist.splice(existingIndex, 1);
            btn.classList.remove('active');
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa fa-heart-o';
            this.showNotification(`${productData.name} izņemts no vēlmju saraksta`, 'error');
        } else {
            this.wishlist.push(productData);
            btn.classList.add('active');
            const icon = btn.querySelector('i');
            if (icon) icon.className = 'fa fa-heart';
            this.showNotification(`${productData.name} pievienots vēlmju sarakstam!`);
        }

        this.saveWishlistToStorage();
        this.updateWishlistCount();
    }

    updateWishlistCount() {
        const wishlistCount = document.getElementById('wishlist-count');
        if (wishlistCount) {
            wishlistCount.textContent = this.wishlist.length;
        }

        // Atjaunināt wishlist pogas stāvokli
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.dataset.productId;
            if (!productId) return;
            
            const isInWishlist = this.wishlist.some(item => item.id === productId);
            
            if (isInWishlist) {
                btn.classList.add('active');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fa fa-heart';
            } else {
                btn.classList.remove('active');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fa fa-heart-o';
            }
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        if (!notification || !notificationText) return;
        
        notificationText.textContent = message;
        notification.style.background = type === 'error' ? '#dc3545' : '#28a745';
        notification.style.transform = 'translateX(0)';

        setTimeout(() => {
            notification.style.transform = 'translateX(350px)';
        }, 3000);
    }

    saveCartToStorage() {
        try {
            localStorage.setItem('miniCart', JSON.stringify(this.items));
        } catch (e) {
            console.warn('Nevar saglabāt grozu localStorage:', e);
        }
    }

    loadCartFromStorage() {
        try {
            const saved = localStorage.getItem('miniCart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Nevar ielādēt grozu no localStorage:', e);
            return [];
        }
    }

    saveWishlistToStorage() {
        try {
            localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        } catch (e) {
            console.warn('Nevar saglabāt wishlist localStorage:', e);
        }
    }

    loadWishlistFromStorage() {
        try {
            const saved = localStorage.getItem('wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn('Nevar ielādēt wishlist no localStorage:', e);
            return [];
        }
    }

    toggleMiniCart() {
        const dropdown = document.getElementById('mini-cart-dropdown');
        if (!dropdown) return;
        
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        } else {
            dropdown.style.display = 'block';
        }
    }

    closeMiniCart() {
        const dropdown = document.getElementById('mini-cart-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }

    checkout() {
        if (this.items.length === 0) {
            this.showNotification('Grozs ir tukšs!', 'error');
            return;
        }

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsText = this.items.map(item => 
            `${item.name} (${item.quantity}x) - ${(item.price * item.quantity).toFixed(2)}€`
        ).join('\n');

        if (confirm(`Pasūtījuma apkopojums:\n\n${itemsText}\n\nKopā: ${total.toFixed(2)}€\n\nVai vēlaties turpināt?`)) {
            // Šeit varētu būt pārvirzīšana uz checkout lapu
            this.showNotification('Paldies par pasūtījumu!');
            
            // Notīrīt grozu pēc veiksmīga pasūtījuma (opcija)
            // this.items = [];
            // this.saveCartToStorage();
            // this.updateCartDisplay();
            this.closeMiniCart();
        }
    }

    // Publiskās metodes
    getCartItems() {
        return this.items;
    }

    getWishlistItems() {
        return this.wishlist;
    }

    getCartTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.items = [];
        this.saveCartToStorage();
        this.updateCartDisplay();
        this.showNotification('Grozs iztīrīts!');
    }

    clearWishlist() {
        this.wishlist = [];
        this.saveWishlistToStorage();
        this.updateWishlistCount();
        this.showNotification('Vēlmju saraksts iztīrīts!');
    }

    // Cleanup funkcija
    destroy() {
        this.unbindEvents();
        if (this.observer) {
            this.observer.disconnect();
        }
        const dropdown = document.getElementById('mini-cart-dropdown');
        if (dropdown) {
            dropdown.closest('.mini-cart-container').remove();
        }
    }

    // Debugging funkcijas
    debugCart() {
        console.log('=== MINI CART DEBUG ===');
        console.log('Items:', this.items);
        console.log('Wishlist:', this.wishlist);
        console.log('LocalStorage cart:', localStorage.getItem('miniCart'));
        console.log('LocalStorage wishlist:', localStorage.getItem('wishlist'));
        console.log('Total items:', this.items.length);
        console.log('Total quantity:', this.items.reduce((sum, item) => sum + item.quantity, 0));
        console.log('Total amount:', this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
        
        // Parādīt esošos groza elementus lapā
        const cartElements = document.querySelectorAll('*');
        const carts = [];
        cartElements.forEach(el => {
            if (el.textContent && el.textContent.includes('€') && el.tagName !== 'SCRIPT') {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    carts.push({
                        element: el.tagName,
                        text: el.textContent.trim().slice(0, 50),
                        classes: el.className,
                        position: `${Math.round(rect.right)}px no kreisās`
                    });
                }
            }
        });
        console.log('Elementi ar € lapā:', carts);
        console.log('======================');
    }

    // Iztīrīt visu (tikai testēšanai)
    resetAll() {
        this.items = [];
        this.wishlist = [];
        localStorage.removeItem('miniCart');
        localStorage.removeItem('wishlist');
        this.updateCartDisplay();
        this.updateWishlistCount();
        this.showNotification('Viss iztīrīts!');
        console.log('✅ Cart un wishlist iztīrīts!');
    }
}

// GLOBĀLĀS FUNKCIJAS
function toggleMiniCart() {
    if (window.miniCart) {
        window.miniCart.toggleMiniCart();
    }
}

function closeMiniCart() {
    if (window.miniCart) {
        window.miniCart.closeMiniCart();
    }
}

function checkout() {
    if (window.miniCart) {
        window.miniCart.checkout();
    }
}

function showWishlist() {
    if (!window.miniCart || window.miniCart.wishlist.length === 0) {
        alert('Jūsu vēlmju saraksts ir tukšs!');
        return;
    }

    let wishlistHTML = 'Jūsu vēlmju saraksts:\n\n';
    window.miniCart.wishlist.forEach((item, index) => {
        wishlistHTML += `${index + 1}. ${item.name} - ${item.price.toFixed(2)}€\n`;
    });

    alert(wishlistHTML);
}

// MANUĀLA GROZU AIZSTĀŠANA
function replaceCartManually(selector) {
    if (!window.miniCart) {
        console.error('Mini Cart nav inicializēts!');
        return;
    }
    
    const element = document.querySelector(selector);
    if (!element) {
        console.error('Elements nav atrasts:', selector);
        return;
    }
    
    console.log('Manuāli aizstāju elementu:', element);
    element.outerHTML = `
        <div class="mini-cart-container" style="position: relative; display: inline-block;">
            <button class="mini-cart-toggle" onclick="toggleMiniCart()" style="
                background: #dc3545; border: none; color: white; padding: 8px 12px; 
                border-radius: 4px; cursor: pointer; display: flex; align-items: center; 
                gap: 6px; font-size: 12px; font-weight: bold; transition: all 0.3s ease; 
                position: relative; min-height: 32px;">
                <span class="cart-icon">🛒</span>
                <span class="cart-total-display" id="cart-total-display">€0.00</span>
                <span class="cart-count" id="cart-count" style="
                    background: white; color: #dc3545; border-radius: 50%; width: 18px; 
                    height: 18px; display: none; align-items: center; justify-content: center; 
                    font-size: 11px; font-weight: bold; margin-left: 4px;">0</span>
            </button>
        </div>
    `;
    
    window.miniCart.updateCartDisplay();
    console.log('✅ Grozs manuāli aizstāts!');
}

// INICIALIZĒT SISTĒMU PĒCDOMLOAD
function initMiniCart() {
    // Pārbaudīt, vai jau ir inicializēts
    if (window.miniCart) {
        console.log('Mini Cart jau ir inicializēts!');
        return;
    }
    
    if (typeof MiniCart !== 'undefined') {
        window.miniCart = new MiniCart();
        console.log('✅ Mini Cart System inicializēts!');
        console.log('🎯 Meklēju sarkano groza pogu ar € summu...');
        console.log('💡 Ja grozs nav pareizi aizstāts, izmantojiet:');
        console.log('   replaceCartManually(".your-cart-selector")');
        
        // Debugging informācija
        console.log('\n📋 Pieejamās komandas:');
        console.log('- miniCart.debugCart() - debug info');
        console.log('- miniCart.resetAll() - iztīrīt visu');
        console.log('- miniCart.clearCart() - iztīrīt grozu');
        console.log('- replaceCartManually(".selector") - manuāla aizstāšana');
        
        // Pārbaudīt esošos datus
        window.miniCart.debugCart();
        
        // Meklēt groza pogas pēc delay
        setTimeout(() => {
            const cartButtons = document.querySelectorAll('*');
            let foundCarts = [];
            cartButtons.forEach(el => {
                const text = el.textContent || '';
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                
                if (text.includes('€') && el.tagName !== 'SCRIPT' && rect.width > 0) {
                    foundCarts.push({
                        element: `<${el.tagName.toLowerCase()}${el.className ? ' class="' + el.className + '"' : ''}>`,
                        text: text.trim().slice(0, 30),
                        background: style.backgroundColor,
                        position: `${Math.round(rect.right)}px no kreisās`,
                        isRed: style.backgroundColor.includes('220, 53, 69') || style.backgroundColor.includes('rgb(255,')
                    });
                }
            });
            console.log('\n🔍 Elementi ar € lapā:');
            console.table(foundCarts);
            
            const redCarts = foundCarts.filter(c => c.isRed);
            if (redCarts.length > 0) {
                console.log('🔴 Sarkanie elementi (iespējamie grozi):', redCarts);
            }
        }, 2000);
        
    } else {
        console.error('❌ MiniCart klase nav pieejama!');
    }
}

// Palaist inicializāciju tikai vienreiz
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMiniCart, { once: true });
} else {
    initMiniCart();
}

// Eksportēt priekš ES6 moduliem
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiniCart;
}