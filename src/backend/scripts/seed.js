import sequelize from '../index.js';
import { User, Product, Review, Cart, CartItem } from '../models/asociaciones.js';

const seedDatabase = async () => {
    try {
        // 1. Sincronizar la base de datos (force: true BORRA TODO y recrea las tablas)
        await sequelize.sync({ force: true });
        console.log('🗑️  Base de datos limpiada y tablas creadas.');

        // 2. Crear Usuarios
        // El documento muestra cómo usar .create() para insertar registros
        const user1 = await User.create({
            name: 'Matias Solis',
            email: 'matias@example.com',
            password: 'password123' // esto debería estar encriptado (hash)
        });

        const user2 = await User.create({
            name: 'Juan Perez',
            email: 'juan@example.com',
            password: '123456password'
        });
        console.log('✅ Usuarios creados.');

        // 3. Crear Productos
        const remera = await Product.create({
            name: 'Remera Oversize Street',
            description: 'Remera de algodón premium, corte amplio.',
            price: 32000.00,
            stock: 20
        });

        const zapatillas = await Product.create({
            name: 'Zapatillas Urban Classic',
            description: 'Ideales para el día a día.',
            price: 80000.00,
            stock: 10
        });
        console.log('✅ Productos creados.');

        // 4. Crear una Review (robando la relación User -> Review -> Product)
        await Review.create({
            rating: 5,
            comment: 'Excelente calidad, me encantó!',
            user_id: user1.id,    // FK manual
            product_id: remera.id // FK manual
        });

        // Alternativa usando "Magic Methods" de Sequelize (más avanzado):
        // await remera.createReview({ rating: 4, comment: 'Muy buena', user_id: user2.id });

        console.log('✅ Reviews creadas.');

        // 5. Simular un Carrito (Probando la relación Muchos a Muchos)
        const cart = await Cart.create({ user_id: user1.id });

        // Agregar items al carrito (usando el modelo intermedio CartItem)
        await CartItem.create({
            cart_id: cart.id,
            product_id: zapatillas.id,
            quantity: 1
        });
        console.log('✅ Carrito cargado.');

        console.log('🚀 ¡Seed completado con éxito!');
        process.exit(0); // Terminar el proceso

    } catch (error) {
        console.error('❌ Error al poblar la base de datos:', error);
        process.exit(1);
    }
};

seedDatabase();