import { useState } from "react";
import {
  Package,
  MapPin,
  History,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";


const categories = [
  { id: "comingsoon", label: "Coming Soon..." },
  // { id: "electronics", label: "Electronics" },
  // { id: "clothing", label: "Clothing" },
  // { id: "home", label: "Home & Garden" },
  // { id: "sports", label: "Sports & Outdoors" },
  // { id: "beauty", label: "Beauty & Health" },
];

const navItems = [
  { icon: MapPin, label: "Saved Addresses", path: "/addresses", color: "text-muted-foreground" },
  { icon: History, label: "Order History", path: "/orders", color: "text-muted-foreground" },
  { icon: Settings, label: "Settings", path:"/settings", color: "text-muted-foreground" },
];

interface SidebarNavProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleAuthAction: () => void
  showAfterLogin: boolean
}

export function SidebarNav({
  isCollapsed,
  onToggle,
  selectedCategory,
  onSelectCategory,
  isAuthenticated,
  isLoading,
  handleAuthAction,
  showAfterLogin
}: SidebarNavProps) {
  const navigate = useNavigate();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  if (isCollapsed) {
    return (
      <div className="w-16 p-2 border-r flex flex-col items-center bg-background shrink-0">
        <Button variant="ghost" size="icon" onClick={onToggle} className="mb-4">
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center gap-2">
          <Button variant="ghost" size="icon" className="text-primary">
            <Package className="h-5 w-5" />
          </Button>
          {navItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={item.color}
            >
              <item.icon className="h-5 w-5" />
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "mt-auto mb-4",
            isAuthenticated ? "text-destructive" : "text-primary",
          )}
          onClick={handleAuthAction}
          disabled={isLoading}
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 p-4 border-r flex flex-col bg-background shrink-0">
      <div className="flex items-center justify-end mb-4">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <PanelLeftClose className="h-5 w-5" />
        </Button>
      </div>

      <nav className="space-y-1 flex-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-primary"
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
        >
          <Package className="mr-2 h-4 w-4" />
          Products
          {isCategoriesOpen ? (
            <ChevronDown className="ml-auto h-4 w-4" />
          ) : (
            <ChevronRight className="ml-auto h-4 w-4" />
          )}
        </Button>

        {isCategoriesOpen && (
          <div className="ml-10 space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start text-sm",
                selectedCategory === null
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
              onClick={() => onSelectCategory(null)}
            >
              All Products
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start text-sm",
                  selectedCategory === category.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
                onClick={() => onSelectCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        )}

        {navItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`w-full justify-start ${item.color}`}
            disabled={!showAfterLogin}
            onClick={() => navigate(item.path)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mt-auto",
          isAuthenticated
            ? "text-destructive hover:bg-destructive/10"
            : "text-primary hover:bg-primary/10",
        )}
        onClick={handleAuthAction}
        disabled={isLoading}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isLoading ? "Processing..." : isAuthenticated ? "Log Out" : "Log In"}
      </Button>
    </div>
  );
}
