import User from './User.js';
import Product from './Producto.js';
import Review from './Review.js';
import Cart from './Cart.js';
import CartItem from './CartItem.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Wishlist from './Wishlist.js';

// 1. Usuario y Reviews
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

// 2. Producto y Reviews
Product.hasMany(Review, { foreignKey: 'product_id' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

// 3. Producto recursivo (parent_id)
Product.hasMany(Product, { as: 'variantes', foreignKey: 'parent_id' });
Product.belongsTo(Product, { as: 'padre', foreignKey: 'parent_id' });

// 4. Carrito: Relación Muchos a Muchos usando tabla intermedia
Cart.belongsToMany(Product, { through: CartItem, foreignKey: 'cart_id' });
Product.belongsToMany(Cart, { through: CartItem, foreignKey: 'product_id' });

// 5. Relación Usuario -> Carrito
User.hasOne(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });


// 6. Orden y OrderItems
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// 7. Wishlist
User.belongsToMany(Product, { through: Wishlist, foreignKey: 'user_id' });
Product.belongsToMany(User, { through: Wishlist, foreignKey: 'product_id' });

// Exportar todo junto si quieres
export { User, Product, Review, Cart, CartItem, Order, OrderItem, Wishlist };