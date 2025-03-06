
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { name, email, password } = await req.json();
    
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Check if user with this email already exists
    const { data: existingUser, error: checkError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return new Response(
        JSON.stringify({ error: checkError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Create new user with the admin role
    const { data: userData, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto confirm the email
      user_metadata: { name }
    });
    
    if (createError) {
      console.error('Error creating user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Update the user's profile to set the admin role
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ is_admin: true })
      .eq('id', userData.user.id);
      
    if (updateError) {
      console.error('Error setting admin role:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`Admin user created: ${email}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created successfully",
        user: {
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.user_metadata.name
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
