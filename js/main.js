/*--------------------------------------------------
Template Name: limupa;
Description: limupa - Digital Products Store ECommerce Bootstrap 4 Template;
Template URI:;
Author Name:HasTech;
Author URI:;
Version: 1;
Note: main.js, All Default Scripting Languages For This Theme Included In This File.
-----------------------------------------------------
		CSS INDEX
		================
		01. Li's Meanmenu
		02. Header Dropdown
		03. Li's Sticky Menu Activation
		04. Nice Select
		05. Main Slider Activision
		06. Li's Product Activision
		07. Li's Product Activision
		08. Countdown
		09. Tooltip Active
		10. Scroll Up
		11. Category Menu
		12. Li's Product Activision
		13. FAQ Accordion
		14. Toggle Function Active
		15. Li's Blog Gallery Slider
		16. Counter Js
		17. Price slider
		18. Category menu Activation
		19. Featured Product active
		20. Featured Product 2 active
		21. Modal Menu Active
		22. Cart Plus Minus Button
		23. Single Prduct Carousel Activision
		24. Star Rating Js
		25. Zoom Product Venobox
		26. WOW

-----------------------------------------------------------------------------------*/
(function ($) {
	"use Strict";
/*----------------------------------------*/
/* 	01. Li's Meanmenu
/*----------------------------------------*/
    jQuery('.hb-menu nav').meanmenu({
        meanMenuContainer: '.mobile-menu',
        meanScreenWidth: "991"
    })
 /*----------------------------------------*/
 /*  02. Header Dropdown
 /*----------------------------------------*/
 	// Li's Dropdown Menu
 	$('.ht-setting-trigger, .ht-currency-trigger, .ht-language-trigger, .hm-minicart-trigger, .cw-sub-menu').on('click', function (e) {
 		e.preventDefault();
 		$(this).toggleClass('is-active');
 		$(this).siblings('.ht-setting, .ht-currency, .ht-language, .minicart, .cw-sub-menu li').slideToggle();
 	});
 	$('.ht-setting-trigger.is-active').siblings('.catmenu-body').slideDown();
/*----------------------------------------*/
/* 03. Li's Sticky Menu Activation
/*----------------------------------------*/
	$(window).on('scroll',function() {
		if ($(this).scrollTop() > 300) {
			$('.header-sticky').addClass("sticky");
		} else {
			$('.header-sticky').removeClass("sticky");
		}
	});
/*----------------------------------------*/
/*  04. Nice Select
/*----------------------------------------*/
	$(document).ready(function() {
		$('.nice-select').niceSelect();
	});
/*----------------------------------------*/
/* 05. Main Slider Activision
/*----------------------------------------*/
	$(".slider-active").owlCarousel({
		loop: true,
		margin: 0,
		nav: true,
		autoplay: true,
		items: 1,
		autoplayTimeout: 10000,
		navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
		dots: true,
		autoHeight: true,
		lazyLoad: true
	});
/*----------------------------------------*/
/* 06. Li's Product Activision
/*----------------------------------------*/
	$(".product-active").owlCarousel({
		loop: true,
		nav: true,
		dots: false,
		autoplay: false,
		autoplayTimeout: 5000,
		navText: ["<i class='fa fa-angle-left'></i>", "<i class='fa fa-angle-right'></i>"],
		item: 5,
		responsive: {
			0: {
					items: 1
			},
			480: {
					items: 2
			},
			768: {
					items: 3
			},
			992: {
					items: 4
			},
			1200: {
					items: 5
			}
		}
	});
/*----------------------------------------*/
/* 07. Li's Product Activision
/*----------------------------------------*/
	$(".special-product-active").owlCarousel({
		loop: true,
		nav: false,
		dots: false,
		autoplay: false,
		autoplayTimeout: 5000,
		navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-left"></i>'],
		item: 4,
		responsive: {
			0: {
					items: 1
			},
			480: {
					items: 1
			},
			768: {
					items: 2
			},
			992: {
					items: 3
			},
			1200: {
					items: 4
			}
		}
	});
/*----------------------------------------*/
/* 08. Countdown
/*----------------------------------------*/
   $(".li-countdown")
     .countdown("2019/12/01", function(event) {
       $(this).html(
         event.strftime('<div class="count">%D <span>Days:</span></div> <div class="count">%H <span>Hours:</span></div> <div class="count">%M <span>Mins:</span></div><div class="count"> %S <span>Secs</span></div>')
       );
     });
/*----------------------------------------*/
/* 09. Tooltip Active
/*----------------------------------------*/
	$('.product-action a, .social-link a').tooltip({
		animated: 'fade',
		placement: 'top',
		container: 'body'
	});
/*----------------------------------------*/
/* 10. Scroll Up
/*----------------------------------------*/
	$.scrollUp({
		scrollText: '<i class="fa fa-angle-double-up"></i>',
		easingType: 'linear',
		scrollSpeed: 900
	});
/*----------------------------------------*/
/* 11. Category Menu
/*----------------------------------------*/
	 $('.rx-parent').on('click', function(){
	    $('.rx-child').slideToggle();
	    $(this).toggleClass('rx-change');
	});
	//    category heading
	$('.category-heading').on('click', function(){
	    $('.category-menu-list').slideToggle(300);
	});	
	/*-- Category Menu Toggles --*/
	function categorySubMenuToggle() {
	    var screenSize = $(window).width();
	    if ( screenSize <= 991) {
	        $('#cate-toggle .right-menu > a').prepend('<i class="expand menu-expand"></i>');
	        $('.category-menu .right-menu ul').slideUp();
	//        $('.category-menu .menu-item-has-children i').on('click', function(e){
	//            e.preventDefault();
	//            $(this).toggleClass('expand');
	//            $(this).siblings('ul').css('transition', 'none').slideToggle();
	//        })
	    } else {
	        $('.category-menu .right-menu > a i').remove();
	        $('.category-menu .right-menu ul').slideDown();
	    }
	}
	categorySubMenuToggle();
	$(window).resize(categorySubMenuToggle);

	/*-- Category Sub Menu --*/
	function categoryMenuHide(){
	    var screenSize = $(window).width();
	    if ( screenSize <= 991) {
	        $('.category-menu-list').hide();
	    } else {
	        $('.category-menu-list').show();
	    }
	}
	categoryMenuHide();
	$(window).resize(categoryMenuHide);
	$('.category-menu-hidden').find('.category-menu-list').hide();
	$('.category-menu-list').on('click', 'li a, li a .menu-expand', function(e) {
	    var $a = $(this).hasClass('menu-expand') ? $(this).parent() : $(this);
	    if ($a.parent().hasClass('right-menu')) {
	        if ($a.attr('href') === '#' || $(this).hasClass('menu-expand')) {
	            if ($a.siblings('ul:visible').length > 0) $a.siblings('ul').slideUp();
	            else {
	                $(this).parents('li').siblings('li').find('ul:visible').slideUp();
	                $a.siblings('ul').slideDown();
	            }
	        }
	    }
	    if ($(this).hasClass('menu-expand') || $a.attr('href') === '#') {
	        e.preventDefault();
	        return false;
	    }
	});
/*----------------------------------------*/
/* 12. Li's Product Activision
/*----------------------------------------*/
	$(".li-featured-product-active").owlCarousel({
		loop: true,
		nav: false,
		dots: false,
		margin: 30,
		autoplay: false,
		autoplayTimeout: 5000,
		navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-left"></i>'],
		item: 2,
		responsive: {
			0: {
				items: 1
			},
			480: {
				items: 2
			},
			768: {
				items: 2
			},
			992: {
				items: 2
			},
			1200: {
				items: 2
			}
		 }
	 });
/*----------------------------------------*/
/* 13. FAQ Accordion
/*----------------------------------------*/
	$('.card-header a').on('click', function() {
		 $('.card').removeClass('actives');
		 $(this).parents('.card').addClass('actives');
	});
/*----------------------------------------*/
/* 14. Toggle Function Active
/*----------------------------------------*/ 
	// showlogin toggle
		$('#showlogin').on('click', function() {
				$('#checkout-login').slideToggle(900);
		});
	// showlogin toggle
		$('#showcoupon').on('click', function() {
				$('#checkout_coupon').slideToggle(900);
		});
	// showlogin toggle
		$('#cbox').on('click', function() {
				$('#cbox-info').slideToggle(900);
		});

	// showlogin toggle
		$('#ship-box').on('click', function() {
				$('#ship-box-info').slideToggle(1000);
		});
/*----------------------------------------*/
/* 15. Li's Blog Gallery Slider
/*----------------------------------------*/ 
	var gallery = $('.li-blog-gallery-slider');
	gallery.slick({
		arrows: false,
		autoplay: true,
		autoplaySpeed: 5000,
		pauseOnFocus: false,
		pauseOnHover: false,
		fade: true,
		dots: true,
		infinite: true,
		slidesToShow: 1,
		responsive: [
			{
				breakpoint: 768,
					settings: {
						arrows: false,
				}
			},
		]
	});
/*----------------------------------------*/
/* 16. Counter Js
/*----------------------------------------*/
    $('.counter').counterUp({
        delay: 10,
        time: 1000
    });
/*----------------------------------------*/
/* 17. Price slider
/*----------------------------------------*/
 var sliderrange = $('#slider-range');
 var amountprice = $('#amount');
 $(function() {
     sliderrange.slider({
         range: true,
         min: 0,
         max: 1200,
         values: [300, 800],
         slide: function(event, ui) {
             amountprice.val("$" + ui.values[0] + " - $" + ui.values[1]);
         }
     });
     amountprice.val("$" + sliderrange.slider("values", 0) +
         " - $" + sliderrange.slider("values", 1));
 });
 /*----------------------------------------*/
 /* 18. Category menu Activation
 /*----------------------------------------*/
 $('.category-sub-menu li.has-sub > a').on('click', function () {
     $(this).removeAttr('href');
     var element = $(this).parent('li');
     if (element.hasClass('open')) {
         element.removeClass('open');
         element.find('li').removeClass('open');
         element.find('ul').slideUp();
     } else {
         element.addClass('open');
         element.children('ul').slideDown();
         element.siblings('li').children('ul').slideUp();
         element.siblings('li').removeClass('open');
         element.siblings('li').find('li').removeClass('open');
         element.siblings('li').find('ul').slideUp();
     }
 });
 /*----------------------------------------*/
 /* 19. Featured Product active
 /*----------------------------------------*/
 $('.featured-product-active').owlCarousel({
     loop: true,
     nav: true,
     autoplay: false,
     autoplayTimeout: 5000,
     navText: ['<i class="ion-ios-arrow-back"></i>', '<i class="ion-ios-arrow-forward"></i>'],
     item: 3,
     responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        },
        992: {
            items: 2
        },
        1100: {
            items: 2
        },
        1200: {
            items: 2
        }
    }
 })
