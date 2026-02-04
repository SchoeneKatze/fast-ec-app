import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { SidebarNav } from "../../components/sidebar-nav"
import { Header } from "../../components/header"
import { ProductGrid } from "../../components/product-grid"
import { Cart } from "../../components/cart"

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isCartCollapsed, setIsCartCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
        />
        <main className="flex-1 overflow-auto p-4">
          <ProductGrid />
        </main>
        <Cart 
          isCollapsed={!isCartCollapsed}
          onToggle={() => setIsCartCollapsed(!isCartCollapsed)}
        />
      </div>
    </div>
  )
}
