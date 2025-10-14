const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Permite peticiones desde cualquier origen. Simple y efectivo para Render.
app.use(cors());

app.use(express.json());

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
    res.status(200).json({ message: '¡Pedido recibido! Gracias por tu compra.' });
});

// Crear un nuevo producto
app.post('/api/admin/products', async (req, res) => {
    try {
        const product = await prisma.product.create({ data: req.body });
        res.status(201).json(product);
    } catch (error) {
        console.error("Error en POST /api/admin/products:", error);
        res.status(500).json({ error: 'Error al crear el producto.' });
    }
});

// Actualizar un producto
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
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
    try {
        await prisma.product.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).send();
    } catch (error) {
        console.error("Error en DELETE /api/admin/products:", error);
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
});

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la verdulería corriendo en el puerto ${PORT}`);
});