/*----------------------------------------*/
/* 20. Featured Product 2 active
/*----------------------------------------*/
 $('.featured-product-active-2').owlCarousel({
     loop: true,
     nav: true,
     autoplay: false,
     autoplayTimeout: 5000,
     navText: ['<i class="ion-ios-arrow-back"></i>', '<i class="ion-ios-arrow-forward"></i>'],
     item: 3,
     responsive: {
        0: {
            items: 1
        },
        768: {
            items: 2
        },
        992: {
            items: 1
        },
        1100: {
            items: 1
        },
        1200: {
            items: 1
        }
    }
 })
 /*----------------------------------------*/
 /* 21. Modal Menu Active
 /*----------------------------------------*/ 
 $('.product-details-images').each(function(){
     var $this = $(this);
     var $thumb = $this.siblings('.product-details-thumbs, .tab-style-left');
     $this.slick({
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 5000,
        dots: false,
        infinite: true,
        centerMode: false,
        centerPadding: 0,
        asNavFor: $thumb,
    });
 });
 $('.product-details-thumbs').each(function(){
     var $this = $(this);
     var $details = $this.siblings('.product-details-images');
     $this.slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 5000,
        dots: false,
        infinite: true,
        focusOnSelect: true,
        centerMode: true,
        centerPadding: 0,
        prevArrow: '<span class="slick-prev"><i class="fa fa-angle-left"></i></span>',
        nextArrow: '<span class="slick-next"><i class="fa fa-angle-right"></i></span>',
        asNavFor: $details,
    });
 });
 $('.tab-style-left, .tab-style-right').each(function(){
     var $this = $(this);
     var $details = $this.siblings('.product-details-images');
     $this.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 5000,
        dots: false,
        infinite: true,
        focusOnSelect: true,
        vertical: true,
        centerPadding: 0,
        prevArrow: '<span class="slick-prev"><i class="fa fa-angle-down"></i></span>',
        nextArrow: '<span class="slick-next"><i class="fa fa-angle-up"></i></span>',
        asNavFor: $details,
    });
 });
/*----------------------------------------*/
/* 22. Cart Plus Minus Button
/*----------------------------------------*/
 $(".cart-plus-minus").append('<div class="dec qtybutton"><i class="fa fa-angle-down"></i></div><div class="inc qtybutton"><i class="fa fa-angle-up"></i></div>');
 $(".qtybutton").on("click", function() {
    var $button = $(this);
    var oldValue = $button.parent().find("input").val();
    if ($button.hasClass('inc')) {
       var newVal = parseFloat(oldValue) + 1;
    } else {
        // Don't allow decrementing below zero
       if (oldValue > 0) {
         var newVal = parseFloat(oldValue) - 1;
         } else {
         newVal = 0;
       }
       }
    $button.parent().find("input").val(newVal);
   });
/*----------------------------------------*/
/* 23. Single Prduct Carousel Activision
/*----------------------------------------*/
 	$(".sp-carousel-active").owlCarousel({
 		loop: true,
 		nav: false,
 		dots: false,
 		autoplay: false,
 		autoplayTimeout: 5000,
 		navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-left"></i>'],
 		item: 4,
 		responsive: {
 			0: {
 					items: 1
 			},
 			480: {
 					items: 2
 			},
 			768: {
 					items: 2
 			},
 			992: {
 					items: 3
 			},
 			1200: {
 					items: 4
 			}
 		}
 	});
