"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/users";
import { 
  User as UserIcon, 
  Shield, 
  Monitor, 
  Activity,
  UserCog
} from "lucide-react";

// Import des composants des tabs
import { UserInfoTab } from "./UserInfoTab";
import { UserPermissionsTab } from "./UserPermissionsTab";
import { UserSessionsTab } from "./UserSessionsTab";
import { UserAuditTab } from "./UserAuditTab";
import { UserProfileTab } from "./UserProfileTab";

interface UserDetailConfigurationProps {
  user: User;
  isLoading?: boolean;
}

export function UserDetailConfiguration({ user , isLoading}: UserDetailConfigurationProps) {
  return (
    <div className="space-y-6">
      {/* En-tête avec informations rapides */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestion de l'utilisateur</h2>
          <p className="text-sm text-muted-foreground">
            Gérez les informations, permissions, sessions et activité de l'utilisateur
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {user.structureName && (
            <span>Structure: {user.structureName}</span>
          )}
          {user.lastLoginAt && (
            <span>• Dernière connexion: {new Date(user.lastLoginAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Gestion des accès
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <UserInfoTab user={user} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="permissions">
          <UserPermissionsTab user={user} />
        </TabsContent>

        <TabsContent value="sessions">
          <UserSessionsTab user={user} />
        </TabsContent>

        <TabsContent value="activity">
          <UserAuditTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}