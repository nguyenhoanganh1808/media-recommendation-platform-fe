import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./follow-button";
import type { UserItem } from "@/lib/features/users/userSlice";

interface UserCardProps {
  user: UserItem;
  currentUserId: string | null;
}

export function UserCard({ user, currentUserId }: UserCardProps) {
  const isCurrentUser = currentUserId === user.id;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link
            href={`/users/${user.id}`}
            className="flex items-center gap-3 flex-1"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.firstName} />
              <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          </Link>

          {!isCurrentUser && (
            <FollowButton
              userId={user.id}
              isFollowing={user.isFollowing}
              size="sm"
              variant={user.isFollowing ? "outline" : "secondary"}
            />
          )}
        </div>

        {user.bio && (
          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
            {user.bio}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
