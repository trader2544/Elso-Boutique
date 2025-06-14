
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    in_stock: boolean;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    console.log("Refreshing cart for user:", user.id);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_url,
            in_stock
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching cart items:", error);
        throw error;
      }
      
      console.log("Cart items fetched:", data);
      setCartItems(data || []);
    } catch (error) {
      console.error("Error refreshing cart:", error);
      toast({
        title: "Error",
        description: "Failed to refresh cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to prevent potential race conditions
          setTimeout(() => {
            refreshCart();
          }, 100);
        } else {
          setCartItems([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        refreshCart();
      }
    });

    return () => subscription.unsubscribe();
  }, [refreshCart]);

  const addToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // First, check if the product exists and is in stock
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("name, in_stock")
        .eq("id", productId)
        .single();

      if (productError) {
        throw new Error("Product not found");
      }

      if (!product.in_stock) {
        toast({
          title: "Out of Stock",
          description: "This product is currently out of stock",
          variant: "destructive",
        });
        return;
      }

      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.products.id === productId);
      
      if (existingItem) {
        // Update quantity instead of showing error
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (error) throw error;
        
        toast({
          title: "Quantity Updated",
          description: `Added another ${product.name} to your cart`,
        });
      } else {
        // Insert new item
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity: 1,
          });

        if (error) throw error;
        
        toast({
          title: "Added to Cart",
          description: `${product.name} has been added to your cart`,
        });
      }

      await refreshCart();
    } catch (error: any) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      
      toast({
        title: "Item Removed",
        description: "Item has been removed from your cart",
      });
      
      await refreshCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId);

      if (error) throw error;
      await refreshCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      refreshCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
