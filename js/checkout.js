// Checkout.js - Atsevišķa JavaScript datne checkout.html lapai

// Cart data (normally loaded from localStorage or API)
let cartData = JSON.parse(localStorage.getItem('cartData')) || [];
let appliedCoupon = null;
let shippingCost = 0;

// Parcel machine data
const parcelMachines = {
    dpd: [
        { value: 'dpd-riga-1', text: 'DPD - Rīga, Brīvības iela 100' },
        { value: 'dpd-riga-2', text: 'DPD - Rīga, Krasta iela 76' },
        { value: 'dpd-jurmala', text: 'DPD - Jūrmala, Jomas iela 42' }
    ],
    venipak: [
        { value: 'venipak-riga-1', text: 'Venipak - Rīga, Elizabetes iela 51' },
        { value: 'venipak-riga-2', text: 'Venipak - Rīga, Matīsa iela 76' }
    ],
    omniva: [
        { value: 'omniva-riga-1', text: 'Omniva - Rīga, Stabu iela 18B' },
        { value: 'omniva-riga-2', text: 'Omniva - Rīga, Dzirnavu iela 67' },
        { value: 'omniva-jurmala', text: 'Omniva - Jūrmala, Jomas iela 90' }
    ],
    'latvijas-pasts': [
        { value: 'lp-riga-1', text: 'Latvijas Pasts - Rīga, Stacijas laukums 1' },
        { value: 'lp-riga-2', text: 'Latvijas Pasts - Rīga, Brīvības gatve 214' }
    ]
};

// Initialize checkout when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout.js loaded successfully');
    
    loadCartData();
    setupEventListeners();
    calculateTotals();
});

// Load cart data
function loadCartData() {
    if (cartData.length === 0) {
        // Sample cart data if none exists
        cartData = [
            { id: 1, name: 'Produkts 1', price: 25.00, quantity: 1 },
            { id: 2, name: 'Produkts 2', price: 35.00, quantity: 2 }
        ];
    }
    
    displayCartProducts();
    updateMiniCart();
}

// Display products in checkout
function displayCartProducts() {
    const productsList = document.getElementById('checkout-products');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    cartData.forEach(product => {
        const row = document.createElement('tr');
        row.className = 'cart_item';
        row.innerHTML = `
            <td class="cart-product-name">
                ${product.name}
                <strong class="product-quantity"> × ${product.quantity}</strong>
            </td>
            <td class="cart-product-total">
                <span class="amount">€${(product.price * product.quantity).toFixed(2)}</span>
            </td>
        `;
        productsList.appendChild(row);
    });
}

