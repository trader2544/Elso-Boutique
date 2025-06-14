import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Order, convertJsonToOrderProducts } from "@/types/order";

interface UserProfile {
  full_name: string;
  phone: string;
  email: string;
}

const Profile = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    phone: "",
    email: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("User from auth:", user);
        
        if (!user) {
          console.log("No user found, redirecting to auth");
          navigate("/auth");
          return;
        }
        
        setUser(user);
        await Promise.all([fetchProfile(user), fetchOrders(user.id)]);
      } catch (error) {
        console.error("Error initializing user:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [navigate, toast]);

  // Add real-time subscription for order updates
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time subscription for orders");
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time order update received:', payload);
          
          if (payload.eventType === 'UPDATE') {
            const updatedOrder = {
              ...payload.new,
              products: convertJsonToOrderProducts(payload.new.products)
            } as Order;
            
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order.id === updatedOrder.id ? updatedOrder : order
              )
            );

            // Show toast notification for status changes
            if (payload.old.status !== payload.new.status) {
              toast({
                title: "Order Status Updated",
                description: `Order #${updatedOrder.id.slice(-8)} is now ${updatedOrder.status}`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const fetchProfile = async (currentUser: SupabaseUser) => {
    try {
      console.log("Fetching profile for user:", currentUser.id);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        if (error.code === 'PGRST116') {
          console.log("Profile not found, creating new profile");
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: currentUser.id,
              email: currentUser.email || "",
              full_name: "",
              phone: "",
              role: "user"
            });
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
            throw insertError;
          }
          
          setProfile({
            full_name: "",
            phone: "",
            email: currentUser.email || "",
          });
          return;
        }
        throw error;
      }
      
      console.log("Profile data:", data);
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        email: data.email || currentUser.email || "",
      });
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const fetchOrders = async (userId: string) => {
    try {
      console.log("Fetching orders for user:", userId);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Orders fetch error:", error);
        throw error;
      }
      
      console.log("Raw orders data:", data);
      const formattedOrders = (data || []).map(order => ({
        ...order,
        products: convertJsonToOrderProducts(order.products)
      }));
      
      console.log("Formatted orders:", formattedOrders);
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error in fetchOrders:", error);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "paid": return "bg-blue-100 text-blue-800";
      case "shipped": return "bg-purple-100 text-purple-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-4">Please sign in to view your profile.</p>
            <Button onClick={() => navigate("/auth")} className="w-full text-sm">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 text-sm h-8 px-2"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Back to Home
        </Button>

        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">My Profile</h1>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="profile" className="text-sm">Profile</TabsTrigger>
            <TabsTrigger value="orders" className="text-sm">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={updateProfile} className="space-y-3">
                  <div>
                    <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      placeholder="Enter your full name"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="mt-1 h-9 text-sm bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed from here
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="mt-1 h-9 text-sm"
                    />
                  </div>

                  <Button type="submit" disabled={updating} className="text-sm h-9 px-4">
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order History</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {orders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-600 mb-3">No orders yet</p>
                    <Button onClick={() => navigate("/")} className="text-sm h-9">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-3 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">Order #{order.id.slice(-8)}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1 shrink-0`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          {order.products.map((product, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              <span className="truncate mr-2">{product.name} x {product.quantity}</span>
                              <span className="text-pink-600 font-medium shrink-0">
                                KSh {(product.price * product.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total:</span>
                            <span className="text-pink-600">
                              KSh {order.total_price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
