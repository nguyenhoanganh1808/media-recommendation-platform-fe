import { UserCard } from "./user-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserItem } from "@/lib/features/users/userSlice";

interface UserListProps {
  users: UserItem[];
  currentUserId: string | null;
  isLoading: boolean;
  emptyMessage: string;
}

export function UserList({
  users,
  currentUserId,
  isLoading,
  emptyMessage,
}: UserListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <UserListSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

function UserListSkeleton() {
  return (
    <div className="flex items-start p-4 border rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full mr-3" />
      <div className="flex-1">
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/4 mb-3" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-9 w-20 ml-2" />
    </div>
  );
}
