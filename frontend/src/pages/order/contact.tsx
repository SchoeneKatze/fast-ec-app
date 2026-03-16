import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLogto } from "@logto/react";
import { useState } from "react";

const ContactSupportPage = () => {
  const { orderNo } = useParams();
  const navigate = useNavigate();
  const { getIdTokenClaims } = useLogto();
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const claims = await getIdTokenClaims();
      const userId = claims?.sub;

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/orders/tickets`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticket_type: "CONTACT",
            order_id: orderNo,
            user_id: userId,
            reason: "General Inquiry", // 客服页面默认理由
            details: details,
          }),
        },
      );

      if (!response.ok) throw new Error("发送失败");

      alert("您的消息已发送，客服将尽快回复。");
      navigate(-1);
    } catch (error) {
      alert("发送失败，请检查网络连接。" + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">
        Contact Support (Order: {orderNo})
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full border rounded-md p-2 h-40 bg-background"
            placeholder="How can we help you with this order?"
            required
          />
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white font-black uppercase text-xs px-8">
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactSupportPage;
