// src/actions/stockActions.ts
import { supabase } from '../lib/supabase';

export interface StockState {
  error?: string;
  success?: boolean;
  timestamp?: number;
}

export async function updateStockAction(
  prevState: StockState | null,
  formData: FormData
): Promise<StockState> {
  const productId = formData.get('productId') as string;
  const stockStr = formData.get('stockQuantity') as string;
  
  if (!productId || !stockStr) return { error: 'Missing data.' };

  const stock_quantity = parseInt(stockStr, 10);
  if (isNaN(stock_quantity) || stock_quantity < 0) {
    return { error: 'Stock must be a valid positive number.' };
  }

  const { error } = await supabase
    .from('products')
    .update({ stock_quantity })
    .eq('id', productId);

  if (error) {
    console.error("STOCK UPDATE ERROR:", error);
    return { error: 'Failed to update stock.' };
  }

  return { success: true, timestamp: Date.now() };
}