import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    ordersToday: number;
    newCustomers: number;
    lowStockItems: number;
  };
  chartData: {
    name: string;
    revenue: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    category: string;
    sales: number;
    revenue: number;
  }[];
  recentOrders: {
    id: string;
    customer: string;
    total: number;
    status: string;
    date: string;
  }[];
}

export const useAnalytics = () => {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics");
      return response.data;
    },
  });
};
