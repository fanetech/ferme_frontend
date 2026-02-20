"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  UserCog, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail,
  Calendar as CalendarIcon,
  User,
  Globe,
  Bell,
  Shield,
  FileText,
  Plus,
  Trash2
} from "lucide-react";

import { User as UserType } from "@/types/users";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserProfileTabProps {
  user: UserType;
}

export function UserProfileTab({ user }: UserProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  // Mock extended profile data - in real app this would come from UserProfile type
  const [profileData, setProfileData] = useState({
    title: "",
    middleName: "",
    displayName: user.fullName || `${user.firstName} ${user.lastName}`,
    bio: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    personalEmail: "",
    workEmail: user.email,
    homePhone: "",
    workPhone: user.phoneNumber || "",
    mobilePhone: "",
    jobTitle: "",
    department: user.departmentName || "",
    manager: "",
    employeeId: "",
    hireDate: "",
    workLocation: "",
    linkedIn: "",
    twitter: "",
    website: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    // Address
    homeAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "France"
    },
    workAddress: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "France"
    },
    // Preferences
    communicationPreferences: {
      email: true,
      sms: false,
      push: true,
      newsletter: false
    },
    marketingOptIn: false,
    dataRetentionPreference: "standard"
  });

  const handleSave = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Profil étendu
            </CardTitle>
            <CardDescription>
              Informations personnelles et professionnelles détaillées
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre/Civilité</Label>
                <Select 
                  value={profileData.title} 
                  onValueChange={(value) => setProfileData({...profileData, title: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M.">M.</SelectItem>
                    <SelectItem value="Mme">Mme</SelectItem>
                    <SelectItem value="Mlle">Mlle</SelectItem>
                    <SelectItem value="Dr.">Dr.</SelectItem>
                    <SelectItem value="Pr.">Pr.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleName">Nom de famille</Label>
                <Input
                  id="middleName"
                  value={profileData.middleName}
                  onChange={(e) => setProfileData({...profileData, middleName: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Nom de famille"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nom d'affichage</Label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date de naissance</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                      disabled={!isEditing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {profileData.dateOfBirth ? 
                        format(new Date(profileData.dateOfBirth), "dd MMM yyyy", { locale: fr }) : 
                        "Sélectionner une date"
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setProfileData({...profileData, dateOfBirth: date?.toISOString() || ""});
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <Select 
                  value={profileData.gender} 
                  onValueChange={(value) => setProfileData({...profileData, gender: value})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                    <SelectItem value="prefer_not_to_say">Préfère ne pas dire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationalité</Label>
                <Input
                  id="nationality"
                  value={profileData.nationality}
                  onChange={(e) => setProfileData({...profileData, nationality: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Française"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Courte description..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations de contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Informations de contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Email personnel</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={profileData.personalEmail}
                  onChange={(e) => setProfileData({...profileData, personalEmail: e.target.value})}
                  disabled={!isEditing}
                  placeholder="email.perso@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workEmail">Email professionnel</Label>
                <Input
                  id="workEmail"
                  type="email"
                  value={profileData.workEmail}
                  onChange={(e) => setProfileData({...profileData, workEmail: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="homePhone">Téléphone domicile</Label>
                <Input
                  id="homePhone"
                  type="tel"
                  value={profileData.homePhone}
                  onChange={(e) => setProfileData({...profileData, homePhone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workPhone">Téléphone professionnel</Label>
                <Input
                  id="workPhone"
                  type="tel"
                  value={profileData.workPhone}
                  onChange={(e) => setProfileData({...profileData, workPhone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobilePhone">Téléphone mobile</Label>
                <Input
                  id="mobilePhone"
                  type="tel"
                  value={profileData.mobilePhone}
                  onChange={(e) => setProfileData({...profileData, mobilePhone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  disabled={!isEditing}
                  placeholder="https://monsite.com"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations professionnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Informations professionnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Poste</Label>
                <Input
                  id="jobTitle"
                  value={profileData.jobTitle}
                  onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Développeur Senior"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Département</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={profileData.manager}
                  onChange={(e) => setProfileData({...profileData, manager: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Nom du manager"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">ID Employé</Label>
                <Input
                  id="employeeId"
                  value={profileData.employeeId}
                  onChange={(e) => setProfileData({...profileData, employeeId: e.target.value})}
                  disabled={!isEditing}
                  placeholder="EMP001234"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">Date d'embauche</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={profileData.hireDate}
                  onChange={(e) => setProfileData({...profileData, hireDate: e.target.value})}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workLocation">Lieu de travail</Label>
                <Input
                  id="workLocation"
                  value={profileData.workLocation}
                  onChange={(e) => setProfileData({...profileData, workLocation: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Paris, France"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Adresses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Adresse domicile */}
            <div>
              <h4 className="font-medium mb-4">Adresse domicile</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="homeLine1">Adresse ligne 1</Label>
                  <Input
                    id="homeLine1"
                    value={profileData.homeAddress.line1}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      homeAddress: {...profileData.homeAddress, line1: e.target.value}
                    })}
                    disabled={!isEditing}
                    placeholder="123 rue de la Paix"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeLine2">Adresse ligne 2</Label>
                  <Input
                    id="homeLine2"
                    value={profileData.homeAddress.line2}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      homeAddress: {...profileData.homeAddress, line2: e.target.value}
                    })}
                    disabled={!isEditing}
                    placeholder="Appartement, étage..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeCity">Ville</Label>
                    <Input
                      id="homeCity"
                      value={profileData.homeAddress.city}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        homeAddress: {...profileData.homeAddress, city: e.target.value}
                      })}
                      disabled={!isEditing}
                      placeholder="Paris"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homePostalCode">Code postal</Label>
                    <Input
                      id="homePostalCode"
                      value={profileData.homeAddress.postalCode}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        homeAddress: {...profileData.homeAddress, postalCode: e.target.value}
                      })}
                      disabled={!isEditing}
                      placeholder="75000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="homeCountry">Pays</Label>
                  <Input
                    id="homeCountry"
                    value={profileData.homeAddress.country}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      homeAddress: {...profileData.homeAddress, country: e.target.value}
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Adresse travail */}
            <div>
              <h4 className="font-medium mb-4">Adresse travail</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workLine1">Adresse ligne 1</Label>
                  <Input
                    id="workLine1"
                    value={profileData.workAddress.line1}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      workAddress: {...profileData.workAddress, line1: e.target.value}
                    })}
                    disabled={!isEditing}
                    placeholder="456 avenue des Champs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workLine2">Adresse ligne 2</Label>
                  <Input
                    id="workLine2"
                    value={profileData.workAddress.line2}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      workAddress: {...profileData.workAddress, line2: e.target.value}
                    })}
                    disabled={!isEditing}
                    placeholder="Bureau, étage..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workCity">Ville</Label>
                    <Input
                      id="workCity"
                      value={profileData.workAddress.city}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        workAddress: {...profileData.workAddress, city: e.target.value}
                      })}
                      disabled={!isEditing}
                      placeholder="Paris"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workPostalCode">Code postal</Label>
                    <Input
                      id="workPostalCode"
                      value={profileData.workAddress.postalCode}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        workAddress: {...profileData.workAddress, postalCode: e.target.value}
                      })}
                      disabled={!isEditing}
                      placeholder="75000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workCountry">Pays</Label>
                  <Input
                    id="workCountry"
                    value={profileData.workAddress.country}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      workAddress: {...profileData.workAddress, country: e.target.value}
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact d'urgence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Contact d'urgence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Nom du contact</Label>
              <Input
                id="emergencyName"
                value={profileData.emergencyContactName}
                onChange={(e) => setProfileData({...profileData, emergencyContactName: e.target.value})}
                disabled={!isEditing}
                placeholder="Nom Prénom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Téléphone</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={profileData.emergencyContactPhone}
                onChange={(e) => setProfileData({...profileData, emergencyContactPhone: e.target.value})}
                disabled={!isEditing}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyRelation">Relation</Label>
              <Select
                value={profileData.emergencyContactRelation}
                onValueChange={(value) => setProfileData({...profileData, emergencyContactRelation: value})}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conjoint">Conjoint(e)</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="enfant">Enfant</SelectItem>
                  <SelectItem value="frere_soeur">Frère/Sœur</SelectItem>
                  <SelectItem value="ami">Ami(e)</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Réseaux sociaux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Réseaux sociaux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={profileData.linkedIn}
                onChange={(e) => setProfileData({...profileData, linkedIn: e.target.value})}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={profileData.twitter}
                onChange={(e) => setProfileData({...profileData, twitter: e.target.value})}
                disabled={!isEditing}
                placeholder="@username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Préférences de communication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotif">Notifications par email</Label>
                <p className="text-sm text-muted-foreground">Recevoir les notifications importantes par email</p>
              </div>
              <Switch
                id="emailNotif"
                checked={profileData.communicationPreferences.email}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  communicationPreferences: {
                    ...profileData.communicationPreferences,
                    email: checked
                  }
                })}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotif">Notifications par SMS</Label>
                <p className="text-sm text-muted-foreground">Recevoir les notifications urgentes par SMS</p>
              </div>
              <Switch
                id="smsNotif"
                checked={profileData.communicationPreferences.sms}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  communicationPreferences: {
                    ...profileData.communicationPreferences,
                    sms: checked
                  }
                })}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotif">Notifications push</Label>
                <p className="text-sm text-muted-foreground">Recevoir les notifications en temps réel</p>
              </div>
              <Switch
                id="pushNotif"
                checked={profileData.communicationPreferences.push}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  communicationPreferences: {
                    ...profileData.communicationPreferences,
                    push: checked
                  }
                })}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing">Marketing et promotions</Label>
                <p className="text-sm text-muted-foreground">Recevoir les offres et actualités produit</p>
              </div>
              <Switch
                id="marketing"
                checked={profileData.marketingOptIn}
                onCheckedChange={(checked) => setProfileData({
                  ...profileData,
                  marketingOptIn: checked
                })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="dataRetention">Préférence de rétention des données</Label>
              <Select
                value={profileData.dataRetentionPreference}
                onValueChange={(value) => setProfileData({...profileData, dataRetentionPreference: value})}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Rétention minimale</SelectItem>
                  <SelectItem value="standard">Rétention standard</SelectItem>
                  <SelectItem value="extended">Rétention étendue</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Durée de conservation de vos données personnelles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <Button size="sm" variant="outline" disabled={!isEditing}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un document
            </Button>
          </div>
          <CardDescription>
            Documents et fichiers liés au profil utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium">Aucun document</h3>
            <p className="text-sm text-muted-foreground">
              Aucun document n'a été ajouté à ce profil
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}