
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
import FloatingBackground from "@/components/FloatingBackground";
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
    <div className="min-h-screen relative">
      <FloatingBackground />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-50 via-white to-pink-50 backdrop-blur-md shadow-lg sticky top-0 z-50 relative border-b border-pink-100">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-md">
                <img
                  src="/lovable-uploads/7796bdd5-cd59-4ebe-b828-c3a6a07072c4.png"
                  alt="ELSO Boutique"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-400 bg-clip-text text-transparent">
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
                      <Button variant="ghost" size="sm" className="rounded-full p-2 md:px-3 hover:bg-pink-50">
                        <Settings className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Admin</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/wishlist">
                    <Button variant="ghost" size="sm" className="rounded-full p-2 md:px-3 hover:bg-pink-50">
                      <Heart className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Wishlist</span>
                    </Button>
                  </Link>
                  <Link to="/cart">
                    <Button variant="ghost" size="sm" className="rounded-full relative p-2 md:px-3 hover:bg-pink-50">
                      <ShoppingCart className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Cart</span>
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="rounded-full p-2 md:px-3 hover:bg-pink-50">
                      <User className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Profile</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:inline-flex rounded-full hover:bg-pink-50">
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="rounded-full text-sm bg-gradient-to-r from-pink-400 to-pink-300 hover:from-pink-500 hover:to-pink-400 shadow-md">
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
              className={`mb-2 rounded-full text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 transition-all ${
                selectedCategory === category 
                  ? "bg-gradient-to-r from-pink-400 to-pink-300 shadow-md" 
                  : "border-pink-200 hover:bg-pink-50"
              }`}
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
      <footer className="bg-gradient-to-r from-pink-100 via-white to-pink-100 text-gray-800 py-8 md:py-12 relative z-10 border-t border-pink-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">ELSO BOUTIQUE</h3>
              <p className="text-gray-600 text-sm md:text-base">Your premier destination for women's fashion and beauty in Kenya.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base text-pink-700">Quick Links</h4>
              <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                <li><Link to="/" className="hover:text-pink-600">Home</Link></li>
                <li><Link to="/cart" className="hover:text-pink-600">Cart</Link></li>
                <li><Link to="/wishlist" className="hover:text-pink-600">Wishlist</Link></li>
                <li><Link to="/profile" className="hover:text-pink-600">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base text-pink-700">Categories</h4>
              <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                <li><a href="#" className="hover:text-pink-600">Jewelry</a></li>
                <li><a href="#" className="hover:text-pink-600">Accessories</a></li>
                <li><a href="#" className="hover:text-pink-600">Beauty</a></li>
                <li><a href="#" className="hover:text-pink-600">Fashion</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm md:text-base text-pink-700">Contact Info</h4>
              <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                <li>📧 elsokisumu@gmail.com</li>
                <li>📱 +254 745 242174</li>
                <li>📍 Kisumu, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-pink-200 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-500">
            <p className="text-xs md:text-sm">&copy; 2024 ELSO BOUTIQUE. All rights reserved.</p>
            <p className="text-xs mt-2">
              <span className="md:hidden">Powered by </span>
              <a href="https://telvix.tech" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600">
                <span className="hidden md:inline">Powered by </span>Telvix
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Hover Button - Global */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/254773482210"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group"
          title="Chat with us on WhatsApp"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Index;
