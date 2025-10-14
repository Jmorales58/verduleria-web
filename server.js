const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// --- CONFIGURACIÓN DE CORS MEJORADA ---
// Lista de orígenes permitidos
const whitelist = [
    'https://verduleria-rjm35aoha-joaquin-morales-projects-3e66175c.vercel.app', // Tu URL de producción
    'http://localhost:5500', // Para pruebas locales
    'http://127.0.0.1:5500'  // Para pruebas locales
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permite peticiones sin origen (como Postman o apps móviles) y las de la whitelist
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Usamos la nueva configuración de CORS
app.use(cors(corsOptions));
// --- FIN DE LA CONFIGURACIÓN DE CORS ---


app.use(express.json());

// --- RUTAS PÚBLICAS ---
// Obtener todos los productos (para la tienda)
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
});

// Procesar el pago (simulado)
app.post('/api/checkout', (req, res) => {
    const { cart } = req.body;
    console.log('Procesando pedido para:', cart);
    // Aquí iría la lógica de pago con Stripe, etc.
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
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
});


// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la verdulería corriendo en el puerto ${PORT}`);
});