import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/productService";
import { stockService } from "../services/stockService";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import { Plus, Edit, Trash2, Eye, X } from "lucide-react";

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", ingredients: [] });

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  const { data: stockItems = [] } = useQuery({
    queryKey: ["stock"],
    queryFn: () => stockService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product created successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product updated successfully");
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  const calculateProductCost = (product) => {
    if (!product || !product.ingredients || product.ingredients.length === 0)
      return 0;

    let totalCost = 0;
    product.ingredients.forEach((ing) => {
      if (ing.stockItem && ing.stockItem.cost && ing.stockItem.costPer) {
        // Calculate cost per unit of the stock item
        const costPerUnit = ing.stockItem.cost / ing.stockItem.costPer;
        // Multiply by quantity required
        const ingredientCost = costPerUnit * ing.quantityRequired;
        totalCost += ingredientCost;
      }
    });

    return totalCost.toFixed(2);
  };

  const openModal = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        ingredients: product.ingredients.map((ing) => ({
          stockItem: ing.stockItem._id,
          unit: ing.unit,
          quantityRequired: ing.quantityRequired,
        })),
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: "",
        ingredients: [{ stockItem: "", unit: "", quantityRequired: 0 }],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({ name: "", ingredients: [] });
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { stockItem: "", unit: "", quantityRequired: 0 },
      ],
    });
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;

    // Auto-fill unit when stock item is selected
    if (field === "stockItem" && value) {
      const stock = stockItems.find((s) => s._id === value);
      if (stock) {
        newIngredients[index].unit = stock.unit;
      }
    }

    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.ingredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    const data = {
      name: formData.name,
      ingredients: formData.ingredients.map((ing) => ({
        stockItem: ing.stockItem,
        unit: ing.unit,
        quantityRequired: Number(ing.quantityRequired),
      })),
    };

    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct._id);
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <button
            onClick={() => openModal()}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Ingredients Count</th>
                <th>Cost</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td className="font-medium">{product.name}</td>
                    <td>{product.ingredients.length}</td>
                    <td>
                      <span className="font-medium text-green-600">
                        ${calculateProductCost(product)}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsViewModalOpen(true);
                          }}
                          className="text-gray-600 hover:text-gray-800 p-2"
                          title="View Ingredients"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal(product)}
                          className="text-blue-600 hover:text-blue-800 p-2"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
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
        title={selectedProduct ? "Edit Product" : "Add Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Ingredients
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <select
                        value={ingredient.stockItem}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "stockItem",
                            e.target.value
                          )
                        }
                        className="input"
                        required
                      >
                        <option value="">Select Stock Item</option>
                        {stockItems.map((stock) => (
                          <option key={stock._id} value={stock._id}>
                            {stock.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={ingredient.unit}
                        onChange={(e) =>
                          handleIngredientChange(index, "unit", e.target.value)
                        }
                        className="input bg-gray-100"
                        placeholder="Unit"
                        readOnly
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={ingredient.quantityRequired}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "quantityRequired",
                            e.target.value
                          )
                        }
                        className="input"
                        placeholder="Quantity"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
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
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Save"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Ingredients Modal */}
      {/* View Ingredients Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedProduct(null);
        }}
        title={
          selectedProduct
            ? `Ingredients - ${selectedProduct.name}`
            : "Ingredients"
        }
      >
        {selectedProduct && (
          <div className="space-y-2">
            {selectedProduct.ingredients &&
            selectedProduct.ingredients.length > 0 ? (
              <>
                {selectedProduct.ingredients.map((ingredient, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">
                      {ingredient.stockItem?.name || "Unknown Item"}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Quantity: {ingredient.quantityRequired} {ingredient.unit}
                    </div>
                    {ingredient.stockItem?.cost &&
                      ingredient.stockItem?.costPer && (
                        <div className="text-xs text-gray-500 mt-1">
                          Cost: $
                          {(
                            (ingredient.stockItem.cost /
                              ingredient.stockItem.costPer) *
                            ingredient.quantityRequired
                          ).toFixed(2)}
                        </div>
                      )}
                  </div>
                ))}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-700">
                    Total Cost
                  </div>
                  <div className="text-xl font-bold text-green-600 mt-1">
                    ${calculateProductCost(selectedProduct)}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No ingredients found
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </Layout>
  );
};

export default Products;
