import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import ButtonIcon from "../components/ButtonIcon";
import { IconArrowRight, IconBuildingBank, IconCash, IconCreditCard, IconTrash } from "@tabler/icons-react";


const Carrito = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState("cash");

    // 1. Cargo el carrito desde la base de datos
    const fetchCart = async () => {
        const userStored = localStorage.getItem("user");
        if (!userStored) return

        const user = JSON.parse(userStored);

        try {
            const response = await fetch(`http://localhost:3000/api/cart/${user.id}`);
            const data = await response.json();
            setCart(data);
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCart();
    }, []);


    // 2. Función para Eliminar Ítem
    const handleRemoveItem = async (itemId) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;

        try {
            const response = await fetch(`http://localhost:3000/api/cart/remove/${itemId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Recargamos el carrito para ver los cambios
                fetchCart();
            } else {
                alert("Error al eliminar");
            }
        } catch (error) {
            console.error(error);
        }
    };


    // 3. Calcular Totales
    const subtotal = cart?.CartItems?.reduce((acc, item) => {
        const price = parseFloat(item.ProductVariant?.price || 0);
        return acc + (price * item.quantity);
    }, 0) || 0;

    const envio = 5000; // Precio fijo de envío (ejemplo)
    const total = subtotal + envio;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                Cargando carrito...
            </div>
        )
    };

    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
                <h2 className="texto-headline text-text-400">Tu carrito está vacío</h2>
                <Button href="/productos" style="primary">Ir a comprar</Button>
            </div>
        );
    }
    return (
        <section className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* --- LISTA DE PRODUCTOS (Izquierda) --- */}
            <div className="lg:col-span-8 flex flex-col gap-4">
                <h1 className="texto-headline text-text-900 dark:text-text-100 mb-2">
                    Tu Carrito
                </h1>

                <div className="flex flex-col gap-4">
                    {cart.CartItems.map((item) => {
                        const variant = item.ProductVariant;
                        const product = variant?.Product;
                        const image = product?.ProductImages?.[0]?.image_url || "/image/placeholder.png";

                        // Encontrar atributos (Color/Talle) para mostrarlos
                        const color = variant?.VariantAttributes?.find(a => a.attribute_name === 'Color')?.attribute_value;
                        const talle = variant?.VariantAttributes?.find(a => a.attribute_name === 'Talle')?.attribute_value;

                        return (
                            <article key={item.id} className="flex gap-4 p-3 rounded-3xl bg-background-100 dark:bg-background-900 border border-background-300 dark:border-background-700 shadow-sm">
                                {/* Imagen */}
                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-white">
                                    <img src={image} alt={product?.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="texto-title text-primary-600 dark:text-primary-400">
                                                {product?.name || "Producto"}
                                            </h3>
                                            <p className="texto-body text-text-500">
                                                {color && <span className="capitalize">{color}</span>}
                                                {talle && <span className="uppercase"> / {talle}</span>}
                                            </p>
                                        </div>
                                        <ButtonIcon style="danger" size="sm" onClick={() => handleRemoveItem(item.id)}>
                                            <IconTrash size={18} />
                                        </ButtonIcon>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <span className="texto-lable bg-background-200 dark:bg-background-800 px-2 py-1 rounded-lg font-medium">
                                            Cant: {item.quantity}
                                        </span>
                                        <span className="texto-title text-primary-600 dark:text-primary-400">
                                            ${(parseFloat(variant?.price) * item.quantity).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>

            {/* --- RESUMEN Y PAGO (Derecha) --- */}
            <aside className="lg:col-span-4 flex flex-col gap-6">

                {/* Tarjeta de Resumen */}
                <div className="bg-background-100 dark:bg-background-900 p-6 rounded-3xl border border-background-300 dark:border-background-700 shadow-sm sticky top-4">
                    <h2 className="texto-title mb-4">
                        Resumen de compra
                    </h2>

                    <div className="flex flex-col gap-2 mb-4 border-b border-background-300 dark:border-background-700 pb-4">
                        <div className="flex justify-between text-text-600 dark:text-text-300">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString('es-AR')}</span>
                        </div>
                        <div className="flex justify-between text-text-600 dark:text-text-300">
                            <span>Envío</span>
                            <span>${envio.toLocaleString('es-AR')}</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-xl font-bold text-text-900 dark:text-text-100 mb-6">
                        <span>Total</span>
                        <span>${total.toLocaleString('es-AR')}</span>
                    </div>

                    {/* Selección de Método de Pago */}
                    <div className="mb-6">
                        <h3 className="texto-label font-bold mb-2">Método de pago</h3>
                        <div className="flex flex-col gap-2">
                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all 
                            ${paymentMethod === 'credit_card'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-background-300 dark:border-background-700'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="credit_card"
                                    checked={paymentMethod === 'credit_card'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="accent-primary-600" />
                                <IconCreditCard className="text-primary-600" />
                                <span className="font-medium">
                                    Tarjeta de Crédito/Débito
                                </span>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all 
                            ${paymentMethod === 'mercado_pago'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-background-300 dark:border-background-700'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="mercado_pago"
                                    checked={paymentMethod === 'mercado_pago'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="accent-primary-600" />
                                <IconBuildingBank className="text-info-600" />
                                <span className="font-medium">
                                    Mercado Pago
                                </span>
                            </label>

                            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all 
                            ${paymentMethod === 'cash'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-background-300 dark:border-background-700'}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="cash"
                                    checked={paymentMethod === 'cash'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="accent-primary-600" />
                                <IconCash className="text-success-600" />
                                <span className="font-medium">
                                    Efectivo / Transferencia
                                </span>
                            </label>
                        </div>
                    </div>

                    <Button
                        style="primary"
                        className="w-full justify-center py-3"
                        iconRight={<IconArrowRight />}>
                        Finalizar Compra
                    </Button>
                </div>
            </aside>
        </section>
    );
}

export default Carrito;