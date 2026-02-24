import { Button } from "@/components/ui/button";
import {
  CreditCard,
  QrCode,
  Truck,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/useCartStore";
import { useLogto } from "@logto/react";

interface CartProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAfterLogin: boolean;
}

export function Cart({
  isCollapsed,
  onToggle,
  isAuthenticated,
  showAfterLogin,
}: CartProps) {
  const { getIdTokenClaims } = useLogto();
  const cartItems = useCartStore((state) => state.cartItems);
  const refreshCart = useCartStore((state) => state.refreshCart);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const initCart = async () => {
      if (isAuthenticated) {
        try {
          const claims = await getIdTokenClaims();
          console.log("Logto claims:", claims);
          const logto_id = claims?.sub;
          if (claims?.sub) setUserId(claims.sub);
          if (logto_id) {
            refreshCart(logto_id);
          }
        } catch (err) {
          console.error("User initialization error:", err);
        }
      }
    };
    initCart();
  }, [isAuthenticated, getIdTokenClaims, refreshCart]);

  const activeItems = cartItems.filter(
    (item) => item.stock_status !== "out_of_stock",
  );

  const totalItems = activeItems.reduce((acc, item) => acc + item.quantity, 0);

  const rawSubtotal = activeItems.reduce(
    (acc, item) => acc + item.final_price * item.quantity,
    0,
  );

  const firstItemPrice = activeItems[0]?.final_price.toString() || "";
  const decimalMatches = firstItemPrice.match(/\.(\d+)/);
  const precision = decimalMatches ? decimalMatches[1].length : 0;

  const subtotal =
    Math.floor(rawSubtotal * Math.pow(10, precision)) / Math.pow(10, precision);

  const currencySymbol = cartItems.length > 0 ? cartItems[0].symbol : "$";

  if (isCollapsed) {
    return (
      <div className="w-16 bg-background border-l flex flex-col items-center py-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="relative"
          disabled={!showAfterLogin}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {isAuthenticated ? totalItems : 0}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-[380px] bg-background border-l flex flex-col h-full shrink-0">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Cart</h2>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {cartItems.map((item, index) => (
          <div
            key={item.id || index}
            className={`flex items-center gap-3 mb-4 ${item.stock_status === "out_of_stock" ? "opacity-40" : ""}`}
          >
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium line-clamp-2">{item.title}</h4>
              {/* remove button */}
              <button
                onClick={() =>
                  useCartStore.getState().removeItem(item.product_id, userId)
                }
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="flex justify-between items-center mt-1">
                <span className="text-primary font-bold">
                  {item.symbol}
                  {item.final_price}
                </span>

                {/* quantity button of cart */}
                <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1">
                  <button
                    onClick={() => {
                      if (item.quantity > 1) {
                        useCartStore
                          .getState()
                          .updateQuantity(
                            item.product_id,
                            item.quantity - 1,
                            userId,
                          );
                      } else {
                        useCartStore
                          .getState()
                          .removeItem(item.product_id, userId);
                      }
                    }}
                    className="hover:text-primary transition-colors"
                  >
                    <Minus className="h-3 w-3" />
                  </button>

                  <span className="text-xs font-semibold w-4 text-center">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      useCartStore
                        .getState()
                        .updateQuantity(
                          item.product_id,
                          item.quantity + 1,
                          userId,
                        )
                    }
                    className="hover:text-primary transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Total Quantity</span>
            <span> X {totalItems}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-muted-foreground">Sub Total</span>
            <span>
              {currencySymbol}
              {subtotal}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 px-2 bg-transparent"
          >
            <Truck className="h-5 w-5 mb-1 flex-shrink-0" />
            <span className="text-xs text-center leading-tight">
              Cash on Delivery
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 px-2 bg-transparent"
          >
            <CreditCard className="h-5 w-5 mb-1 flex-shrink-0" />
            <span className="text-xs text-center leading-tight">
              Credit/Debit Card
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center h-16 px-2 bg-transparent"
          >
            <QrCode className="h-5 w-5 mb-1 flex-shrink-0" />
            <span className="text-xs text-center leading-tight">QR Code</span>
          </Button>
        </div>

        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
          disabled={!showAfterLogin || totalItems === 0}
        >
          Purchase
        </Button>
      </div>
    </div>
  );
}
