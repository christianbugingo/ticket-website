"use client";

import Link from "next/link";
import { Bus, Menu, UserCircle, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile.js";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact & Help" },
];

export function Header() {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    
    // Simple check for admin page
    if (pathname.startsWith('/admin')) {
        setIsAdmin(true);
        setIsLoggedIn(true)
    } else {
        setIsAdmin(false);
         // We consider the user logged in if they are on the dashboard page.
        if (pathname.startsWith('/dashboard')) {
            setIsLoggedIn(true);
        } else {
            // A simple check to see if we came from a login. A real app would use a better method.
            const cameFromLogin = typeof document !== 'undefined' && (document.referrer.includes('sign-in') || document.referrer.includes('sign-up'));
            if (pathname === '/dashboard' || (cameFromLogin && pathname ==='/')) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        }
    }
    }
  , [pathname]);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push('/');
  };

  const navLinks = (
    <>
      {NAV_LINKS.map((link) => (
        <Button key={link.href} variant="ghost" asChild>
          <Link href={link.href}>{link.label}</Link>
        </Button>
      ))}
    </>
  );

  const authButtons = (
    <div className="flex gap-2 items-center">
      <Button variant="outline" asChild>
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </div>
  );

  const userButtons = (
    <div className="flex gap-2 items-center">
      {isAdmin ? (
            <Button variant="ghost" asChild>
            <Link href="/admin" className="flex items-center gap-2">
                    <ShieldCheck />
                    Admin Dashboard
                </Link>
            </Button>
            ) : (
            <Button variant="ghost" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                    <UserCircle />
                    My Account
                </Link>
            </Button>
        )}
        
      <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
        <LogOut />
        Sign Out
      </Button>
    </div>
  );

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground rounded-full p-2">
            <Bus className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-primary">ITIKE</span>
        </Link>
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link href={link.href} className="text-lg py-2">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                
              </nav>
              <div className="mt-8 pt-4 border-t">
                {isLoggedIn ? userButtons : authButtons}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-2">{navLinks}</nav>
            {isLoggedIn ? userButtons : authButtons}
          </div>
        )}
      </div>
    </header>
  );
}