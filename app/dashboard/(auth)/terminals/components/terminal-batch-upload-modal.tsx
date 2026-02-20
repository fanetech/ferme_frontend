"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/ui/modal/FormModal";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDownloadBatchTemplate, useUploadBatchTerminals } from "@/data/terminal";
import { useStructuresForFilter, useSuperStructuresForFilter } from "@/data/organization";
import { toast } from "sonner";
import type { BatchTerminalResponse, BatchUploadOptions, BatchUploadProgress, PaginatedResponse } from "@/types";
import { Structure, SuperStructure } from "@/types/organization";

interface TerminalBatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  structuresData?: PaginatedResponse<Structure>,
  isLoadingStructures: boolean
}

export function TerminalBatchUploadModal({ isOpen, onClose,  structuresData, isLoadingStructures }: TerminalBatchUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadOptions, setUploadOptions] = useState<BatchUploadOptions>({
    structureId: undefined,
    superStructureId: undefined,
    activateImmediately: false,
    skipErrors: false,
  });
  const [uploadResult, setUploadResult] = useState<BatchTerminalResponse | null>(null);
  const [showErrors, setShowErrors] = useState(true);
  const [showSuccess, setShowSuccess] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<BatchUploadProgress>({
    isUploading: false,
    progress: 0,
    currentStep: '',
  });

  // Hooks
  const downloadTemplate = useDownloadBatchTemplate();
  const uploadBatch = useUploadBatchTerminals();
  const { data: superStructuresData, isLoading: isLoadingSuperStructures } = useSuperStructuresForFilter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Type de fichier non supporté", {
        description: "Veuillez sélectionner un fichier Excel (.xlsx ou .xls)"
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null); // Reset previous results
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      setUploadProgress({
        isUploading: true,
        progress: 50,
        currentStep: 'Téléchargement du modèle...',
      });

      const blob = await downloadTemplate.mutateAsync();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'terminal-batch-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setUploadProgress({
        isUploading: false,
        progress: 100,
        currentStep: 'Téléchargement terminé',
      });

      toast.success("Modèle téléchargé avec succès");
    } catch (error: any) {
      toast.error("Erreur lors du téléchargement", {
        description: error?.message || "Une erreur est survenue"
      });
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentStep: '',
      });
    }
  };

  // Handle file upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentStep: 'Préparation de l\'upload...',
      });

      // Auto-scroll to progress section when upload starts
      setTimeout(() => {
        progressRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);

      // Simulate progress steps
      const progressSteps = [
        { progress: 20, step: 'Validation du fichier...' },
        { progress: 40, step: 'Lecture des données...' },
        { progress: 60, step: 'Création des terminaux...' },
        { progress: 80, step: 'Finalisation...' },
      ];

      for (const { progress, step } of progressSteps) {
        setUploadProgress(prev => ({ ...prev, progress, currentStep: step }));
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
      }

      const result = await uploadBatch.mutateAsync({
        file: selectedFile,
        options: uploadOptions,
      });

      setUploadProgress({
        isUploading: false,
        progress: 100,
        currentStep: 'Upload terminé',
      });

      setUploadResult(result);
      
      // Auto-scroll to results section when upload is complete
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Erreur lors de l'upload", {
          description: result.message
        });
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'upload", {
        description: error?.response?.data?.message || error?.message || "Une erreur est survenue"
      });
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentStep: '',
      });
    }
  };

  // Reset modal state
  const handleClose = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress({
      isUploading: false,
      progress: 0,
      currentStep: '',
    });
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const titleIcon = (
    <div className="p-2.5 bg-primary/10 rounded-lg shadow-sm">
      <FileSpreadsheet className="h-5 w-5 text-primary" />
    </div>
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Création en lot de terminaux"
      titleIcon={titleIcon}
      subtitle="Importez plusieurs terminaux à la fois via un fichier Excel"
      onSubmit={!uploadResult ? handleUpload : handleClose}
      submitLabel={uploadResult ? 'OK' : uploadProgress.isUploading ? 'Upload en cours...' : 'Lancer l\'upload'}
      cancelLabel={uploadResult ? 'Fermer' : 'Annuler'}
      isSubmitting={uploadProgress.isUploading}
      isDirty={false}
      size="xl"
    >
      <div className="space-y-6">
        {/* Step 1: Download Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-4 w-4" />
              1. Télécharger le modèle Excel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Téléchargez le modèle Excel avec le format requis pour créer vos terminaux.
              </p>
              <Button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={downloadTemplate.isPending}
                className="shrink-0"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le modèle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Upload Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-4 w-4" />
              2. Configuration de l'upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SuperStructure Selection */}
            <div className="space-y-2">
              <Label htmlFor="super-structure-select">Super structure par défaut (optionnel)</Label>
              <Select
                value={uploadOptions.superStructureId || "none"}
                onValueChange={(value) =>
                  setUploadOptions(prev => ({
                    ...prev,
                    superStructureId: value === "none" ? undefined : value
                  }))
                }
                disabled={isLoadingSuperStructures}
              >
                <SelectTrigger id="super-structure-select">
                  <SelectValue placeholder="Sélectionner une super structure par défaut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune super structure par défaut</SelectItem>
                  {superStructuresData?.content?.map((superStructure) => (
                    <SelectItem key={superStructure.id} value={superStructure.id}>
                      {superStructure.code} - {superStructure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Les codes de super structure dans le fichier Excel auront la priorité sur cette sélection.
              </p>
            </div>

            {/* Structure Selection */}
            <div className="space-y-2">
              <Label htmlFor="structure-select">Structure par défaut (optionnel)</Label>
              <Select
                value={uploadOptions.structureId || "none"}
                onValueChange={(value) =>
                  setUploadOptions(prev => ({
                    ...prev,
                    structureId: value === "none" ? undefined : value
                  }))
                }
                disabled={isLoadingStructures}
              >
                <SelectTrigger id="structure-select">
                  <SelectValue placeholder="Sélectionner une structure par défaut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune structure par défaut</SelectItem>
                  {structuresData?.content?.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      {structure.code} - {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Les codes de structure dans le fichier Excel auront la priorité sur cette sélection.
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="activate-immediately">Activer immédiatement</Label>
                  <p className="text-xs text-muted-foreground">
                    Les terminaux seront activés automatiquement après création
                  </p>
                </div>
                <Switch
                  id="activate-immediately"
                  checked={uploadOptions.activateImmediately}
                  onCheckedChange={(checked) =>
                    setUploadOptions(prev => ({ ...prev, activateImmediately: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="skip-errors">Ignorer les erreurs</Label>
                  <p className="text-xs text-muted-foreground">
                    Continuer le traitement même en cas d'erreurs sur certaines lignes
                  </p>
                </div>
                <Switch
                  id="skip-errors"
                  checked={uploadOptions.skipErrors}
                  onCheckedChange={(checked) =>
                    setUploadOptions(prev => ({ ...prev, skipErrors: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-4 w-4" />
              3. Sélectionner le fichier Excel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedFile ? (
              <div
                onClick={handleFileAreaClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier Excel ici'}
                </p>
                <p className="text-muted-foreground mb-4">
                  ou cliquez pour sélectionner un fichier
                </p>
                <Badge variant="outline">Formats supportés: .xlsx, .xls</Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Changer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Progress */}
        {uploadProgress.isUploading && (
          <Card ref={progressRef}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Upload en cours...</p>
                  <span className="text-sm text-muted-foreground">
                    {uploadProgress.progress}%
                  </span>
                </div>
                <Progress value={uploadProgress.progress} />
                <p className="text-sm text-muted-foreground">
                  {uploadProgress.currentStep}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <Card ref={resultsRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                4. Résultats de l'upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Summary Message */}
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                <div className="text-lg font-semibold text-gray-900 mb-2">
                  {uploadResult.message}
                </div>
                <div className="text-sm text-gray-600">
                  Traitement terminé avec {uploadResult.data.successCount} succès sur {uploadResult.data.totalProcessed} terminaux
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {uploadResult.data.totalProcessed}
                  </div>
                  <div className="text-sm font-medium text-blue-800">Total traité</div>
                </div>
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {uploadResult.data.successCount}
                  </div>
                  <div className="text-sm font-medium text-green-800">Créés avec succès</div>
                </div>
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {uploadResult.data.errorCount}
                  </div>
                  <div className="text-sm font-medium text-red-800">Erreurs</div>
                </div>
                <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((uploadResult.data.successCount / uploadResult.data.totalProcessed) * 100)}%
                  </div>
                  <div className="text-sm font-medium text-purple-800">Taux de succès</div>
                </div>
              </div>

              {/* Status Alerts */}
              {uploadResult.success && uploadResult.data.successCount > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>{uploadResult.data.successCount} terminaux</strong> ont été créés avec succès.
                  </AlertDescription>
                </Alert>
              )}

              {uploadResult.data.errorCount > 0 && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>{uploadResult.data.errorCount} erreur(s)</strong> ont été détectées lors du traitement.
                  </AlertDescription>
                </Alert>
              )}

              {/* Successful Terminals */}
              {uploadResult.data.createdTerminals.length > 0 && (
                <Collapsible open={showSuccess} onOpenChange={setShowSuccess}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Terminaux créés avec succès ({uploadResult.data.createdTerminals.length})
                      </span>
                      {showSuccess ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <ScrollArea className="h-48">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Numéro de série</TableHead>
                            <TableHead>Code d'activation</TableHead>
                            <TableHead>Modèle</TableHead>
                            <TableHead>Structure</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.data.createdTerminals.map((terminal) => (
                            <TableRow key={terminal.id}>
                              <TableCell className="font-mono">
                                {terminal.serialNumber}
                              </TableCell>
                              <TableCell className="font-mono">
                                {terminal.activationCode}
                              </TableCell>
                              <TableCell>{terminal.model}</TableCell>
                              <TableCell>{terminal.structureName}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Error Details */}
              {uploadResult.data.errors.length > 0 && (
                <Collapsible open={showErrors} onOpenChange={setShowErrors}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        Détails des erreurs ({uploadResult.data.errors.length})
                      </span>
                      {showErrors ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
                    <ScrollArea className="h-48">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ligne</TableHead>
                            <TableHead>Numéro de série</TableHead>
                            <TableHead>Erreur</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {uploadResult.data.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.rowNumber}</TableCell>
                              <TableCell className="font-mono">
                                {error.serialNumber}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {error.error}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </FormModal>
  );
}