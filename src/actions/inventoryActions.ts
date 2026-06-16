// src/actions/inventoryActions.ts
import { supabase } from '../lib/supabase';

export interface InventoryState {
  error?: string;
  success?: boolean;
  message?: string;
  timestamp?: number;
}

export async function saveProductAction(
  prevState: InventoryState | null,
  formData: FormData
): Promise<InventoryState> {
  const productId = formData.get('productId') as string | null; 
  const name = (formData.get('productName') || formData.get('name')) as string;
  const priceDollars = formData.get('price') as string;
  const imageFile = formData.get('productImage') as File | null;
  
  // 1. NEW: Extract the stock quantity from the form
  const stockStr = formData.get('stockQuantity') as string;
  const stockQuantity = parseInt(stockStr || '0', 10);

  if (!name || !priceDollars) {
    return { error: 'Product name and price are required.' };
  }

  const priceCents = Math.round(parseFloat(priceDollars) * 100);
  if (isNaN(priceCents) || priceCents < 0) {
    return { error: 'Invalid price format. Must be a positive number.' };
  }

  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants').select('id').limit(1).single();

  if (tenantError || !tenantData) return { error: 'System Error: No active tenant.' };

  let imageUrl = formData.get('existingImageUrl') as string | null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images').upload(fileName, imageFile, { cacheControl: '3600', upsert: false });

    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };

    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    imageUrl = publicUrlData.publicUrl;
  }

  // 2. NEW: Add stock_quantity to the database payload
  const payload = {
    tenant_id: tenantData.id,
    name,
    price_cents: priceCents,
    image_url: imageUrl,
    stock_quantity: stockQuantity 
  };

  let dbError;
  if (productId) {
    const { error } = await supabase.from('products').update(payload).eq('id', productId);
    dbError = error;
  } else {
    const { error } = await supabase.from('products').insert([payload]);
    dbError = error;
  }

  if (dbError) {
    console.error("DB ERROR:", dbError);
    return { error: 'Database constraint violation. Failed to save product.' };
  }

  return { success: true, message: productId ? 'Product updated.' : 'Product added.', timestamp: Date.now() };
}

export async function deleteProductAction(
  prevState: InventoryState | null,
  formData: FormData
): Promise<InventoryState> {
  const productId = formData.get('productId') as string;

  if (!productId) return { error: 'Missing product ID for deletion.' };

  const { error } = await supabase.from('products').delete().eq('id', productId);

  if (error) {
    console.error("DELETE ERROR:", error);
    return { error: 'Failed to delete product. Check permissions.' };
  }

  return { success: true, message: 'Product deleted permanently.', timestamp: Date.now() };
}