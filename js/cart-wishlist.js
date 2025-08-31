// ===============================
// 1. cart-wishlist.js - Galvenā JavaScript funkcionalitāte
// ===============================

// Globālie mainīgie
let cart = JSON.parse(localStorage.getItem('angava_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('angava_wishlist')) || [];

// Produktu dati no jūsu lapas
const products = [
    {
        id: 1,
        name: "Accusantium dolorem1",
        price: 46.80,
        oldPrice: null,
        image: "images/product/large-size/1.jpg"
    },
    {
        id: 2,
        name: "Mug Today is a good day",
        price: 71.80,
        oldPrice: 77.22,
        image: "images/product/large-size/2.jpg"
    },
    {
        id: 3,
        name: "Chamcham Galaxy S9",
        price: 1209.00,
        oldPrice: 1350.00,
        image: "images/product/large-size/3.jpg"
    },
    {
        id: 4,
        name: "Work Desk Surface Studio 2018",
        price: 824.00,
        oldPrice: 950.00,
        image: "images/product/large-size/4.jpg"
    },
    {
        id: 5,
        name: "Phantom 4 Pro+ Obsidian",
        price: 1849.00,
        oldPrice: null,
        image: "images/product/large-size/5.jpg"
    }
];

// Inicializācija
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    updateWishlistDisplay();
    attachEventListeners();
});

// Produktu pievienošana grozam
function addToCart(productId, productName, productPrice) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            quantity: 1,
            image: getProductImage(productId)
        });
    }

    saveCart();
    updateCartDisplay();
    showNotification(`${productName} pievienots grozam!`);
}

// Produktu pievienošana vēlmju sarakstam
function addToWishlist(productId, productName, productPrice) {
    const existingItem = wishlist.find(item => item.id === productId);

    if (!existingItem) {
        wishlist.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: getProductImage(productId)
        });

        saveWishlist();
        updateWishlistDisplay();
        showNotification(`${productName} pievienots vēlmju sarakstam!`);
        
        // Mainīt pogas stāvokli
        updateWishlistButton(productId, true);
    }
}

// Produktu noņemšana no vēlmju saraksta
function removeFromWishlist(productId) {
    const index = wishlist.findIndex(item => item.id === productId);
    if (index > -1) {
        const productName = wishlist[index].name;
        wishlist.splice(index, 1);
        saveWishlist();
        updateWishlistDisplay();
        showNotification(`${productName} noņemts no vēlmju saraksta!`, 'error');
        
        // Mainīt pogas stāvokli
        updateWishlistButton(productId, false);
    }
}

// Produktu noņemšana no groza
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        const productName = cart[index].name;
        cart.splice(index, 1);
        saveCart();
        updateCartDisplay();
        renderCartModal();
        showNotification(`${productName} noņemts no groza!`, 'error');
    }
}

// Daudzuma izmaiņa grozā
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartDisplay();
            renderCartModal();
        }
    }
}

// Saglabāt grozu
function saveCart() {
    localStorage.setItem('angava_cart', JSON.stringify(cart));
}

// Saglabāt vēlmju sarakstu
function saveWishlist() {
    localStorage.setItem('angava_wishlist', JSON.stringify(wishlist));
}

// Atjaunot groza attēlojumu headerā
function updateCartDisplay() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Atjaunot skaitītāju
    const countElement = document.querySelector('.cart-item-count');
    if (countElement) {
        countElement.textContent = cartCount;
    }
    
    // Atjaunot summu
    const totalElement = document.querySelector('.item-text');
    if (totalElement) {
        totalElement.innerHTML = `€${cartTotal.toFixed(2)} <span class="cart-item-count">${cartCount}</span>`;
    }
    
    // Atjaunot mini grozu
    updateMiniCart();
}

// Atjaunot vēlmju saraksta attēlojumu
function updateWishlistDisplay() {
    const wishlistCount = wishlist.length;
    const countElement = document.querySelector('.wishlist-item-count');
    if (countElement) {
        countElement.textContent = wishlistCount;
    }
}

