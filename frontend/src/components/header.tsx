import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <div className="flex-1 bg-background px-4 py-2 flex items-center gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input type="text" placeholder="Search products..." className="pl-10 w-full" />
      </div>
      <Button variant="ghost" size="icon">
        <User className="h-5 w-5" />
      </Button>
    </div>
  )
}
