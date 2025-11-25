import express from 'express';
import { Product, ProductVariant, VariantAttribute, ProductImage } from '../models/asociaciones.js';

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [
                { model: ProductImage },
                {
                    model: ProductVariant,
                    include: [VariantAttribute]
                }
            ]
        });

        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET /api/products/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findByPk(productId, {
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
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

export default router;
