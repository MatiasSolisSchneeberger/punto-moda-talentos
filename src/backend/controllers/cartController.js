import { Cart, CartItem, ProductVariant, Product, ProductImage, VariantAttribute } from "../models/asociaciones.js";

// 1 Importo el carrito (GET /api/cart/:userId)
export const getCart = async (req, res) => {
    try {
        const { userId } = req.params;

        // Busco el carrito activo del usuario, sinó creamos uno si no tiene
        const [cart] = await Cart.findOrCreate({
            where: { user_id: userId },
            include: [
                {
                    model: CartItem,
                    include: [
                        {
                            model: ProductVariant,
                            include: [
                                {
                                    model: Product,
                                    include: [ProductImage]
                                },
                                VariantAttribute
                            ]
                        }
                    ]
                }
            ]
        })

        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 2 Agregar un productos (POST /api/cart/add)
export const addToCart = async (req, res) => {
    try {
        const { userId, variantId, quantity } = req.body;

        // a asegurar que el usuario tenga carrito
        const [cart] = await Cart.findOrCreate({
            where: { user_id: userId },
            defaults: { user_id: userId }
        })

        // b buscar si el producto ya está
        const existingItem = await CartItem.findOne({
            where: {
                cart_id: cart.id,
                product_variant_id: variantId
            }
        });

        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
        } else {
            await CartItem.create({ cart_id: cart.id, product_variant_id: variantId, quantity });
        }

        res.json({ message: "Producto agregado al carrito" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

// 3 Quitar un producto (DELETE /api/cart/remove)
export const removeCartItem = async (req, res) => {
    try {
        const { id } = req.params; // ID del CartItem
        await CartItem.destroy({ where: { id } });
        res.json({ message: "Ítem eliminado" });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar ítem' });
    }
};