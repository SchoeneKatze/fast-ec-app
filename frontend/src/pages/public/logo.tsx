import { ShoppingBag } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex flex-col h-screen bg-muted">
      {/* Fixed Header with Logo */}
      <div className="flex items-center border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-3 border-r w-fit shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold">MyShop</span>
        </div>
      </div>
    </div>
  );
}
