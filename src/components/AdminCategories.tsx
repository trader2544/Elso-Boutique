
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface NewCategory {
  name: string;
  description: string;
  image_url: string;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: "",
    description: "",
    image_url: "",
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from("categories")
        .insert({
          name: newCategory.name,
          description: newCategory.description || null,
          image_url: newCategory.image_url || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category added successfully",
      });

      setNewCategory({
        name: "",
        description: "",
        image_url: "",
      });
      setIsAddingCategory(false);
      await fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: editingCategory.name,
          description: editingCategory.description,
          image_url: editingCategory.image_url,
        })
        .eq("id", editingCategory.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      setEditingCategory(null);
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-pink-700">Category Management</h2>
        <Button
          onClick={() => setIsAddingCategory(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 w-full sm:w-auto text-sm h-9"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Category
        </Button>
      </div>

      {/* Add Category Form */}
      {isAddingCategory && (
        <Card className="shadow-sm border-pink-200">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-pink-700 text-base">Add New Category</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingCategory(false)}
                className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <form onSubmit={addCategory} className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-pink-700 text-sm">Category Name</Label>
                    <Input
                      id="name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      required
                      className="border-pink-200 focus:border-pink-400 h-9 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-pink-700 text-sm">Description</Label>
                    <Textarea
                      id="description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      rows={3}
                      className="border-pink-200 focus:border-pink-400 text-sm mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-pink-700 text-sm">Category Image</Label>
                  <ImageUpload
                    onImageUploaded={(url) => setNewCategory({ ...newCategory, image_url: url })}
                    currentImage={newCategory.image_url}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 flex-1 sm:flex-none text-sm h-9"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingCategory(false)}
                  className="flex-1 sm:flex-none text-sm h-9"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      <Card className="shadow-sm border-pink-200">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 pb-3">
          <CardTitle className="text-pink-700 text-base">Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categories.map((category) => (
              <div key={category.id} className="border border-pink-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                {editingCategory?.id === category.id ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <ImageUpload
                      onImageUploaded={(url) => setEditingCategory({ ...editingCategory, image_url: url })}
                      currentImage={editingCategory.image_url}
                      className="mb-2"
                    />
                    <Input
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="text-xs h-8"
                      placeholder="Category name"
                    />
                    <Textarea
                      value={editingCategory.description || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      className="text-xs"
                      rows={2}
                      placeholder="Description"
                    />
                    <div className="flex gap-1">
                      <Button
                        onClick={updateCategory}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 flex-1 text-xs h-8"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditingCategory(null)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="w-full h-24 mb-2 rounded-lg overflow-hidden bg-pink-50">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-pink-300 text-2xl">📦</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1 text-xs line-clamp-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{category.description}</p>
                    )}
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                        className="flex-1 text-xs h-7 py-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteCategory(category.id)}
                        className="px-2 h-7"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No categories found. Add your first category to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategories;
