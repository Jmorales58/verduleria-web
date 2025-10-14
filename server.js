const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// --- CONFIGURACIÓN DE CORS SIMPLE Y EFECTIVA ---
// Esto permite peticiones desde cualquier origen. Es seguro para empezar.
// Render maneja las peticiones OPTIONS automáticamente con esta configuración.
app.use(cors());
// --- FIN DE LA CONFIGURACIÓN ---

app.use(express.json());

// --- RUTAS PÚBLICAS ---
// Obtener todos los productos
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error("Error en /api/products:", error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

// Procesar el pago (simulado)
app.post('/api/checkout', (req, res) => {
    const { cart } = req.body;
    console.log('Procesando pedido para:', cart);
    res.status(200).json({ message: '¡Pedido recibido! Gracias por tu compra.' });
});


// --- RUTAS DE ADMINISTRACIÓN ---
// Crear un nuevo producto
app.post('/api/admin/products', async (req, res) => {
    try {
        const product = await prisma.product.create({
            data: req.body,
        });
        res.status(201).json(product);
    } catch (error) {
        console.error("Error en POST /api/admin/products:", error);
        res.status(500).json({ error: 'Error al crear el producto.' });
    }
});

// Actualizar un producto
app.put('/api/admin/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: req.body,
        });
        res.json(product);
    } catch (error) {
        console.error("Error en PUT /api/admin/products:", error);
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
});

// Eliminar un producto
app.delete('/api/admin/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error en DELETE /api/admin/products:", error);
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
});


// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la verdulería corriendo en el puerto ${PORT}`);
});