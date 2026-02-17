import { ProductCard, type ProductCardProps } from "./product-card"
import { useState, useEffect } from "react"

export function ProductGrid() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [products, setProducts] = useState<ProductCardProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const countryCode = "CN" 
    
    fetch(`${BACKEND_URL}/products/${countryCode}/productCards`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Products load error:", err)
        setLoading(false)
      })
  }, [BACKEND_URL])

  if (loading) return <div className="p-10 text-center">Loading products...</div>
  if (products.length === 0) return <div className="p-10 text-center">No products found.</div>  
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
      {products.map((item) => (
        <ProductCard key={item.product_id} {...item} />
      ))}
    </div>
  )
}
