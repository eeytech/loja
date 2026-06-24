"use client";

import { LogInIcon, LogOutIcon, MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signOut } from "@/actions/auth/sign-out";
import { useSession } from "@/providers/session-provider";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Cart } from "./cart";

export const Header = () => {
  const { user } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between p-5">
      <Link href="/">
        <Image src="/logo.svg" alt="TECHPEAK" width={120} height={30} />
      </Link>

      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-5">
              {user ? (
                <>
                  <div className="flex justify-between space-y-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.image as string | undefined}
                        />
                        <AvatarFallback>
                          {user.name?.split(" ")?.[0]?.[0]}
                          {user.name?.split(" ")?.[1]?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <span className="text-muted-foreground block text-xs">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSignOut}
                    >
                      <LogOutIcon />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Olá. Faça seu login!</h2>
                  <Button size="icon" asChild variant="outline">
                    <Link href="/authentication">
                      <LogInIcon />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
        <Cart />
      </div>
    </header>
  );
};
