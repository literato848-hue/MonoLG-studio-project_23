// Vēlmju saraksta sistēma wishlist.html lapai
class WishlistPageSystem {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('angava-wishlist')) || [];
        this.cart = JSON.parse(localStorage.getItem('angava-cart')) || [];
        
        this.init();
    }
    
    init() {
        this.updateHeaderCounts();
        this.renderWishlistItems();
        this.bindEvents();
    }
    
    updateHeaderCounts() {
        // Atjaunina cart skaitītāju
        const cartCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.querySelectorAll('.cart-item-count').forEach(el => {
            el.textContent = cartCount;
            el.style.display = cartCount > 0 ? 'block' : 'none';
        });
        
        // Atjaunina mini cart tekstu
        const cartText = document.querySelector('.hm-minicart-trigger .item-text');
        if (cartText) {
            cartText.innerHTML = `€${cartTotal.toFixed(2)} <span class="cart-item-count">${cartCount}</span>`;
        }
        
        // Atjaunina wishlist skaitītāju
        document.querySelectorAll('.wishlist-item-count').forEach(el => {
            el.textContent = this.wishlist.length;
            el.style.display = this.wishlist.length > 0 ? 'block' : 'none';
        });
        
        // Atjaunina mini cart saturu
        this.updateMiniCart();
    }
    
    updateMiniCart() {
        const miniCartList = document.querySelector('.minicart-product-list');
        if (!miniCartList) return;
        
        if (this.cart.length === 0) {
            miniCartList.innerHTML = '<li style="text-align: center; padding: 20px; color: #666;">Grozs ir tukšs</li>';
        } else {
            miniCartList.innerHTML = this.cart.map(item => `
                <li>
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
        
        // Atjaunina kopējo summu
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.querySelector('.minicart-total span');
        if (totalElement) {
            totalElement.textContent = `€${total.toFixed(2)}`;
        }
    }
    
    renderWishlistItems() {
        const container = document.querySelector('.wishlist-area .container');
        if (!container) return;
        
        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Jūsu vēlmju saraksts ir tukšs</h3>
                    <p>Pievienojiet produktus, lai tos vēlāk apskatītu</p>
                    <a href="index.html" class="li-button">Atgriezties veikalā</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="row">
                <div class="col-12">
                    <h1 class="title">Vēlmju saraksts (${this.wishlist.length} preces)</h1>
                    <div class="table-content table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="li-product-remove">Noņemt</th>
                                    <th class="li-product-thumbnail">Attēls</th>
                                    <th class="cart-product-name">Produkts</th>
                                    <th class="li-product-price">Cena</th>
                                    <th class="li-product-stock-status">Statuss</th>
                                    <th class="li-product-add-cart">Pievienot grozam</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.wishlist.map((item, index) => this.renderWishlistItem(item, index)).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="li-button-group">
                                <button type="button" class="li-button" onclick="wishlistSystem.clearWishlist()">
                                    Iztukšot vēlmju sarakstu
                                </button>
                                <a href="index.html" class="li-button li-button-dark">
                                    Turpināt iepirkšanos
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderWishlistItem(item, index) {
        return `
            <tr>
                <td class="li-product-remove">
                    <a href="#" class="remove-wishlist-item" data-index="${index}">
                        <i class="fa fa-times"></i>
                    </a>
                </td>
                <td class="li-product-thumbnail">
                    <a href="${item.url}">
                        <img src="${item.image}" alt="${item.name}" style="max-width: 80px;">
                    </a>
                </td>
                <td class="li-product-name">
                    <a href="${item.url}">${item.name}</a>
                </td>
                <td class="li-product-price">
                    <span class="amount">€${item.price.toFixed(2)}</span>
                </td>
                <td class="li-product-stock-status">
                    <span class="in-stock">Pieejams</span>
                </td>
                <td class="li-product-add-cart">
                    <a href="#" class="li-button add-to-cart-from-wishlist" 
                       data-product-id="${item.id}"
                       data-product-name="${item.name}"
                       data-product-price="${item.price}"
                       data-product-image="${item.image}"
                       data-product-url="${item.url}">
                       Pievienot grozam
                    </a>
                </td>
            </tr>
        `;
    }
    
    bindEvents() {
        // Event delegation
        document.addEventListener('click', (e) => {
            // Noņemt no vēlmju saraksta
            if (e.target.closest('.remove-wishlist-item')) {
                e.preventDefault();
                const index = parseInt(e.target.closest('.remove-wishlist-item').dataset.index);
                this.removeFromWishlist(index);
            }
            
            // Pievienot grozam no vēlmju saraksta
            if (e.target.closest('.add-to-cart-from-wishlist')) {
                e.preventDefault();
                this.addToCartFromWishlist(e.target.closest('.add-to-cart-from-wishlist'));
            }
            
            // Mini cart remove funkcionalitāte
            if (e.target.closest('.remove-from-cart')) {
                e.preventDefault();
                const listItem = e.target.closest('li');
                this.removeFromCart(listItem);
            }
        });
    }
    
    removeFromWishlist(index) {
        if (index >= 0 && index < this.wishlist.length) {
            const removedItem = this.wishlist[index];
            this.wishlist.splice(index, 1);
            this.saveWishlist();
            this.updateHeaderCounts();
            this.renderWishlistItems();
            this.showNotification(`"${removedItem.name}" noņemts no vēlmju saraksta`, 'wishlist');
        }
    }
    
    addToCartFromWishlist(button) {
        const productData = {
            id: button.dataset.productId,
            name: button.dataset.productName,
            price: parseFloat(button.dataset.productPrice),
            image: button.dataset.productImage,
            url: button.dataset.productUrl,
            quantity: 1
        };
        
        const existingItem = this.cart.find(item => item.id === productData.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push(productData);
        }
        
        this.saveCart();
        this.updateHeaderCounts();
        this.showNotification(`"${productData.name}" pievienots grozam`, 'cart');
    }
    
    removeFromCart(listItem) {
        const allItems = Array.from(document.querySelectorAll('.minicart-product-list li'));
        const itemIndex = allItems.indexOf(listItem);
        
        if (itemIndex >= 0 && itemIndex < this.cart.length) {
            const removedItem = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            this.updateHeaderCounts();
            this.showNotification(`"${removedItem.name}" noņemts no groza`, 'cart');
        }
    }
    
    clearWishlist() {
        if (this.wishlist.length === 0) return;
        
        if (confirm('Vai tiešām vēlaties iztukšot vēlmju sarakstu?')) {
            this.wishlist = [];
            this.saveWishlist();
            this.updateHeaderCounts();
            this.renderWishlistItems();
            this.showNotification('Vēlmju saraksts iztukšots', 'wishlist');
        }
    }
    
    saveCart() {
        localStorage.setItem('angava-cart', JSON.stringify(this.cart));
    }
    
    saveWishlist() {
        localStorage.setItem('angava-wishlist', JSON.stringify(this.wishlist));
    }
    
    showNotification(message, type = 'cart') {
        const notificationId = type === 'wishlist' ? 'wishlistNotification' : 'cartNotification';
        let notification = document.getElementById(notificationId);
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = notificationId;
            notification.className = type === 'wishlist' ? 'wishlist-notification' : 'cart-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Palaiž sistēmu, kad lapa ir ielādēta
document.addEventListener('DOMContentLoaded', function() {
    window.wishlistSystem = new WishlistPageSystem();
    
    // Pievienots papildu CSS
    const style = document.createElement('style');
    style.textContent = `
        .title {
            font-size: 24px;
            margin-bottom: 30px;
            color: #333;
        }
        
        .table {
            margin-bottom: 30px;
        }
        
        .table th {
            border-top: none;
            font-weight: 600;
            color: #333;
            padding: 15px 10px;
        }
        
        .table td {
            vertical-align: middle;
            padding: 15px 10px;
        }
        
        .li-product-remove a {
            color: #dc3545;
            font-size: 18px;
        }
        
        .li-product-remove a:hover {
            color: #c82333;
        }
        
        .li-product-name a {
            color: #333;
            font-weight: 500;
            text-decoration: none;
        }
        
        .li-product-name a:hover {
            color: #007bff;
        }
        
        .amount {
            font-weight: 600;
            color: #28a745;
        }
        
        .in-stock {
            color: #28a745;
            font-weight: 500;
        }
        
        .li-button {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            border: none;
            cursor: pointer;
            display: inline-block;
            margin-right: 10px;
        }
        
        .li-button:hover {
            background: #0056b3;
            color: white;
            text-decoration: none;
        }
        
        .li-button-dark {
            background: #333;
        }
        
        .li-button-dark:hover {
            background: #555;
        }
        
        .li-button-group {
            margin-top: 20px;
        }
        
        @media (max-width: 768px) {
            .table-responsive {
                font-size: 14px;
            }
            
            .li-product-thumbnail img {
                max-width: 60px !important;
            }
            
            .li-button {
                padding: 8px 16px;
                font-size: 14px;
            }
        }
    `;
    document.head.appendChild(style);
});