import { queryOptions } from "@tanstack/react-query";
import * as api from "./api";
export const perfumeQuery = (filters?: { family?: string; style?: string; maxPrice?: number }) =>
  queryOptions({ queryKey: ["perfumes", filters], queryFn: () => api.getPerfumes(filters) });
export const productQuery = (id: string) =>
  queryOptions({ queryKey: ["perfume", id], queryFn: () => api.getPerfume(id) });
export const cartQuery = () => queryOptions({ queryKey: ["cart"], queryFn: api.getCart });
export const savedQuery = () => queryOptions({ queryKey: ["saved"], queryFn: api.listSavedCharts });
