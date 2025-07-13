
import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface WishlistContextType {
  wishlistItems: string[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      fetchWishlist();
    } else if (!loading && !user) {
      setWishlistItems([]);
    }
  }, [user, loading]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("wishlist")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email || "",
              full_name: user.user_metadata?.full_name || "",
              phone: user.user_metadata?.phone || "",
              role: "user",
              wishlist: []
            });
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
          }
          setWishlistItems([]);
          return;
        }
        throw error;
      }
      setWishlistItems(data?.wishlist || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlistItems([]);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      console.log("No user found when trying to add to wishlist");
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedWishlist = [...wishlistItems, productId];
      
      const { error } = await supabase
        .from("profiles")
        .update({ wishlist: updatedWishlist })
        .eq("id", user.id);

      if (error) throw error;

      setWishlistItems(updatedWishlist);
      toast({
        title: "Success",
        description: "Item added to wishlist",
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const updatedWishlist = wishlistItems.filter(id => id !== productId);
      
      const { error } = await supabase
        .from("profiles")
        .update({ wishlist: updatedWishlist })
        .eq("id", user.id);

      if (error) throw error;

      setWishlistItems(updatedWishlist);
      toast({
        title: "Success",
        description: "Item removed from wishlist",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isInWishlist,
      addToWishlist,
      removeFromWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
