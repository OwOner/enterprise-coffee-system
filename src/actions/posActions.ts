// src/actions/posActions.ts
import { supabase } from '../lib/supabase';

export interface PosState {
  error?: string;
  success?: boolean;
  receiptId?: string;
  timestamp?: number; // Used to trigger re-renders on consecutive identical sales
}

export async function processSaleAction(
  _prevState: PosState | null,
  formData: FormData
): Promise<PosState> {
  const productName = formData.get('productName') as string;
  const priceCentsStr = formData.get('priceCents') as string;

  if (!productName || !priceCentsStr) {
    return { error: 'Missing product payload.' };
  }

  const priceCents = parseInt(priceCentsStr, 10);
  const description = `Sale: ${productName}`;

  // Execute the atomic Remote Procedure Call (RPC)
  const { data: entryId, error } = await supabase.rpc('process_pos_sale', {
    p_amount_cents: priceCents,
    p_description: description
  });

  if (error) {
    console.error('Ledger Fault:', error);
    return { error: 'Transaction failed. The ledger was not modified.' };
  }

  return { 
    success: true, 
    receiptId: entryId,
    timestamp: Date.now() 
  };
}