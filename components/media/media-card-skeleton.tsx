import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MediaCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="aspect-[2/3] w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center mt-2">
          <Skeleton className="h-4 w-10 mr-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </CardFooter>
    </Card>
  );
}
