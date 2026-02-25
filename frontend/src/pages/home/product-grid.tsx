import { ProductCard, type ProductCardProps } from "./product-card";
import { useState, useEffect } from "react";

export function ProductGrid() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const geoRes = await fetch("https://ipapi.co/json/");
        // const geoData = await geoRes.json();
        // const countryCode = geoData.country_code || "US";
        const countryCode = "CN";

        const productRes = await fetch(
          `${BACKEND_URL}/products/${countryCode}/productCards`,
        );
        const data = await productRes.json();

        setProducts(data);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [BACKEND_URL]);

  if (loading)
    return <div className="p-10 text-center">Loading products...</div>;
  if (products.length === 0)
    return <div className="p-10 text-center">No products found.</div>;
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
    >
      {products.map((item) => (
        <ProductCard key={item.product_id} {...item} />
      ))}
    </div>
  );
}