// Update mini cart
function updateMiniCart() {
    const totalItems = cartData.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const miniCartSubtotal = document.getElementById('mini-cart-subtotal');
    
    if (cartCount) cartCount.textContent = totalItems;
    if (cartTotal) cartTotal.innerHTML = `€${totalPrice.toFixed(2)} <span class="cart-item-count">${totalItems}</span>`;
    if (miniCartSubtotal) miniCartSubtotal.textContent = `€${totalPrice.toFixed(2)}`;
    
    // Update mini cart products
    const miniCartProducts = document.getElementById('mini-cart-products');
    if (miniCartProducts) {
        miniCartProducts.innerHTML = '';
        
        cartData.forEach(product => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="single-product.html" class="minicart-product-image">
                    <img src="images/product/small-size/5.jpg" alt="cart products">
                </a>
                <div class="minicart-product-details">
                    <h6><a href="single-product.html">${product.name}</a></h6>
                    <span>€${product.price.toFixed(2)} x ${product.quantity}</span>
                </div>
                <button class="close" title="Remove">
                    <i class="fa fa-close"></i>
                </button>
            `;
            miniCartProducts.appendChild(li);
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form toggle
    const showLogin = document.getElementById('showlogin');
    if (showLogin) {
        showLogin.addEventListener('click', function() {
            const loginDiv = document.getElementById('checkout-login');
            if (loginDiv) {
                loginDiv.style.display = loginDiv.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    // Coupon form toggle
    const showCoupon = document.getElementById('showcoupon');
    if (showCoupon) {
        showCoupon.addEventListener('click', function() {
            const couponDiv = document.getElementById('checkout_coupon');
            if (couponDiv) {
                couponDiv.style.display = couponDiv.style.display === 'none' ? 'block' : 'none';
            }
        });
    }
    
    // Create account checkbox
    const cboxCheckbox = document.getElementById('cbox');
    if (cboxCheckbox) {
        cboxCheckbox.addEventListener('change', function() {
            const accountInfo = document.getElementById('cbox-info');
            if (accountInfo) {
                accountInfo.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
    
    // Customer type change
    const customerTypeRadios = document.querySelectorAll('input[name="customer-type"]');
    customerTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleCustomerFields(this.value);
        });
    });
    
    // Delivery method change
    const deliveryMethodRadios = document.querySelectorAll('input[name="delivery-method"]');
    deliveryMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleDeliveryFields(this.value);
            updateShippingCost(this.value);
            togglePaymentOptions(this.value);
        });
    });
    
    // Parcel provider change
    const parcelProvider = document.getElementById('parcel-provider');
    if (parcelProvider) {
        parcelProvider.addEventListener('change', function() {
            updateParcelMachines(this.value);
        });
    }
    
    // Payment method change
    const paymentMethodRadios = document.querySelectorAll('input[name="payment-method"]');
    paymentMethodRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            showPaymentInfo(this.value);
        });
    });
    
    // Coupon form submit
    const couponForm = document.getElementById('coupon-form');
    if (couponForm) {
        couponForm.addEventListener('submit', function(e) {
            e.preventDefault();
            applyCoupon();
        });
    }
    
    // Place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            if (validateCheckoutForm()) {
                processOrder();
            }
        });
    }
}

// Toggle customer fields
function toggleCustomerFields(customerType) {
    const privateFields = document.getElementById('private-customer-fields');
    const businessFields = document.getElementById('business-customer-fields');
    
    if (privateFields && businessFields) {
        if (customerType === 'private') {
            privateFields.style.display = 'block';
            businessFields.style.display = 'none';
        } else {
            privateFields.style.display = 'none';
            businessFields.style.display = 'block';
        }
    }
}

// Toggle delivery fields
function toggleDeliveryFields(deliveryMethod) {
    // Hide all fields first
    const fieldsToToggle = [
        'address-fields',
        'parcel-selection', 
        'store-selection',
        'partner-selection'
    ];
    
    fieldsToToggle.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // Show relevant fields
    let targetFieldId = '';
    switch(deliveryMethod) {
        case 'courier':
            targetFieldId = 'address-fields';
            break;
        case 'parcel':
            targetFieldId = 'parcel-selection';
            break;
        case 'store':
            targetFieldId = 'store-selection';
            break;
        case 'partner':
            targetFieldId = 'partner-selection';
            break;
    }
    
    const targetField = document.getElementById(targetFieldId);
    if (targetField) {
        targetField.style.display = 'block';
    }
}

// Update shipping cost
function updateShippingCost(deliveryMethod) {
    switch(deliveryMethod) {
        case 'courier':
            shippingCost = 5.00;
            break;
        case 'parcel':
            shippingCost = 3.00;
            break;
        case 'store':
        case 'partner':
            shippingCost = 0.00;
            break;
        default:
            shippingCost = 0.00;
    }
    
    const shippingRow = document.getElementById('shipping-row');
    const shippingCostElement = document.getElementById('shipping-cost');
    
    if (shippingRow && shippingCostElement) {
        if (shippingCost > 0) {
            shippingRow.style.display = 'table-row';
            shippingCostElement.textContent = `€${shippingCost.toFixed(2)}`;
        } else {
            shippingRow.style.display = 'none';
        }
    }
    
    calculateTotals();
}

// Toggle payment options
function togglePaymentOptions(deliveryMethod) {
    const payInStoreOption = document.getElementById('pay-in-store-option');
    if (payInStoreOption) {
        if (deliveryMethod === 'store' || deliveryMethod === 'partner') {
            payInStoreOption.style.display = 'block';
        } else {
            payInStoreOption.style.display = 'none';
            // Uncheck pay in store if it was selected
            const payInStoreRadio = document.getElementById('pay-in-store');
            if (payInStoreRadio && payInStoreRadio.checked) {
                payInStoreRadio.checked = false;
                hideAllPaymentInfo();
            }
        }
    }
}

// Update parcel machines list
function updateParcelMachines(provider) {
    const machineSelect = document.getElementById('parcel-machine');
    if (!machineSelect) return;
    
    machineSelect.innerHTML = '<option value="">Izvēlieties pakomātu</option>';
    
    if (provider && parcelMachines[provider]) {
        parcelMachines[provider].forEach(machine => {
            const option = document.createElement('option');
            option.value = machine.value;
            option.textContent = machine.text;
            machineSelect.appendChild(option);
        });
    }
}

// Show payment info
function showPaymentInfo(paymentMethod) {
    hideAllPaymentInfo();
    
    const infoElementId = paymentMethod.replace('-', '-') + '-info';
    const infoElement = document.getElementById(infoElementId);
    
    if (infoElement) {
        infoElement.style.display = 'block';
    }
}

// Hide all payment info
function hideAllPaymentInfo() {
    const paymentInfoElements = document.querySelectorAll('.payment-info');
    paymentInfoElements.forEach(info => {
        info.style.display = 'none';
    });
}

// Select bank function
function selectBank(bankValue) {
    // Remove previous selections
    const bankContainers = document.querySelectorAll('.bank-logo-container');
    bankContainers.forEach(container => {
        container.style.border = '2px solid #ddd';
        container.style.transform = 'scale(1)';
        container.style.boxShadow = 'none';
    });
    
    // Select the clicked bank
    const selectedBank = document.getElementById('bank-' + bankValue);
    if (selectedBank) {
        const bankContainer = selectedBank.nextElementSibling.querySelector('.bank-logo-container');
        
        selectedBank.checked = true;
        if (bankContainer) {
            bankContainer.style.border = '2px solid #007bff';
            bankContainer.style.transform = 'scale(1.05)';
            bankContainer.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
        }
    }
}

// Apply coupon
function applyCoupon() {
    const couponCodeInput = document.getElementById('coupon-code');
    const messageDiv = document.getElementById('coupon-message');
    
    if (!couponCodeInput || !messageDiv) return;
    
    const couponCode = couponCodeInput.value.trim();
    
    if (!couponCode) {
        messageDiv.innerHTML = '<div class="alert alert-danger">Lūdzu ievadiet kupona kodu.</div>';
        return;
    }
    
    // Sample coupon validation
    const validCoupons = {
        'SAVE10': { type: 'percentage', value: 10, description: '10% atlaide' },
        'WELCOME5': { type: 'fixed', value: 5.00, description: '€5 atlaide' },
        'FREESHIP': { type: 'shipping', value: 0, description: 'Bezmaksas piegāde' }
    };
    
    if (validCoupons[couponCode.toUpperCase()]) {
        appliedCoupon = validCoupons[couponCode.toUpperCase()];
        appliedCoupon.code = couponCode.toUpperCase();
        messageDiv.innerHTML = `<div class="alert alert-success">Kupons "${couponCode}" veiksmīgi pielietots! ${appliedCoupon.description}</div>`;
        calculateTotals();
    } else {
        messageDiv.innerHTML = '<div class="alert alert-danger">Nederīgs kupona kods.</div>';
    }
}

// Calculate totals
function calculateTotals() {
    const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let finalShipping = shippingCost;
    
    // Apply coupon discount
    if (appliedCoupon) {
        switch(appliedCoupon.type) {
            case 'percentage':
                discount = subtotal * (appliedCoupon.value / 100);
                break;
            case 'fixed':
                discount = Math.min(appliedCoupon.value, subtotal);
                break;
            case 'shipping':
                finalShipping = 0;
                break;
        }
    }
    
    const total = subtotal - discount + finalShipping;
    
    // Update display
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `€${subtotal.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `€${total.toFixed(2)}`;
    
    const discountRow = document.getElementById('discount-row');
    const discountAmount = document.getElementById('discount-amount');
    
    if (discountRow && discountAmount) {
        if (discount > 0) {
            discountRow.style.display = 'table-row';
            discountAmount.textContent = `-€${discount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    const shippingCostElement = document.getElementById('shipping-cost');
    if (appliedCoupon && appliedCoupon.type === 'shipping' && shippingCostElement) {
        shippingCostElement.textContent = '€0.00 (Bezmaksas)';
    }
}

// Validate checkout form
function validateCheckoutForm() {
    let isValid = true;
    const errors = [];
    
    // Get customer type
    const customerTypeRadio = document.querySelector('input[name="customer-type"]:checked');
    if (!customerTypeRadio) {
        errors.push('Lūdzu izvēlieties pircēja veidu');
        return false;
    }
    
    const customerType = customerTypeRadio.value;
    
    // Validate based on customer type
    if (customerType === 'private') {
        // Private customer validation
        const requiredFields = [
            { id: 'first-name', name: 'Vārds' },
            { id: 'last-name', name: 'Uzvārds' },
            { id: 'email', name: 'E-pasta adrese' },
            { id: 'phone', name: 'Tālrunis' }
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element && !element.value.trim()) {
                errors.push(`${field.name} ir obligāts lauks`);
                element.classList.add('error');
                isValid = false;
            } else if (element) {
                element.classList.remove('error');
            }
        });
        
    } else {
        // Business customer validation
        const requiredFields = [
            { id: 'company-name', name: 'Uzņēmuma nosaukums' },
            { id: 'registration-number', name: 'Reģistrācijas numurs' },
            { id: 'contact-person', name: 'Kontaktpersona' },
            { id: 'legal-address', name: 'Juridiskā adrese' },
            { id: 'email', name: 'E-pasta adrese' },
            { id: 'phone', name: 'Tālrunis' }
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element && !element.value.trim()) {
                errors.push(`${field.name} ir obligāts lauks`);
                element.classList.add('error');
                isValid = false;
            } else if (element) {
                element.classList.remove('error');
            }
        });
    }
    
    // Validate delivery method
    const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked');
    if (!deliveryMethod) {
        errors.push('Lūdzu izvēlieties piegādes veidu');
        isValid = false;
    }
    
    // Validate payment method
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
    if (!paymentMethod) {
        errors.push('Lūdzu izvēlieties maksāšanas veidu');
        isValid = false;
    } else if (paymentMethod.value === 'online-banking') {
        const bankSelection = document.querySelector('input[name="bank-selection"]:checked');
        if (!bankSelection) {
            errors.push('Lūdzu izvēlieties banku');
            isValid = false;
        }
    }
    
    // Validate email format
    const emailElement = document.getElementById('email');
    if (emailElement) {
        const email = emailElement.value;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Lūdzu ievadiet derīgu e-pasta adresi');
            isValid = false;
        }
    }
    
    if (!isValid) {
        alert('Lūdzu izlabojiet šīs kļūdas:\n\n' + errors.join('\n'));
    }
    
    return isValid;
}

// Process order
function processOrder() {
    const customerTypeRadio = document.querySelector('input[name="customer-type"]:checked');
    const deliveryMethodRadio = document.querySelector('input[name="delivery-method"]:checked');
    const paymentMethodRadio = document.querySelector('input[name="payment-method"]:checked');
    
    // Collect all form data
    const orderData = {
        customerType: customerTypeRadio ? customerTypeRadio.value : '',
        customer: {},
        delivery: {
            method: deliveryMethodRadio ? deliveryMethodRadio.value : ''
        },
        payment: {
            method: paymentMethodRadio ? paymentMethodRadio.value : ''
        },
        products: cartData,
        totals: {
            subtotal: cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            shipping: shippingCost,
            discount: appliedCoupon ? calculateDiscount() : 0,
            total: parseFloat(document.getElementById('total').textContent.replace('€', ''))
        },
        coupon: appliedCoupon,
        notes: document.getElementById('checkout-mess') ? document.getElementById('checkout-mess').value : '',
        timestamp: new Date().toISOString()
    };
    
    // Collect customer data based on type
    if (orderData.customerType === 'private') {
        const firstNameEl = document.getElementById('first-name');
        const lastNameEl = document.getElementById('last-name');
        const emailEl = document.getElementById('email');
        const phoneEl = document.getElementById('phone');
        
        orderData.customer = {
            firstName: firstNameEl ? firstNameEl.value : '',
            lastName: lastNameEl ? lastNameEl.value : '',
            email: emailEl ? emailEl.value : '',
            phone: phoneEl ? phoneEl.value : ''
        };
    } else {
        const companyEl = document.getElementById('company-name');
        const regNumEl = document.getElementById('registration-number');
        const contactEl = document.getElementById('contact-person');
        const legalAddressEl = document.getElementById('legal-address');
        const emailEl = document.getElementById('email');
        const phoneEl = document.getElementById('phone');
        
        orderData.customer = {
            companyName: companyEl ? companyEl.value : '',
            registrationNumber: regNumEl ? regNumEl.value : '',
            contactPerson: contactEl ? contactEl.value : '',
            legalAddress: legalAddressEl ? legalAddressEl.value : '',
            email: emailEl ? emailEl.value : '',
            phone: phoneEl ? phoneEl.value : ''
        };
    }
    
    // Simulate order processing
    const orderButton = document.getElementById('place-order-btn');
    if (orderButton) {
        orderButton.value = 'Apstrādā...';
        orderButton.disabled = true;
    }
    
    setTimeout(() => {
        // Generate order ID
        const orderId = 'LV' + Date.now().toString().substr(-6);
        
        // Store order in localStorage (in real app, send to server)
        localStorage.setItem('lastOrder', JSON.stringify({...orderData, orderId}));
        
        // Clear cart
        localStorage.removeItem('cartData');
        
        // Show success message and redirect
        const customerEmail = orderData.customer.email;
        alert(`Paldies! Jūsu pasūtījums #${orderId} ir veiksmīgi apstiprināts.\n\nJūs saņemsiet apstiprinājuma e-pastu uz ${customerEmail}`);
        
        // In a real app, redirect to order confirmation page
        // window.location.href = 'order-confirmation.html?orderId=' + orderId;
        
        if (orderButton) {
            orderButton.value = 'Apstiprināt pasūtījumu';
            orderButton.disabled = false;
        }
        
    }, 2000);
}

// Calculate discount amount
function calculateDiscount() {
    if (!appliedCoupon) return 0;
    
    const subtotal = cartData.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    switch(appliedCoupon.type) {
        case 'percentage':
            return subtotal * (appliedCoupon.value / 100);
        case 'fixed':
            return Math.min(appliedCoupon.value, subtotal);
        case 'shipping':
            return shippingCost;
        default:
            return 0;
    }
}

// Make functions globally available
window.selectBank = selectBank;