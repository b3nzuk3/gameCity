
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

// Service to handle migration of data from localStorage to Supabase
export const migrationService = {
  // Migrate data after user signs in
  async migrateLocalDataToSupabase(): Promise<boolean> {
    try {
      // Get session to verify user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.access_token) {
        return false;
      }
      
      // Check if we have any local data to migrate
      const cartData = localStorage.getItem('cart');
      const userData = localStorage.getItem('user');
      
      if (!cartData && !userData) {
        return false; // Nothing to migrate
      }
      
      // Parse data
      const cartItems = cartData ? JSON.parse(cartData) : [];
      const userData$ = userData ? JSON.parse(userData) : null;
      const addresses = userData$ && userData$.addresses ? userData$.addresses : [];
      
      // Call the edge function to migrate data
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/migrate-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userToken: session.access_token,
          cartItems,
          addresses
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Migration failed');
      }
      
      // Clear local storage now that data is migrated
      if (result.results.cart) {
        localStorage.removeItem('cart');
      }
      
      // Don't remove user data yet as it might be needed for the session
      
      toast({
        title: 'Data migrated',
        description: 'Your cart and account data have been migrated to your account',
      });
      
      return true;
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Migration warning',
        description: 'Some of your local data could not be migrated',
        variant: 'destructive'
      });
      return false;
    }
  }
};

export default migrationService;
