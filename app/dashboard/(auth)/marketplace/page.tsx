"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, ShoppingBasket, UserCheck, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFarms } from "@/data/farms";
import { useFarmCustomers, useFarmProducts, useFarmOrders } from "@/data/marketplace";
import { CustomerFormModal, ProductFormModal, OrderFormModal } from "./components";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { safeArray } from "@/lib/utils/safe-array";

const orderStatusLabels: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-gray-100 text-gray-800" }, PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmé", className: "bg-blue-100 text-blue-800" }, PROCESSING: { label: "En cours", className: "bg-indigo-100 text-indigo-800" },
  READY: { label: "Prêt", className: "bg-green-100 text-green-800" }, DELIVERED: { label: "Livré", className: "bg-emerald-100 text-emerald-800" },
  CANCELLED: { label: "Annulé", className: "bg-red-100 text-red-800" },
};
const paymentLabels: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-yellow-100 text-yellow-800" }, PARTIAL: { label: "Partiel", className: "bg-orange-100 text-orange-800" },
  PAID: { label: "Payé", className: "bg-green-100 text-green-800" }, OVERDUE: { label: "En retard", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Annulé", className: "bg-gray-100 text-gray-800" },
};
const customerTypeLabels: Record<string, string> = { INDIVIDUAL: "Particulier", COMPANY: "Entreprise", COOPERATIVE: "Coopérative", RESTAURANT: "Restaurant", WHOLESALER: "Grossiste", RETAILER: "Détaillant" };
const productTypeLabels: Record<string, string> = { CROP: "Culture", LIVESTOCK: "Élevage", PROCESSED: "Transformé", BY_PRODUCT: "Sous-produit", SERVICE: "Service" };

