import api from "./api";

export const stockService = {
  getAll: async (sortBy = "") => {
    const params = sortBy ? { sortBy } : {};
    const response = await api.get("/stock", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/stock/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/stock", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/stock/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/stock/${id}`);
    return response.data;
  },
};
