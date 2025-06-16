
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";

export const navItems = [
  {
    to: "/",
    page: <Index />,
  },
  {
    to: "/auth",
    page: <Auth />,
  },
  {
    to: "/profile",
    page: <Profile />,
  },
  {
    to: "/cart",
    page: <Cart />,
  },
  {
    to: "/wishlist",
    page: <Wishlist />,
  },
  {
    to: "/product/:id",
    page: <ProductDetail />,
  },
  {
    to: "/checkout",
    page: <Checkout />,
  },
  {
    to: "/admin",
    page: <Admin />,
  },
  {
    to: "/about",
    page: <AboutUs />,
  },
  {
    to: "*",
    page: <NotFound />,
  },
];
