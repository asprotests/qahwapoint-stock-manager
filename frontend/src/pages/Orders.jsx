import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Eye, Trash2, X, AlertTriangle, Printer } from "lucide-react";
import jsPDF from "jspdf";

const Orders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    products: [{ product: "", quantity: 1 }],
  });

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: orderService.getAll,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: orderService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["stock"]);
      toast.success("Order created successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create order");
    },
  });

  const discardMutation = useMutation({
    mutationFn: orderService.discard,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["stock"]);
      toast.success("Order discarded successfully");
      setIsDiscardDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to discard order");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: orderService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      toast.success("Order deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete order");
    },
  });

  const openModal = () => {
    setFormData({ products: [{ product: "", quantity: 1 }] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ products: [{ product: "", quantity: 1 }] });
  };

  const handleAddProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { product: "", quantity: 1 }],
    });
  };

  const handleRemoveProduct = (index) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: newProducts });
  };

  const handleProductChange = (index, field, value) => {
    const newProducts = [...formData.products];
    newProducts[index][field] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.products.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    const data = {
      products: formData.products.map((p) => ({
        product: p.product,
        quantity: Number(p.quantity),
      })),
    };

    createMutation.mutate(data);
  };

  const handleDiscard = () => {
    if (selectedOrder) {
      discardMutation.mutate(selectedOrder._id);
    }
  };

  const handleDelete = () => {
    if (selectedOrder) {
      deleteMutation.mutate(selectedOrder._id);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const order = await orderService.getById(orderId);
      setSelectedOrder(order);
      setIsViewModalOpen(true);
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  const generatePDF = async (orderId) => {
    try {
      const order = await orderService.getById(orderId);

      // Calculate total ingredients needed
      const ingredientsMap = {};

      order.products.forEach((item) => {
        if (item.product.ingredients) {
          item.product.ingredients.forEach((ing) => {
            const stockName = ing.stockItem.name;
            const totalNeeded = ing.quantityRequired * item.quantity;

            if (!ingredientsMap[stockName]) {
              ingredientsMap[stockName] = {
                quantity: 0,
                unit: ing.unit,
              };
            }

            ingredientsMap[stockName].quantity += totalNeeded;
          });
        }
      });

      // Create PDF
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("QahwaPoint", 105, 20, { align: "center" });

      doc.setFontSize(16);
      doc.text("Order Receipt", 105, 30, { align: "center" });

      // Order Info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Order ID: ${order._id}`, 20, 45);
      doc.text(`Date: ${new Date(order.dateCreated).toLocaleString()}`, 20, 52);
      doc.text(`Status: ${order.status.toUpperCase()}`, 20, 59);

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);

      // Products Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Order Products", 20, 75);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      let yPosition = 85;

      order.products.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.product.name}`, 25, yPosition);
        doc.text(`Quantity: ${item.quantity}`, 150, yPosition, {
          align: "left",
        });
        yPosition += 7;

        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
      });

      yPosition += 10;

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;

      // Required Ingredients Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Required Ingredients", 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      Object.entries(ingredientsMap).forEach(([name, data], index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        const quantityText = `${data.quantity.toFixed(2)} ${data.unit}`;
        doc.text(`${index + 1}. ${name}`, 25, yPosition);
        doc.text(quantityText, 150, yPosition, { align: "left" });
        yPosition += 7;
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text(
          `Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }

      // Save PDF
      doc.save(`QahwaPoint_Order_${order._id.slice(-8)}.pdf`);
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
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
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <button
            onClick={openModal}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Order</span>
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Products Count</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No orders found. Create your first order!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="font-mono text-sm">{order._id.slice(-8)}</td>
                    <td>{new Date(order.dateCreated).toLocaleDateString()}</td>
                    <td>{order.products?.length || 0}</td>
                    <td>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => viewOrderDetails(order._id)}
                          className="text-gray-600 hover:text-gray-800 p-2"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generatePDF(order._id)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Print Order"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {order.status === "completed" && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDiscardDialogOpen(true);
                            }}
                            className="text-orange-600 hover:text-orange-800 p-2"
                            title="Discard Order"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        )}
                        {order.status === "discarded" && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Create Order"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Products
              </label>
              <button
                type="button"
                onClick={handleAddProduct}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Product
              </button>
            </div>

            <div className="space-y-3">
              {formData.products.map((orderProduct, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <select
                        value={orderProduct.product}
                        onChange={(e) =>
                          handleProductChange(index, "product", e.target.value)
                        }
                        className="input"
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        value={orderProduct.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", e.target.value)
                        }
                        className="input"
                        placeholder="Quantity"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Stock Validation</p>
                <p>
                  The system will check ingredient availability before creating
                  the order. If any ingredient is insufficient, the order will
                  not be created.
                </p>
              </div>
            </div>
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Order Details Modal */}
      {/* View Order Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono text-sm">{selectedOrder._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p>{new Date(selectedOrder.dateCreated).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    selectedOrder.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Products</h3>
              <div className="space-y-2">
                {selectedOrder.products && selectedOrder.products.length > 0 ? (
                  selectedOrder.products.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product?.name || "Product Name Unavailable"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity: {item.quantity}
                          </p>
                          {item.product?.ingredients &&
                            item.product.ingredients.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700">
                                  Ingredients:
                                </p>
                                <ul className="mt-1 space-y-1">
                                  {item.product.ingredients.map((ing, i) => (
                                    <li
                                      key={i}
                                      className="text-xs text-gray-600"
                                    >
                                      • {ing.stockItem?.name || "Unknown"}:{" "}
                                      {ing.quantityRequired * item.quantity}{" "}
                                      {ing.unit}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No products found in this order
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Discard Confirmation */}
      <ConfirmDialog
        isOpen={isDiscardDialogOpen}
        onClose={() => {
          setIsDiscardDialogOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDiscard}
        title="Discard Order"
        message="Are you sure you want to discard this order? All deducted stock quantities will be returned."
        confirmText="Discard"
        type="danger"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDelete}
        title="Delete Order"
        message="Are you sure you want to permanently delete this order? This action cannot be undone."
        confirmText="Delete"
      />
    </Layout>
  );
};

export default Orders;
