import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLogto } from "@logto/react";
import { ShoppingBag } from "lucide-react";

const REFUND_WINDOW_DAYS = 10;

interface OrderItem {
  product_id: string;
  product_name: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  orderNo: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  currency: string;
  items: OrderItem[];
}

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { getAccessToken } = useLogto();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 默认当前年月 (2026-02)
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const [year, month] = filterMonth.split("-");
      
      const response = await fetch(`/api/orders?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, getAccessToken]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const checkIsRefundable = (dateString: string) => {
    const orderDate = new Date(dateString);
    const now = new Date(); // 根据当前设备时间 (2026-02-26)
    const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= REFUND_WINDOW_DAYS;
  };

  const backToHome = () => navigate("/");

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">{/* Fixed Header with Logo */}
      <div className="flex items-center border-b bg-background">
        <div
          className="flex items-center gap-2 px-4 py-3 border-r w-fit shrink-0"
          onClick={backToHome}
          style={{ cursor: "pointer" }}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">MyShop</span>
        </div>
      </div>
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">Order History</h1>
        <input 
          type="month" 
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border rounded p-2 bg-background" 
        />
      </div>

      {loading ? <p>Loading orders...</p> : (
        <div className="space-y-6">
          {orders.length === 0 && <p className="text-muted-foreground">No orders found for this month.</p>}
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
              <div className="flex justify-between border-b pb-4 mb-4 text-sm text-muted-foreground">
                <div>
                  <p>Order No: <span className="font-mono text-foreground">{order.orderNo}</span></p>
                  <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{order.status}</p>
                  <p>Total: {order.currency}{order.totalPrice}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>{order.currency}{item.unit_price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => navigate(`/contact-support/${order.orderNo}`)}>
                  Contact Support
                </Button>
                {checkIsRefundable(order.createdAt) ? (
                  <Button variant="destructive" onClick={() => navigate(`/refund/${order.orderNo}`, { state: { order }})}>
                    Apply Refund
                  </Button>
                ) : (
                  <Button variant="secondary" disabled title={`Refunds only available within ${REFUND_WINDOW_DAYS} days`}>
                    Refund Expired
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
