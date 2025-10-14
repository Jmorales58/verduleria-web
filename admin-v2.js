document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const productList = document.getElementById('existing-products-list');
    const formTitle = document.getElementById('form-title');
    const submitButton = productForm.querySelector('button');
    let editingProductId = null;

    // URL CORRECTA Y FINAL (con 'j')
    const API_URL = 'https://verduleria-backend-beuj.onrender.com/api';

    async function fetchAndRenderProducts() {
        try {
            const response = await fetch(`${BASE_API_URL}/products`);
            if (!response.ok) throw new Error(`Error al cargar: ${response.statusText}`);
            const products = await response.json();
            
            productList.innerHTML = '';
            products.forEach(product => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${product.name} - $${product.price.toFixed(2)}</span><div><button class="edit-btn" data-id="${product.id}">Editar</button><button class="delete-btn" data-id="${product.id}">Eliminar</button></div>`;
                productList.appendChild(li);
            });
        } catch (error) {
            console.error(error);
            productList.innerHTML = '<li>No se pudieron cargar los productos.</li>';
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const product = {
            name: productForm.name.value,
            price: parseFloat(productForm.price.value),
            image: productForm.image.value,
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
            if (!response.ok) throw new Error('La operación falló.');
            resetForm();
            await fetchAndRenderProducts();
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('No se pudo guardar el producto.');
        }
    }

    function handleEdit(e) {
        if (!e.target.matches('.edit-btn')) return;
        editingProductId = e.target.dataset.id;
        const [name, priceStr] = e.target.closest('li').querySelector('span').textContent.split(' - $');
        productForm.name.value = name.trim();
        productForm.price.value = parseFloat(priceStr);
        formTitle.textContent = 'Editar Producto';
        submitButton.textContent = 'Actualizar Producto';
    }

    async function handleDelete(e) {
        if (!e.target.matches('.delete-btn')) return;
        if (!confirm('¿Seguro?')) return;
        try {
            const response = await fetch(`${BASE_API_URL}/admin/products/${e.target.dataset.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('No se pudo eliminar.');
            await fetchAndRenderProducts();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('No se pudo eliminar.');
        }
    }
    
    function resetForm() {
        productForm.reset();
        editingProductId = null;
        formTitle.textContent = 'Agregar Nuevo Producto';
        submitButton.textContent = 'Guardar Producto';
    }

    productForm.addEventListener('submit', handleFormSubmit);
    productList.addEventListener('click', handleEdit);
    productList.addEventListener('click', handleDelete);

    fetchAndRenderProducts();
});