// src/pages/admin/WorkerDashboard.tsx
import { useEffect, useState, useActionState } from 'react';
import { supabase } from '../../lib/supabase';
import { updateStockAction } from '../../actions/stockActions';

interface StockItem {
  id: string;
  name: string;
  stock_quantity: number;
}

export default function WorkerDashboard() {
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // We apply the action globally for the page
  const [state, formAction, isPending] = useActionState(updateStockAction, null);

  useEffect(() => {
    async function fetchStock() {
      const { data } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .order('name', { ascending: true });

      if (data) setInventory(data);
      setLoading(false);
    }
    fetchStock();
  }, [state?.timestamp]); // Instantly re-fetch when stock is updated

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">Back of House: Stock Counts</h2>
        <p className="text-gray-500">Fast inventory adjustments. Enter the new count and hit enter.</p>
        
        {state?.success && (
          <div className="mt-2 p-3 bg-green-50 text-green-800 text-sm border-l-4 border-green-600 animate-pulse">
            Stock updated successfully.
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading stockroom data...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {inventory.map((item) => (
            <form 
              key={item.id} 
              action={formAction} 
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 hover:border-blue-300 transition-colors"
            >
              <input type="hidden" name="productId" value={item.id} />
              
              <div className="flex flex-col flex-1">
                <span className="font-bold text-gray-900">{item.name}</span>
                <span className="text-xs font-mono text-gray-400">ID: {item.id.split('-')[0]}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <label htmlFor={`stock-${item.id}`} className="sr-only">Stock</label>
                  <input
                    type="number"
                    id={`stock-${item.id}`}
                    name="stockQuantity"
                    defaultValue={item.stock_quantity}
                    min="0"
                    className="w-20 min-h-[44px] text-center font-bold border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-[44px] px-4 bg-gray-900 hover:bg-black text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}