/*----------------------------------------*/
/* 24. Star Rating Js
/*----------------------------------------*/
    $(function() {
          $('.star-rating').barrating({
            theme: 'fontawesome-stars'
        });
    });
/*----------------------------------------*/
/* 25. Zoom Product Venobox
/*----------------------------------------*/
    $('.venobox').venobox({
        spinner:'wave',
        spinColor:'#cb9a00',
    });
/*----------------------------------------*/
/* 26. WOW
/*----------------------------------------*/
    new WOW().init();
})(jQuery);



// Pārdošanas asistenta JavaScript kods - ielīmēt js/main.js faila beigās

// Chat stāvoklis
let isOpen = false;

// Produktu datubāze ar saitēm (PIELĀGOJIET SAVIEM PRODUKTIEM)
const products = {
    'chamcham': { 
        name: 'Chamcham Galaxy S9', 
        price: '€1209', 
        description: 'Jaunākais smartphone ar lielisku kameru',
        link: 'single-product.html?id=chamcham',
        image: 'images/product/large-size/1.jpg'
    },
    'surface': { 
        name: 'Surface Studio', 
        price: '€824', 
        description: 'Profesionāls dators dizaineriem',
        link: 'single-product.html?id=surface',
        image: 'images/product/large-size/2.jpg'
    },
    'phantom': { 
        name: 'Phantom 4 Pro+', 
        price: '€1849', 
        description: 'Profesionāls drons ar 4K kameru',
        link: 'single-product.html?id=phantom',
        image: 'images/product/large-size/3.jpg'
    },
    'camera': { 
        name: 'Professional Camera', 
        price: '€599', 
        description: 'Augstas kvalitātes fotokamera',
        link: 'single-product.html?id=camera',
        image: 'images/product/large-size/4.jpg'
    },
    'headphones': { 
        name: 'Wireless Headphones', 
        price: '€299', 
        description: 'Bezvadu austiņas ar noise canceling',
        link: 'single-product.html?id=headphones',
        image: 'images/product/large-size/5.jpg'
    }
};

