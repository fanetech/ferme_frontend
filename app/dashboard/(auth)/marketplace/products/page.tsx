"use client";

import { useState } from "react";
import { ShoppingBasket, PlusCircle, AlertTriangle, Search, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useFarms } from "@/data/farms";
import { useFarmProducts } from "@/data/marketplace";
import { ProductFormModal } from "../components";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { safeArray } from "@/lib/utils/safe-array";

const typeOptions = [
  { value: "ALL", label: "Tous les types" },
  { value: "CROP", label: "Culture" },
  { value: "LIVESTOCK", label: "Élevage" },
  { value: "PROCESSED", label: "Transformé" },
  { value: "BY_PRODUCT", label: "Sous-produit" },
  { value: "SERVICE", label: "Service" },
];

const typeColors: Record<string, string> = {
  CROP: "bg-green-100 text-green-800",
  LIVESTOCK: "bg-amber-100 text-amber-800",
  PROCESSED: "bg-blue-100 text-blue-800",
  BY_PRODUCT: "bg-purple-100 text-purple-800",
  SERVICE: "bg-gray-100 text-gray-800",
};

const qualityColors: Record<string, string> = {
  PREMIUM: "bg-yellow-100 text-yellow-800",
  STANDARD: "bg-blue-100 text-blue-800",
  ECONOMY: "bg-gray-100 text-gray-800",
  REJECT: "bg-red-100 text-red-800",
};

const typeLabels: Record<string, string> = {
  CROP: "Culture", LIVESTOCK: "Élevage", PROCESSED: "Transformé",
  BY_PRODUCT: "Sous-produit", SERVICE: "Service",
};

const qualityLabels: Record<string, string> = {
  PREMIUM: "Premium", STANDARD: "Standard", ECONOMY: "Économique", REJECT: "Rejet",
};

export default function ProductsPage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];

  const { data: productsData, isLoading } = useFarmProducts(selectedFarmId);
  const allProducts = safeArray(productsData?.data);

  const filtered = allProducts.filter((p: any) => {
    const matchType = typeFilter === "ALL" || p.productType === typeFilter;
    const matchSearch = !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.productCode?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const lowStockProducts = allProducts.filter((p: any) => p.availableQuantity <= 0);
  const totalValue = allProducts.reduce((sum: number, p: any) => sum + (p.unitPrice * p.availableQuantity || 0), 0);
  const availableCount = allProducts.filter((p: any) => p.isAvailable).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBasket className="h-6 w-6 text-pink-600" /> Produits
          </h1>
          <p className="text-muted-foreground">Gestion des produits à vendre</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Sélectionner une ferme" />
            </SelectTrigger>
            <SelectContent>
              {farms.map((f: any) => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFarmId && (
            <PermissionGuard permission={PERMISSIONS.MARKETPLACE.PRODUCT_CREATE}>
              <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
                <PlusCircle className="mr-2 h-4 w-4" /> Nouveau produit
              </Button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ShoppingBasket className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Sélectionnez une ferme pour voir ses produits</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          {!isLoading && allProducts.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Total produits</p>
                  <p className="text-2xl font-bold">{allProducts.length}</p>
                  <p className="text-xs text-muted-foreground">{availableCount} disponibles</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">Valeur totale stock</p>
                  <p className="text-2xl font-bold">{totalValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">FCFA</p>
                </CardContent>
              </Card>
              <Card className={lowStockProducts.length > 0 ? "border-red-200 bg-red-50/50" : ""}>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {lowStockProducts.length > 0 && <AlertTriangle className="h-3 w-3 text-red-500" />}
                    Stock épuisé
                  </p>
                  <p className={`text-2xl font-bold ${lowStockProducts.length > 0 ? "text-red-600" : ""}`}>
                    {lowStockProducts.length}
                  </p>
                  <p className="text-xs text-muted-foreground">produit{lowStockProducts.length > 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBasket className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">
                {allProducts.length === 0 ? "Aucun produit pour cette ferme" : "Aucun produit ne correspond aux filtres"}
              </p>
              {allProducts.length === 0 && (
                <PermissionGuard permission={PERMISSIONS.MARKETPLACE.PRODUCT_CREATE}>
                  <Button onClick={() => setIsFormOpen(true)} className="mt-4 bg-green-600 hover:bg-green-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un produit
                  </Button>
                </PermissionGuard>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {filtered.length} produit{filtered.length > 1 ? "s" : ""}
                {typeFilter !== "ALL" || search ? ` (filtré${filtered.length > 1 ? "s" : ""})` : ""}
              </p>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p: any) => {
                  const isOutOfStock = p.availableQuantity <= 0;
                  return (
                    <Card key={p.id} className={`hover:shadow-md transition-shadow ${isOutOfStock ? "border-red-200" : ""}`}>
                      <CardContent className="pt-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.productCode}</p>
                          </div>
                          <Badge className={typeColors[p.productType] ?? "bg-gray-100 text-gray-800"}>
                            {typeLabels[p.productType] ?? p.productType}
                          </Badge>
                        </div>

                        {/* Price & Stock */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Prix unitaire</p>
                            <p className="font-bold text-green-700">{p.unitPrice?.toLocaleString()} FCFA</p>
                            <p className="text-xs text-muted-foreground">/ {p.unit}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Quantité dispo.</p>
                            <p className={`font-bold text-lg ${isOutOfStock ? "text-red-600" : "text-foreground"}`}>
                              {p.availableQuantity}
                            </p>
                            <p className="text-xs text-muted-foreground">{p.unit}</p>
                          </div>
                        </div>

                        {/* Value */}
                        <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                          Valeur stock : <span className="font-medium text-foreground">
                            {(p.unitPrice * p.availableQuantity)?.toLocaleString()} FCFA
                          </span>
                        </div>

                        {/* Quality & Dates */}
                        <div className="flex flex-wrap gap-1.5">
                          {p.qualityGrade && (
                            <Badge variant="outline" className={qualityColors[p.qualityGrade] ?? ""}>
                              {qualityLabels[p.qualityGrade] ?? p.qualityGrade}
                            </Badge>
                          )}
                          {p.harvestDate && (
                            <Badge variant="outline" className="text-xs">
                              Récolte: {p.harvestDate}
                            </Badge>
                          )}
                          {p.expiryDate && (
                            <Badge variant="outline" className="text-xs text-orange-700 bg-orange-50">
                              Expire: {p.expiryDate}
                            </Badge>
                          )}
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between pt-1 border-t">
                          {isOutOfStock ? (
                            <Badge className="bg-red-100 text-red-700">Stock épuisé</Badge>
                          ) : p.isAvailable ? (
                            <Badge className="bg-green-100 text-green-700">Disponible</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700">Indisponible</Badge>
                          )}
                          {p.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]" title={p.description}>
                              {p.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {selectedFarmId && (
        <ProductFormModal open={isFormOpen} onOpenChange={setIsFormOpen} farmId={selectedFarmId} />
      )}
    </div>
  );
}
