import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "../services/supplierService";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Edit, Trash2 } from "lucide-react";

const Suppliers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      toast.success("Supplier created successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create supplier");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => supplierService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      toast.success("Supplier updated successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update supplier");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: supplierService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["suppliers"]);
      toast.success("Supplier deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete supplier");
    },
  });

  const openModal = (supplier = null) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setFormData({
        name: supplier.name,
        address: supplier.address,
        phone: supplier.phone,
      });
    } else {
      setSelectedSupplier(null);
      setFormData({ name: "", address: "", phone: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
    setFormData({ name: "", address: "", phone: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSupplier) {
      updateMutation.mutate({ id: selectedSupplier._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedSupplier) {
      deleteMutation.mutate(selectedSupplier._id);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No suppliers found. Add your first supplier!
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td className="font-medium">{supplier.name}</td>
                    <td>{supplier.address}</td>
                    <td>{supplier.phone}</td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openModal(supplier)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSupplier(supplier);
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
        title={selectedSupplier ? "Edit Supplier" : "Add Supplier"}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="input"
              required
            />
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
          setSelectedSupplier(null);
        }}
        onConfirm={handleDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${selectedSupplier?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </Layout>
  );
};

export default Suppliers;
