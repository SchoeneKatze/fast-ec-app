import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  // Package,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";

export interface ProductCardProps {
  product_id: string;
  title: string;
  category_name: string;
  base_price: number;
  discount_rate: number;
  tax_rate: number;
  final_price: number;
  image_url?: string;
  stock_status: string;
  symbol: string;
  final_no_discount_price_for_show: number;
  is_show_inclusive: boolean;
}

export function ProductCard({
  title,
  final_price,
  discount_rate,
  stock_status,
  symbol,
  final_no_discount_price_for_show,
  is_show_inclusive,
}: ProductCardProps) {
  // 折扣显示逻辑：如果 discount 是 0.85，显示 15% Off
  const discountPercent = Math.round((1 - discount_rate) * 100);

  const [productAmount, setProductAmount] = useState(1);

  const plusAmount = () => {
    setProductAmount((prev) => prev + 1);
  };
  const minusAmount = () => {
    setProductAmount((prev) => prev - 1);
  };

  return (
    <Card className="overflow-hidden bg-background">
      <div className="relative">
        <div className="w-full h-40 bg-muted flex items-center justify-center">
          {/* <Package className="h-12 w-12 text-muted-foreground" /> */}
          <img className="h-12 w-12 text-muted-foreground" />
        </div>
        {discount_rate < 1 && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-medium">
            {discountPercent}% Off
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium mb-1 line-clamp-2">{title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-primary font-bold">
            {symbol}
            {final_price}
            {is_show_inclusive ? " (Tax in)" : ""}
          </span>
          {discount_rate < 1 && (
            <span className="text-xs text-muted-foreground line-through">
              {symbol}
              {final_no_discount_price_for_show}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8 bg-transparent"
            onClick={minusAmount}
            disabled={stock_status === "out_of_stock"}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span id="productAmount" className="font-medium">
            {productAmount}
          </span>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-8 w-8 bg-transparent"
            onClick={plusAmount}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button className="w-full" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
