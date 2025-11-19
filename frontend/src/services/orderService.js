import api from "./api";

export const orderService = {
  getAll: async () => {
    const response = await api.get("/orders");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  discard: async (id) => {
    const response = await api.put(`/orders/${id}/discard`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
};
