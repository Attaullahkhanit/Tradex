import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Order {
  id: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
  };
  total: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED";
  createdAt: string;
  _count?: {
    orderItems: number;
  };
  orderItems?: any[];
}

export interface OrdersResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: Order[];
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

export const useOrders = (params: { status?: string; page?: number; limit?: number } = {}) => {
  const { status = "all", page = 1, limit = 10 } = params;
  return useQuery<OrdersResponse>({
    queryKey: ["orders", status, page, limit],
    queryFn: async () => {
      const response = await apiClient.get(`/orders?status=${status}&page=${page}&limit=${limit}`);
      return response.data;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch(`/orders/${id}`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
    },
  });
};
