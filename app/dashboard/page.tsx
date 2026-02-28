"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Flame,
} from "lucide-react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  initialProducts,
  dailySalesData,
  monthlySalesData,
} from "@/lib/mock-data";
import { Auth } from "@/providers/AuthContext";
import { useGetStatsOverview } from "@/hooks/useCompany";
import { useEffect, useState } from "react";
import { IStats } from "@/types/company";
import { formatPrice } from "@/lib/helper";

const hotProducts = [...initialProducts]
  .sort((a, b) => b.sold - a.sold)
  .slice(0, 5);
const lowStockProducts = initialProducts.filter((p) => p.stock < 15);

export default function OverviewPage() {
  const { state } = Auth();

  const { data } = useGetStatsOverview(state.user?.company.id!);

  const [statistics, setStatistics] = useState<IStats>({
    profit: 0,
    revenue: 0,
    total_orders: 0,
    total_products: 0,
  });

  useEffect(() => {
    if (!data) {
      return;
    }
    return setStatistics(data);
  }, [data]);

  const stats = [
    {
      title: "Total Produits",
      value: statistics.total_products,
      icon: Package,
      change: "marques de produits",
    },
    {
      title: "Total Commandes",
      value: statistics.total_orders,
      icon: ShoppingCart,
      change: "pour le mois actuel",
    },
    {
      title: "Chiffre d'affaires (Francs Cfa)",
      value: formatPrice(statistics.revenue),
      icon: DollarSign,
      change: "pour le mois actuel",
    },
    {
      title: "Bénéfice (Francs Cfa)",
      value: formatPrice(statistics.profit),
      icon: TrendingUp,
      change: "pour le mois actuel",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {"Vue d'ensemble"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {"Bienvenue ! Voici un r\u00e9sum\u00e9 de votre inventaire."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-gradient">
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Ventes journali&egrave;res
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailySalesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold text-foreground">
              Ventes mensuelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlySalesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="url(#barGradientMonthly)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="barGradientMonthly"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hot Products & Low Stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              Meilleures ventes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {hotProducts.map((product, i) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full btn-gradient text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {product.sold} vendus
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Alerte stock faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {product.stock} restants
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
