import { DataTypes } from 'sequelize';
import sequelize from '../index.js';

const CartItem = sequelize.define('CartItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    }
}, { tableName: 'cart_items', timestamps: false });

export default CartItem;