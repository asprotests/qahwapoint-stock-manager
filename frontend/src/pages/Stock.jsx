import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService } from "../services/stockService";
import { supplierService } from "../services/supplierService";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Edit, Trash2, ArrowUpDown } from "lucide-react";

const Stock = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [sortBy, setSortBy] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    quantityAvailable: 0,
    cost: 0,
    costPer: 1,
    supplier: "",
  });

  const queryClient = useQueryClient();

  const { data: stockItems = [], isLoading } = useQuery({
    queryKey: ["stock", sortBy],
    queryFn: () => stockService.getAll(sortBy),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: stockService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["stock"]);
      toast.success("Stock item created successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create stock item"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => stockService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["stock"]);
      toast.success("Stock item updated successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update stock item"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: stockService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["stock"]);
      toast.success("Stock item deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedStock(null);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete stock item"
      );
    },
  });

  const openModal = (stock = null) => {
    if (stock) {
      setSelectedStock(stock);
      setFormData({
        name: stock.name,
        category: stock.category,
        unit: stock.unit,
        quantityAvailable: stock.quantityAvailable,
        cost: stock.cost,
        costPer: stock.costPer,
        supplier: stock.supplier?._id || "",
      });
    } else {
      setSelectedStock(null);
      setFormData({
        name: "",
        category: "",
        unit: "",
        quantityAvailable: 0,
        cost: 0,
        costPer: 1,
        supplier: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
    setFormData({
      name: "",
      category: "",
      unit: "",
      quantityAvailable: 0,
      cost: 0,
      costPer: 1,
      supplier: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      quantityAvailable: Number(formData.quantityAvailable),
      cost: Number(formData.cost),
      costPer: Number(formData.costPer),
      supplier: formData.supplier || null,
    };

    if (selectedStock) {
      updateMutation.mutate({ id: selectedStock._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (selectedStock) {
      deleteMutation.mutate(selectedStock._id);
    }
  };

  const calculateCostPerUnit = (stock) => {
    return (stock.cost / stock.costPer).toFixed(3);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-700"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input py-2"
              >
                <option value="">Default</option>
                <option value="category">Sort by Category</option>
                <option value="supplier">Sort by Supplier</option>
              </select>
            </div>
            <button
              onClick={() => openModal()}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stock</span>
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Quantity Available</th>
                <th>Cost</th>
                <th>Supplier</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    No stock items found. Add your first stock item!
                  </td>
                </tr>
              ) : (
                stockItems.map((stock) => (
                  <tr key={stock._id}>
                    <td className="font-medium">{stock.name}</td>
                    <td>{stock.category}</td>
                    <td>{stock.unit}</td>
                    <td>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          stock.quantityAvailable > 20
                            ? "bg-green-100 text-green-800"
                            : stock.quantityAvailable > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {stock.quantityAvailable}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">
                          KES {stock.cost} / {stock.costPer} {stock.unit}
                        </div>
                        <div className="text-gray-500">
                          KES {calculateCostPerUnit(stock)} per {stock.unit}
                        </div>
                      </div>
                    </td>
                    <td>{stock.supplier?.name || "N/A"}</td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openModal(stock)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStock(stock);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedStock ? "Edit Stock Item" : "Add Stock Item"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input"
                placeholder="e.g., Beverages, Dairy"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="input"
                placeholder="e.g., kg, liters, grams"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Available
            </label>
            <input
              type="number"
              value={formData.quantityAvailable}
              onChange={(e) =>
                setFormData({ ...formData, quantityAvailable: e.target.value })
              }
              className="input"
              min="0"
              step="0.001"
              required
            />
          </div>

          {/* Cost Fields */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Cost Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost (KES)
                </label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: e.target.value })
                  }
                  className="input"
                  min="0"
                  step="0.001"
                  placeholder="e.g., 25.084"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Per {formData.unit || "Unit"}
                </label>
                <input
                  type="number"
                  value={formData.costPer}
                  onChange={(e) =>
                    setFormData({ ...formData, costPer: e.target.value })
                  }
                  className="input"
                  min="0.001"
                  step="0.001"
                  placeholder="e.g., 1"
                  required
                />
              </div>
            </div>
            {formData.cost > 0 && formData.costPer > 0 && (
              <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                <strong>Cost per {formData.unit || "unit"}:</strong> KES{" "}
                {(formData.cost / formData.costPer).toFixed(3)}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier (Optional)
            </label>
            <select
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
              className="input"
            >
              <option value="">No Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedStock(null);
        }}
        onConfirm={handleDelete}
        title="Delete Stock Item"
        message={`Are you sure you want to delete "${selectedStock?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </Layout>
  );
};

export default Stock;
