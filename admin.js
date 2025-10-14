document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('existing-products-list');
    const formTitle = document.getElementById('form-title');
    const submitButton = productForm.querySelector('button');
    let editingProductId = null;

    // LA URL REAL Y CORRECTA ASIGNADA POR RENDER
    const BASE_API_URL = 'https://verduleria-backend-beuj.onrender.com/api';

    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(`${BASE_API_URL}/products`);
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
            console.error(error);
            productList.innerHTML = '<li>No se pudieron cargar los productos. Intenta refrescar la página.</li>';
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

        let url = `${BASE_API_URL}/admin/products`;
        let method = 'POST';

        if (editingProductId) {
            url = `${BASE_API_URL}/admin/products/${editingProductId}`;
            method = 'PUT';
        }

        try {
            const response = await fetch(url, {
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
            console.error('Error al guardar:', error);
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
        productForm.image.value = '';

        formTitle.textContent = 'Editar Producto';
        submitButton.textContent = 'Actualizar Producto';
        window.scrollTo(0, 0);
    }

    async function handleDelete(e) {
        const button = e.target.closest('.delete-btn');
        if (!button) return;

        const productId = button.dataset.id;
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;

        try {
            const response = await fetch(`${BASE_API_URL}/admin/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('No se pudo eliminar.');
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

    fetchAndRenderProducts();
});