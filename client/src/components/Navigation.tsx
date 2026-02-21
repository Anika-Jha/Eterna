import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Hourglass, LayoutDashboard, PlusCircle, Library } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Gallery", icon: Library },
    { href: "/preserve", label: "Preserve", icon: PlusCircle },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-colors hover:text-primary">
            <Hourglass className="h-6 w-6 text-primary" />
            <span className="font-serif text-xl font-bold tracking-tight">Eterna</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer",
                  location === href ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline-block">{label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
