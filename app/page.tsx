"use client";

import { Button } from "@/components/ui/button";
import { RootState } from "@/lib/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function Home() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  // Redirect to recommendations page if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/recommendations");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Media Recommendation Platform
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        Track your favorite movies, games, and manga. Get personalized
        recommendations based on your preferences and discover new content.
      </p>
      <div className="flex gap-4 mt-10">
        <Button asChild size="lg">
          <Link href="/login">Get Started</Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/register">Create Account</Link>
        </Button>
      </div>
    </div>
  );
}
