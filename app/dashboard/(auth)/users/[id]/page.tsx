"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Components
import { UserDetailConfiguration } from "./components/user-detail-configuration";

// Hooks
import { useUser } from "@/data/users";
import { UserType, UserStatus, AccountStatus } from "@/types/users";
import AvePayLoader from "@/components/avepay-loader";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: user, isLoading, error } = useUser(id);
  console.log("User data:", user);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <AvePayLoader />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Utilisateur introuvable ou erreur lors du chargement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getUserStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "default";
      case UserStatus.SUSPENDED:
        return "destructive";
      case UserStatus.BLOCKED:
        return "destructive";
      case UserStatus.INACTIVE:
        return "secondary";
      case UserStatus.PENDING:
        return "outline";
      default:
        return "secondary";
    }
  };

  const getAccountStatusColor = (status: AccountStatus) => {
    switch (status) {
      case AccountStatus.VERIFIED:
        return "default";
      case AccountStatus.UNVERIFIED:
        return "secondary";
      case AccountStatus.LOCKED:
        return "destructive";
      case AccountStatus.SUSPENDED:
        return "destructive";
      case AccountStatus.DELETED:
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="flex items-center gap-2">
          <User className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </h1>
            <p className="text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={getUserStatusColor(user.status)} className="text-xs">
            {user.status}
          </Badge>
        </div>
      </div>

      {/* Configuration principale */}
      <div className="mt-6">
        <UserDetailConfiguration user={user} isLoading={isLoading} />
      </div>
    </div>
  );
}