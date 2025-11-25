import express from 'express';
import cors from 'cors';
import sequelize from './index.js'; // Tu conexión a la DB
import { Product, ProductImage, ProductVariant, VariantAttribute } from './models/asociaciones.js';
/* Rutas */
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

/* --- Rutas --- */
app.use('/api/auth', authRoutes);

// Obtener todos los productos
app.get('/api/products', async (req, res) => {
    try {
        // Buscamos productos trayendo todas sus relaciones necesarias
        const products = await Product.findAll({
            include: [
                { model: ProductImage }, // Para la foto
                {
                    model: ProductVariant, // Para precio y stock real
                    include: [VariantAttribute] // Para filtros (talle/color)
                }
            ]
        });
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Obtener un producto específico por ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [
                { model: ProductImage },
                {
                    model: ProductVariant,
                    include: [VariantAttribute]
                }
            ]
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// Rutas de carrito
app.use('/api/cart', cartRoutes);

// Rutas de wishlist
app.use('/api/wishlist', wishlistRoutes);

// --- Iniciar servidor ---
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
});