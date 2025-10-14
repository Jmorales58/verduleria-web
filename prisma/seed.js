const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista de productos para poblar la base de datos.
// Nota: No incluimos el 'id', ya que la base de datos lo genera automáticamente.
const productsData = [
    { name: 'Manzanas Rojas', price: 2.50, image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500&q=80' },
    { name: 'Plátanos', price: 1.80, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&q=80' },
    { name: 'Zanahorias', price: 1.20, image: 'https://images.unsplash.com/photo-1590431306482-f700ee050c59?w=500&q=80' },
    { name: 'Brócoli', price: 3.00, image: 'https://images.unsplash.com/photo-1587351177733-a0b94734523c?w=500&q=80' },
    { name: 'Tomates', price: 2.80, image: 'https://images.unsplash.com/photo-1561155653-29e1c14b6396?w=500&q=80' },
    { name: 'Espinacas Frescas', price: 2.20, image: 'https://images.unsplash.com/photo-1576045057995-568f588f2f20?w=500&q=80' },
    { name: 'Papas', price: 1.50, image: 'https://images.unsplash.com/photo-1590324836483-5483a4a39d48?w=500&q=80' }
];

async function main() {
  console.log('Empezando el sembrado (seeding)...');
  
  // Borramos los productos existentes para evitar duplicados si corremos el script varias veces.
  await prisma.product.deleteMany({});
  console.log('Productos existentes eliminados.');

  // Creamos los nuevos productos uno por uno.
  for (const product of productsData) {
    await prisma.product.create({
      data: product,
    });
  }
  
  console.log('Sembrado completado exitosamente.');
}

// Ejecutamos la función principal y manejamos los errores.
main()
  .catch((e) => {
    console.error('Hubo un error durante el sembrado:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Nos aseguramos de cerrar la conexión a la base de datos al final.
    await prisma.$disconnect();
  });