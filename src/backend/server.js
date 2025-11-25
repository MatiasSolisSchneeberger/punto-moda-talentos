import express from 'express';
import cors from 'cors';
import sequelize from './index.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

/* --- Rutas --- */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        console.log('Conectado a la base de datos');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
    }
})