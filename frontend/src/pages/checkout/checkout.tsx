import { useSearchParams } from "react-router-dom";
import { useCartStore } from "@/lib/useCartStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLogto } from "@logto/react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { COUNTRY_LIST } from "@/lib/countries";

// 定义地址接口
interface Address {
  id: number;
  tag: string;
  recipient_name: string;
  phone: string;
  country_code: string;
  zip_code: string;
  state: string | null;
  city: string | null;
  address_line: string;
  is_default: number;
}

const CheckoutPage = () => {
  const { getIdTokenClaims, isAuthenticated, getAccessToken } = useLogto();
  const [userId, setUserId] = useState<string>("");
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method") || "card";
  const ids = searchParams.get("ids") || "";
  const selectedIdSet = new Set(ids.split(","));
  const navigate = useNavigate();
  const getCountryName = (code: string) => {
  return COUNTRY_LIST.find(c => c.code === code)?.label || code;
};

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const { cartItems, refreshCart } = useCartStore();

  const checkoutItems = cartItems.filter((item) =>
    selectedIdSet.has(item.product_id),
  );
  const subtotal = checkoutItems.reduce(
    (acc, item) => acc + item.final_price * item.quantity,
    0,
  );

  useEffect(() => {
    const allowedMethods = ["card", "qr"];
    if (!allowedMethods.includes(method)) {
      alert("Payment method unavailable.");
      navigate("/");
    }
  }, [method, navigate]);

  useEffect(() => {
    const initCheckout = async () => {
      if (isAuthenticated) {
        const claims = await getIdTokenClaims();
        const token = await getAccessToken();
        if (claims?.sub) {
          setUserId(claims.sub);
          refreshCart(claims.sub);

          try {
            setIsAddressLoading(true);
            const res = await fetch(
              `${BACKEND_URL}/addresses/getAddresses?logto_id=${claims.sub}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            if (res.ok) {
              const data = await res.json();
              setAddresses(data);
              const defaultAddr = data.find((a: Address) => a.is_default === 1);
              if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            }
          } catch (err) {
            console.error("Fetch addresses failed", err);
          } finally {
            setIsAddressLoading(false);
          }
        }
      }
    };
    initCheckout();
  }, [
    isAuthenticated,
    getIdTokenClaims,
    refreshCart,
    getAccessToken,
    BACKEND_URL,
  ]);

  const navigateToOrderSubmit = async () => {
    if (!selectedAddressId) {
      alert("Please select a shipping address first!");
      return;
    }
    try {
      const token = await getAccessToken();
      const orderPayload = {
        user_id: userId,
        address_id: selectedAddressId,
        currency: checkoutItems[0]?.symbol || "USD",
        total_price: subtotal,
        items: checkoutItems.map((item) => ({
          product_id: item.product_id,
          product_name: item.title,
          image_url: item.image_url,
          quantity: item.quantity,
          unit_price: item.final_price,
        })),
      };

      const response = await fetch(`${BACKEND_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) throw new Error("Payment failed");
      const data = await response.json();
      navigate("/order-success", { state: { orderNo: data.order_no } });
    } catch (error) {
      console.error(error);
      alert("Payment failed, please try again.");
    }
  };

  const methodNames: Record<string, string> = {
    card: "Credit/Debit Card",
    qr: "QR Code",
  };

  if (cartItems.length === 0) {
    return <div className="p-20 text-center">Cart is Empty.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6 border rounded-lg max-w-4xl mx-auto mt-10">
      {/* 恢复原标题风格 */}
      <h2 className="text-xl font-bold">Checkout Confirmation</h2>

      {/* 订单预览区域 (原风格) */}
      <div className="border rounded-lg p-6 w-full bg-muted/30">
        {checkoutItems.map((item) => (
          <div
            key={item.product_id}
            className="flex justify-between py-4 border-b last:border-0"
          >
            <span>
              {item.title} (x{item.quantity})
            </span>
            <span>
              {item.symbol}
              {item.final_price * item.quantity}
            </span>
          </div>
        ))}
        <div className="flex justify-between mt-4 font-bold text-lg">
          <span></span>
          <span>
            Total:&nbsp;&nbsp;{checkoutItems[0]?.symbol}
            {subtotal}
          </span>
        </div>
      </div>

      {/* 地址选择区域 (无缝嵌入) */}
      <div className="w-full space-y-3">
        <label className="text-sm font-semibold flex items-center gap-2">
          <MapPin size={16} /> Shipping Address
        </label>
        {isAddressLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse">
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-sm p-4 border rounded-lg border-dashed text-center text-muted-foreground">
            No address found.{" "}
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              Add One
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => setSelectedAddressId(addr.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all flex justify-between items-center ${
                  selectedAddressId === addr.id
                    ? "border-foreground bg-accent/50 shadow-sm"
                    : "bg-background border-input"
                }`}
              >
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {addr.tag}
                    </span>
                    <p className="text-muted-foreground text-xs">
                      {addr.zip_code}, {addr.address_line}, {addr.city}, {getCountryName(addr.country_code)} 
                    </p>
                  </div>
                  <div className="gap-5 flex items-center">
                    <span className="font-bold">{addr.recipient_name}</span>
                    <span className="text-muted-foreground">{addr.phone}</span>
                  </div>
                </div>
                {selectedAddressId === addr.id && (
                  <CheckCircle2
                    size={18}
                    className="text-foreground shrink-0"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 支付方式与提交按钮 (恢复原布局) */}
      <p className="text-muted-foreground">
        Pay method:{" "}
        <span className="font-semibold text-foreground">
          {methodNames[method]}
        </span>
      </p>

      <div className="w-full space-y-3">
        {method === "card" && (
          <div className="flex flex-col items-center justify-center w-full space-y-4">
            <span className="text-sm text-center text-muted-foreground">
              For safety reason, we don't support card info saving. <br />
              Please input or use data saving function of browser. Thanks!
            </span>
            <Button
              disabled={!selectedAddressId || isAddressLoading}
              className="w-full max-w-[280px] bg-green-600 hover:bg-green-700"
              onClick={navigateToOrderSubmit}
            >
              Pay with Credit Card
            </Button>
          </div>
        )}

        {method === "qr" && (
          <div className="flex justify-center w-full">
            <Button
              disabled={!selectedAddressId || isAddressLoading}
              className="w-full max-w-[280px] bg-green-600 hover:bg-green-700"
              onClick={navigateToOrderSubmit}
            >
              Scan QR to Pay
            </Button>
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => window.history.back()}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
