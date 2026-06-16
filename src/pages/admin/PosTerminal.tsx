// src/pages/admin/PosTerminal.tsx
import { useEffect, useState, useActionState } from 'react';
import { supabase } from '../../lib/supabase';
import { processSaleAction } from '../../actions/posActions';

interface Product {
  id: string;
  name: string;
  price_cents: number;
}

export default function PosTerminal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction, isPending] = useActionState(processSaleAction, null);

  useEffect(() => {
    async function fetchMenu() {
      const { data } = await supabase.from('products').select('*').order('name');
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchMenu();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Terminal Alpha</h2>
        <p className="text-sm text-gray-500 mb-6">Select an item to instantly charge and record the transaction.</p>

        {/* Transactional Error Mapping / Toast */}
        {state?.error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-600 text-red-800 text-sm font-medium">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-600 text-green-800 text-sm font-medium flex justify-between items-center">
            <span>Transaction Approved. Ledger balanced.</span>
            <span className="font-mono text-xs opacity-70">RPT: {state.receiptId?.split('-')[0]}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full py-8 text-center text-gray-500">Initializing Terminal...</div>
          ) : (
            products.map((product) => (
              <form action={formAction} key={product.id}>
                {/* Hidden inputs to pass data via FormData */}
                <input type="hidden" name="productName" value={product.name} />
                <input type="hidden" name="priceCents" value={product.price_cents} />
                
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full min-h-[80px] p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="font-semibold text-gray-900 group-hover:text-blue-800 text-center leading-tight">
                    {product.name}
                  </span>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600">
                    ${(product.price_cents / 100).toFixed(2)}
                  </span>
                </button>
              </form>
            ))
          )}
        </div>
      </div>
    </div>
  );
}