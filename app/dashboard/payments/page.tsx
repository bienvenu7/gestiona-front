"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, DollarSign, TrendingUp, CreditCard } from "lucide-react"
import { initialPayments } from "@/lib/mock-data"
import { TablePagination } from "@/components/table-pagination"
import { DateRangeFilter } from "@/components/date-range-filter"
import type { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns"

const PAGE_SIZE = 8

export default function PaymentsPage() {
  const [filterOrderId, setFilterOrderId] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [activeTab, setActiveTab] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const baseFiltered = useMemo(() => {
    let result = [...initialPayments]
    if (filterOrderId) {
      const q = filterOrderId.toLowerCase()
      result = result.filter(
        (p) =>
          p.orderId.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      )
    }
    if (typeFilter !== "all") {
      result = result.filter((p) => p.type === typeFilter)
    }
    if (dateRange?.from) {
      result = result.filter((p) => {
        const payDate = parseISO(p.date)
        if (dateRange.to) {
          return isWithinInterval(payDate, {
            start: startOfDay(dateRange.from!),
            end: endOfDay(dateRange.to),
          })
        }
        return payDate >= startOfDay(dateRange.from!)
      })
    }
    return result
  }, [filterOrderId, typeFilter, dateRange])

  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return baseFiltered
    if (activeTab === "successful") return baseFiltered.filter((p) => p.status === "successful")
    if (activeTab === "in-progress") return baseFiltered.filter((p) => p.status === "in-progress")
    if (activeTab === "failed") return baseFiltered.filter((p) => p.status === "failed")
    return baseFiltered
  }, [baseFiltered, activeTab])

  const totalPages = Math.max(1, Math.ceil(tabFiltered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedPayments = tabFiltered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const totalAmount = baseFiltered.reduce((sum, p) => sum + p.amount, 0)
  const successfulAmount = baseFiltered
    .filter((p) => p.status === "successful")
    .reduce((sum, p) => sum + p.amount, 0)
  const installmentPayments = baseFiltered.filter((p) => p.type === "installment")

  const statusStyle = (status: string) => {
    switch (status) {
      case "successful":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "failed":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case "successful":
        return "R\u00e9ussi"
      case "in-progress":
        return "En cours"
      case "failed":
        return "\u00c9chou\u00e9"
      default:
        return status
    }
  }

  const methodLabel = (method: string) => {
    switch (method) {
      case "Credit Card":
        return "Carte de cr\u00e9dit"
      case "Debit Card":
        return "Carte de d\u00e9bit"
      case "Bank Transfer":
        return "Virement bancaire"
      default:
        return method
    }
  }

  const resetPage = () => setCurrentPage(1)

  const stats = [
    {
      title: "Total paiements",
      value: baseFiltered.length.toString(),
      icon: CreditCard,
      subtitle: "transactions",
    },
    {
      title: "Montant total",
      value: `${totalAmount.toFixed(2)} \u20ac`,
      icon: DollarSign,
      subtitle: "tous les paiements",
    },
    {
      title: "R\u00e9ussis",
      value: `${successfulAmount.toFixed(2)} \u20ac`,
      icon: TrendingUp,
      subtitle: `${baseFiltered.filter((p) => p.status === "successful").length} paiements`,
    },
    {
      title: "\u00c9ch\u00e9ances",
      value: installmentPayments.length.toString(),
      icon: CreditCard,
      subtitle: "plans actifs",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Paiements</h1>
        <p className="text-sm text-muted-foreground">{"Suivez les statuts et l'historique des paiements"}</p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-gradient">
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID commande ou paiement..."
            className="pl-9"
            value={filterOrderId}
            onChange={(e) => {
              setFilterOrderId(e.target.value)
              resetPage()
            }}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(val) => {
            setTypeFilter(val)
            resetPage()
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type de paiement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="full">Paiement complet</SelectItem>
            <SelectItem value="installment">{"\u00c9ch\u00e9ance"}</SelectItem>
          </SelectContent>
        </Select>
        <DateRangeFilter
          dateRange={dateRange}
          onDateRangeChange={(range) => {
            setDateRange(range)
            resetPage()
          }}
        />
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val)
              setCurrentPage(1)
            }}
          >
            <div className="px-6 pt-6">
              <TabsList>
                <TabsTrigger value="all">
                  Tous ({baseFiltered.length})
                </TabsTrigger>
                <TabsTrigger value="successful">
                  {"R\u00e9ussis"} ({baseFiltered.filter((p) => p.status === "successful").length})
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  En cours ({baseFiltered.filter((p) => p.status === "in-progress").length})
                </TabsTrigger>
                <TabsTrigger value="failed">
                  {"\u00c9chou\u00e9s"} ({baseFiltered.filter((p) => p.status === "failed").length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <div className="max-h-[480px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow className="border-b-2 border-border">
                      <TableHead>ID Paiement</TableHead>
                      <TableHead>ID Commande</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>{"M\u00e9thode"}</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          {"Aucun paiement trouv\u00e9."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">{payment.id}</TableCell>
                          <TableCell className="font-mono text-xs">
                            <span className="link-gradient font-medium">{payment.orderId}</span>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-foreground">
                            {payment.amount.toFixed(2)} &euro;
                          </TableCell>
                          <TableCell>
                            {payment.type === "installment" ? (
                              <Badge variant="secondary" className="text-xs">
                                {"\u00c9ch\u00e9ance"} {payment.installmentNumber}/{payment.totalInstallments}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Complet
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{methodLabel(payment.method)}</TableCell>
                          <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle(payment.status)}`}
                            >
                              {statusLabel(payment.status)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {tabFiltered.length > 0 && (
                <TablePagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={tabFiltered.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
