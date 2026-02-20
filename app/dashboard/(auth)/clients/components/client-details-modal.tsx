"use client";

import { useState } from "react";
import { BaseModal } from "@/components/ui/modal/BaseModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  CreditCard,
  Award,
  Shield,
  Activity,
  Edit,
  Ban,
  CheckCircle,
  Globe,
  Hash,
  Building,
  Building2,
  FileText,
  X
} from "lucide-react";
import { ClientBadge } from "./client-badge";
import { formatDate } from "@/lib/utils";
import { Client } from "@/types/clients";

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (client: Client) => void;
  onStatusChange?: (client: Client, action: string) => void;
  onEnrollLoyalty?: (client: Client) => void;
}

export function ClientDetailsModal({
  client,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onEnrollLoyalty
}: ClientDetailsModalProps) {

  if (!isOpen || !client) return null;

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-lg shadow-sm dark:shadow-none">
      <User className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails du client"
      titleIcon={titleIcon}
      subtitle={`${client.firstName} ${client.lastName} - ${client.code}`}
      size="xl"
      className="max-w-3xl"
      noPadding={true}
      bodyClassName="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 overflow-y-auto p-6">
        {client ? (
          <div className="space-y-6">
            {/* En-tête avec informations principales */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">
                    {client.firstName} {client.lastName}
                  </h2>
                  <ClientBadge status={client.status} />
                  {client.isLoyaltyMember && (
                    <Badge variant="default">
                      <Award className="h-3 w-3 mr-1" />
                      {client.loyaltyTier || "Membre fidélité"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    {client.code}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Client depuis {formatDate(client?.createdAt!)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(client)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                {client.status === 'BLOCKED' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange?.(client, 'unblock')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Débloquer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange?.(client, 'block')}
                  >
                    <Ban className="h-4 w-4 mr-1" />
                    Bloquer
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="organization">Organisation</TabsTrigger>
                <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={User}
                    label="Type de client"
                    value={
                      client.type === 'INDIVIDUAL' ? 'Particulier' :
                      client.type === 'COMPANY' ? 'Entreprise' :
                      'Gouvernement'
                    }
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Date de naissance"
                    value={client.dateOfBirth ? formatDate(client.dateOfBirth) : "Non renseignée"}
                  />
                  <InfoItem
                    icon={User}
                    label="Genre"
                    value={
                      client.gender === 'MALE' ? 'Homme' :
                      client.gender === 'FEMALE' ? 'Femme' :
                      client.gender || "Non renseigné"
                    }
                  />
                  <InfoItem
                    icon={Shield}
                    label="Type de pièce"
                    value={client.idType || "Non renseigné"}
                  />
                  <InfoItem
                    icon={CreditCard}
                    label="Numéro de pièce"
                    value={client.idNumber || "Non renseigné"}
                  />
                  <InfoItem
                    icon={Globe}
                    label="Nationalité"
                    value={client.nationality || "Non renseignée"}
                  />
                </div>

                {client.notes && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={Phone}
                    label="Téléphone principal"
                    value={client.phone}
                  />
                  <InfoItem
                    icon={Phone}
                    label="Téléphone secondaire"
                    value={client.alternatePhone || "Non renseigné"}
                  />
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={client.email || "Non renseigné"}
                  />
                  <InfoItem
                    icon={Globe}
                    label="Langue préférée"
                    value={
                      client.preferredLanguage === 'fr' ? 'Français' :
                      client.preferredLanguage === 'en' ? 'Anglais' :
                      client.preferredLanguage || "Non renseignée"
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Adresse</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      icon={MapPin}
                      label="Adresse"
                      value={client.address || "Non renseignée"}
                    />
                    <InfoItem
                      icon={MapPin}
                      label="Ville"
                      value={client.city || "Non renseignée"}
                    />
                    <InfoItem
                      icon={MapPin}
                      label="Pays"
                      value={client.country || "Non renseigné"}
                    />
                    <InfoItem
                      icon={MapPin}
                      label="Code postal"
                      value={client.postalCode || "Non renseigné"}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Préférences</h3>
                  <div className="flex gap-4">
                    <Badge variant={client.acceptMarketing ? "default" : "secondary"}>
                      {client.acceptMarketing ? "✓" : "✗"} Marketing
                    </Badge>
                    <Badge variant={client.acceptSms ? "default" : "secondary"}>
                      {client.acceptSms ? "✓" : "✗"} SMS
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="organization" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {client.organizationType && (
                    <>
                      <InfoItem
                        icon={Building}
                        label="Type d'organisation"
                        value={
                          client.organizationType === 'SUPER_STRUCTURE' ? 'Super Structure' :
                          client.organizationType === 'STRUCTURE' ? 'Structure' :
                          client.organizationType
                        }
                      />
                      <InfoItem
                        icon={Building2}
                        label="Organisation"
                        value={client.organizationName || "Non renseignée"}
                      />
                      {client.organizationCode && (
                        <InfoItem
                          icon={Hash}
                          label="Code organisation"
                          value={client.organizationCode}
                        />
                      )}
                    </>
                  )}
                  {client.type === 'COMPANY' && client.taxId && (
                    <InfoItem
                      icon={FileText}
                      label="Numéro fiscal (IFU)"
                      value={client.taxId}
                    />
                  )}
                </div>

                {!client.organizationType && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Ce client n'est associé à aucune organisation
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="loyalty" className="space-y-4 mt-4">
                {client.isLoyaltyMember ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem
                        icon={Award}
                        label="Statut"
                        value="Membre actif"
                      />
                      <InfoItem
                        icon={Award}
                        label="Niveau"
                        value={client.loyaltyTier || "Bronze"}
                      />
                      <InfoItem
                        icon={Award}
                        label="Points"
                        value={client.loyaltyPoints?.toString() || "0"}
                      />
                      <InfoItem
                        icon={Calendar}
                        label="Date d'inscription"
                        value={client.loyaltyJoinDate ? formatDate(client.loyaltyJoinDate) : "N/A"}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Ce client n'est pas encore membre du programme de fidélité
                    </p>
                    <Button onClick={() => onEnrollLoyalty?.(client)}>
                      Inscrire au programme
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem
                    icon={Activity}
                    label="Nombre de transactions"
                    value={client.totalTransactions?.toString() || "0"}
                  />
                  <InfoItem
                    icon={CreditCard}
                    label="Montant total"
                    value={
                      client.totalAmount
                        ? new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0
                          }).format(client.totalAmount)
                        : "0 FCFA"
                    }
                  />
                  <InfoItem
                    icon={CreditCard}
                    label="Montant moyen"
                    value={
                      client.averageTransactionAmount
                        ? new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0
                          }).format(client.averageTransactionAmount)
                        : "0 FCFA"
                    }
                  />
                  <InfoItem
                    icon={Calendar}
                    label="Dernière transaction"
                    value={client.lastTransactionDate ? formatDate(client.lastTransactionDate) : "Aucune"}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium">Complétude du profil</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${client.profileCompletion || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {client.profileCompletion || 0}%
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        )}
      </div>
      
      {/* Footer with Close button */}
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

// Composant pour afficher une information
function InfoItem({
  icon: Icon,
  label,
  value
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
