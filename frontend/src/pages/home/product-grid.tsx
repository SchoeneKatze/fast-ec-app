import { ProductCard } from "./product-card"
import { useState, useEffect } from "react"

const products = [
  {
    title: "Wireless Bluetooth Headphones",
    price: 89.99,
    discount: 20,
    category: "electronics",
  },
  {
    title: "Organic Cotton T-Shirt - Navy Blue",
    price: 29.99,
    category: "clothing",
  },
  {
    title: "Smart LED Desk Lamp with USB Charging",
    price: 45.99,
    category: "home",
  },
  {
    title: "Running Shoes - Lightweight Mesh",
    price: 79.99,
    discount: 15,
    category: "sports",
  },
  {
    title: "Natural Face Moisturizer 50ml",
    price: 24.99,
    category: "beauty",
  },
  {
    title: "Portable Power Bank 10000mAh",
    price: 35.99,
    category: "electronics",
  },
  {
    title: "Yoga Mat - Non-Slip Surface",
    price: 32.99,
    category: "sports",
  },
  {
    title: "Stainless Steel Water Bottle 750ml",
    price: 19.99,
    discount: 10,
    category: "home",
  },
]

export function ProductGrid() {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
      {products.map((item, index) => (
        <ProductCard key={index} {...item} />
      ))}
    </div>
  )
}