// AI atbildes bāze
const responses = {
    greetings: [
        'Sveiki! Kā varu palīdzēt?',
        'Labdien! Ar ko varu būt noderīgs?',
        'Sveicināti! Kādu informāciju meklējat?'
    ],
    products: [
        'Mūsu populārākās preces ir Chamcham Galaxy S9 (€1209), Surface Studio (€824) un Phantom 4 Pro+ (€1849). Kura jūs interesē vairāk?',
        'Mums ir plašs produktu klāsts - telefoni, datori, droni. Kāda veida produkts jūs interesē?'
    ],
    shipping: [
        'Mēs piedāvājam bezmaksas piegādi pasūtījumiem virs €50. Standarta piegāde aizņem 2-3 darba dienas.',
        'Piegāde: Bezmaksas virs €50, citādi €5. Ātrā piegāde (1 diena) - €15.'
    ],
    prices: [
        'Mūsu cenas ir konkurētspējīgas! Kādu produktu cenu vēlaties uzzināt?',
        'Cenas sākas no €50. Konkrētu produktu cenu varu pateikt, ja nosauciet produktu.'
    ],
    support: [
        'Mūsu atbalsta komanda ir pieejama 24/7. Varat sazināties pa e-pastu vai telefonu.',
        'Ja jums ir problēmas, varam palīdzēt tūlīt vai novirzīt uz tehnisko atbalstu.'
    ],
    default: [
        'Interesants jautājums! Varu palīdzēt ar produktu informāciju, cenām, piegādi. Ko vēlaties uzzināt?',
        'Nepilnīgi saprotu. Varat precizēt jautājumu? Varu stāstīt par produktiem, cenām vai piegādi.',
        'Šis ir specifisks jautājums. Vēlaties runāt ar cilvēku no mūsu komandas? Tikmēr varu palīdzēt ar pamatjautājumiem.'
    ]
};

// Chat atvēršana/aizvēršana
function toggleChat() {
    const container = document.getElementById('chatContainer');
    const icon = document.getElementById('toggleIcon');
    
    isOpen = !isOpen;
    container.classList.toggle('open');
    icon.textContent = isOpen ? '✕' : '💬';
    
    if (isOpen) {
        document.getElementById('messageInput').focus();
    }
}

// Ziņas sūtīšana
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        
        // Simulēt rakstīšanu
        showTyping();
        
        // Atbildēt pēc 1-3 sekundēm
        setTimeout(() => {
            hideTyping();
            const response = generateResponse(message);
            addMessage(response, 'bot');
        }, Math.random() * 2000 + 1000);
    }
}

// Ātrās ziņas
function sendQuickMessage(message) {
    addMessage(message, 'user');
    showTyping();
    
    setTimeout(() => {
        hideTyping();
        const response = generateResponse(message);
        addMessage(response, 'bot');
    }, 1500);
}

