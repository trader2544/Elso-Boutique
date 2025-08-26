
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useIsMobile } from "@/hooks/use-mobile";
import SearchBar from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Category {
  id: string;
  name: string;
}

const Header = () => {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isAdmin = user?.email === "admin@elsoboutique.com";

  return (
    <header
      className={`bg-white shadow-sm border-b sticky top-0 z-50 transition-transform duration-300 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/348f1448-0870-4006-b782-dfb9a8d5927f.png" 
              alt="Elso Boutique" 
              className="h-8 md:h-10 w-auto object-contain"
            />
            <span className="font-bold text-lg md:text-xl text-pink-600 hidden sm:block">
              Elso Boutique
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <>
              {/* Categories Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium">
                    Categories
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category.id} asChild>
                      <Link to={`/?category=${category.id}`} className="w-full">
                        {category.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-4">
                <SearchBar />
              </div>

              {/* Contact Link */}
              <Link
                to="/contact"
                className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
              >
                Contact
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Link to="/wishlist" className="relative">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-5 h-5" />
                    {wishlistItems.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {wishlistItems.length}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link to="/cart" className="relative">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="flex items-center">
                            <Settings className="w-4 h-4 mr-2" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/auth">
                    <Button variant="default" size="sm">
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}

          {/* Mobile Menu */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {/* Search Bar for Mobile */}
                    <div className="pb-4 border-b">
                      <SearchBar />
                    </div>

                    {/* Categories for Mobile - Improved Layout */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500">Categories</h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/?category=${category.id}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="block w-full p-3 text-sm border rounded-md hover:bg-gray-50 transition-colors text-left bg-white shadow-sm"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <Link
                        to="/contact"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 text-sm font-medium"
                      >
                        Contact
                      </Link>

                      {user ? (
                        <>
                          <Link
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center py-2 text-sm"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setIsMenuOpen(false)}
                              className="flex items-center py-2 text-sm"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Admin Panel
                            </Link>
                          )}
                          <Button
                            onClick={() => {
                              handleSignOut();
                              setIsMenuOpen(false);
                            }}
                            variant="ghost"
                            className="w-full justify-start p-0"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </Button>
                        </>
                      ) : (
                        <Link
                          to="/auth"
                          onClick={() => setIsMenuOpen(false)}
                          className="block"
                        >
                          <Button variant="default" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
