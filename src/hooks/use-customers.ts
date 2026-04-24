import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
}

export interface CustomersResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: Customer[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export const useCustomers = (params: { page?: number; limit?: number } = {}) => {
  return useQuery<CustomersResponse>({
    queryKey: ["customers", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      
      const response = await apiClient.get(`/customers?${searchParams.toString()}`);
      return response.data;
    },
  });
};
