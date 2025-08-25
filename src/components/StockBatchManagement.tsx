
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
}

interface StockBatch {
  id: string;
  product_id: string;
  batch_number: string;
  quantity: number;
  cost_price: number | null;
  supplier: string | null;
  expiry_date: string | null;
  received_date: string;
  products: {
    name: string;
  };
}

interface NewBatch {
  product_id: string;
  batch_number: string;
  quantity: string;
  cost_price: string;
  supplier: string;
  expiry_date: string;
}

const StockBatchManagement = () => {
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newBatch, setNewBatch] = useState<NewBatch>({
    product_id: "",
    batch_number: "",
    quantity: "",
    cost_price: "",
    supplier: "",
    expiry_date: "",
  });
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_batches")
        .select(`
          *,
          products (name)
        `)
        .order("received_date", { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("stock_batches")
        .insert({
          product_id: newBatch.product_id,
          batch_number: newBatch.batch_number,
          quantity: parseInt(newBatch.quantity),
          cost_price: newBatch.cost_price ? parseFloat(newBatch.cost_price) : null,
          supplier: newBatch.supplier || null,
          expiry_date: newBatch.expiry_date || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock batch added successfully",
      });

      setNewBatch({
        product_id: "",
        batch_number: "",
        quantity: "",
        cost_price: "",
        supplier: "",
        expiry_date: "",
      });
      setIsAddingBatch(false);
      await fetchBatches();
    } catch (error) {
      console.error("Error adding batch:", error);
      toast({
        title: "Error",
        description: "Failed to add stock batch",
        variant: "destructive",
      });
    }
  };

  const deleteBatch = async (batchId: string) => {
    try {
      const { error } = await supabase
        .from("stock_batches")
        .delete()
        .eq("id", batchId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock batch deleted successfully",
      });

      await fetchBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast({
        title: "Error",
        description: "Failed to delete stock batch",
        variant: "destructive",
      });
    }
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-pink-700">Stock Batch Management</h2>
        <Button
          onClick={() => setIsAddingBatch(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full sm:w-auto text-sm h-9"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Batch
        </Button>
      </div>

      {/* Add Batch Form */}
      {isAddingBatch && (
        <Card className="shadow-sm border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-3">
            <CardTitle className="text-pink-700 text-base">Add New Stock Batch</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <form onSubmit={addBatch} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="product" className="text-pink-700 text-sm">Product</Label>
                  <Select value={newBatch.product_id} onValueChange={(value) => setNewBatch({ ...newBatch, product_id: value })}>
                    <SelectTrigger className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="batch_number" className="text-pink-700 text-sm">Batch Number</Label>
                  <Input
                    id="batch_number"
                    value={newBatch.batch_number}
                    onChange={(e) => setNewBatch({ ...newBatch, batch_number: e.target.value })}
                    required
                    className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="quantity" className="text-pink-700 text-sm">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                    required
                    className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cost_price" className="text-pink-700 text-sm">Cost Price (KSh)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={newBatch.cost_price}
                    onChange={(e) => setNewBatch({ ...newBatch, cost_price: e.target.value })}
                    className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplier" className="text-pink-700 text-sm">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newBatch.supplier}
                    onChange={(e) => setNewBatch({ ...newBatch, supplier: e.target.value })}
                    className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiry_date" className="text-pink-700 text-sm">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={newBatch.expiry_date}
                    onChange={(e) => setNewBatch({ ...newBatch, expiry_date: e.target.value })}
                    className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 flex-1 sm:flex-none text-sm h-9"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Batch
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingBatch(false)}
                  className="flex-1 sm:flex-none text-sm h-9"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Batches List */}
      <Card className="shadow-sm border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-3">
          <CardTitle className="text-pink-700 text-base">Stock Batches ({batches.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className={`border rounded-lg p-3 ${
                isExpired(batch.expiry_date) ? 'border-red-300 bg-red-50' :
                isExpiringSoon(batch.expiry_date) ? 'border-orange-300 bg-orange-50' :
                'border-pink-200 hover:shadow-md'
              } transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                    <div>
                      <span className="font-medium text-pink-700">Product:</span>
                      <p className="text-gray-900">{batch.products.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-pink-700">Batch #:</span>
                      <p className="text-gray-900">{batch.batch_number}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-pink-700">Qty:</span>
                      <p className="text-gray-900">{batch.quantity}</p>
                    </div>
                    <div>
                      <span className="font-medium text-pink-700">Cost:</span>
                      <p className="text-gray-900">
                        {batch.cost_price ? `KSh ${batch.cost_price.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-pink-700">Supplier:</span>
                      <p className="text-gray-900">{batch.supplier || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {(isExpired(batch.expiry_date) || isExpiringSoon(batch.expiry_date)) && (
                        <AlertTriangle className="w-3 h-3 text-orange-500" />
                      )}
                      <div>
                        <span className="font-medium text-pink-700">Expiry:</span>
                        <p className={`${
                          isExpired(batch.expiry_date) ? 'text-red-600 font-medium' :
                          isExpiringSoon(batch.expiry_date) ? 'text-orange-600 font-medium' :
                          'text-gray-900'
                        }`}>
                          {batch.expiry_date || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteBatch(batch.id)}
                    className="ml-3 px-2 h-7"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {batches.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No stock batches found. Add your first batch to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockBatchManagement;
