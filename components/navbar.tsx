"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/lib/store";
import { logout } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Film, User, LogOut, ListIcon, Sparkles } from "lucide-react";
import { NotificationsDropdown } from "./notifications/notifications-dropdown";

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Film className="h-5 w-5" />
          <span>MediaRec</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className={
                  pathname === "/dashboard"
                    ? "text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground"
                }
              >
                Dashboard
              </Link>
              <Link
                href="/browse"
                className={
                  pathname === "/browse"
                    ? "text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground"
                }
              >
                Browse
              </Link>
              <Link
                href="/recommendations"
                className={
                  pathname === "/recommendations" ||
                  pathname.startsWith("/recommendations/")
                    ? "text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground"
                }
              >
                <span className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Recommendations
                </span>
              </Link>
              <Link
                href="/lists"
                className={
                  pathname === "/lists" || pathname.startsWith("/lists/")
                    ? "text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground"
                }
              >
                <span className="flex items-center">
                  <ListIcon className="h-4 w-4 mr-1" />
                  My Lists
                </span>
              </Link>
              <NotificationsDropdown />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatar || ""}
                        alt={user?.firstName || "User"}
                      />
                      <AvatarFallback>
                        {user?.firstName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={
                  pathname === "/login"
                    ? "text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground"
                }
              >
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}
