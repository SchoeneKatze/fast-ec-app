import { useSearchParams } from "react-router-dom";
import { useCartStore } from "@/lib/useCartStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLogto } from "@logto/react";

const CheckoutPage = () => {
  const { getIdTokenClaims, isAuthenticated } = useLogto();
  const [userId, setUserId] = useState<string>("");
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method") || "card";
  const ids = searchParams.get("ids") || "";
  const selectedIdSet = new Set(ids.split(","));
  const navigate = useNavigate();

  const {
    cartItems,
    refreshCart,
    // totalFinalPrice,
  } = useCartStore();

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
    const getUserId = async () => {
      if (isAuthenticated) {
        const claims = await getIdTokenClaims();
        if (claims?.sub) {
          setUserId(claims.sub);
          refreshCart(claims.sub);
        }
      }
    };
    getUserId();
  }, [isAuthenticated, getIdTokenClaims, refreshCart]);

  const navigateToOrderSubmit = () => {
    navigate("/");
    // navigate(`/orderSubmit/${method}`, { state: { method } });
  };

  const methodNames: Record<string, string> = {
    card: "Credit/Debit Card",
    qr: "QR Code",
    // cash: "Cash on Delivery",
  };

  if (cartItems.length === 0) {
    return <div>Cart is Empty. Please Go Back and try again.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-10 space-y-6 border rounded-lg max-w-4xl mx-auto mt-10">
      <h2 className="text-xl font-bold">Checkout Confirmation</h2>

      <div className="border rounded-lg p-6 mb-6 w-full bg-muted/30">
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
            Total:&nbsp;&nbsp;
            {checkoutItems[0]?.symbol}
            {subtotal}
          </span>
        </div>
      </div>

      <p className="text-muted-foreground">
        Pay method:{" "}
        <span className="font-semibold text-foreground">
          {methodNames[method]}
        </span>
      </p>
      <div className="w-full space-y-3">
        {/* {method === "cash" && (
          <div className="flex justify-center w-full">
            <Button
              className="w-full max-w-[280px] bg-green-600"
              onClick={navigateToOrderSubmit}
            >
              Confirm Order (Cash on Delivery)
            </Button>
          </div>
        )} */}

        {method === "card" && (
          <div className="flex flex-col items-center justify-center w-full space-y-4">
            <span>
              For safety reason, we don't support card info saving. <br />
              Please input or use data saving function of browser. Thanks!
            </span>
            <Button
              className="w-full max-w-[280px] bg-green-600"
              onClick={navigateToOrderSubmit}
            >
              Pay with Credit Card
            </Button>
          </div>
        )}

        {method === "qr" && (
          <div className="flex justify-center w-full">
            <Button
              className="w-full max-w-[280px] bg-green-600"
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
          Back to Cart
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
