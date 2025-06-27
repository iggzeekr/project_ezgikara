
if (!window.jQuery) {
    const script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
}

(function () {
    let currentIndex = 0;

    console.log('%c🎉 Carousel is running... Enjoyyyyyyy!', 'color: #007BFF; font-size: 16px; font-weight: bold;');

    const productDetailElement = $('.product-detail');
    if (!productDetailElement.length) {
        console.log('%c🚨 No .product-detail element found. Code not executed.', 'color: red; font-size: 14px;');
        return;
    }

    const init = async () => {
        const products = await fetchProducts();
        buildHTML(products);
        buildCSS();
        setEvents();
        loadFavorites();
    };

    const fetchProducts = async () => {
        const localProducts = localStorage.getItem('productList');
        if (localProducts) {
            return JSON.parse(localProducts);
        } else {
            const response = await $.getJSON('https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json');
            localStorage.setItem('productList', JSON.stringify(response));
            return response;
        }
    };

    const buildHTML = (products) => {
        let html = '<div class="carousel-container">';
        html += '<h2>You Might Also Like</h2>';
        html += '<div class="carousel">';
        products.forEach((product) => {
            html += `<div class="carousel-item" data-id="${product.id}">
                <button class="favorite-btn">
                    <svg class="heart-svg" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" class="heart-path"></path>
                    </svg>
                </button>
                <a href="${product.url}" target="_blank">
                    <img src="${product.img}" alt="${product.name}">
                </a>
                <h3>${product.name}</h3>
                <span class="product-price">${product.price} TRY</span>
            </div>`;
        });
        html += '</div>';
        html += '<button class="carousel-prev">&#10094;</button>';
        html += '<button class="carousel-next">&#10095;</button>';
        html += '</div>';
        productDetailElement.after(html);
    };

    const buildCSS = () => {
        const css = `
            .carousel-container {
                position: relative;
                width: 100%;
                overflow: hidden;
                background: #f9f9f9;
                padding: 20px;
            }
            .carousel {
                display: flex;
                transition: transform 0.5s ease-in-out;
            }
            .carousel-item {
                min-width: calc(100% / 6.5);
                box-sizing: border-box;
                padding: 10px;
                text-align: center;
                position: relative;
            }
            .carousel-item img {
                width: 100%;
                height: auto;
                border-radius: 8px;
                display: block;
            }
            .favorite-btn {
                width: 36px;
                height: 36px;
                background: #fff;
                border: 2px solid #ccc;
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                border-radius: 4px;
                transition: transform 0.2s ease;
                z-index: 2;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            }
            .carousel-item:hover .favorite-btn {
                opacity: 1;
            }
            .favorite-btn .heart-svg path {
                stroke: #000;
                stroke-width: 2;
                fill: none;
            }
            .favorite-btn.active .heart-svg path {
                fill: #007BFF;
                stroke: none;
            }
            .carousel-prev, .carousel-next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: #000;
                color: #fff;
                border: none;
                padding: 10px;
                cursor: pointer;
                z-index: 10;
                font-size: 18px;
                border-radius: 50%;
            }
            .carousel-prev {
                left: 10px;
            }
            .carousel-next {
                right: 10px;
            }
            h3 {
                color: #000;
            }
            .product-price {
                color: #007BFF;
                font-weight: normal;
            }
        `;
        $('<style>').text(css).appendTo('head');
    };

    const setEvents = () => {
        $('.carousel-next').on('click', () => {
            if (currentIndex < $('.carousel-item').length - 6.5) {
                currentIndex++;
                updateCarouselPosition();
            }
        });

        $('.carousel-prev').on('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarouselPosition();
            }
        });

        $('.favorite-btn').on('click', function () {
            const heartPath = $(this).find('.heart-svg path');
            const itemId = $(this).closest('.carousel-item').data('id');
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                heartPath.removeClass('active');
                saveFavorite(itemId, false);
            } else {
                $(this).addClass('active');
                heartPath.addClass('active');
                saveFavorite(itemId, true);
                $(this).css('transform', 'scale(1.2)').delay(150).queue(function (next) {
                    $(this).css('transform', 'scale(1)');
                    next();
                });
            }
        });
    };

    const updateCarouselPosition = () => {
        $('.carousel').css('transform', `translateX(-${currentIndex * (100 / 6.5)}%)`);
    };

    const saveFavorite = (id, isFavorite) => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (isFavorite) {
            if (!favorites.includes(id)) favorites.push(id);
        } else {
            favorites = favorites.filter((fav) => fav !== id);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
    };

    const loadFavorites = () => {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.forEach((id) => {
            const heartPath = $(`.carousel-item[data-id="${id}"] .heart-svg path`);
            if (heartPath.length) {
                heartPath.addClass('active');
                heartPath.closest('.favorite-btn').addClass('active');
            }
        });
    };

    init();
})();
//EZGİ KARA 