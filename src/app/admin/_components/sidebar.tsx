"use client";

import {
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  ShoppingBagIcon,
  TagIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { signOut } from "@/actions/auth/sign-out";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/categories", label: "Categorias", icon: TagIcon },
  { href: "/admin/products", label: "Produtos", icon: PackageIcon },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBagIcon },
];

type SidebarProps = {
  user: SessionUser;
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <aside className="bg-card border-r flex h-screen w-64 flex-col">
      <div className="border-b p-5">
        <Link href="/admin">
          <Image src="/logo.svg" alt="TECHPEAK" width={110} height={28} />
        </Link>
        <p className="text-muted-foreground mt-1 text-xs font-medium uppercase tracking-widest">
          Painel Admin
        </p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleSignOut}
            title="Sair"
          >
            <LogOutIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
