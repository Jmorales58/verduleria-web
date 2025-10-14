const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// --- CONFIGURACIÓN DE CORS SIMPLE Y EFECTIVA ---
// Habilita CORS para TODAS las peticiones y orígenes.
// Esto manejará automáticamente las peticiones OPTIONS.
app.use(cors());
// ----------------------------------------------

// Middleware para parsear el body de las peticiones a JSON
app.use(express.json());

// --- RUTAS DE LA API ---

// RUTA PÚBLICA: Obtener todos los productos para la tienda
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error("Error en GET /api/products:", error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

// RUTA PÚBLICA: Simular un checkout
app.post('/api/checkout', (req, res) => {
    console.log('Procesando pedido para:', req.body.cart);
    res.status(200).json({ message: '¡Pedido recibido! Gracias por tu compra.' });
});

// RUTA DE ADMIN: Crear un nuevo producto
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

// RUTA DE ADMIN: Actualizar un producto
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

// RUTA DE ADMIN: Eliminar un producto
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