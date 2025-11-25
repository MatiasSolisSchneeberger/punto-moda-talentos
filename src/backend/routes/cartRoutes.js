import express from "express";
import { getCart, addToCart, removeCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/add", addToCart);
router.delete("/remove/:id", removeCartItem);

export default router;
