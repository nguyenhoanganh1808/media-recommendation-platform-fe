"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ListPlus, TrendingUp, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user?.firstName || "User"}
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ListPlus className="mr-2 h-5 w-5" />
              Your Lists
            </CardTitle>
            <CardDescription>Manage your media lists</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create and manage your custom media lists</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/lists">View Lists</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>Personalized for you</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Discover new media based on your preferences</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/recommendations">View Recommendations</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Trending
            </CardTitle>
            <CardDescription>Popular right now</CardDescription>
          </CardHeader>
          <CardContent>
            <p>See what's popular across all users</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/browse">Browse Media</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
