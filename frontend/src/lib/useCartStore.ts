import { toast } from "@/components/ui/use-toast";
import { useLogto } from "node_modules/@logto/react/lib/hooks";
import { create } from "zustand";

export interface CartItem {
  id?: number;
  product_id: string;
  user_id: number;
  title: string;
  productAmount: number;
  symbol: string;
  final_price: number;
  final_no_discount_price_for_show: number;
  image_url?: string;
  stock_status?: string;
  is_show_inclusive: boolean;
}

interface CartStore {
  cartItems: CartItem[];
  refreshCart: () => Promise<void>;
  addOptimistically: (item: CartItem) => Promise<void>;
}

const { getIdTokenClaims } = useLogto();

const claims = await getIdTokenClaims();
console.log("Logto claims:", claims);

if (claims) {
  const response = await fetch(`${BACKEND_URL}/auth/getMe`, {
    headers: {
      Authorization: `Bearer ${await getIdToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to get user info");
  }
  const userData = await response.json();
  user_id = userData.logto_id;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],

  refreshCart: async () => {
    const response = await fetch("/api/cart/list");
    const data = await response.json();
    set({ cartItems: data });
  },

  addOptimistically: async (newItem) => {
    const previousCart = get().cartItems;

    set((state) => {
      const existing = state.cartItems.find(
        (i) => i.product_id === newItem.product_id,
      );
      if (existing) {
        toast({
          title: "Quantity Updated",
          description: `${newItem.title.substring(0, 15)}... is already in cart. Amount +1`,
          variant: "default",
        });
        return {
          cartItems: state.cartItems.map((i) =>
            i.product_id === newItem.product_id
              ? { ...i, productAmount: i.productAmount + newItem.productAmount }
              : i,
          ),
        };
      }
      toast({
        title: "Added to Cart",
        description: `${newItem.title.substring(0, 15)}... added successfully.`,
      });
      return {
        cartItems: [...state.cartItems, { ...newItem, id: Math.random() }],
      };
    });

    try {
      const response = await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: newItem.product_id,
          productAmount: newItem.productAmount,
        }),
      });

      if (!response.ok) throw new Error("Failed to add");

      const serverItem = await response.json();

      set((state) => ({
        cartItems: state.cartItems.map((i) =>
          i.product_id === serverItem.product_id
            ? {
                ...i,
                id: serverItem.id,
                productAmount: serverItem.productAmount,
              }
            : i,
        ),
      }));
    } catch (error) {
      set({ cartItems: previousCart });
      console.error("Cart error:", error);
    }
  },
}));
function getIdTokenClaims() {
  throw new Error("Function not implemented.");
}
