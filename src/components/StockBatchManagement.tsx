
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Package, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StockBatch {
  id: string;
  batch_number: string;
  received_date: string;
  created_at: string;
}

interface NewBatch {
  batch_number: string;
  received_date: string;
}

const StockBatchManagement = () => {
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [newBatch, setNewBatch] = useState<NewBatch>({
    batch_number: "",
    received_date: new Date().toISOString().split('T')[0],
  });
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_batches")
        .select("id, batch_number, received_date, created_at")
        .order("received_date", { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    }
  };

  const addBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("stock_batches")
        .insert({
          batch_number: newBatch.batch_number,
          received_date: newBatch.received_date,
          quantity: 0, // Default quantity
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock batch added successfully",
      });

      setNewBatch({
        batch_number: "",
        received_date: new Date().toISOString().split('T')[0],
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

  const downloadBatchData = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_batches")
        .select(`
          batch_number,
          received_date,
          products!stock_batches_product_id_fkey (
            name,
            category,
            quantity,
            price
          )
        `)
        .order("received_date", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const csvContent = [
          ["Batch Number", "Date Added", "Products in Batch"].join(","),
          ...data.map(batch => [
            batch.batch_number,
            new Date(batch.received_date).toLocaleDateString(),
            "Click to view products" // Simplified for CSV
          ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "stock-batches.csv";
        link.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: "Batch data downloaded successfully",
        });
      } else {
        toast({
          title: "No Data",
          description: "No batches found to download",
        });
      }
    } catch (error) {
      console.error("Error downloading batch data:", error);
      toast({
        title: "Error",
        description: "Failed to download batch data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-pink-700">Stock Batch Management</h2>
        <div className="flex gap-2">
          <Button
            onClick={downloadBatchData}
            variant="outline"
            className="text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Data
          </Button>
          <Button
            onClick={() => setIsAddingBatch(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full sm:w-auto text-sm h-9"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Batch
          </Button>
        </div>
      </div>

      {/* Add Batch Form */}
      {isAddingBatch && (
        <Card className="shadow-sm border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-3">
            <CardTitle className="text-pink-700 text-base">Add New Stock Batch</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <form onSubmit={addBatch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batch_number" className="text-pink-700 text-sm">Batch Name/Number</Label>
                  <Input
                    id="batch_number"
                    value={newBatch.batch_number}
                    onChange={(e) => setNewBatch({ ...newBatch, batch_number: e.target.value })}
                    required
                    className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                    placeholder="e.g., Spring Collection 2025"
                  />
                </div>
                
                <div>
                  <Label htmlFor="received_date" className="text-pink-700 text-sm">Date Added</Label>
                  <Input
                    id="received_date"
                    type="date"
                    value={newBatch.received_date}
                    onChange={(e) => setNewBatch({ ...newBatch, received_date: e.target.value })}
                    required
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
              <div key={batch.id} className="border rounded-lg p-4 border-pink-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-pink-700">Batch Name:</span>
                      <p className="text-gray-900">{batch.batch_number}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-pink-700">Date Added:</span>
                      <p className="text-gray-900">{new Date(batch.received_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-pink-700">Created:</span>
                      <p className="text-gray-900">{new Date(batch.created_at).toLocaleDateString()}</p>
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
