"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Package,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${data?.kpis.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Orders Today",
      value: data?.kpis.ordersToday.toString() || "0",
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "New Customers",
      value: data?.kpis.newCustomers.toString() || "0",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Low Stock Items",
      value: data?.kpis.lowStockItems.toString() || "0",
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-zinc-500">Real-time business performance and fleet analytics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="bg-zinc-900 border-zinc-800 border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{kpi.title}</CardTitle>
              <div className={cn("p-2 rounded-lg", kpi.bg)}>
                <kpi.icon className={cn("h-4 w-4", kpi.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <p className="text-xs text-zinc-500 mt-1">
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +12.5%
                </span>
                since last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Revenue Growth
              <Badge variant="outline" className="border-zinc-700 text-zinc-400 font-normal">Last 7 Days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", color: "#fff" }}
                  itemStyle={{ color: "#22c55e" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data?.topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <p className="text-xs text-zinc-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${product.revenue.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">{product.sales} sales</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-1">
            View All <ArrowUpRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-950/50">
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400 pl-6">Order ID</TableHead>
                <TableHead className="text-zinc-400">Customer</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Date</TableHead>
                <TableHead className="text-right text-zinc-400 pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recentOrders.map((order) => (
                <TableRow key={order.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-mono text-xs text-zinc-500 pl-6">#{order.id.slice(0,8)}</TableCell>
                  <TableCell className="text-white">{order.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize border-zinc-700 text-zinc-400">
                      {order.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-sm">
                    {new Date(order.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right font-medium text-white pr-6">
                    ${order.total.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
