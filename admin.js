document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('existing-products-list');
    const formTitle = document.getElementById('form-title');
    const submitButton = productForm.querySelector('button');
    let editingProductId = null;

    // URL CORRECTA Y ÚNICA PARA TODAS LAS PETICIONES DE ADMIN
    const ADMIN_API_URL = 'https://verduleria-backend.onrender.com/api/admin/products';
    // URL CORRECTA PARA LEER LOS PRODUCTOS
    const PRODUCTS_API_URL = 'https://verduleria-backend.onrender.com/api/products';


    async function fetchAndRenderProducts() {
        try {
            // Usamos la URL pública para leer productos
            const response = await fetch(PRODUCTS_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
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
            console.error('Error al cargar productos:', error);
            productList.innerHTML = '<li>Error al cargar productos. Refresca la página.</li>';
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(productForm);
        const product = {
            name: formData.get('name'),
            price: parseFloat(formData.get('price')),
            image: formData.get('image'),
        };

        try {
            let response;
            let url = ADMIN_API_URL;
            let method = 'POST';

            if (editingProductId) {
                url = `${ADMIN_API_URL}/${editingProductId}`;
                method = 'PUT';
            }

            response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });

            if (!response.ok) {
                throw new Error('La operación de guardado falló.');
            }

            resetForm();
            await fetchAndRenderProducts();

        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('No se pudo guardar el producto.');
        }
    }

    function handleEdit(e) {
        const button = e.target.closest('.edit-btn');
        if (!button) return;

        editingProductId = button.dataset.id;
        const productText = button.parentElement.previousElementSibling.textContent;
        const [name, priceStr] = productText.split(' - $');
        
        productForm.name.value = name.trim();
        productForm.price.value = parseFloat(priceStr);
        productForm.image.value = ''; // Limpiamos la imagen por seguridad

        formTitle.textContent = 'Editar Producto';
        submitButton.textContent = 'Actualizar Producto';
        window.scrollTo(0, 0); // Sube al principio de la página para ver el formulario
    }

    async function handleDelete(e) {
        const button = e.target.closest('.delete-btn');
        if (!button) return;

        const productId = button.dataset.id;
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            const response = await fetch(`${ADMIN_API_URL}/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('No se pudo eliminar el producto.');
            }

            await fetchAndRenderProducts();

        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('No se pudo eliminar el producto.');
        }
    }
    
    function resetForm() {
        productForm.reset();
        editingProductId = null;
        formTitle.textContent = 'Agregar Nuevo Producto';
        submitButton.textContent = 'Guardar Producto';
    }

    productForm.addEventListener('submit', handleFormSubmit);
    productList.addEventListener('click', (e) => {
        handleEdit(e);
        handleDelete(e);
    });

    // Iniciar todo
    fetchAndRenderProducts();
});