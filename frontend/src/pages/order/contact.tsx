import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ContactSupportPage = () => {
  const { orderNo } = useParams();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent to support.");
    navigate("/order-history");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">Contact Support (Order: {orderNo})</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea 
            className="w-full border rounded-md p-2 h-40 bg-background" 
            placeholder="How can we help you with this order?"
            required
          />
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit">Send Message</Button>
        </div>
      </form>
    </div>
  );
};

export default ContactSupportPage;