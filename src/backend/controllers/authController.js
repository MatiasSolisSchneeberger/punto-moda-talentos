import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/asociaciones.js";
import { where } from "sequelize";

const SECRET_KEY = "mi_clave_secreta"; // esto tiene que ir en un .env obvio

// 1ro REGISTRO 

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // veridicar si existe
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: "Usuario ya registrado" });
        }

        // encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // crear usuario
        const newUser = await User.create({ name, email, password: hashedPassword });

        // generar token
        const token = jwt.sign({ id: newUser.id }, SECRET_KEY, { expiresIn: "1h" });

        // Devolver solo datos seguros del usuario (sin password)
        const user = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            img: `https://i.pravatar.cc/150?u=${newUser.email}`
        };

        res.status(201).json({ user, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al registrar usuario" });
    }
}

// 2do LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // verificar si existe
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ message: "Usuario no encontrado" });
        }

        // verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Contraseña incorrecta" });
        }

        // generar token
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });

        // Devolver solo datos seguros del usuario (sin password)
        const safeUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            img: `https://i.pravatar.cc/150?u=${user.email}`
        };

        res.status(200).json({ user: safeUser, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
}
