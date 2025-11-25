import { useState, useEffect } from "react";
import Chip from "../components/Chip";
import ListaProductos from "../components/ListaProductos";
import BentoHero from "../section/BentoHero";
import MarcasCarrusel from "../section/MarcasCarrusel";

const Index = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/products');
                const data = await response.json();

                // Adaptador de datos (DB -> Frontend)
                const productosAdaptados = data.map(dbProduct => {
                    const variantesDB = dbProduct.ProductVariants || [];
                    const stockTotal = variantesDB.reduce((acc, curr) => acc + curr.stock, 0);
                    const precio = variantesDB.length > 0 ? parseFloat(variantesDB[0].price) : parseFloat(dbProduct.price);

                    // Reconstruir estructura para filtros
                    const atributosMap = {};
                    variantesDB.forEach(v => {
                        if (v.VariantAttributes) {
                            v.VariantAttributes.forEach(attr => {
                                const tipo = attr.attribute_name.toLowerCase();
                                const valor = attr.attribute_value;
                                if (!atributosMap[tipo]) atributosMap[tipo] = new Set();
                                atributosMap[tipo].add(valor);
                            });
                        }
                    });

                    const variantesFrontend = Object.entries(atributosMap).map(([tipo, setOpciones]) => ({
                        tipo,
                        opciones: Array.from(setOpciones)
                    }));

                    const imagenPrincipal = dbProduct.ProductImages?.[0]?.image_url || "/image/placeholder.png";

                    return {
                        id: dbProduct.id,
                        nombre: dbProduct.name,
                        categoria: dbProduct.category,
                        precio: { regular: precio, oferta: null },
                        imgs: [{ url: imagenPrincipal, alt: dbProduct.name }],
                        stock: { disponible: stockTotal, bajo_stock: stockTotal < 5 },
                        variantes: variantesFrontend,
                    };
                });

                // Seleccionar 8 productos aleatorios
                const shuffled = [...productosAdaptados].sort(() => Math.random() - 0.5);
                const randomProducts = shuffled.slice(0, 8);

                setProductos(randomProducts);
            } catch (error) {
                console.error("Error cargando productos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    return (
        <>
            <BentoHero />
            <MarcasCarrusel />
            {loading ? (
                <div className="py-8 text-center text-text-500">Cargando productos...</div>
            ) : (
                <ListaProductos productos={productos} titulo="Nuevos Llegados" />
            )}
        </>
    );
};

export default Index;
