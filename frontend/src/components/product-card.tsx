import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Package, ShoppingCart } from "lucide-react"

interface ProductCardProps {
  title: string
  price: number
  discount?: number
  category: string
}

export function ProductCard({ title, price, discount }: ProductCardProps) {
  const discountedPrice = discount ? price * (1 - discount / 100) : price

  return (
    <Card className="overflow-hidden bg-background">
      <div className="relative">
        <div className="w-full h-40 bg-muted flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        {discount && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-medium">
            {discount}% Off
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium mb-1 line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary font-bold">${discountedPrice.toFixed(2)}</span>
          {discount && (
            <span className="text-xs text-muted-foreground line-through">${price.toFixed(2)}</span>
          )}
        </div>
        <div className="flex items-center justify-between mb-2">
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8 bg-transparent">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="font-medium">1</span>
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8 bg-transparent">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  )
}
