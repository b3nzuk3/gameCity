
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

// This edge function helps migrate data from localStorage to Supabase
// It should be called after a user logs in if they had previous guest data

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { userToken, cartItems, addresses } = await req.json()
    
    // Create Supabase client using the provided user token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${userToken}` },
        },
      }
    )
    
    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Begin migration of data
    const results = {
      cart: false,
      addresses: false,
    }
    
    // Migrate cart items if provided
    if (cartItems && Array.isArray(cartItems) && cartItems.length > 0) {
      // First, delete existing cart items to avoid duplicates
      await supabaseClient
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
      
      // For each item in localStorage cart, add it to Supabase
      for (const item of cartItems) {
        // Check if product exists in the database
        const { data: productData } = await supabaseClient
          .from('products')
          .select('id')
          .eq('id', item.product)
          .maybeSingle()
          
        // If product exists, add to cart
        if (productData) {
          await supabaseClient
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: item.product,
              quantity: item.quantity
            })
        }
      }
      
      results.cart = true
    }
    
    // Migrate addresses if provided
    if (addresses && Array.isArray(addresses) && addresses.length > 0) {
      for (const address of addresses) {
        // Check for duplicate addresses
        const { data: existingAddresses } = await supabaseClient
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('street', address.street)
          .eq('city', address.city)
          
        // Only add if not a duplicate
        if (!existingAddresses || existingAddresses.length === 0) {
          await supabaseClient
            .from('addresses')
            .insert({
              user_id: user.id,
              street: address.street,
              city: address.city,
              state: address.state,
              postal_code: address.postalCode || address.postal_code,
              country: address.country
            })
        }
      }
      
      results.addresses = true
    }
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
