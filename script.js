document.addEventListener('DOMContentLoaded', () => {

    let products = [];
    let cart = [];

    const productList = document.getElementById('product-list');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.getElementById('cart-count');
    const checkoutBtn = document.querySelector('.checkout-btn');

    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/api/products');
            if (!response.ok) throw new Error('No se pudieron cargar los productos.');
            products = await response.json();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
            productList.innerHTML = '<p>Lo sentimos, no se pueden mostrar los productos en este momento.</p>';
        }
    }

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
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartCount.textContent = totalItems;
        cartTotalPrice.textContent = totalPrice.toFixed(2);
        checkoutBtn.disabled = cart.length === 0;
    }

    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
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

    // --- NUEVA FUNCIÓN PARA MANEJAR EL CHECKOUT ---
    async function handleCheckout() {
        if (cart.length === 0) return;

        // Cambiamos el texto del botón para dar feedback al usuario
        checkoutBtn.textContent = 'Procesando...';
        checkoutBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/api/checkout', {
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
            alert(result.message); // Mostramos un mensaje de éxito

            // Vaciamos el carrito y actualizamos la interfaz
            cart = [];
            renderCart();

        } catch (error) {
            console.error('Error en el checkout:', error);
            alert('No se pudo completar el pedido. Inténtalo de nuevo.');
        } finally {
            // Devolvemos el botón a su estado original
            checkoutBtn.textContent = 'Proceder al Pago';
            // La función updateCartInfo se encargará de deshabilitarlo si el carrito está vacío
            updateCartInfo();
        }
    }
    
    // --- MANEJADORES DE EVENTOS ---
    productList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(parseInt(e.target.getAttribute('data-id')));
        }
    });

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-cart-btn')) {
            removeFromCart(parseInt(e.target.getAttribute('data-id')));
        }
    });

    // ¡NUEVO EVENT LISTENER PARA EL BOTÓN DE PAGO!
    checkoutBtn.addEventListener('click', handleCheckout);

    // --- INICIALIZACIÓN ---
    fetchProducts();
    renderCart();
});