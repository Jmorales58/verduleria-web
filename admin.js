document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('admin-product-list');
    const formTitle = document.getElementById('form-title');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const saveBtn = document.getElementById('save-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    const API_URL = 'http://localhost:3000/api';

    // Función para obtener y mostrar todos los productos
    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            const products = await response.json();
            
            productList.innerHTML = ''; // Limpiar la lista antes de renderizar
            products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item';
                productItem.innerHTML = `
                    <div class="product-item-info">
                        <img src="${product.image}" alt="${product.name}">
                        <div>
                            <strong>${product.name}</strong>
                            <p>$${product.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <div class="product-item-actions">
                        <button class="edit-btn" data-id="${product.id}">Editar</button>
                        <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                    </div>
                `;
                productList.appendChild(productItem);
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    }

    // Función para manejar el envío del formulario (Crear o Actualizar)
    async function handleFormSubmit(e) {
        e.preventDefault();
        const id = productIdInput.value;
        const productData = {
            name: productNameInput.value,
            price: productPriceInput.value,
            image: productImageInput.value,
        };

        const isUpdating = id !== '';
        const url = isUpdating ? `${API_URL}/admin/products/${id}` : `${API_URL}/admin/products`;
        const method = isUpdating ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) throw new Error('La respuesta del servidor no fue OK');
            
            resetForm();
            await fetchAndRenderProducts();

        } catch (error) {
            console.error('Error al guardar producto:', error);
        }
    }

    // Función para preparar el formulario para editar un producto
    function handleEditClick(e) {
        if (!e.target.classList.contains('edit-btn')) return;
        
        const button = e.target;
        const productItem = button.closest('.product-item');
        const name = productItem.querySelector('strong').textContent;
        const price = parseFloat(productItem.querySelector('p').textContent.replace('$', ''));
        const image = productItem.querySelector('img').src;
        const id = button.dataset.id;

        // Llenar el formulario con los datos del producto
        formTitle.textContent = 'Editar Producto';
        productIdInput.value = id;
        productNameInput.value = name;
        productPriceInput.value = price;
        productImageInput.value = image;
        saveBtn.textContent = 'Actualizar Producto';
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo(0, 0); // Subir al inicio de la página para ver el formulario
    }

    // Función para eliminar un producto
    async function handleDeleteClick(e) {
        if (!e.target.classList.contains('delete-btn')) return;

        const id = e.target.dataset.id;
        // Pedir confirmación antes de eliminar
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

        try {
            const response = await fetch(`${API_URL}/admin/products/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('La respuesta del servidor no fue OK');
            
            await fetchAndRenderProducts();

        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    }

    // Función para resetear el formulario
    function resetForm() {
        productForm.reset();
        productIdInput.value = '';
        formTitle.textContent = 'Agregar Nuevo Producto';
        saveBtn.textContent = 'Guardar Producto';
        cancelEditBtn.style.display = 'none';
    }

    // --- EVENT LISTENERS ---
    productForm.addEventListener('submit', handleFormSubmit);
    productList.addEventListener('click', handleEditClick);
    productList.addEventListener('click', handleDeleteClick);
    cancelEditBtn.addEventListener('click', resetForm);

    // Carga inicial de productos
    fetchAndRenderProducts();
});