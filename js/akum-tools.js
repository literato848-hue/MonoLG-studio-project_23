// Globāli mainīgie
let productsData = null;
let currentProduct = null;

// Ielādē produktu datus kad lapa ir gatava
document.addEventListener('DOMContentLoaded', function() {
    loadProductData();
});

// Ielādē JSON datus
async function loadProductData() {
    try {
        const response = await fetch('akum-tools.json');
        productsData = await response.json();
        populateProductSelector();
        
        // Mēģina ielādēt produktu no URL parametriem
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (productId) {
            document.getElementById('productSelector').value = productId;
            loadProduct();
        }
    } catch (error) {
        console.error('Kļūda ielādējot produktu datus:', error);
        alert('Nevarēja ielādēt produktu datus. Pārbaudiet vai akum-tools.json fails eksistē.');
    }
}

// Aizpilda produktu izvēlētāju
function populateProductSelector() {
    const selector = document.getElementById('productSelector');
    selector.innerHTML = '<option value="">-- Izvēlieties produktu --</option>';
    
    productsData.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.id} - ${product.name}`;
        selector.appendChild(option);
    });
}

// Ielādē izvēlēto produktu
function loadProduct() {
    const productId = document.getElementById('productSelector').value;
    
    if (!productId) {
        hideProductContent();
        return;
    }
    
    // Atrod produktu pēc ID
    currentProduct = productsData.products.find(p => p.id === productId);
    
    if (!currentProduct) {
        alert('Produkts nav atrasts!');
        return;
    }
    
    // Rāda loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('product-content').style.display = 'none';
    document.getElementById('product-tabs').style.display = 'none';
    
    // Simulē loading laiku
    setTimeout(() => {
        displayProduct(currentProduct);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('product-content').style.display = 'block';
        document.getElementById('product-tabs').style.display = 'block';
        
        // Atjauno URL
        const newUrl = `${window.location.pathname}?id=${productId}`;
        window.history.pushState({}, '', newUrl);
    }, 500);
}

// Paslēpj produkta saturu
function hideProductContent() {
    document.getElementById('product-content').style.display = 'none';
    document.getElementById('product-tabs').style.display = 'none';
    document.getElementById('loading').style.display = 'none';
}

// Atveido produkta informāciju
function displayProduct(product) {
    // Page title un meta
    document.getElementById('page-title').textContent = `${product.name} - SIA ANGAVA`;
    document.getElementById('page-description').content = product.description;
    
    // Breadcrumb
    document.getElementById('breadcrumb-text').textContent = product.breadcrumb;
    
    // Produkta pamata info
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-reference').textContent = `Reference: ${product.reference}`;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('full-description').textContent = product.fullDescription;
    
    // Cena
    displayPrice(product);
    
    // Rating
    displayRating(product.rating);
    
    // Noliktavas statuss
    displayStockStatus(product.inStock);
    
    // Attēli
    displayImages(product.images);
    
    // Specifikācijas
    displaySpecs(product.specs);
    
    // Komplektācija
    displayIncluded(product.included);
    
    // Garantija
    displayWarranty(product.warranty, product.certificates);
    
    // Piezīme
    displayNote(product.note);
    
    // Pogu dati
    setupButtons(product);
}

// Atveido cenu
function displayPrice(product) {
    let priceHTML = `<span class="new-price new-price-2">${product.price}</span>`;
    
    if (product.oldPrice) {
        priceHTML += `<span class="old-price">${product.oldPrice}</span>`;
    }
    
    if (product.discount) {
        priceHTML += `<span class="discount-percentage">${product.discount}</span>`;
    }
    
    document.getElementById('product-price').innerHTML = priceHTML;
}

// Atveido rating
function displayRating(rating) {
    let ratingHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            ratingHTML += '<li><i class="fa fa-star-o"></i></li>';
        } else {
            ratingHTML += '<li class="no-star"><i class="fa fa-star-o"></i></li>';
        }
    }
    ratingHTML += '<li class="review-item"><a href="#">Apskatīt</a></li>';
    ratingHTML += '<li class="review-item"><a href="#">Rakstīt komentāru</a></li>';
    
    document.getElementById('product-rating').innerHTML = ratingHTML;
    document.getElementById('review-rating').innerHTML = ratingHTML;
}

// Atveido noliktavas statusu
function displayStockStatus(inStock) {
    const statusElement = document.getElementById('stock-status');
    
    if (inStock) {
        statusElement.innerHTML = '<div class="stock-available"><strong>✓ Noliktavā pieejams</strong></div>';
    } else {
        statusElement.innerHTML = '<div class="stock-unavailable"><strong>✗ Nav noliktavā</strong></div>';
    }
}

// Atveido attēlus
function displayImages(images) {
    // Galvenie attēli
    let mainImagesHTML = '';
    images.main.forEach(img => {
        mainImagesHTML += `
            <div class="lg-image">
                <a class="popup-img venobox vbox-item" href="images/product/large-size/${img}" data-gall="myGallery">
                    <img src="images/product/large-size/${img}" alt="product image">
                </a>
            </div>`;
    });
    document.getElementById('main-images').innerHTML = mainImagesHTML;

    // Thumbnail attēli
    let thumbsHTML = '';
    images.thumbnails.forEach(img => {
        thumbsHTML += `
            <div class="sm-image">
                <img src="images/product/small-size/${img}" alt="product image thumb">
            </div>`;
    });
    document.getElementById('thumbnail-images').innerHTML = thumbsHTML;
}

// Atveido specifikācijas
function displaySpecs(specs) {
    // Galvenā tabula
    let tableHTML = '';
    Object.entries(specs).forEach(([key, value]) => {
        // Izceļ svarīgākos parametrus
        const isHighlight = ['Griešanas garums', 'Griešanas ātrums', 'Maks. spiediens', 'Griezes moments'].includes(key);
        const valueHTML = isHighlight ? `<span class="spec-highlight">${value}</span>` : value;
        
        tableHTML += `
            <tr>
                <td class="spec-label">${key}:</td>
                <td class="spec-value">${valueHTML}</td>
            </tr>`;
    });
    document.getElementById('specs-table').innerHTML = tableHTML;
    
    // Specifikāciju grupas
    displaySpecGroups(specs);
}

// Atveido specifikāciju grupas
function displaySpecGroups(specs) {
    // Dalām specifikācijas grupās
    const batterySpecs = {};
    const performanceSpecs = {};
    
    Object.entries(specs).forEach(([key, value]) => {
        if (key.includes('Akumulatora') || key.includes('akumulatora')) {
            batterySpecs[key] = value;
        } else if (['Griešanas garums', 'Griešanas ātrums', 'Urbšanas ātrums', 'Griezes moments', 'Maks. spiediens', 'Gaisa plūsma'].includes(key)) {
            performanceSpecs[key] = value;
        }
    });

    let groupsHTML = '';
    
    if (Object.keys(batterySpecs).length > 0 || Object.keys(performanceSpecs).length > 0) {
        groupsHTML += '<div class="two-column-specs">';
        
        // Akumulatora grupa
        if (Object.keys(batterySpecs).length > 0) {
            groupsHTML += `
                <div class="spec-group">
                    <h4>🔋 Akumulatora raksturojumi</h4>
                    <ul class="spec-list">`;
            
            Object.entries(batterySpecs).forEach(([key, value]) => {
                const shortKey = key.replace('Akumulatora ', '');
                groupsHTML += `
                        <li>
                            <span class="spec-name">${shortKey}:</span>
                            <span class="spec-value-inline">${value}</span>
                        </li>`;
            });
            
            groupsHTML += `
                    </ul>
                </div>`;
        }

        // Darba raksturojumi
        if (Object.keys(performanceSpecs).length > 0) {
            groupsHTML += `
                <div class="spec-group">
                    <h4>⚡ Darba raksturojumi</h4>
                    <ul class="spec-list">`;
            
            Object.entries(performanceSpecs).forEach(([key, value]) => {
                groupsHTML += `
                        <li>
                            <span class="spec-name">${key}:</span>
                            <span class="spec-value-inline">${value}</span>
                        </li>`;
            });
            
            groupsHTML += `
                    </ul>
                </div>`;
        }
        
        groupsHTML += '</div>';
    }
    
    document.getElementById('specs-groups').innerHTML = groupsHTML;
}

// Atveido komplektāciju
function displayIncluded(included) {
    if (!included) {
        document.getElementById('included-items').innerHTML = '';
        return;
    }
    
    let includedHTML = `
        <div class="included-items">
            <h3 class="included-title">Komplektā iekļauts</h3>
            <div class="items-grid">`;

    Object.entries(included).forEach(([category, items]) => {
        includedHTML += `
                <div class="item-category">
                    <div class="category-title">${category}</div>
                    <div class="item-list">${items}</div>
                </div>`;
    });

    includedHTML += `
            </div>
        </div>`;

    document.getElementById('included-items').innerHTML = includedHTML;
}

// Atveido garantijas info
function displayWarranty(warranty, certificates) {
    let warrantyHTML = `
        <div class="warranty-info">
            <div class="warranty-title">Kvalitātes garantija</div>
            <p>Produkts ražots atbilstoši Eiropas standartiem, garantija: ${warranty}</p>
            <div class="standards-badges">`;

    if (certificates) {
        certificates.forEach(cert => {
            const certClass = cert.includes('CE') ? 'ce' : cert.includes('kvalitāte') ? 'quality' : '';
            warrantyHTML += `<span class="badge ${certClass}">${cert}</span>`;
        });
    }

    warrantyHTML += `<span class="badge">${warranty} garantija</span>
            </div>
        </div>`;

    document.getElementById('warranty-info').innerHTML = warrantyHTML;
}

// Atveido piezīmi
function displayNote(note) {
    const noteElement = document.getElementById('product-note');
    
    if (note) {
        noteElement.innerHTML = `<div class="product-note"><strong>Piezīme:</strong> ${note}</div>`;
    } else {
        noteElement.innerHTML = '';
    }
}

// Iestata pogu datus
function setupButtons(product) {
    const cleanPrice = product.price.replace(/[€$,]/g, '').trim();
    const firstImage = product.images.main[0];
    
    // Pasūtīšanas poga
    const orderBtn = document.getElementById('order-btn');
    orderBtn.setAttribute('data-product-id', product.id);
    orderBtn.setAttribute('data-product-name', product.name);
    orderBtn.setAttribute('data-product-price', cleanPrice);
    orderBtn.setAttribute('data-product-image', `images/product/large-size/${firstImage}`);
    
    // Wishlist poga
    const wishlistBtn = document.getElementById('wishlist-btn');
    wishlistBtn.setAttribute('data-product-id', product.id);
    wishlistBtn.setAttribute('data-product-name', product.name);
    wishlistBtn.setAttribute('data-product-price', cleanPrice);
    wishlistBtn.setAttribute('data-product-image', `images/product/large-size/${firstImage}`);
}

// Palīgfunkcija URL ģenerēšanai konkrētam produktam
function getProductURL(productId) {
    return `akum-tools.html?id=${productId}`;
}

// Palīgfunkcija produkta meklēšanai pēc ID
function findProductById(id) {
    return productsData ? productsData.products.find(p => p.id === id) : null;
}

// Debug funkcija - parāda visu produktu sarakstu konsolē
function debugProducts() {
    console.log('Pieejamie produkti:');
    if (productsData) {
        productsData.products.forEach(p => {
            console.log(`${p.id}: ${p.name}`);
        });
    }
}

// Eksportē funkcijas globālai lietošanai
window.loadProduct = loadProduct;
window.debugProducts = debugProducts;