// Atjaunot mini grozu
function updateMiniCart() {
    const minicartList = document.querySelector('.minicart-product-list');
    const minicartTotal = document.querySelector('.minicart-total span');
    
    if (minicartList) {
        if (cart.length === 0) {
            minicartList.innerHTML = '<li style="text-align: center; padding: 20px;">Grozs ir tukšs</li>';
        } else {
            minicartList.innerHTML = cart.slice(0, 3).map(item => `
                <li>
                    <a href="#" class="minicart-product-image">
                        <img src="${item.image || 'images/product/small-size/1.jpg'}" alt="${item.name}">
                    </a>
                    <div class="minicart-product-details">
                        <h6><a href="#">${item.name}</a></h6>
                        <span>€${item.price.toFixed(2)} x ${item.quantity}</span>
                    </div>
                    <button class="close" onclick="removeFromCart(${item.id})" title="Noņemt">
                        <i class="fa fa-close"></i>
                    </button>
                </li>
            `).join('');
        }
    }
    
    if (minicartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        minicartTotal.textContent = `€${total.toFixed(2)}`;
    }
}

// Attēlot groza modālo logu
function renderCartModal() {
    let modal = document.getElementById('cartModal');
    if (!modal) {
        createCartModal();
        modal = document.getElementById('cartModal');
    }
    
    const cartItems = document.getElementById('cartModalItems');
    const cartTotal = document.getElementById('cartModalTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <i class="fa fa-shopping-cart" style="font-size: 48px; color: #ddd; margin-bottom: 15px;"></i>
                <h3>Jūsu grozs ir tukšs</h3>
                <p>Pievienojiet produktus, lai sāktu iepirkšanos!</p>
            </div>
        `;
        cartTotal.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-modal-item">
                <img src="${item.image || 'images/product/small-size/1.jpg'}" alt="${item.name}" class="cart-modal-image">
                <div class="cart-modal-info">
                    <h6>${item.name}</h6>
                    <p>€${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">×</button>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.innerHTML = `
            <div style="text-align: right; padding: 20px; border-top: 1px solid #eee;">
                <h4>Kopā: €${total.toFixed(2)}</h4>
                <button onclick="checkout()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px; cursor: pointer;">
                    Pasūtīt
                </button>
            </div>
        `;
        cartTotal.style.display = 'block';
    }
}

// Izveidot groza modālo logu
function createCartModal() {
    const modalHTML = `
        <div id="cartModal" class="modal fade modal-wrapper" style="display: none;">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h4 class="modal-title">Iepirkumu grozs</h4>
                        <button type="button" class="close" onclick="closeCartModal()">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body" id="cartModalItems">
                        <!-- Items will be loaded here -->
                    </div>
                    <div id="cartModalTotal">
                        <!-- Total will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Atvērt groza modālo logu
function openCartModal() {
    renderCartModal();
    document.getElementById('cartModal').style.display = 'block';
}

// Aizvērt groza modālo logu
function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

// Pirkšanas process
function checkout() {
    if (cart.length === 0) {
        showNotification('Jūsu grozs ir tukšs!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`Pasūtījums veiksmīgi iesniegts! Kopā: €${total.toFixed(2)}`);
    
    // Notīrīt grozu
    cart = [];
    saveCart();
    updateCartDisplay();
    closeCartModal();
}

// Paziņojumu sistēma
function showNotification(message, type = 'success') {
    // Noņemt esošos paziņojumus
    const existing = document.querySelector('.custom-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : '#28a745'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Palīgfunkci
function getProductImage(productId) {
    const product = products.find(p => p.id === productId);
    return product ? product.image : 'images/product/small-size/1.jpg';
}

function updateWishlistButton(productId, isInWishlist) {
    // Atjaunot visas wishlist pogas šim produktam
    const buttons = document.querySelectorAll(`[onclick*="addToWishlist(${productId}"], [onclick*="removeFromWishlist(${productId})"]`);
    buttons.forEach(button => {
        if (isInWishlist) {
            button.innerHTML = '<i class="fa fa-heart"></i>';
            button.setAttribute('onclick', `removeFromWishlist(${productId})`);
            button.style.background = '#e74c3c';
        } else {
            button.innerHTML = '<i class="fa fa-heart-o"></i>';
            button.setAttribute('onclick', `addToWishlist(${productId}, '${getProductName(productId)}', ${getProductPrice(productId)})`);
            button.style.background = '';
        }
    });
}

function getProductName(productId) {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Nezināms produkts';
}

function getProductPrice(productId) {
    const product = products.find(p => p.id === productId);
    return product ? product.price : 0;
}

// Pievienot event listeners
function attachEventListeners() {
    // Pievienot click event mini grozam
    const minicartTrigger = document.querySelector('.hm-minicart-trigger');
    if (minicartTrigger) {
        minicartTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    }
    
    // Pievienot click event wishlist linkam
    const wishlistLink = document.querySelector('.hm-wishlist a');
    if (wishlistLink) {
        wishlistLink.addEventListener('click', function(e) {
            e.preventDefault();
            openWishlistModal();
        });
    }
}

// ===============================
// CSS stili (pievienot head sadaļā)
// ===============================

const additionalCSS = `
<style>
.cart-modal-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
    gap: 15px;
}

.cart-modal-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 5px;
}

.cart-modal-info {
    flex: 1;
}

.cart-modal-info h6 {
    margin: 0 0 5px 0;
    font-size: 14px;
}

.cart-modal-info p {
    margin: 0;
    color: #667eea;
    font-weight: bold;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
}

.quantity-controls button {
    width: 25px;
    height: 25px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    font-size: 14px;
}

.quantity-controls button:hover {
    background: #f8f9fa;
}

.quantity-controls span {
    min-width: 30px;
    text-align: center;
    font-weight: bold;
}

.remove-btn {
    background: #dc3545;
    color: white;
    border: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-btn:hover {
    background: #c82333;
}

.modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal-dialog {
    position: relative;
    margin: 5% auto;
    max-width: 600px;
}

.modal-content {
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.modal-header {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header .close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
}

.modal-body {
    max-height: 400px;
    overflow-y: auto;
}
</style>
`;

// ===============================
// HTML izmaiņas (instructions)
// ===============================

/* 
INTEGRĀCIJAS INSTRUKCIJAS:

1. Pievienojiet CSS stilus head sadaļā (additionalCSS mainīgais)

2. Pievienojiet šo JavaScript failu pirms </body> taga:
   <script src="cart-wishlist.js"></script>

3. Mainiet esošās "Add to cart" pogas:
   No: <a href="#">Add to cart</a>
   Uz: <a href="#" onclick="addToCart(1, 'Accusantium dolorem1', 46.80); return false;">pievienot grozam</a>

4. Mainiet wishlist pogas:
   No: <a href="wishlist.html"><i class="fa fa-heart-o"></i></a>
   Uz: <a href="#" onclick="addToWishlist(1, 'Accusantium dolorem1', 46.80); return false;"><i class="fa fa-heart-o"></i></a>

5. Pievienojiet checkout pogām onclick:
   <a href="#" onclick="openCartModal(); return false;" class="li-button li-button-fullwidth">
       <span>Skatīt grozu</span>
   </a>

6. Katram produktam pievienojiet unikālu ID, nosaukumu un cenu onclick funkcijās

PRODUKTU ID un DATI:
- Accusantium dolorem1: ID=1, cena=46.80
- Mug Today is a good day: ID=2, cena=71.80  
- Chamcham Galaxy S9: ID=3, cena=1209.00
- Work Desk Surface Studio: ID=4, cena=824.00
- Phantom 4 Pro+ Obsidian: ID=5, cena=1849.00
*/