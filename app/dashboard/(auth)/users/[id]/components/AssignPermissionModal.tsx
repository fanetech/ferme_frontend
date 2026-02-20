"use client";

import { useState, useEffect } from "react";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, Shield, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import client from "@/data/client";
import type { User } from "@/types/users";
import type { PermissionSummary, AssignPermissionFormData } from "@/types/module-permissions";

interface AssignPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  permission: PermissionSummary;
  onSuccess?: () => void;
}

export function AssignPermissionModal({
  isOpen,
  onClose,
  user,
  permission,
  onSuccess
}: AssignPermissionModalProps) {
  const [formData, setFormData] = useState<AssignPermissionFormData>({
    permissionType: 'DIRECT',
    reason: '',
    validFrom: undefined,
    expiresAt: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        permissionType: 'DIRECT',
        reason: '',
        validFrom: undefined,
        expiresAt: undefined
      });
      setErrors({});
    }
  }, [isOpen]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.reason.trim()) {
      newErrors.reason = "La raison est obligatoire";
    }

    if (formData.permissionType === 'TEMPORARY' && !formData.expiresAt) {
      newErrors.expiresAt = "La date d'expiration est obligatoire pour les permissions temporaires";
    }

    if (formData.validFrom && formData.expiresAt && formData.validFrom >= formData.expiresAt) {
      newErrors.expiresAt = "La date d'expiration doit être postérieure à la date de début";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      await client.auth.userPermissions.assign({
        userId: user.id,
        permissionId: permission.id,
        permissionType: formData.permissionType,
        reason: formData.reason,
        validFrom: formData.validFrom?.toISOString(),
        expiresAt: formData.expiresAt?.toISOString()
      });

      toast.success(`Permission "${permission.name}" assignée avec succès`);
      onSuccess?.();
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error("Erreur lors de l'assignation de la permission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      permissionType: 'DIRECT',
      reason: '',
      validFrom: undefined,
      expiresAt: undefined
    });
    setErrors({});
    onClose();
  };

  const isDirty = formData.reason.trim() !== '' || 
                  formData.permissionType !== 'DIRECT' || 
                  formData.validFrom !== undefined || 
                  formData.expiresAt !== undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <span>Assigner une permission</span>
        </div>
      }
      subtitle={`Assignation de la permission à ${user.fullName}`}
      onSubmit={handleSubmit}
      submitLabel="Assigner"
      isSubmitting={isSubmitting}
      isDirty={isDirty}
      size="lg"
      footerNote="Les permissions assignées prennent effet immédiatement"
    >
      <div className="space-y-6">
        {/* Informations de la permission */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-medium">{permission.name}</span>
            <Badge variant="outline" className="text-xs">
              {permission.action}
            </Badge>
            {permission.isSystem && (
              <Badge variant="secondary" className="text-xs">
                Système
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            Code: <span className="font-mono">{permission.code}</span>
          </p>
          {permission.description && (
            <p className="text-xs text-muted-foreground">
              {permission.description}
            </p>
          )}
        </div>

        {/* Type de permission */}
        <div className="space-y-2">
          <Label htmlFor="permissionType">Type de permission *</Label>
          <Select
            value={formData.permissionType}
            onValueChange={(value: 'DIRECT' | 'TEMPORARY') => 
              setFormData(prev => ({ ...prev, permissionType: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DIRECT">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Permission directe</div>
                    <div className="text-xs text-muted-foreground">Permission permanente jusqu'à révocation</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="TEMPORARY">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Permission temporaire</div>
                    <div className="text-xs text-muted-foreground">Permission avec date d'expiration</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Raison */}
        <div className="space-y-2">
          <Label htmlFor="reason">Raison de l'assignation *</Label>
          <Textarea
            id="reason"
            placeholder="Expliquez pourquoi cette permission est accordée..."
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            className={errors.reason ? "border-destructive" : ""}
            rows={3}
          />
          {errors.reason && (
            <p className="text-sm text-destructive">{errors.reason}</p>
          )}
        </div>

        {/* Dates sur la même ligne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date de début (optionnelle) */}
          <div className="space-y-2">
            <Label htmlFor="validFrom">Date de début (optionnelle)</Label>
            <Input
              id="validFrom"
              type="datetime-local"
              value={formData.validFrom ? formData.validFrom.toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setFormData(prev => ({ ...prev, validFrom: date }));
              }}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-muted-foreground">
              Si non spécifiée, la permission sera active immédiatement
            </p>
          </div>

          {/* Date d'expiration (obligatoire pour TEMPORARY) */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">
              Date d'expiration {formData.permissionType === 'TEMPORARY' ? '*' : '(optionnelle)'}
            </Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt ? formData.expiresAt.toISOString().slice(0, 16) : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setFormData(prev => ({ ...prev, expiresAt: date }));
              }}
              min={formData.validFrom ? formData.validFrom.toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
              className={errors.expiresAt ? "border-destructive" : ""}
              disabled={formData.permissionType === 'DIRECT'}
            />
            {errors.expiresAt && (
              <p className="text-sm text-destructive">{errors.expiresAt}</p>
            )}
            {formData.permissionType === 'DIRECT' && (
              <p className="text-xs text-muted-foreground">
                Non applicable pour les permissions directes
              </p>
            )}
          </div>
        </div>

        {/* Alerte pour permissions système */}
        {permission.isSystem && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Cette permission système peut donner accès à des fonctionnalités critiques. 
              Assurez-vous que l'utilisateur a besoin de cette permission pour ses fonctions.
            </AlertDescription>
          </Alert>
        )}

        {/* Résumé */}
        <div className="border rounded-lg p-4 bg-muted/10">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Résumé de l'assignation
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Utilisateur :</span>
              <span className="font-medium">{user.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Permission :</span>
              <span className="font-medium">{permission.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type :</span>
              <Badge variant={formData.permissionType === 'DIRECT' ? 'default' : 'secondary'} className="text-xs">
                {formData.permissionType === 'DIRECT' ? 'Directe' : 'Temporaire'}
              </Badge>
            </div>
            {formData.validFrom && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active à partir de :</span>
                <span className="font-medium">
                  {formData.validFrom.toLocaleDateString('fr-FR')} à {formData.validFrom.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
            {formData.expiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expire le :</span>
                <span className="font-medium">
                  {formData.expiresAt.toLocaleDateString('fr-FR')} à {formData.expiresAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  );
}