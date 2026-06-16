// src/pages/admin/InventoryDashboard.tsx
import { useEffect, useState, useActionState } from 'react';
import { supabase } from '../../lib/supabase';
import { saveProductAction, deleteProductAction } from '../../actions/inventoryActions';

// 1. NEW: Added stock_quantity to the interface
interface Product {
  id: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  stock_quantity: number; 
}

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [saveState, formSaveAction, isSaving] = useActionState(saveProductAction, null);
  const [deleteState, formDeleteAction, isDeleting] = useActionState(deleteProductAction, null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      // 2. NEW: Fetch stock_quantity from Postgres
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_cents, image_url, stock_quantity')
        .order('created_at', { ascending: false });

      if (!error && data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
    
    if (saveState?.success) setEditingProduct(null);
  }, [saveState?.success, deleteState?.success]); 

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* Left Column: Form */}
      <div className="xl:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 self-start sticky top-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          {editingProduct && (
            <button 
              onClick={() => setEditingProduct(null)}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        {(saveState?.error || deleteState?.error) && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm border-l-4 border-red-600">
            {saveState?.error || deleteState?.error}
          </div>
        )}
        {(saveState?.success || deleteState?.success) && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 text-sm border-l-4 border-green-600">
            {saveState?.message || deleteState?.message}
          </div>
        )}

        <form action={formSaveAction} className="flex flex-col gap-4" encType="multipart/form-data">
          
          {editingProduct && <input type="hidden" name="productId" value={editingProduct.id} />}
          {editingProduct?.image_url && <input type="hidden" name="existingImageUrl" value={editingProduct.image_url} />}

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Product Name</label>
            <input 
              key={`name-${editingProduct?.id || 'new'}`} 
              type="text" id="name" name="name" required disabled={isSaving || isDeleting}
              defaultValue={editingProduct?.name || ''}
              placeholder="e.g., Caramel Macchiato"
              className="min-h-[44px] px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="price" className="text-sm font-semibold text-gray-700">Price (USD)</label>
              <input 
                key={`price-${editingProduct?.id || 'new'}`}
                type="number" id="price" name="price" step="0.01" min="0" required disabled={isSaving || isDeleting}
                defaultValue={editingProduct ? (editingProduct.price_cents / 100).toFixed(2) : ''}
                placeholder="4.50"
                className="min-h-[44px] px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
              />
            </div>

            {/* 3. NEW: Stock Quantity Input */}
            <div className="flex flex-col gap-1">
              <label htmlFor="stockQuantity" className="text-sm font-semibold text-gray-700">Initial Stock</label>
              <input 
                key={`stock-${editingProduct?.id || 'new'}`}
                type="number" id="stockQuantity" name="stockQuantity" min="0" required disabled={isSaving || isDeleting}
                defaultValue={editingProduct?.stock_quantity || '0'}
                className="min-h-[44px] px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="productImage" className="text-sm font-semibold text-gray-700">
              {editingProduct?.image_url ? 'Replace Image (Optional)' : 'Product Image (Optional)'}
            </label>
            <input
              type="file" id="productImage" name="productImage" accept="image/png, image/jpeg, image/webp"
              disabled={isSaving || isDeleting}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors cursor-pointer"
            />
          </div>

          <button 
            type="submit" disabled={isSaving || isDeleting}
            className="min-h-[44px] mt-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Processing...' : editingProduct ? 'Update Product' : 'Save Product'}
          </button>
        </form>
      </div>

      {/* Right Column: Inventory Data Table */}
      <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden self-start">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Active Inventory</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700">
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-center">Stock</th> {/* NEW Column */}
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Querying database...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">No products found. Add one to begin.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400 text-xs">N/A</div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                    <td className="p-4 text-gray-700">${(product.price_cents / 100).toFixed(2)}</td>
                    
                    {/* 4. NEW: Stock Display with Conditional Formatting */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.stock_quantity <= 5 
                          ? 'bg-red-100 text-red-800' // Low stock warning
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock_quantity}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-3">
                      <button
                        type="button" onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors focus:outline-none"
                      >
                        Edit
                      </button>
                      <form action={formDeleteAction} className="inline-block">
                        <input type="hidden" name="productId" value={product.id} />
                        <button
                          type="submit" disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 font-medium transition-colors focus:outline-none disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}