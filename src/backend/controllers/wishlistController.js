import { Wishlist, Product, ProductImage } from '../models/asociaciones.js';

// 1. OBTENER WISHLIST (GET /api/wishlist/:userId)
export const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        // Busco todos los registros de la wishlist para este usuario
        const wishlist = await Wishlist.findAll({
            where: { user_id: userId }
        });

        // Para cada item de la wishlist, obtenemos el producto completo
        const wishlistWithProducts = await Promise.all(
            wishlist.map(async (item) => {
                const product = await Product.findByPk(item.product_id, {
                    include: [ProductImage]
                });
                return {
                    ...item.toJSON(),
                    Product: product
                };
            })
        );

        res.json(wishlistWithProducts);
    } catch (error) {
        console.error('Error en getWishlist:', error);
        res.status(500).json({ error: 'Error al obtener la wishlist' });
    }
};

// 2. AGREGAR O QUITAR (POST /api/wishlist/toggle)
export const toggleWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Busco si ya existe
        const existingItem = await Wishlist.findOne({
            where: {
                user_id: userId,
                product_id: productId
            }
        });

        if (existingItem) {
            // Si existe, lo borramos (Quitamos el like)
            await existingItem.destroy();
            res.json({ message: "Eliminado de favoritos", action: "removed" });
        } else {
            // Si no existe, lo creamos (Damos like)
            await Wishlist.create({
                user_id: userId,
                product_id: productId
            });
            res.json({ message: "Agregado a favoritos", action: "added" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar wishlist' });
    }
};

// 3. VERIFICAR UN PRODUCTO (GET /api/wishlist/check/:userId/:productId)

export const checkWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const item = await Wishlist.findOne({
            where: { user_id: userId, product_id: productId }
        });
        res.json({ isInWishlist: !!item }); // Devuelve true o false
    } catch (error) {
        res.status(500).json({ error: 'Error al verificar' });
    }
};