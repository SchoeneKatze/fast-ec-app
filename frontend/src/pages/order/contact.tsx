import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLogto } from "@logto/react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

const ContactSupportPage = () => {
  const { orderNo } = useParams();
  const navigate = useNavigate();
  const { getIdTokenClaims } = useLogto();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const claims = await getIdTokenClaims();
      if (!claims?.sub) {
        toast({
          title: "Authentication required",
          description: "Please log in to contact support.",
          variant: "destructive",
        });
        return;
      }

      // First get order id from order_no
      const orderRes = await fetch(`${BACKEND_URL}/orders/order/${orderNo}`);
      if (!orderRes.ok) {
        throw new Error("Order not found");
      }
      const order = await orderRes.json();

      const response = await fetch(`${BACKEND_URL}/contacts/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          user_id: claims.sub,
          message: message,
        }),
      });

      if (response.ok) {
        toast({
          title: "Message sent",
          description: "Your message has been sent to support.",
        });
        navigate("/order-history");
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">Contact Support (Order: {orderNo})</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-md p-2 h-40 bg-background"
            placeholder="How can we help you with this order?"
            required
          />
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactSupportPage;