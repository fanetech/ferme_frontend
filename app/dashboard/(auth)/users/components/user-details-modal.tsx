"use client";

import { 
  User as UserIcon, 
  Hash, 
  Building2,
  Calendar,
  Shield,
  Mail,
  Phone,
  Globe,
  Settings,
  Clock,
  UserCheck,
  Key,
  Briefcase,
  X,
  Play,
  Pause,
  Ban,
  Lock,
  Unlock,
  ExternalLink
} from "lucide-react";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useUser } from "@/data/users";
import { formatDate } from "@/lib/utils";
import { UserBadge } from "./user-badge";
import { getAvailableActions } from "./user-status-mapper";
import type { User } from "@/types/users";

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, action: string) => void;
  onAdvancedView?: (id: string) => void;
}

// Composant pour afficher une ligne d'information
function InfoRow({ icon: Icon, label, value, className = "" }: {
  icon: any;
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return null;
  
  return (
    <div className={`flex items-center gap-3 py-2 ${className}`}>
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

// Composant pour afficher les badges de statut
function StatusBadges({ user }: { user: User }) {
  return (
    <div className="flex flex-wrap gap-2">
      <UserBadge status={user.status} />
      {user.otpEnabled && (
        <Badge variant="default" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          2FA activé
        </Badge>
      )}
      {user.locked && (
        <Badge variant="destructive" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          Compte verrouillé
        </Badge>
      )}
    </div>
  );
}

export function UserDetailsModal({ userId, isOpen, onClose, onStatusChange, onAdvancedView }: UserDetailsModalProps) {
  const { data: user, isLoading, error } = useUser(userId || "", !!userId);

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <UserIcon className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de l'utilisateur"
      titleIcon={titleIcon}
      size="xl"
      className="max-w-3xl"
      noPadding={true}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="py-8 text-center">
            <div className="text-sm text-muted-foreground">Chargement...</div>
          </div>
        )}

        {error && (
          <div className="py-8 text-center">
            <div className="text-sm text-destructive">
              Erreur lors du chargement des détails de l'utilisateur
            </div>
          </div>
        )}

        {user && (
          <div className="space-y-6">
            {/* Header avec statut et actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserBadge status={user.accountStatus} />
                <StatusBadges user={user} />
              </div>
              
              {/* Boutons d'action rapide */}
              <div className="flex items-center gap-2">
                {onAdvancedView && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onAdvancedView(user.id)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Vue avancée
                  </Button>
                )}
                
                {onStatusChange && getAvailableActions(user.accountStatus).map((action) => {
                  const getActionConfig = (action: string) => {
                    switch (action) {
                      case 'activate':
                        return { icon: Play, label: 'Activer', variant: 'default' as const };
                      case 'deactivate':
                        return { icon: Pause, label: 'Désactiver', variant: 'outline' as const };
                      case 'suspend':
                        return { icon: Ban, label: 'Suspendre', variant: 'destructive' as const };
                      case 'lock':
                        return { icon: Lock, label: 'Verrouiller', variant: 'destructive' as const };
                      case 'unlock':
                        return { icon: Unlock, label: 'Déverrouiller', variant: 'default' as const };
                      default:
                        return { icon: Shield, label: action, variant: 'outline' as const };
                    }
                  };
                  
                  const config = getActionConfig(action);
                  const IconComponent = config.icon;
                  
                  return (
                    <Button
                      key={action}
                      size="sm"
                      variant={config.variant}
                      onClick={() => onStatusChange(user.id, action)}
                    >
                      <IconComponent className="mr-2 h-4 w-4" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Header avec avatar et nom */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePicture} alt={user.fullName} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.fullName}</h3>
                <p className="text-muted-foreground">{user.displayName}</p>
              </div>
            </div>

            <Separator />

            {/* Informations personnelles */}
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoRow icon={Hash} label="Code utilisateur" value={user.code} />
                <InfoRow icon={Mail} label="Email" value={user.email} />
                <InfoRow icon={Phone} label="Téléphone" value={user.phone} />
                <InfoRow icon={Briefcase} label="Titre/Fonction" value={user.title} />
                <InfoRow icon={Calendar} label="Date de naissance" value={user.birthDate} />
                <InfoRow icon={UserCheck} label="Genre" value={user.gender} />
              </div>
              {user.bio && (
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-1">Biographie</div>
                  <div className="text-sm bg-muted/50 p-3 rounded-md">{user.bio}</div>
                </div>
              )}
            </div>

            <Separator />

            {/* Organisation */}
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Organisation
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoRow 
                  icon={Building2} 
                  label="Type d'organisation" 
                  value={user.organizationType === "STRUCTURE" ? "Structure" : "Super Structure"} 
                />
                <InfoRow icon={Building2} label="Organisation" value={`${user.organizationCode} - ${user.organizationName}`} />
                {user.parentSuperStructureName && (
                  <InfoRow icon={Building2} label="Super Structure parent" value={user.parentSuperStructureName} />
                )}
              </div>
            </div>

            <Separator />

            {/* Rôles */}
            {user.roles && user.roles.length > 0 && (
              <>
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Rôles et permissions
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Rôles assignés</div>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <Badge key={role.id} variant="outline" className="gap-1">
                            <Shield className="h-3 w-3" />
                            {role.name}
                            <span className="text-xs text-muted-foreground">({role.code})</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Préférences */}
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Préférences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoRow icon={Globe} label="Langue" value={user.language} />
                <InfoRow icon={Clock} label="Fuseau horaire" value={user.timezone} />
                <InfoRow icon={Settings} label="Thème" value={user.theme} />
              </div>
            </div>

            <Separator />

            {/* Informations d'audit */}
            <div>
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Informations système
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <InfoRow icon={Calendar} label="Créé le" value={formatDate(user.createdAt)} />
                <InfoRow icon={Calendar} label="Modifié le" value={formatDate(user.updatedAt)} />
                <InfoRow icon={Clock} label="Dernière connexion" value={user.lastLoginAt ? formatDate(user.lastLoginAt) : "Jamais"} />
                <InfoRow icon={Shield} label="Tentatives échouées" value={user.failedLoginAttempts.toString()} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 px-6 py-4 bg-muted/50 dark:bg-muted/20 border-t border-border">
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="min-w-[120px]"
          >
            <X className="mr-2 h-4 w-4" />
            Fermer
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}