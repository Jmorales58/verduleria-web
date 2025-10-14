// --- CONFIGURACIÓN DEL SERVIDOR ---
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Configuración de CORS más específica
const corsOptions = {
  origin: 'https://verduleria-rjm35aoha-joaquin-morales-projects-3e66175c.vercel.app/', // <-- ¡URL CORRECTA!
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// --- ENDPOINTS PÚBLICOS (Para la tienda) ---

app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
        res.json(products);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error del servidor." });
    }
});

app.post('/api/checkout', async (req, res) => {
    // ... (este endpoint no cambia)
    const { cart } = req.body;
    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: 'El carrito está vacío.' });
    }
    console.log('--- NUEVO PEDIDO RECIBIDO ---');
    let totalCalculado = 0;
    cart.forEach(item => {
        console.log(`- ${item.quantity} x ${item.name} (@ $${item.price.toFixed(2)} c/u)`);
        totalCalculado += item.quantity * item.price;
    });
    console.log(`TOTAL DEL PEDIDO: $${totalCalculado.toFixed(2)}`);
    console.log('----------------------------\n');
    res.status(200).json({ message: '¡Pedido recibido con éxito!' });
});


// --- ENDPOINTS DE ADMINISTRACIÓN (Para el panel de control) ---

// <-- NUEVO: Crear un producto
app.post('/api/admin/products', async (req, res) => {
    try {
        const { name, price, image } = req.body;
        const newProduct = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price), // Convertimos el precio a número
                image,
            },
        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ message: "Error del servidor al crear producto." });
    }
});

// <-- NUEVO: Actualizar un producto
app.put('/api/admin/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image } = req.body;
        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: parseFloat(price),
                image,
            },
        });
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ message: "Error del servidor al actualizar." });
    }
});

// <-- NUEVO: Eliminar un producto
app.delete('/api/admin/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send(); // 204 significa "OK, pero sin contenido que devolver"
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ message: "Error del servidor al eliminar." });
    }
});


// --- INICIAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor de la verdulería corriendo en http://localhost:${PORT}`);
});