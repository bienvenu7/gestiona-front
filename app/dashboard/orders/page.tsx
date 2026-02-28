"use client";

import React, { useEffect } from "react";
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
import { Plus, DollarSign, Search, XIcon } from "lucide-react";
import {
  type Order,
  type Payment,
  initialOrders,
  initialPayments,
  initialProducts,
} from "@/lib/mock-data";
import { TablePagination } from "@/components/table-pagination";
import { DateRangeFilter } from "@/components/date-range-filter";
import type { DateRange } from "react-day-picker";
import {
  isWithinInterval,
  parseISO,
  startOfDay,
  endOfDay,
  format,
} from "date-fns";
import { Auth } from "@/providers/AuthContext";
import { useGetClients } from "@/hooks/useClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IClient } from "@/types/company";
import { useGetProducts } from "@/hooks/useProduct";
import {
  useCreateOrder,
  useCreatePayment,
  useGetOrders,
} from "@/hooks/useCompany";
import { formatPrice, formattedDate } from "@/lib/helper";
import {
  ICart,
  ICreateOrder,
  IOrder,
  IPayementResponse,
  IPaymentData,
} from "@/types/socket";
import { useSocket } from "@/providers/Socket";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 8;

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { state } = Auth();

  const socket = useSocket();

  const { data: clients } = useGetClients(state.user?.company.id);
  const { data: products } = useGetProducts(state.user?.company.id);
  const { asyncCreateOrder, isPending: loading } = useCreateOrder();
  const { asyncCreatePayment, isPending: loadingPayment } = useCreatePayment();

  const [searchByClientName, setSearchByClientName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [carts, setCarts] = useState<ICart[]>([]);
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ICart>({
    productId: "",
    productName: "",
    quantity: 1,
    totalPrice: 0,
  });
  const [orders, setOrders] = useState<IOrder[]>([]);

  const { isPending, data: orderData } = useGetOrders(
    state.user?.company.id,
    searchByClientName,
    startDate,
    endDate,
  );

  // const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [paymentMode, setPaymentMode] = useState<"full" | "installment">(
    "full",
  );
  const [errPayment, setErrPayment] = useState("");
  const [installmentCount, setInstallmentCount] = useState("3");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [amountToPay, setAmountToPay] = useState(0);

  const totalToPay = useMemo(() => {
    return carts.reduce((sum, { totalPrice }) => sum + totalPrice, 0);
  }, [carts]);

  // const filteredOrders = useMemo(() => {
  //   let result = orders!;
  //   if (searchQuery) {
  //     const q = searchQuery.toLowerCase();
  //     result = result.filter(
  //       (o) =>
  //         o.id.toLowerCase().includes(q) ||
  //         o.productName.toLowerCase().includes(q),
  //     );
  //   }
  //   if (statusFilter !== "all") {
  //     result = result.filter((o) => o.status === statusFilter);
  //   }
  //   if (dateRange?.from) {
  //     result = result.filter((o) => {
  //       const orderDate = parseISO(o.date);
  //       if (dateRange.to) {
  //         return isWithinInterval(orderDate, {
  //           start: startOfDay(dateRange.from!),
  //           end: endOfDay(dateRange.to),
  //         });
  //       }
  //       return orderDate >= startOfDay(dateRange.from!);
  //     });
  //   }
  //   return result;
  // }, [orders, searchQuery, statusFilter, dateRange]);

  // const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  // const safePage = Math.min(currentPage, totalPages);
  // const paginatedOrders = filteredOrders.slice(
  //   (safePage - 1) * PAGE_SIZE,
  //   safePage * PAGE_SIZE,
  // );

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (carts.length === 0 || selectedClient?.companyId === undefined) {
      return;
    }

    const orderData: ICreateOrder = {
      carts,
      order: {
        clientId: selectedClient?.id!,
        companyId: state.user?.company.id!,
        totalAmount: totalToPay,
      },
    };

    await asyncCreateOrder(orderData)
      .then((e) => {
        queryClient.invalidateQueries({
          queryKey: ["get/orders"],
        });
        // setOrders((prev) => [e, ...prev]);
        setCarts([]);
        setAddOpen(false);
        setCurrentPage(1);
        setSelectedProduct({
          productId: "",
          productName: "",
          quantity: 1,
          totalPrice: 0,
        });
        setSelectedClient(null);
      })
      .catch((e) => console.log(e));
  };

  const openPayDialog = (order: IOrder) => {
    setSelectedOrder(order);
    setPaymentMode("full");
    setInstallmentCount("3");
    setPaymentMethod("Credit Card");
    setAmountToPay(order.totalAmount - order.paidAmount);
    setPayOpen(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const remaining = selectedOrder.totalAmount - selectedOrder.paidAmount;

    if (remaining < amountToPay) {
      return setErrPayment(
        "Vous ne pouvez pas payer plus que ce qu'il reste à payer.",
      );
    }

    if (remaining === 0) {
      return setErrPayment("Impossible de payer cette transaction.");
    }

    const dataToPay: IPaymentData = {
      amountPaid: amountToPay,
      companyId: state.user?.company.id!,
      orderNumber: selectedOrder.orderNumber,
      type: paymentMode === "full" ? "COMPLET" : "ECHEANCE",
    };

    await asyncCreatePayment(dataToPay)
      .then((el) => {
        setPayOpen(false);
        setSelectedOrder(null);
      })
      .catch((e) => console.log(e));

    // if (paymentMode === "full") {
    //   const payment: Payment = {
    //     id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
    //     orderId: selectedOrder.id,
    //     amount: remaining,
    //     status: "successful",
    //     date: new Date().toISOString().split("T")[0],
    //     method: paymentMethod,
    //     type: "full",
    //   };
    //   setPayments([payment, ...payments]);
    //   setOrders(
    //     orders.map((o) =>
    //       o.id === selectedOrder.id
    //         ? {
    //             ...o,
    //             amountPaid: o.total,
    //             paymentType: "full",
    //             status: "completed",
    //           }
    //         : o,
    //     ),
    //   );
    // } else {
    //   const numInstallments = Number.parseInt(installmentCount);
    //   const installmentAmount =
    //     Math.round((remaining / numInstallments) * 100) / 100;
    //   const payment: Payment = {
    //     id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
    //     orderId: selectedOrder.id,
    //     amount: installmentAmount,
    //     status: "successful",
    //     date: new Date().toISOString().split("T")[0],
    //     method: paymentMethod,
    //     type: "installment",
    //     installmentNumber: 1,
    //     totalInstallments: numInstallments,
    //   };
    //   setPayments([payment, ...payments]);
    //   setOrders(
    //     orders.map((o) =>
    //       o.id === selectedOrder.id
    //         ? {
    //             ...o,
    //             amountPaid: o.amountPaid + installmentAmount,
    //             paymentType: "installment",
    //             installmentPlan: {
    //               totalInstallments: numInstallments,
    //               paidInstallments:
    //                 (o.installmentPlan?.paidInstallments ?? 0) + 1,
    //               installmentAmount,
    //             },
    //           }
    //         : o,
    //     ),
    //   );
    // }
    // setPayOpen(false);
    // setSelectedOrder(null);
  };

  // const handlePayNextInstallment = (order: Order) => {
  //   if (!order.installmentPlan) return;
  //   const { installmentAmount, paidInstallments, totalInstallments } =
  //     order.installmentPlan;
  //   const nextInstallment = paidInstallments + 1;
  //   const payment: Payment = {
  //     id: `PAY-${String(payments.length + 1).padStart(3, "0")}`,
  //     orderId: order.id,
  //     amount: installmentAmount,
  //     status: "successful",
  //     date: new Date().toISOString().split("T")[0],
  //     method: "Credit Card",
  //     type: "installment",
  //     installmentNumber: nextInstallment,
  //     totalInstallments,
  //   };
  //   setPayments([payment, ...payments]);

  //   const newAmountPaid = order.amountPaid + installmentAmount;
  //   const isFullyPaid = nextInstallment >= totalInstallments;

  //   setOrders(
  //     orders.map((o) =>
  //       o.id === order.id
  //         ? {
  //             ...o,
  //             amountPaid: isFullyPaid ? o.total : newAmountPaid,
  //             status: isFullyPaid ? "completed" : o.status,
  //             paymentType: isFullyPaid ? "full" : "installment",
  //             installmentPlan: {
  //               ...o.installmentPlan!,
  //               paidInstallments: nextInstallment,
  //             },
  //           }
  //         : o,
  //     ),
  //   );
  // };

  const statusColor = (status: IOrder["status"]) => {
    switch (status) {
      case "FINISH":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "WAITING":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "CANCEL":
        return "bg-red-100 text-red-700 border-red-200";
      case "PARTIAL":
        return "bg-transparent text-blue-600 border border-blue-600";
    }
  };

  const statusLabel = (status: IOrder["status"]) => {
    switch (status) {
      case "FINISH":
        return "Termin\u00e9e";
      case "WAITING":
        return "En attente";
      case "CANCEL":
        return "Annul\u00e9e";
      case "PARTIAL":
        return "Partiel";
    }
  };

  const paymentTypeLabel = (order: Order) => {
    if (order.paymentType === "full") return "Pay\u00e9";
    if (order.paymentType === "installment" && order.installmentPlan)
      return `${order.installmentPlan.paidInstallments}/${order.installmentPlan.totalInstallments} pay\u00e9`;
    return "Non pay\u00e9";
  };

  // const paymentTypeBadge = (order: IOrder) => {
  //   if (order.paymentType === "full")
  //     return "bg-emerald-100 text-emerald-700 border-emerald-200";
  //   if (order.paymentType === "installment")
  //     return "bg-blue-100 text-blue-700 border-blue-200";
  //   return "bg-muted text-muted-foreground border-border";
  // };

  const resetFilters = (setter: (v: string) => void, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (orderData !== undefined) {
      return setOrders([...orderData]);
    }
    return;
  }, [orderData]);

  useEffect(() => {
    if (!socket) return;

    socket.on("order-created", () => {
      queryClient.invalidateQueries({
        queryKey: ["get/orders", state.user?.company.id!],
      });
    });

    socket.on("Created-payement", () => {
      queryClient.invalidateQueries({
        queryKey: ["get/orders", state.user?.company.id!],
      });
      queryClient.invalidateQueries({
        queryKey: ["get/overview-stats", state.user?.company.id!],
      });
      queryClient.invalidateQueries({
        queryKey: ["get/payments", state.user?.company.id!],
      });
      queryClient.invalidateQueries({
        queryKey: ["get/payments-stats", state.user?.company.id!],
      });
      // setInitialPayments((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("order-created");
      socket.off("Created-payement");
    };
  }, []);

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
            <form onSubmit={handleAddOrder} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="product">Information du client</Label>
                <Select
                  value={selectedClient?.id}
                  onValueChange={(val) =>
                    setSelectedClient(
                      clients?.find((el) => el.id === val) as IClient,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={"S\u00e9lectionner un client"} />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((p) => (
                      <SelectItem key={p.number} value={p.id}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="btn-gradient text-xs text-white">
                              {p.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">
                            {p.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {carts.length > 0 && (
                <div className="flex flex-row gap-4 flex-wrap">
                  {carts.map((el) => (
                    <div
                      className="flex flex-row gap-2 border border-gray-300 rounded-md p-2 items-center"
                      key={el.productId}
                    >
                      <span className="text-sm">
                        {el.productName + " * " + el.quantity}
                      </span>
                      <button
                        onClick={() =>
                          setCarts((prev) => [
                            ...prev.filter((e) => e.productId !== el.productId),
                          ])
                        }
                      >
                        <XIcon style={{ width: "18px", height: "18px" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="product">Produit</Label>
                  <Select
                    value={selectedProduct.productId}
                    onValueChange={(val) => {
                      let findP = products?.data.find((el) => el.id! === val);
                      setSelectedProduct((prev) => {
                        return {
                          ...prev,
                          productName: findP?.name!,
                          productId: findP?.id!,
                          totalPrice: findP?.price! * prev.quantity,
                        };
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={"S\u00e9lectionner un produit"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.data.map((p) => (
                        <SelectItem key={p.sku!} value={p.id!}>
                          {p.name} - {p.price.toFixed(2)} Franc;
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
                    value={selectedProduct.quantity}
                    onChange={(e) =>
                      setSelectedProduct((prev) => {
                        return {
                          ...prev,
                          quantity: parseInt(e.target.value),
                        };
                      })
                    }
                    required
                  />
                </div>
              </div>
              <button
                type="button"
                className="h-10 w-full rounded-lg text-sm font-medium border-primary"
                onClick={() => {
                  const findIndex = carts.findIndex(
                    (el) => el.productId === selectedProduct.productId,
                  );

                  const totalPrice =
                    selectedProduct.totalPrice * selectedProduct.quantity;

                  if (findIndex > -1) {
                    carts[findIndex] = {
                      ...carts[findIndex],
                      quantity:
                        carts[findIndex].quantity + selectedProduct.quantity,
                      totalPrice: carts[findIndex].totalPrice + totalPrice,
                    };

                    setSelectedProduct({
                      productId: "",
                      productName: "",
                      quantity: 1,
                      totalPrice: 0,
                    });
                    setCarts([...carts]);
                    return;
                  }
                  setCarts((prev) => [
                    { ...selectedProduct, totalPrice },
                    ...prev,
                  ]);
                  setSelectedProduct({
                    productId: "",
                    productName: "",
                    quantity: 1,
                    totalPrice: 0,
                  });
                  return;
                }}
              >
                {"Ajouter à la comande"}
              </button>
              <button
                type="submit"
                className="h-10 w-full rounded-lg btn-gradient text-sm font-medium"
              >
                {loading
                  ? "Veillez patienter..."
                  : `Créer la commande ${totalToPay.toLocaleString()} Franc CFA`}
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
            if (!range) {
              setEndDate(null);
              setStartDate(null);
            }

            if (range?.from) {
              setStartDate(startOfDay(range.from!).toISOString());
            }

            if (range?.to) {
              setEndDate(endOfDay(range.to!).toISOString());
            }
            setDateRange(range);
            setCurrentPage(1);
          }}
        />
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-base font-semibold text-foreground">
            Toutes les commandes ({orders?.length})
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
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {"Veuillez patienter..."}
                    </TableCell>
                  </TableRow>
                ) : orders?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {"Aucune commande trouv\u00e9e."}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders?.map((order) => {
                    const remaining = order.totalAmount - order.paidAmount;
                    const statuses = ["WAITING", "PARTIAL"];
                    const canPay =
                      statuses.includes(order.status) && remaining > 0;
                    // const canPayInstallment =
                    //   order.paymentType === "installment" &&
                    //   order.installmentPlan &&
                    //   order.installmentPlan.paidInstallments <
                    //     order.installmentPlan.totalInstallments;

                    return (
                      <TableRow key={order.orderNumber}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell
                          className="font-medium text-foreground"
                          style={{ maxWidth: "180px" }}
                        >
                          {order.products.map(
                            (el) => `${el.productName} * ${el.quantity} | `,
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {order.products.reduce(
                            (sum, { quantity }) => sum + quantity,
                            0,
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatPrice(order.paidAmount)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formattedDate(order.createdAt)}
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
                            {canPay ? (
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
          {/* {filteredOrders.length > 0 && (
            <TablePagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )} */}
        </CardContent>
      </Card>

      {/* Dialogue de paiement */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="flex flex-col gap-6">
          <DialogHeader className="flex flex-col gap-4">
            <DialogTitle className="font-heading">
              Ajouter un paiement
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedOrder && (
                <>
                  Commande{" "}
                  <span className="font-mono font-semibold">
                    {selectedOrder.orderNumber}
                  </span>{" "}
                  - Total : {formatPrice(selectedOrder.totalAmount)} Francs; |
                  Restant :{" "}
                  {formatPrice(
                    selectedOrder.totalAmount - selectedOrder.paidAmount,
                  )}{" "}
                  Francs
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <form onSubmit={handlePayment} className="flex flex-col gap-8">
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total commande
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatPrice(selectedOrder.totalAmount)} Francs;
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {"D\u00e9j\u00e0 pay\u00e9"}
                  </span>
                  <span className="font-mono text-sm text-emerald-600">
                    {formatPrice(selectedOrder.paidAmount)} Francs;
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-border pt-1">
                  <span className="text-sm font-medium text-foreground">
                    Restant
                  </span>
                  <span className="font-mono font-semibold link-gradient">
                    {formatPrice(
                      selectedOrder.totalAmount - selectedOrder.paidAmount,
                    )}{" "}
                    Francs
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

              {/* {paymentMode === "installment" && (
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
                        ((selectedOrder.totalAmount -
                          selectedOrder.paidAmount) /
                          Number.parseInt(installmentCount)) *
                          100,
                      ) / 100
                    ).toFixed(2)}{" "}
                    &euro;
                  </p>
                </div>
              )} */}

              {/* <div className="flex flex-col gap-2">
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
              </div> */}

              {paymentMode === "installment" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="montant">{"Montant à payer"}</Label>
                  <Input
                    id="montant"
                    style={errPayment ? { border: "1px solid red" } : {}}
                    type="number"
                    min="1"
                    placeholder="1"
                    value={amountToPay}
                    onChange={(e) => {
                      setAmountToPay(parseFloat(e.target.value));
                      setErrPayment("");
                    }}
                    required
                  />
                </div>
              )}

              {errPayment.length > 1 && (
                <p
                  className="text-sm text-red-500"
                  style={errPayment ? { color: "red" } : {}}
                >
                  {errPayment}
                </p>
              )}

              <button
                type="submit"
                className="h-10 w-full rounded-lg btn-gradient text-sm font-bold"
                disabled={loadingPayment}
              >
                {loadingPayment
                  ? "Veuillez patienter..."
                  : paymentMode === "full"
                    ? `Payer ${formatPrice(selectedOrder.totalAmount - selectedOrder.paidAmount)} Francs`
                    : `D\u00e9marrer les \u00e9ch\u00e9ances (${formatPrice(
                        amountToPay | 0,
                      )} Francs)`}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
