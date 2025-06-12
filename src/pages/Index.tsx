
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, User, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import MobileProductCard from "@/components/MobileProductCard";
import { useCart } from "@/hooks/useCart";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price: number | null;
  category: string;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  in_stock: boolean;
}

const FloatingHearts = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute text-pink-200 opacity-10 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 3}s`,
            fontSize: `${8 + Math.random() * 12}px`,
          }}
        >
          💖
        </div>
      ))}
    </div>
  );
};

const Index = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || 'user');
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 relative">
      <FloatingHearts />
      
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                <img
                  src="/lovable-uploads/3942f446-3594-43a8-b602-0e80b80bdd8c.png"
                  alt="ELSO Boutique"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                ELSO
              </h1>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <SearchBar onSearch={setSearchTerm} />
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-1 md:space-x-4">
              {user ? (
                <>
                  {userRole === 'admin' && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" className="rounded-full p-2 md:px-3">
                        <Settings className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Admin</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/wishlist">
                    <Button variant="ghost" size="sm" className="rounded-full p-2 md:px-3">
                      <Heart className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Wishlist</span>
                    </Button>
                  </Link>
                  <Link to="/cart">
                    <Button variant="ghost" size="sm" className="rounded-full relative p-2 md:px-3">
                      <ShoppingCart className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Cart</span>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="rounded-full p-2 md:px-3">
                      <User className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Profile</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:inline-flex rounded-full">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="rounded-full text-sm">
                    <User className="w-4 h-4 mr-1 md:mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <SearchBar onSearch={setSearchTerm} />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10">
        <HeroSection />
      </div>

      {/* Category Filter */}
      <section className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="mb-2 rounded-full text-xs md:text-sm px-3 py-1 md:px-4 md:py-2"
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-12 md:pb-16 relative z-10">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No products found matching your criteria.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 md:py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4">ELSO BOUTIQUE</h3>
              <p className="text-gray-400 text-sm md:text-base">Your premier destination for women's fashion and beauty in Kenya.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li><Link to="/" className="hover:text-white">Home</Link></li>
                <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
                <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
                <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base">Categories</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li><a href="#" className="hover:text-white">Jewelry</a></li>
                <li><a href="#" className="hover:text-white">Accessories</a></li>
                <li><a href="#" className="hover:text-white">Beauty</a></li>
                <li><a href="#" className="hover:text-white">Fashion</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base">Contact Info</h4>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li>📧 elsokisumu@gmail.com</li>
                <li>📱 +254 745 242174</li>
                <li>📍 Kisumu, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-xs md:text-sm">&copy; 2024 ELSO BOUTIQUE. All rights reserved.</p>
            <p className="text-xs mt-2">
              <span className="md:hidden">Powered by </span>
              <a href="https://telvix.tech" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <span className="hidden md:inline">Powered by </span>Telvix
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
