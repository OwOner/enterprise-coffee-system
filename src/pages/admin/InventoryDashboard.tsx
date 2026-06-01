// src/pages/admin/InventoryDashboard.tsx
import { useEffect, useState, useActionState } from 'react';
import { supabase } from '../../lib/supabase';
import { addProductAction } from '../../actions/inventoryActions';

// TypeScript interface defining our Supabase row
interface Product {
  id: string;
  name: string;
  price_cents: number;
}

export default function InventoryDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction, isPending] = useActionState(addProductAction, null);

  // Fetch products from Supabase on mount and after successful additions
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [state?.success]); // Re-run fetch when a new product is successfully added

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Add Product Form */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 self-start">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Product</h2>
        
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 text-sm border-l-4 border-red-600">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 text-sm border-l-4 border-green-600">
            Product added to inventory.
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-semibold text-gray-700">Product Name</label>
            <input 
              type="text" id="name" name="name" required disabled={isPending}
              placeholder="e.g., Caramel Macchiato"
              className="min-h-[44px] px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="price" className="text-sm font-semibold text-gray-700">Price (USD)</label>
            <input 
              type="number" id="price" name="price" step="0.01" min="0" required disabled={isPending}
              placeholder="4.50"
              className="min-h-[44px] px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-gray-100"
            />
          </div>
          <button 
            type="submit" disabled={isPending}
            className="min-h-[44px] mt-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {isPending ? 'Committing...' : 'Save Product'}
          </button>
        </form>
      </div>

      {/* Right Column: Inventory Data Table */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Active Inventory</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700">
                <th className="p-4">Product Name</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">System ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">Querying database...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">No products found. Add one to begin.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{product.name}</td>
                    {/* Convert BIGINT cents back to formatted dollars for display */}
                    <td className="p-4 text-gray-700">${(product.price_cents / 100).toFixed(2)}</td>
                    <td className="p-4 text-gray-400 font-mono text-xs">{product.id.split('-')[0]}...</td>
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