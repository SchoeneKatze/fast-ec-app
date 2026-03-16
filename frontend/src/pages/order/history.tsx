import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLogto } from "@logto/react";
import {
  ShoppingBag,
  // Calendar,
  // ArrowRight
} from "lucide-react";

const REFUND_WINDOW_DAYS = 10;

interface OrderItem {
  product_id: string;
  product_name: string;
  image_url?: string;
  quantity: number;
  unit_price: number;
}

interface AddressInfo {
  tag: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string | null;
  state: string | null;
  country_code: string;
  zip_code: string;
}

interface Order {
  id: number;
  orderNo: string;
  createdAt: string;
  status: string;
  totalPrice: number;
  currency: string;
  items: OrderItem[];
  address: AddressInfo| null;
}

interface RawOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  image_url?: string;
}

interface RawOrder {
  id: number;
  order_no: string;
  created_at: string;
  status: string;
  total_price: number;
  currency: string;
  items: RawOrderItem[];
  address: AddressInfo | null;
}

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const { getAccessToken, isAuthenticated, getIdTokenClaims } = useLogto();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // 日期区间状态
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 2. 修改 fetchOrders 内部的转换逻辑
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      const claims = await getIdTokenClaims();
      const logto_id = claims?.sub;

      let url = `${BACKEND_URL}/orders/history?user_id=${logto_id}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      // 关键改动：将 data.orders 显式断言为 RawOrder 数组
      const rawOrders: RawOrder[] = Array.isArray(data)
        ? data
        : data.orders || [];

      const formattedOrders: Order[] = rawOrders.map((o) => ({
        id: o.id,
        orderNo: o.order_no, // 明确从 order_no 映射到 orderNo
        createdAt: o.created_at,
        status: o.status,
        totalPrice: o.total_price,
        address: o.address,
        currency: o.currency || "$",
        items: o.items.map((i) => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          image_url: i.image_url,
        })),
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Fetch orders error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [
    startDate,
    endDate,
    getAccessToken,
    getIdTokenClaims,
    isAuthenticated,
    BACKEND_URL,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const checkIsRefundable = (dateString: string) => {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffDays =
      (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= REFUND_WINDOW_DAYS;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
            Paid
          </span>
        );
      case "REFUND_PENDING":
        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
            Refund applied
          </span>
        );
      case "REFUND_APPROVED":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
            Refunded
          </span>
        );
      case "REFUND_REJECTED":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
            Refund Denied
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  const backToHome = () => navigate("/");

  return (
    <div className="flex flex-col h-screen bg-muted">
      {/* Header Logo */}
      <div className="flex items-center border-b bg-background">
        <div
          className="flex items-center gap-2 px-4 py-3 border-r w-fit shrink-0 cursor-pointer"
          onClick={backToHome}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">MyShop</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* 筛选区域 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold">Order History</h1>
            <p className="text-sm text-muted-foreground">
              View and manage your past orders
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg border">
              {/* <Calendar className="w-4 h-4 text-muted-foreground" /> */}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm outline-none w-32"
              />
              {/* <ArrowRight className="w-3 h-3 text-muted-foreground" /> */}
              ~
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm outline-none w-32"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Show All
              </Button>
            )}
          </div>
        </div>

        {/* 列表区域 */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading Orders...
          </div>
        ) : (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <p className="text-muted-foreground mb-4">
                  No orders found for the selected range.
                </p>
                <Button variant="outline" onClick={backToHome}>
                  Go Shopping
                </Button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-xl p-6 bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row justify-between border-b pb-4 mb-4 gap-4">
                    <div className="space-y-1">
                      {/* <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Order Number</p> */}
                      <p className="text-foreground font-bold">
                        {order.orderNo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                      {order.address && (
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-200 text-slate-600 rounded cursor-pointer"
                            title={`${order.address.recipient_name} (${order.address.phone})\n${order.address.address_line}, ${order.address.city || ""}, ${order.address.country_code}`}
                          >
                            {order.address.tag}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ( ←Hover to see details )
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <span>{getStatusBadge(order.status)}</span>
                      <p className="text-xl font-bold">
                        {order.currency}
                        {order.totalPrice}
                      </p>
                    </div>
                  </div>

                  {/* 商品列表 */}
                  <div className="space-y-4 mb-6">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="font-medium">
                          {order.currency}
                          {item.unit_price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/contact-support/${order.orderNo}`)
                      }
                    >
                      Contact Support
                    </Button>
                    {/* 操作按钮区域 */}
                    {order.status.startsWith("REFUND") ? (
                      <Button variant="secondary" size="sm" disabled>
                        Refund Requested
                      </Button>
                    ) : checkIsRefundable(order.createdAt) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/refund/${order.orderNo}`, {
                            state: { order },
                          })
                        }
                      >
                        Apply Refund
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        Refund Expired
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
