import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <>
      <PageHeader title="Settings" description="Workspace and account preferences" />
      <div className="p-6">
        <div className="max-w-xl rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold">Account</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Role</span>
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Admin" : "User"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-xs">{user?.id.slice(0, 8)}…</span>
            </div>
          </div>
          <Button variant="outline" className="mt-6" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}
