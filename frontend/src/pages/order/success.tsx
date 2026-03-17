import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderNo = location.state?.orderNo || "UNKNOWN";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4">
        ✓
      </div>
      <h2 className="text-2xl font-bold">Payment Successful!</h2>
      <p className="text-muted-foreground">
        Your order <span className="font-semibold text-foreground">{orderNo}</span> has been created.<br />
        An email confirmation has been sent to you.
      </p>
      <div className="flex space-x-4 mt-8">
        <Button onClick={() => navigate("/order-history")}>View Order History</Button>
        <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    </div>
  );
};
