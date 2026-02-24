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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface CartStore {
  cartItems: CartItem[];
  refreshCart: (user_id: string) => Promise<void>;
  addOptimistically: (item: CartItem) => Promise<void>;
  updateQuantity: (
    productId: string,
    newAmount: number,
    user_id: string,
  ) => Promise<void>;
  removeItem: (productId: string, user_id: string) => Promise<void>;
  totalFinalPrice: number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],
  totalFinalPrice: 0,

  refreshCart: async (user_id: string) => {
    if (!user_id) return;

    try {
      // const geoRes = await fetch("https://ipapi.co/json/");
      // const geoData = await geoRes.json();
      // const countryCode = geoData.country_code || "US";
      const countryCode = "JP";

      const response = await fetch(
        `${BACKEND_URL}/cart/list?user_id=${user_id}&country_code=${countryCode}`,
      );
      const data = await response.json();

      // 加上保护，确保 data 是数组，否则 filter 会报错
      if (response.ok && data && Array.isArray(data.cart_list)) {
        set({
          cartItems: data.cart_list,
          totalFinalPrice: data.total_final_price,
        });
      } else {
        set({
          cartItems: [],
          totalFinalPrice: 0,
        });
      }
    } catch (error) {
      set({ cartItems: [], totalFinalPrice: 0 });
      console.error("Failed to refresh cart:", error);
      toast({
        title: "Failed to refresh cart",
      });
    }
  },

  addOptimistically: async (newItem) => {
    const previousCart = get().cartItems;
    const existing = previousCart.find(i => i.product_id === newItem.product_id);

    if (existing) {
      set((state) => ({
        cartItems: state.cartItems.map((i) =>
          i.product_id === newItem.product_id ? { ...i, quantity: i.quantity + newItem.quantity } : i
        ),
      }));
      toast({ title: "Already in Cart, Quantity +1" });
      return; 
    }

    set((state) => ({
      cartItems: [...state.cartItems, { ...newItem, id: Math.random() }],
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: newItem.user_id,
          product_id: newItem.product_id,
          quantity: newItem.quantity,
          finally_price: newItem.final_price,
        }),
      });

      if (!response.ok) throw new Error("Failed to add");

      const serverItem = await response.json();
      set((state) => ({
        cartItems: state.cartItems.map((i) =>
          i.product_id === serverItem.product_id ? { ...i, id: serverItem.id } : i
        ),
      }));

      toast({
        title: `"${newItem.title.substring(0, 20)}..." added successfully.`,
      });

    } catch (error) {
      set({ cartItems: previousCart });
      console.error("Cart error:", error);
      toast({ title: "Failed to add", variant: "destructive" });
    }
  },

  updateQuantity: async (productId, newAmount, user_id) => {
    const previousCart = get().cartItems;

    set((state) => ({
      cartItems: state.cartItems.map((i) =>
        i.product_id === productId ? { ...i, quantity: newAmount } : i,
      ),
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/cart/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity: newAmount,
          user_id: user_id,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");
      await get().refreshCart(user_id);
    } catch (error) {
      set({ cartItems: previousCart });
      console.error("Cart error:", error);
    }
  },

  removeItem: async (productId, user_id) => {
    const previousCart = get().cartItems;

    set((state) => ({
      cartItems: state.cartItems.filter((i) => i.product_id !== productId),
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/cart/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          user_id: user_id,
        }),
      });

      if (!response.ok) {
        const errorDetail = await response.json();
        console.error("Validation Error Details:", errorDetail);
        toast({
          title: "Remove Failed",
        });
        throw new Error("Failed to update");
      }
      await get().refreshCart(user_id);
    } catch (error) {
      set({ cartItems: previousCart });
      console.error("Cart error:", error);
    }
    toast({
      title: "Removed from Cart successfully.",
    });
  },
}));
