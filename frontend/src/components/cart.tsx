"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, QrCode, Truck, ShoppingCart, X } from "lucide-react"

const cartItems = [
  { title: "Wireless Bluetooth Headphones with Noise Cancellation", price: 89.99, quantity: 1 },
  { title: "Organic Cotton T-Shirt - Navy Blue (Size M)", price: 29.99, quantity: 2 },
  { title: "Stainless Steel Water Bottle 750ml", price: 24.99, quantity: 1 },
  { title: "Running Shoes - Lightweight Mesh Design", price: 79.99, quantity: 1 },
]

interface CartProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Cart({ isCollapsed, onToggle }: CartProps) {
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax

  if (isCollapsed) {
    return (
      <div className="w-16 bg-background border-l flex flex-col items-center py-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle}
          className="relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[380px] bg-background border-l flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Cart</h2>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {cartItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium line-clamp-2">{item.title}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">{item.quantity}X</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sub Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax 5%</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Amount</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button variant="outline" className="flex flex-col items-center justify-center h-16 px-2 bg-transparent">
            <Truck className="h-5 w-5 mb-1 flex-shrink-0" />
            <span className="text-xs text-center leading-tight">Cash on Delivery</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center justify-center h-16 px-2 bg-transparent">
            <CreditCard className="h-5 w-5 mb-1 flex-shrink-0" />
            <span className="text-xs text-center leading-tight">Credit/Debit Card</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center justify-center h-16 px-2 bg-transparent">
            <QrCode className="h-5 w-5 mb-1 flex-shrink-0" />
            <span className="text-xs text-center leading-tight">QR Code</span>
          </Button>
        </div>
        
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12">
          Purchase
        </Button>
      </div>
    </div>
  )
}
