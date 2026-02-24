import { toast } from "@/components/ui/use-toast";
import { create } from "zustand";

export interface CartItem {
  id?: number;
  product_id: string;
  user_id: string;
  title: string;
  quantity: number;
  symbol: string;
  final_price: number;
  final_no_discount_price_for_show: number;
  image_url?: string;
  stock_status?: string;
  is_show_inclusive: boolean;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface CartStore {
  cartItems: CartItem[];
  refreshCart: () => Promise<void>;
  addOptimistically: (item: CartItem) => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],

  refreshCart: async () => {
    const response = await fetch(`${BACKEND_URL}/cart/list`);
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
              ? { ...i, quantity: i.quantity + newItem.quantity }
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
      const response = await fetch(`${BACKEND_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: newItem.user_id,
          product_id: newItem.product_id,
          quantity: newItem.quantity,
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
                quantity: serverItem.quantity,
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
