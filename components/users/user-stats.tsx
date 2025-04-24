import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "./user-list";
import type { UserProfile, UserItem } from "@/lib/features/users/userSlice";

interface UserStatsProps {
  profile: UserProfile;
  followers: UserItem[];
  following: UserItem[];
  currentUserId: string | null;
  followersLoading: boolean;
  followingLoading: boolean;
}

export function UserStats({
  profile,
  followers,
  following,
  currentUserId,
  followersLoading,
  followingLoading,
}: UserStatsProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="followers">
          <TabsList className="w-full grid grid-cols-4 rounded-none">
            <TabsTrigger value="followers" className="rounded-none">
              Followers ({profile.stats.followersCount})
            </TabsTrigger>
            <TabsTrigger value="following" className="rounded-none">
              Following ({profile.stats.followingCount})
            </TabsTrigger>
            <TabsTrigger value="lists" className="rounded-none">
              Lists ({profile.stats.listsCount})
            </TabsTrigger>
            <TabsTrigger value="ratings" className="rounded-none">
              Ratings ({profile.stats.ratingsCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="p-4">
            <UserList
              users={followers}
              currentUserId={currentUserId}
              isLoading={followersLoading}
              emptyMessage="This user doesn't have any followers yet."
            />
          </TabsContent>

          <TabsContent value="following" className="p-4">
            <UserList
              users={following}
              currentUserId={currentUserId}
              isLoading={followingLoading}
              emptyMessage="This user isn't following anyone yet."
            />
          </TabsContent>

          <TabsContent value="lists" className="p-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Lists will be implemented in a future update.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="p-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Ratings will be implemented in a future update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
