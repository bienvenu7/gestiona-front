"use client";

import React from "react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, DollarSign, Search } from "lucide-react";
import {
  type Order,
  type Payment,
  initialOrders,
  initialPayments,
  initialProducts,
  clients,
} from "@/lib/mock-data";
import { TablePagination } from "@/components/table-pagination";
import { DateRangeFilter } from "@/components/date-range-filter";
import type { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMode, setPaymentMode] = useState<"full" | "installment">(
    "full",
  );
  const [installmentCount, setInstallmentCount] = useState("3");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [newOrder, setNewOrder] = useState({ productName: "", quantity: "" });

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (dateRange?.from) {
      result = result.filter((o) => {
        const orderDate = parseISO(o.date);
        if (dateRange.to) {
          return isWithinInterval(orderDate, {
            start: startOfDay(dateRange.from!),
            end: endOfDay(dateRange.to),
          });
        }
        return orderDate >= startOfDay(dateRange.from!);
      });
    }
    return result;
  }, [orders, searchQuery, statusFilter, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const product = initialProducts.find(
      (p) => p.name === newOrder.productName,
    );
    if (!product) return;
    const qty = Number.parseInt(newOrder.quantity);
    const order: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      productName: newOrder.productName,
      quantity: qty,
      total: product.price * qty,
      amountPaid: 0,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      paymentType: "unpaid",
    };
    setOrders([order, ...orders]);
    setNewOrder({ productName: "", quantity: "" });
    setAddOpen(false);
    setCurrentPage(1);
  };

  const openPayDialog = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMode("full");
    setInstallmentCount("3");
    setPaymentMethod("Credit Card");
    setPayOpen(true);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const remaining = selectedOrder.total - selectedOrder.amountPaid;

    if (paymentMode === "full") {
      const payment: Payment = {
        id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
        orderId: selectedOrder.id,
        amount: remaining,
        status: "successful",
        date: new Date().toISOString().split("T")[0],
        method: paymentMethod,
        type: "full",
      };
      setPayments([payment, ...payments]);
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                amountPaid: o.total,
                paymentType: "full",
                status: "completed",
              }
            : o,
        ),
      );
    } else {
      const numInstallments = Number.parseInt(installmentCount);
      const installmentAmount =
        Math.round((remaining / numInstallments) * 100) / 100;
      const payment: Payment = {
        id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
        orderId: selectedOrder.id,
        amount: installmentAmount,
        status: "successful",
        date: new Date().toISOString().split("T")[0],
        method: paymentMethod,
        type: "installment",
        installmentNumber: 1,
        totalInstallments: numInstallments,
      };
      setPayments([payment, ...payments]);
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id
            ? {
                ...o,
                amountPaid: o.amountPaid + installmentAmount,
                paymentType: "installment",
                installmentPlan: {
                  totalInstallments: numInstallments,
                  paidInstallments:
                    (o.installmentPlan?.paidInstallments ?? 0) + 1,
                  installmentAmount,
                },
              }
            : o,
        ),
      );
    }
    setPayOpen(false);
    setSelectedOrder(null);
  };

  const handlePayNextInstallment = (order: Order) => {
    if (!order.installmentPlan) return;
    const { installmentAmount, paidInstallments, totalInstallments } =
      order.installmentPlan;
    const nextInstallment = paidInstallments + 1;
    const payment: Payment = {
      id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
      orderId: order.id,
      amount: installmentAmount,
      status: "successful",
      date: new Date().toISOString().split("T")[0],
      method: "Credit Card",
      type: "installment",
      installmentNumber: nextInstallment,
      totalInstallments,
    };
    setPayments([payment, ...payments]);

    const newAmountPaid = order.amountPaid + installmentAmount;
    const isFullyPaid = nextInstallment >= totalInstallments;

    setOrders(
      orders.map((o) =>
        o.id === order.id
          ? {
              ...o,
              amountPaid: isFullyPaid ? o.total : newAmountPaid,
              status: isFullyPaid ? "completed" : o.status,
              paymentType: isFullyPaid ? "full" : "installment",
              installmentPlan: {
                ...o.installmentPlan!,
                paidInstallments: nextInstallment,
              },
            }
          : o,
      ),
    );
  };

  const statusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
    }
  };

  const statusLabel = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "Termin\u00e9e";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annul\u00e9e";
    }
  };

  const paymentTypeLabel = (order: Order) => {
    if (order.paymentType === "full") return "Pay\u00e9";
    if (order.paymentType === "installment" && order.installmentPlan)
      return `${order.installmentPlan.paidInstallments}/${order.installmentPlan.totalInstallments} pay\u00e9`;
    return "Non pay\u00e9";
  };

  const paymentTypeBadge = (order: Order) => {
    if (order.paymentType === "full")
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (order.paymentType === "installment")
      return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-muted text-muted-foreground border-border";
  };

  const resetFilters = (setter: (v: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Commandes
          </h1>
          <p className="text-sm text-muted-foreground">
            Suivez et g&eacute;rez les commandes de vente
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg btn-gradient px-4 text-sm"
            >
              <Plus className="h-4 w-4" />
              Enregistrer une vente
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                Enregistrer une vente
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {
                  "Cr\u00e9ez une nouvelle commande en s\u00e9lectionnant un produit et une quantit\u00e9."
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddOrder} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="product">Information du client</Label>
                <Select
                  value={newOrder.productName}
                  onValueChange={(val) =>
                    setNewOrder({ ...newOrder, productName: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"S\u00e9lectionner un client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((p) => (
                      <SelectItem key={p.number} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="product">Produit</Label>
                <Select
                  value={newOrder.productName}
                  onValueChange={(val) =>
                    setNewOrder({ ...newOrder, productName: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"S\u00e9lectionner un produit"} />
                  </SelectTrigger>
                  <SelectContent>
                    {initialProducts.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name} - {p.price.toFixed(2)} &euro;
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">{"Quantit\u00e9"}</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={newOrder.quantity}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, quantity: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
              >
                {"Cr\u00e9er la commande"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher des commandes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => resetFilters(setSearchQuery, e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => resetFilters(setStatusFilter, val)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="completed">{"Termin\u00e9e"}</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="cancelled">{"Annul\u00e9e"}</SelectItem>
          </SelectContent>
        </Select>
        <DateRangeFilter
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }}
        />
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Toutes les commandes ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[480px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="border-b-2 border-border">
                  <TableHead>N&deg; Commande</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">{"Qt\u00e9"}</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">{"Pay\u00e9"}</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {"Aucune commande trouv\u00e9e."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => {
                    const remaining = order.total - order.amountPaid;
                    const canPay =
                      order.status !== "cancelled" && remaining > 0;
                    const canPayInstallment =
                      order.paymentType === "installment" &&
                      order.installmentPlan &&
                      order.installmentPlan.paidInstallments <
                        order.installmentPlan.totalInstallments;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {order.id}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {order.productName}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {order.quantity}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {order.total.toFixed(2)} &euro;
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {order.amountPaid.toFixed(2)} &euro;
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${paymentTypeBadge(order)}`}
                          >
                            {paymentTypeLabel(order)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.date}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColor(order.status)}`}
                          >
                            {statusLabel(order.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {canPayInstallment ? (
                              <button
                                type="button"
                                onClick={() => handlePayNextInstallment(order)}
                                className="flex h-7 items-center gap-1 rounded-md btn-gradient px-2 text-xs"
                              >
                                <DollarSign className="h-3 w-3" />
                                Suivant
                              </button>
                            ) : canPay ? (
                              <button
                                type="button"
                                onClick={() => openPayDialog(order)}
                                className="flex h-7 items-center gap-1 rounded-md btn-gradient px-2 text-xs"
                              >
                                <DollarSign className="h-3 w-3" />
                                Payer
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                --
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length > 0 && (
            <TablePagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>

      {/* Dialogue de paiement */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Ajouter un paiement
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedOrder && (
                <>
                  Commande{" "}
                  <span className="font-mono font-semibold">
                    {selectedOrder.id}
                  </span>{" "}
                  - Total : {selectedOrder.total.toFixed(2)} &euro; | Restant :{" "}
                  {(selectedOrder.total - selectedOrder.amountPaid).toFixed(2)}{" "}
                  &euro;
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <form onSubmit={handlePayment} className="flex flex-col gap-4">
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total commande
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedOrder.total.toFixed(2)} &euro;
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {"D\u00e9j\u00e0 pay\u00e9"}
                  </span>
                  <span className="font-mono text-sm text-emerald-600">
                    {selectedOrder.amountPaid.toFixed(2)} &euro;
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-border pt-1">
                  <span className="text-sm font-medium text-foreground">
                    Restant
                  </span>
                  <span className="font-mono font-semibold link-gradient">
                    {(selectedOrder.total - selectedOrder.amountPaid).toFixed(
                      2,
                    )}{" "}
                    &euro;
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Type de paiement</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("full")}
                    className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      paymentMode === "full"
                        ? "btn-gradient border-transparent"
                        : "border-input bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    Paiement complet
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("installment")}
                    className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      paymentMode === "installment"
                        ? "btn-gradient border-transparent"
                        : "border-input bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    {"\u00c9ch\u00e9ances"}
                  </button>
                </div>
              </div>

              {paymentMode === "installment" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="installments">
                    {"Nombre d'\u00e9ch\u00e9ances"}
                  </Label>
                  <Select
                    value={installmentCount}
                    onValueChange={setInstallmentCount}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">
                        {"2 \u00e9ch\u00e9ances"}
                      </SelectItem>
                      <SelectItem value="3">
                        {"3 \u00e9ch\u00e9ances"}
                      </SelectItem>
                      <SelectItem value="4">
                        {"4 \u00e9ch\u00e9ances"}
                      </SelectItem>
                      <SelectItem value="6">
                        {"6 \u00e9ch\u00e9ances"}
                      </SelectItem>
                      <SelectItem value="12">
                        {"12 \u00e9ch\u00e9ances"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {"Chaque \u00e9ch\u00e9ance : "}
                    {(
                      Math.round(
                        ((selectedOrder.total - selectedOrder.amountPaid) /
                          Number.parseInt(installmentCount)) *
                          100,
                      ) / 100
                    ).toFixed(2)}{" "}
                    &euro;
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label>{"M\u00e9thode de paiement"}</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Card">
                      Carte de cr&eacute;dit
                    </SelectItem>
                    <SelectItem value="Debit Card">
                      Carte de d&eacute;bit
                    </SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Bank Transfer">
                      Virement bancaire
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <button
                type="submit"
                className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
              >
                {paymentMode === "full"
                  ? `Payer ${(selectedOrder.total - selectedOrder.amountPaid).toFixed(2)} \u20ac`
                  : `D\u00e9marrer les \u00e9ch\u00e9ances (${(
                      Math.round(
                        ((selectedOrder.total - selectedOrder.amountPaid) /
                          Number.parseInt(installmentCount)) *
                          100,
                      ) / 100
                    ).toFixed(2)} \u20ac/mois)`}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
