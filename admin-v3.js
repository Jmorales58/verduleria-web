document.addEventListener('DOMContentLoaded', () => {
    // Selectores de elementos del DOM
    const productForm = document.getElementById('product-form');
    // FIX #1: Usar el ID correcto del HTML ('admin-product-list')
    const productList = document.getElementById('admin-product-list'); 
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('save-btn');
    
    // URL correcta y final de tu API
    const API_URL = 'https://verduleria-backend-beuj.onrender.com/api';
    
    let editingProductId = null;

    // Función para obtener y mostrar todos los productos
    async function fetchAndRenderProducts() {
        // Asegurarse de que productList no sea null antes de hacer nada
        if (!productList) {
            console.error("Elemento 'admin-product-list' no encontrado en el HTML.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error(`Error al cargar productos: ${response.statusText}`);
            }
            const products = await response.json();
            
            productList.innerHTML = '';
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

    // Función para manejar el envío del formulario
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // FIX #2: Obtener valores usando el ID de cada input
        const productData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            image: document.getElementById('product-image').value,
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

            if (!response.ok) throw new Error('La operación en el servidor falló.');
            resetForm();
            await fetchAndRenderProducts();
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('No se pudo guardar el producto. Revisa la consola.');
        }
    }

    // Función para preparar el formulario para la edición
    function handleEdit(productId) {
        const productElement = document.querySelector(`.edit-btn[data-id='${productId}']`).closest('li');
        const [name, priceStr] = productElement.querySelector('span').textContent.split(' - $');
        
        document.getElementById('product-name').value = name.trim();
        document.getElementById('product-price').value = parseFloat(priceStr);
        document.getElementById('product-image').value = '';

        editingProductId = productId;
        formTitle.textContent = 'Editar Producto';
        submitButton.textContent = 'Actualizar Producto';
        window.scrollTo(0, 0);
    }

    // Función para eliminar un producto
    async function handleDelete(productId) {
        if (!confirm('¿Estás seguro?')) return;
        try {
            await fetch(`${API_URL}/admin/products/${productId}`, { method: 'DELETE' });
            await fetchAndRenderProducts();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('No se pudo eliminar el producto.');
        }
    }
    
    // Función para resetear el formulario
    function resetForm() {
        productForm.reset();
        editingProductId = null;
        formTitle.textContent = 'Agregar Nuevo Producto';
        submitButton.textContent = 'Guardar Producto';
    }

    // --- EVENT LISTENERS ---
    // Solo agregar listeners si los elementos existen
    if (productForm) {
        productForm.addEventListener('submit', handleFormSubmit);
    }

    if (productList) {
        productList.addEventListener('click', (e) => {
            if (e.target.matches('.edit-btn')) handleEdit(e.target.dataset.id);
            if (e.target.matches('.delete-btn')) handleDelete(e.target.dataset.id);
        });
    }

    // Carga inicial de productos
    fetchAndRenderProducts();
});