// Pievienot ziņu
function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'bot' ? '🤖' : '👤';
    
    messageDiv.innerHTML = `
        <div class="avatar">${avatar}</div>
        <div class="message-content">${text}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Rakstīšanas indikators
function showTyping() {
    document.getElementById('typingIndicator').style.display = 'block';
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTyping() {
    document.getElementById('typingIndicator').style.display = 'none';
}

// AI atbildes ģenerēšana ar produktu kartītēm
function generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Produktu atpazīšana
    for (let key in products) {
        if (lowerMessage.includes(key) || 
            lowerMessage.includes(products[key].name.toLowerCase()) ||
            lowerMessage.includes(key.substring(0, 4))) {
            
            const product = products[key];
            return createProductCard(product);
        }
    }
    
    // Visu produktu rādīšana
    if (lowerMessage.includes('visi produkt') || 
        lowerMessage.includes('katalogu') || 
        lowerMessage.includes('kas jums ir') ||
        lowerMessage.includes('populārāk')) {
        return createProductCatalog();
    }
    
    // Kategoriju atpazīšana
    if (lowerMessage.includes('sveik') || lowerMessage.includes('labdien')) {
        return getRandomResponse('greetings');
    }
    
    if (lowerMessage.includes('piegād') || lowerMessage.includes('dostav') || lowerMessage.includes('kurjer')) {
        return getRandomResponse('shipping');
    }
    
    if (lowerMessage.includes('cen') || lowerMessage.includes('maksa') || lowerMessage.includes('€')) {
        return getRandomResponse('prices');
    }
    
    if (lowerMessage.includes('atbalst') || lowerMessage.includes('palīdz') || lowerMessage.includes('problēm')) {
        return getRandomResponse('support');
    }
    
    if (lowerMessage.includes('paldies')) {
        return 'Lūdzu! Ja jums ir vēl kādi jautājumi, droši jautājiet!';
    }
    
    return getRandomResponse('default');
}

// Izveidot produkta kartīti ar pogu
function createProductCard(product) {
    return `
        <div class="product-card-chat">
            <div class="product-info-chat">
                <strong>${product.name}</strong><br>
                <span class="price-chat">${product.price}</span><br>
                <span class="description-chat">${product.description}</span>
            </div>
            <div class="product-actions-chat">
                <a href="${product.link}" class="view-product-btn" target="_blank">Skatīt produktu</a>
                <button onclick="addToCartFromChat('${product.name}', '${product.price}')" class="add-cart-btn">Pievienot grozam</button>
            </div>
        </div>
        Vai vēlaties uzzināt vairāk par šo produktu vai nepieciešama palīdzība ar ko citu?
    `;
}

// Izveidot produktu katalogu
function createProductCatalog() {
    let catalog = 'Šeit ir mūsu populārākie produkti:<br><br>';
    
    for (let key in products) {
        const product = products[key];
        catalog += `
            <div class="mini-product-card">
                <strong>${product.name}</strong> - ${product.price}<br>
                <a href="${product.link}" class="mini-link" target="_blank">Skatīt</a> | 
                <span onclick="addToCartFromChat('${product.name}', '${product.price}')" class="mini-add-cart">Pievienot grozam</span>
            </div>
        `;
    }
    
    catalog += '<br>Kuru produktu vēlaties apskatīt sīkāk?';
    return catalog;
}

// Pievienot grozam no čata
function addToCartFromChat(productName, productPrice) {
    // Ja jums ir esošā cart funkcionalitāte, izmantojiet to
    if (typeof addToCart === 'function') {
        // Izmantot esošo funkciju
        const productId = productName.toLowerCase().replace(/\s+/g, '-');
        addToCart(productId);
    } else {
        // Vienkāršs localStorage risinājums
        let cart = JSON.parse(localStorage.getItem('chat_cart') || '[]');
        
        const existingItem = cart.find(item => item.name === productName);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }
        
        localStorage.setItem('chat_cart', JSON.stringify(cart));
        
        // Paziņojums
        addMessage(`✅ ${productName} pievienots grozam!`, 'bot');
        
        // Atjaunot cart counter, ja eksistē
        const cartCounter = document.querySelector('.cart-item-count');
        if (cartCounter) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCounter.textContent = totalItems;
        }
    }
}

// Nejaušas atbildes
function getRandomResponse(category) {
    const responses_array = responses[category];
    return responses_array[Math.floor(Math.random() * responses_array.length)];
}

// Enter taustiņa apstrāde
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Inicializācija
document.addEventListener('DOMContentLoaded', function() {
    // Pievienot intro ziņu pēc 3 sekundēm
    setTimeout(() => {
        if (!isOpen) {
            const toggle = document.getElementById('chatToggle');
            if (toggle) {
                toggle.style.animation = 'pulse 1s infinite';
            }
        }
    }, 3000);
});
// E-commerce Wishlist un Cart funkcionalitāte
// Pievienot šo kodu js/main.js faila beigās

// Globālie mainīgie
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Inicializācija kad lapa ielādējas
$(document).ready(function() {
    updateCounters();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Add to cart pogas
    $(document).on('click', '.add-cart a', function(e) {
        e.preventDefault();
        const productCard = $(this).closest('.single-product-wrap');
        addToCart(productCard);
    });

    // Wishlist pogas
    $(document).on('click', '.links-details', function(e) {
        e.preventDefault();
        const productCard = $(this).closest('.single-product-wrap');
        toggleWishlist(productCard);
    });
}

// Pievienot produktu grozam
function addToCart(productCard) {
    const product = getProductData(productCard);
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCounters();
    showNotification(product.name + ' pievienots grozam!', 'success');
}

// Toggle wishlist
function toggleWishlist(productCard) {
    const product = getProductData(productCard);
    const existingIndex = wishlist.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification(product.name + ' noņemts no vēlmju saraksta!', 'error');
    } else {
        wishlist.push(product);
        showNotification(product.name + ' pievienots vēlmju sarakstam!', 'success');
    }
    
    saveWishlist();
    updateCounters();
}

// Iegūt produkta datus no HTML
function getProductData(productCard) {
    const title = productCard.find('.product_name').text().trim();
    const priceText = productCard.find('.new-price').text().trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
    const image = productCard.find('.product-image img').attr('src');
    
    return {
        id: title.replace(/\s+/g, '-').toLowerCase(), // Izveidot ID no nosaukuma
        name: title,
        price: price || 0,
        image: image || 'images/product/large-size/1.jpg'
    };
}

// Atjaunot skaitītājus
function updateCounters() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const wishlistCount = wishlist.length;
    
    $('.cart-item-count').text(cartCount);
    $('.wishlist-item-count').text(wishlistCount);
}

// Saglabāt localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Paziņojumu sistēma
function showNotification(message, type) {
    // Noņemt iepriekšējos paziņojumus
    $('.notification').remove();
    
    const notification = $(`
        <div class="notification notification-${type}" style="
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 9999;
            transform: translateX(300px);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
        ">
            ${message}
        </div>
    `);
    
    $('body').append(notification);
    
    // Animācija
    setTimeout(() => {
        notification.css('transform', 'translateX(0)');
    }, 100);
    
    // Noņemt pēc 3 sekundēm
    setTimeout(() => {
        notification.css('transform', 'translateX(300px)');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    // Groza un vēlmju saraksta pārvaldība
let cart = JSON.parse(localStorage.getItem('angava_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('angava_wishlist')) || [];

// Inicializācija
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    updateWishlistCount();
});

// Funkcija preces pievienošanai grozam
function addToCart(productId, productName, productPrice, productImage = null) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: productImage,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification('Prece pievienota grozam!', 'success');
    
    // Atjaunināt mini groza saturu
    updateMiniCart();
}

// Funkcija preces noņemšanai no groza
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    updateMiniCart();
    showNotification('Prece noņemta no groza', 'info');
}

// Funkcija daudzuma maiņai
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartCount();
            updateMiniCart();
        }
    }
}

// Funkcija vēlmju saraksta pārvaldībai
function toggleWishlist(productId, productName, productPrice, productImage = null) {
    const existingIndex = wishlist.findIndex(item => item.id === productId);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        showNotification('Prece noņemta no vēlmju saraksta', 'info');
    } else {
        wishlist.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            image: productImage,
            addedAt: new Date().toISOString()
        });
        showNotification('Prece pievienota vēlmju sarakstam!', 'success');
    }
    
    saveWishlist();
    updateWishlistCount();
    updateWishlistIcons();
}

// Funkcija preces pārvietošanai no vēlmju saraksta uz grozu
function moveToCart(productId) {
    const wishlistItem = wishlist.find(item => item.id === productId);
    if (wishlistItem) {
        addToCart(wishlistItem.id, wishlistItem.name, wishlistItem.price, wishlistItem.image);
        toggleWishlist(productId); // Noņemt no vēlmju saraksta
    }
}

// Datu saglabāšana
function saveCart() {
    localStorage.setItem('angava_cart', JSON.stringify(cart));
}

function saveWishlist() {
    localStorage.setItem('angava_wishlist', JSON.stringify(wishlist));
}

// Skaitītāju atjaunināšana
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-item-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    // Atjaunināt cenu
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const priceElements = document.querySelectorAll('.item-text');
    priceElements.forEach(element => {
        if (element.textContent.includes('€') || element.textContent.includes('£')) {
            element.innerHTML = `€${totalPrice.toFixed(2)}<span class="cart-item-count">${totalItems}</span>`;
        }
    });
}

function updateWishlistCount() {
    const wishlistCountElements = document.querySelectorAll('.wishlist-item-count');
    wishlistCountElements.forEach(element => {
        element.textContent = wishlist.length;
    });
}

// Mini groza atjaunināšana
function updateMiniCart() {
    const minicartList = document.querySelector('.minicart-product-list');
    const minicartTotal = document.querySelector('.minicart-total span');
    
    if (!minicartList) return;
    
    minicartList.innerHTML = '';
    
    if (cart.length === 0) {
        minicartList.innerHTML = '<li class="empty-cart">Grozs ir tukšs</li>';
        if (minicartTotal) minicartTotal.textContent = '€0.00';
        return;
    }
    
    let total = 0;
    cart.slice(0, 3).forEach(item => { // Rādīt tikai pirmās 3 preces
        total += item.price * item.quantity;
        
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a href="single-product.html" class="minicart-product-image">
                <img src="images/product/small-size/placeholder.jpg" alt="${item.name}" onerror="this.style.display='none'">
            </a>
            <div class="minicart-product-details">
                <h6><a href="single-product.html">${item.name}</a></h6>
                <span>€${item.price.toFixed(2)} x ${item.quantity}</span>
            </div>
            <button class="close" title="Remove" onclick="removeFromCart('${item.id}')">
                <i class="fa fa-close"></i>
            </button>
        `;
        minicartList.appendChild(listItem);
    });
    
    if (minicartTotal) {
        minicartTotal.textContent = `€${total.toFixed(2)}`;
    }
}