export default function MarketplacePage() {
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [isCustFormOpen, setIsCustFormOpen] = useState(false);
  const [isProdFormOpen, setIsProdFormOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  const { data: farmsData } = useFarms(0, 100);
  const farms = farmsData?.data?.content ?? [];
  const { data: custsData, isLoading: custLoading } = useFarmCustomers(selectedFarmId);
  const { data: prodsData, isLoading: prodLoading } = useFarmProducts(selectedFarmId);
  const { data: ordersData, isLoading: ordLoading } = useFarmOrders(selectedFarmId);
  const customers = safeArray(custsData?.data);
  const products = safeArray(prodsData?.data);
  const orders = safeArray(ordersData?.data);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><ShoppingCart className="h-6 w-6 text-pink-600" /> Marché</h1>
          <p className="text-muted-foreground">Clients, produits et commandes</p>
        </div>
        <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Sélectionner une ferme" /></SelectTrigger>
          <SelectContent>{farms.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {!selectedFarmId ? (
        <div className="flex flex-col items-center justify-center py-20"><ShoppingCart className="h-12 w-12 text-muted-foreground/30 mb-4" /><p className="text-muted-foreground">Sélectionnez une ferme</p></div>
      ) : (
        <Tabs defaultValue="orders">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="orders"><ShoppingCart className="mr-1.5 h-4 w-4" /> Commandes ({orders.length})</TabsTrigger>
              <TabsTrigger value="products"><ShoppingBasket className="mr-1.5 h-4 w-4" /> Produits ({products.length})</TabsTrigger>
              <TabsTrigger value="customers"><UserCheck className="mr-1.5 h-4 w-4" /> Clients ({customers.length})</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <PermissionGuard permission={PERMISSIONS.MARKETPLACE.ORDER_CREATE}>
                <Button size="sm" onClick={() => setIsOrderFormOpen(true)} className="bg-green-600 hover:bg-green-700"><PlusCircle className="mr-1 h-4 w-4" /> Commande</Button>
              </PermissionGuard>
              <PermissionGuard permission={PERMISSIONS.MARKETPLACE.PRODUCT_CREATE}>
                <Button size="sm" variant="outline" onClick={() => setIsProdFormOpen(true)}><PlusCircle className="mr-1 h-4 w-4" /> Produit</Button>
              </PermissionGuard>
              <PermissionGuard permission={PERMISSIONS.MARKETPLACE.CUSTOMER_CREATE}>
                <Button size="sm" variant="outline" onClick={() => setIsCustFormOpen(true)}><PlusCircle className="mr-1 h-4 w-4" /> Client</Button>
              </PermissionGuard>
            </div>
          </div>

          {/* ORDERS TAB */}
          <TabsContent value="orders" className="mt-4">
            {ordLoading ? <Skeleton className="h-40" /> : orders.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Aucune commande</p></div>
            ) : (
              <div className="rounded-lg border">
                <div className="grid grid-cols-6 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground"><span>N° commande</span><span>Client</span><span>Date</span><span>Montant</span><span>Statut</span><span>Paiement</span></div>
                {orders.map((o: any) => {
                  const oSt = orderStatusLabels[o.orderStatus] ?? { label: o.orderStatus, className: "" };
                  const pSt = paymentLabels[o.paymentStatus] ?? { label: o.paymentStatus, className: "" };
                  return (
                    <Link key={o.id} href={`/dashboard/marketplace/orders/${o.id}`} className="grid grid-cols-6 gap-4 p-3 border-b last:border-0 text-sm hover:bg-muted/50 transition-colors">
                      <span className="font-mono text-xs">{o.orderNumber}</span>
                      <span>{o.customerName ?? "—"}</span>
                      <span className="text-muted-foreground">{o.orderDate}</span>
                      <span className="font-medium">{o.netAmount?.toLocaleString()} FCFA</span>
                      <Badge className={oSt.className}>{oSt.label}</Badge>
                      <Badge className={pSt.className}>{pSt.label}</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="mt-4">
            {prodLoading ? <Skeleton className="h-40" /> : products.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Aucun produit</p></div>
            ) : (
              <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p: any) => (
                  <Card key={p.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{p.name}</p>
                        <Badge variant="outline">{productTypeLabels[p.productType] ?? p.productType}</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Prix:</span> <span className="font-medium">{p.unitPrice?.toLocaleString()} FCFA / {p.unit}</span></p>
                        <p><span className="text-muted-foreground">Stock:</span> {p.availableQuantity} {p.unit}</p>
                        {p.qualityGrade && <p><span className="text-muted-foreground">Qualité:</span> {p.qualityGrade}</p>}
                        {p.expiryDate && <p><span className="text-muted-foreground">Expire:</span> {p.expiryDate}</p>}
                      </div>
                      <div className="mt-2">{p.isAvailable ? <Badge className="bg-green-100 text-green-700">Disponible</Badge> : <Badge className="bg-gray-100 text-gray-700">Indisponible</Badge>}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* CUSTOMERS TAB */}
          <TabsContent value="customers" className="mt-4">
            {custLoading ? <Skeleton className="h-40" /> : customers.length === 0 ? (
              <div className="text-center py-16"><p className="text-muted-foreground">Aucun client</p></div>
            ) : (
              <div className="rounded-lg border">
                <div className="grid grid-cols-5 gap-4 p-3 border-b bg-muted/50 text-xs font-medium text-muted-foreground"><span>Client</span><span>Type</span><span>Téléphone</span><span>Limite crédit</span><span>Statut</span></div>
                {customers.map((c: any) => (
                  <div key={c.id} className="grid grid-cols-5 gap-4 p-3 border-b last:border-0 text-sm">
                    <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground font-mono">{c.customerCode}</p></div>
                    <Badge variant="outline">{customerTypeLabels[c.customerType] ?? c.customerType}</Badge>
                    <span className="text-muted-foreground">{c.phoneNumber ?? "—"}</span>
                    <span>{c.creditLimit ? `${c.creditLimit.toLocaleString()} FCFA` : "—"}</span>
                    <span>{c.isActive ? <Badge className="bg-green-100 text-green-700">Actif</Badge> : <Badge className="bg-gray-100 text-gray-700">Inactif</Badge>}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {selectedFarmId && (
        <>
          <CustomerFormModal open={isCustFormOpen} onOpenChange={setIsCustFormOpen} farmId={selectedFarmId} />
          <ProductFormModal open={isProdFormOpen} onOpenChange={setIsProdFormOpen} farmId={selectedFarmId} />
          <OrderFormModal open={isOrderFormOpen} onOpenChange={setIsOrderFormOpen} farmId={selectedFarmId} />
        </>
      )}
    </div>
  );
}
