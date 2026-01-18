import React, { useState, useEffect } from "react";
import { Trash2, X } from "lucide-react";
import type { MenuItem } from "../../types/menu";
import { useMenuStore } from "../../store/useMenuStore";
import ConfirmModal from "../common/ConfirmModal";

type EditMenuItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
};

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  // Store actions
  const { updateMenuItem, deleteMenuItem } = useMenuStore();
  // Obtain categories from store
  const categories = useMenuStore((state) => state.categories);

  // State for all fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSpecial, setIsSpecial] = useState(false);

  // Custom delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /** Load existing item values */
  useEffect(() => {
    if (item) {
      setName(item.name);
      const cat = categories.find(c => c.categoryName === item.category);
      setCategoryId(cat?.categoryId || "");
      setPrice(item.price);
      setIsVeg(item.isVeg ?? true);
      setIsAvailable(item.isAvailable);
      setIsSpecial(item.isSpecial);
    }
  }, [item, categories]);

  if (!isOpen || !item) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMenuItem(item.id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    const updateData = {
      name,
      categoryId,
      price: Number(price),
      isVeg,
      isAvailable,
      isSpecial,
    };

    await updateMenuItem(item.id, updateData);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">Edit Menu Item</h2>

          <div className="flex flex-col gap-3">
            {/* Name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />

            {/* Category */}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>

            {/* Price */}
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />

            {/* Veg/Non-Veg (Radio) */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">Food Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="editFoodType"
                    checked={isVeg === true}
                    onChange={() => setIsVeg(true)}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm">🟢 Veg</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="editFoodType"
                    checked={isVeg === false}
                    onChange={() => setIsVeg(false)}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm">🔴 Non-Veg</span>
                </label>
              </div>
            </div>

            {/* Available */}
            <div className="flex items-center gap-2">
              <label className="font-medium">Available</label>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 accent-orange-600"
              />
            </div>

            {/* Special */}
            <div className="flex items-center gap-2">
              <label className="font-medium">Special</label>
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="w-5 h-5 accent-orange-600"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button
                onClick={handleUpdate}
                className="flex-[2] py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Permanently Delete?"
        message={`This will remove "${name}" from your menu. This action is irreversible.`}
        confirmLabel="Yes, Delete"
        isLoading={isDeleting}
      />
    </>
  );
};

export default EditMenuItemModal;
