// src/actions/inventoryActions.ts
import { supabase } from '../lib/supabase';

export interface InventoryState {
  error?: string;
  success?: boolean;
}

export async function addProductAction(
  prevState: InventoryState | null,
  formData: FormData
): Promise<InventoryState> {
  const name = formData.get('name') as string;
  const priceDollars = formData.get('price') as string;

  if (!name || !priceDollars) {
    return { error: 'Product name and price are required.' };
  }

  // FINANCIAL INTEGRITY GUARD: Convert string "$4.50" to integer 450 cents.
  // We parse the float purely to do the conversion, then round it to a strict integer.
  const priceCents = Math.round(parseFloat(priceDollars) * 100);

  if (isNaN(priceCents) || priceCents < 0) {
    return { error: 'Invalid price format. Must be a positive number.' };
  }

  // Fetch the active tenant (For a real app, this would come from the auth session)
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('id')
    .limit(1)
    .single();

  if (tenantError || !tenantData) {
    return { error: 'System Error: No active tenant found to assign product.' };
  }

  // Insert the product into the Postgres database
  const { error: insertError } = await supabase
    .from('products')
    .insert({
      tenant_id: tenantData.id,
      name,
      price_cents: priceCents,
    });

  if (insertError) {
    return { error: 'Database constraint violation. Failed to add product.' };
  }

  return { success: true };
}