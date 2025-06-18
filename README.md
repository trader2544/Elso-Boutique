# Elso Boutique

Elso Boutique is a modern e-commerce platform focused on delivering premium women's fashion, jewelry, accessories, and beauty products, primarily serving Kisumu, Kenya.

## Project Overview

This project provides an online storefront for ELSO Boutique, enabling users to browse products, manage their carts and wishlists, place orders, and complete secure payments using M-Pesa mobile money integration.

## Features

- Product catalog for women's fashion, jewelry, accessories, and beauty products
- User authentication and profile management
- Shopping cart and persistent cart storage
- Wishlist functionality
- Product reviews and ratings
- Order management and tracking
- Secure payments via M-Pesa (mobile money)
- Admin panel for product and order management
- Responsive UI for mobile and desktop

## Technologies Used

- **Frontend:** Vite, React, TypeScript, shadcn-ui, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **Payments Integration:** M-Pesa (Safaricom)
- **Deployment:** Vercel or similar platforms

## Getting Started

### Prerequisites

- [Node.js & npm](https://github.com/nvm-sh/nvm#installing-and-updating) installed

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd elso-chic-commerce

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Editing the Code

You can edit the codebase using your preferred IDE locally, or directly on GitHub via the web interface or Codespaces.

- To use Codespaces:  
  Go to your repository page, click the "Code" button, switch to the "Codespaces" tab, and launch a new codespace for cloud-based development.

## Database Schema

- Users, products, orders, cart items, reviews, and M-Pesa transactions are managed in Supabase/PostgreSQL.
- Row Level Security (RLS) is enabled for all main tables to protect user data.

## Payment Integration

- M-Pesa payments are integrated for secure, mobile-friendly checkout experiences.
- Transactions are securely recorded and tracked in the database.

## Deployment

Deploy using your preferred platform (e.g., Vercel) or via your own infrastructure.

## Custom Domain

You can connect a custom domain to your deployed storefront via your deployment platform's settings.

## License

This project is proprietary and intended for use by Elso Boutique and its operators.

---

**For questions or support, please contact:**  
Elso Boutique, Kisumu, Kenya  
Customer Service: +254 745 242174
