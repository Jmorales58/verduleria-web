document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('existing-products-list');
    const formTitle = document.getElementById('form-title');
    const submitButton = productForm.querySelector('button[type="submit"]');
    
    // URL correcta y final de tu API
    const API_URL = 'https://verduleria-backend-beuj.onrender.com/api';
    
    let editingProductId = null;

    // Función para obtener y mostrar todos los productos
    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error(`Error al cargar productos: ${response.statusText}`);
            }
            const products = await response.json();
            
            productList.innerHTML = ''; // Limpiar la lista antes de renderizar
            products.forEach(product => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${product.name} - $${product.price.toFixed(2)}</span>
                    <div>
                        <button class="edit-btn" data-id="${product.id}">Editar</button>
                        <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                    </div>
                `;
                productList.appendChild(li);
            });
        } catch (error) {
            console.error('Error en fetchAndRenderProducts:', error);
            productList.innerHTML = '<li>Error al cargar los productos. Revisa la consola.</li>';
        }
    }

    // Función para manejar el envío del formulario (crear o actualizar)
    async function handleFormSubmit(e) {
        e.preventDefault();
        const productData = {
            name: productForm.name.value,
            price: parseFloat(productForm.price.value),
            image: productForm.image.value,
        };

        let url = `${API_URL}/admin/products`;
        let method = 'POST';

        if (editingProductId) {
            url = `${API_URL}/admin/products/${editingProductId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('La operación en el servidor falló.');
            }

            resetForm();
            await fetchAndRenderProducts(); // Recargar la lista
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('No se pudo guardar el producto. Revisa la consola.');
        }
    }

    // Función para preparar el formulario para la edición
    function handleEdit(productId) {
        const productElement = document.querySelector(`.edit-btn[data-id='${productId}']`).closest('li');
        const [name, priceStr] = productElement.querySelector('span').textContent.split(' - $');
        
        productForm.name.value = name.trim();
        productForm.price.value = parseFloat(priceStr);
        productForm.image.value = ''; // La imagen no se puede "leer" de vuelta, se deja en blanco

        editingProductId = productId;
        formTitle.textContent = 'Editar Producto';
        submitButton.textContent = 'Actualizar Producto';
        window.scrollTo(0, 0); // Subir al inicio de la página para ver el formulario
    }

    // Función para eliminar un producto
    async function handleDelete(productId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/admin/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('No se pudo eliminar el producto en el servidor.');
            }
            await fetchAndRenderProducts(); // Recargar la lista
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('No se pudo eliminar el producto.');
        }
    }
    
    // Función para resetear el formulario a su estado inicial
    function resetForm() {
        productForm.reset();
        editingProductId = null;
        formTitle.textContent = 'Agregar Nuevo Producto';
        submitButton.textContent = 'Guardar Producto';
    }

    // --- EVENT LISTENERS ---
    productForm.addEventListener('submit', handleFormSubmit);

    // Usar delegación de eventos para los botones de la lista
    productList.addEventListener('click', (e) => {
        if (e.target.matches('.edit-btn')) {
            handleEdit(e.target.dataset.id);
        }
        if (e.target.matches('.delete-btn')) {
            handleDelete(e.target.dataset.id);
        }
    });

    // Carga inicial de productos
    fetchAndRenderProducts();
});