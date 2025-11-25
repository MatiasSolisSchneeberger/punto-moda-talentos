import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardProducto from "../components/CardProducto";
import FiltrosProductos from "../components/FiltrosProductos";
import Button from '../components/Button';

function Productos() {
    const [searchParams] = useSearchParams();
    const [productos, setProductos] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);

    // 1. CARGAR DATOS DEL BACKEND
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                // Petición al servidor que creamos en el Paso 1
                const response = await fetch('http://localhost:3000/api/products');
                const data = await response.json();

                // --- ADAPTADOR DE DATOS (DB -> Frontend) ---
                const productosAdaptados = data.map(dbProduct => {
                    // a. Calcular Stock total y Precio desde las variantes
                    const variantesDB = dbProduct.ProductVariants || [];
                    const stockTotal = variantesDB.reduce((acc, curr) => acc + curr.stock, 0);
                    // Usamos el precio de la primera variante, o el base si no hay variantes
                    const precio = variantesDB.length > 0 ? parseFloat(variantesDB[0].price) : parseFloat(dbProduct.price);

                    // b. Reconstruir estructura para filtros (Agrupar Talles y Colores)
                    const atributosMap = {};

                    variantesDB.forEach(v => {
                        if (v.VariantAttributes) {
                            v.VariantAttributes.forEach(attr => {
                                const tipo = attr.attribute_name.toLowerCase(); // ej: 'talle'
                                const valor = attr.attribute_value;             // ej: 'M'

                                if (!atributosMap[tipo]) atributosMap[tipo] = new Set();
                                atributosMap[tipo].add(valor);
                            });
                        }
                    });

                    // Convertir Sets a Arrays para el componente de filtros
                    const variantesFrontend = Object.entries(atributosMap).map(([tipo, setOpciones]) => ({
                        tipo,
                        opciones: Array.from(setOpciones)
                    }));

                    // c. Imagen principal (La primera de la lista o un placeholder)
                    const imagenPrincipal = dbProduct.ProductImages?.[0]?.image_url || "/image/placeholder.png";

                    // d. Objeto final listo para tus componentes
                    return {
                        id: dbProduct.id,
                        nombre: dbProduct.name,
                        categoria: dbProduct.category, // Asegurate que en DB se llame 'category' o 'categoria'
                        precio: { regular: precio, oferta: null },
                        imgs: [{ url: imagenPrincipal, alt: dbProduct.name }],
                        stock: { disponible: stockTotal, bajo_stock: stockTotal < 5 },
                        variantes: variantesFrontend,
                        id: dbProduct.id.toString() // Usamos ID como slug por ahora
                    };
                });

                setProductos(productosAdaptados);
                setFilteredProducts(productosAdaptados);
            } catch (error) {
                console.error("Error conectando con el backend:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, []);

    // Aplicar filtro de categoría desde URL al cargar
    useEffect(() => {
        const categoriaFromUrl = searchParams.get('categoria');
        if (categoriaFromUrl) {
            setFilters(prev => ({ ...prev, categoria: categoriaFromUrl }));
        }
    }, [searchParams]);

    // 2. LÓGICA DE FILTROS (Igual que antes)
    useEffect(() => {
        let result = productos;

        if (filters.categoria) {
            result = result.filter(p => p.categoria === filters.categoria);
        }

        if (filters.talle) {
            result = result.filter(p =>
                p.variantes?.some(v =>
                    v.tipo === 'talle' && v.opciones.includes(filters.talle)
                )
            );
        }

        if (filters.color) {
            result = result.filter(p =>
                p.variantes?.some(v =>
                    v.tipo === 'color' && v.opciones.includes(filters.color)
                )
            );
        }

        if (filters.minPrice) {
            result = result.filter(p => {
                const price = p.precio.oferta || p.precio.regular;
                return price >= Number(filters.minPrice);
            });
        }
        if (filters.maxPrice) {
            result = result.filter(p => {
                const price = p.precio.oferta || p.precio.regular;
                return price <= Number(filters.maxPrice);
            });
        }

        setFilteredProducts(result);
    }, [filters, productos]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-text-500">Cargando catálogo...</div>;

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {/* Sidebar Filters */}
            <aside className="row-span-2">
                <FiltrosProductos
                    productos={productos}
                    filters={filters}
                    setFilters={setFilters}
                />
            </aside>

            {/* Header */}
            <header className="sm:col-start-2 sm:col-end-6 texto-headline text-center text-text-800 dark:text-text-200">
                <h2>Resultados</h2>
            </header>

            {/* Lista de Productos */}
            <article className="sm:col-start-2 sm:col-end-6 sm:row-start-2 grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((producto, index) => (
                    <CardProducto key={index} producto={producto} />
                ))}

                {filteredProducts.length === 0 && (
                    <span className="col-span-6 flex flex-col items-center justify-center gap-4 py-10 text-gray-500 dark:text-gray-400">
                        <h3 className="texto-title text-text-800 dark:text-text-400">
                            No se encontraron productos.
                        </h3>
                        <Button
                            style="tertiary"
                            onClick={() => setFilters({})}
                        >
                            Limpiar filtros
                        </Button>
                    </span>
                )}
            </article>
        </section>
    );
}

export default Productos;