// Vēlmju saraksta ikonu atjaunināšana
function updateWishlistIcons() {
    document.querySelectorAll('[data-wishlist-id]').forEach(element => {
        const productId = element.getAttribute('data-wishlist-id');
        const isInWishlist = wishlist.some(item => item.id === productId);
        
        if (isInWishlist) {
            element.classList.add('in-wishlist');
            element.innerHTML = '<i class="fa fa-heart"></i>';
        } else {
            element.classList.remove('in-wishlist');
            element.innerHTML = '<i class="fa fa-heart-o"></i>';
        }
    });
}

// Paziņojumu sistēma
function showNotification(message, type = 'success') {
    // Noņemt esošos paziņojumus
    const existingNotifications = document.querySelectorAll('.angava-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `angava-notification angava-notification-${type}`;
    notification.textContent = message;
    
    // Pievienot stilos CSS
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animācija
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Noņemt pēc 3 sekundēm
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Groza notīrīšana
function clearCart() {
    if (confirm('Vai tiešām vēlaties iztukšot grozu?')) {
        cart = [];
        saveCart();
        updateCartCount();
        updateMiniCart();
        showNotification('Grozs iztukšots', 'info');
    }
}

// Pasūtīšanas funkcija
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Grozs ir tukšs!', 'error');
        return;
    }
    
    // Novirzīt uz checkout lapu
    window.location.href = 'checkout.html';
}


// Eksportēt funkcijas globāli
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlist = toggleWishlist;
window.moveToCart = moveToCart;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;
}

/*----------------------------------------------------------------------------------------------------*/
/*------------------------------------------> The End <-----------------------------------------------*/
/*----------------------------------------------------------------------------------------------------*/