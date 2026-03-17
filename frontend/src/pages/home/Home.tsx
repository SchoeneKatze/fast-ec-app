import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"
import { Header } from "./header"
import { ProductGrid } from "./product-grid"
import { Cart } from "./cart"
import { useLogto } from "@logto/react";
import { toast } from "@/components/ui/use-toast"

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isCartCollapsed, setIsCartCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { isAuthenticated, isLoading, signOut,signIn } = useLogto();

  const showAfterLogin = isAuthenticated && !isLoading;

    const handleAuthAction = () => {
    if (isAuthenticated) {
      signOut(window.location.origin);
      toast({
        title: "Logged out",
        description: `Logged out successfully.`,
      });
    } else {
      signIn(window.location.origin + "/callback");
    }
  };

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
        <Header />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav 
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          handleAuthAction={handleAuthAction}
          showAfterLogin={showAfterLogin}
        />
        <main className="flex-1 overflow-auto p-4">
          <ProductGrid />
        </main>
        <Cart 
          isCollapsed={!isCartCollapsed}
          onToggle={() => setIsCartCollapsed(!isCartCollapsed)}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          showAfterLogin={showAfterLogin}
        />
      </div>
    </div>
  )
}
