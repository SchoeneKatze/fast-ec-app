import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLogto } from "@logto/react";

export default function RefundPage() {
  const { orderNo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getAccessToken } = useLogto();
  const order = location.state?.order; 

  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return alert("Order data missing.");
    setIsSubmitting(true);

    try {
      const token = await getAccessToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/orders/refund/${order.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason, details }),
      });

      if (!response.ok) throw new Error("Refund request failed");
      
      alert("Refund request submitted successfully.");
      navigate("/order-history");
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 border rounded-lg shadow-sm">

      <h2 className="text-xl font-bold mb-6">Apply Refund for {orderNo}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Reason</label>
          <select 
            value={reason} onChange={e => setReason(e.target.value)} 
            className="w-full border rounded-md p-2 bg-background" required
          >
            <option value="">Select a reason...</option>
            <option value="defective">Product Defective</option>
            <option value="wrong_item">Wrong Item Sent</option>
            <option value="not_needed">No Longer Needed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Details</label>
          <textarea 
            value={details} onChange={e => setDetails(e.target.value)}
            className="w-full border rounded-md p-2 h-32 bg-background" 
            placeholder="Please describe the issue in detail..." required
          />
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
};
