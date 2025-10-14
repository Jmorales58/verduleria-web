document.addEventListener('DOMContentLoaded', () => {
    let products = [];
    let cart = [];

    // URL CORRECTA Y FINAL (con 'j')
    const API_URL = 'https://verduleria-backend-beuj.onrender.com/api';

    const productList = document.getElementById('product-list');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');

    async function fetchProducts() {
        try {
            const response = await fetch(`${BASE_API_URL}/products`);
            if (!response.ok) throw new Error('No se pudieron cargar los productos.');
            products = await response.json();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productList.innerHTML = '<p>Lo sentimos, no se pueden mostrar los productos en este momento.</p>';
        }
    }

    // ... (el resto del código de script.js es el mismo, no es necesario copiarlo si solo cambias la URL)
    
    function renderProducts() {
        if (!productList) return;
        productList.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">
                        <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
                    </button>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    function renderCart() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <strong>${item.name}</strong>
                            <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                    </div>
                    <button class="remove-from-cart-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
        }
        updateCartInfo();
    }

    function updateCartInfo() {
        if (!cartCount || !cartTotalPrice || !checkoutBtn) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartCount.textContent = totalItems;
        cartTotalPrice.textContent = totalPrice.toFixed(2);
        checkoutBtn.disabled = cart.length === 0;
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        renderCart();
    }
    
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    }

    async function handleCheckout() {
        if (cart.length === 0) return;

        checkoutBtn.textContent = 'Procesando...';
        checkoutBtn.disabled = true;

        try {
            const response = await fetch(`${BASE_API_URL}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart: cart }),
            });

            if (!response.ok) {
                throw new Error('Hubo un problema al procesar el pedido.');
            }

            const result = await response.json();
            alert(result.message);

            cart = [];
            renderCart();

        } catch (error) {
            console.error('Error en el checkout:', error);
            alert('No se pudo completar el pedido. Inténtalo de nuevo.');
        } finally {
            checkoutBtn.textContent = 'Proceder al Pago';
            updateCartInfo();
        }
    }
    
    if (productList) {
        productList.addEventListener('click', (e) => {
            const button = e.target.closest('.add-to-cart-btn');
            if (button) {
                addToCart(parseInt(button.getAttribute('data-id')));
            }
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.remove-from-cart-btn');
            if (button) {
                removeFromCart(parseInt(button.getAttribute('data-id')));
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }

    fetchProducts();
    renderCart();
});