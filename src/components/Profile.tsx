import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Camera, Plus, X, Edit, Trash2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

interface Testimonial {
  id: string;
  user_name: string;
  description: string;
  images: string[];
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });

  // Testimonial form state
  const [testimonialForm, setTestimonialForm] = useState({
    user_name: "",
    description: "",
  });
  const [testimonialImages, setTestimonialImages] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTestimonials();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setProfileForm({
        full_name: data.full_name || "",
        phone: data.phone || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchTestimonials = async () => {
    if (!user) return;

    setTestimonialsLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !testimonialForm.user_name || !testimonialForm.description) return;

    setLoading(true);
    try {
      if (editingTestimonial) {
        // Update existing testimonial
        const { error } = await supabase
          .from("testimonials")
          .update({
            user_name: testimonialForm.user_name,
            description: testimonialForm.description,
            images: testimonialImages,
          })
          .eq("id", editingTestimonial);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Testimonial updated successfully!",
        });
      } else {
        // Create new testimonial
        const { error } = await supabase
          .from("testimonials")
          .insert({
            user_id: user.id,
            user_name: testimonialForm.user_name,
            description: testimonialForm.description,
            images: testimonialImages,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Testimonial posted successfully!",
        });
      }

      // Reset form
      setTestimonialForm({ user_name: "", description: "" });
      setTestimonialImages([]);
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post testimonial",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial.id);
    setTestimonialForm({
      user_name: testimonial.user_name,
      description: testimonial.description,
    });
    setTestimonialImages(testimonial.images);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testimonial deleted successfully!",
      });

      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (url: string) => {
    setTestimonialImages(prev => [...prev, url]);
  };

  const removeImage = (index: number) => {
    setTestimonialImages(prev => prev.filter((_, i) => i !== index));
  };

  const cancelEdit = () => {
    setEditingTestimonial(null);
    setTestimonialForm({ user_name: "", description: "" });
    setTestimonialImages([]);
  };

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="testimonials">My Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="space-y-6">
            {/* Add/Edit Testimonial Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingTestimonial ? "Edit Testimonial" : "Share Your Experience"}
                  {editingTestimonial && (
                    <Button variant="outline" size="sm" onClick={cancelEdit}>
                      Cancel Edit
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_name">Display Name</Label>
                    <Input
                      id="user_name"
                      value={testimonialForm.user_name}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, user_name: e.target.value })}
                      placeholder="How should we display your name?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Your Experience</Label>
                    <Textarea
                      id="description"
                      value={testimonialForm.description}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, description: e.target.value })}
                      placeholder="Share your experience with our products..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Photos (Optional)</Label>
                    <ImageUpload onImageUpload={handleImageUpload} />
                    {testimonialImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {testimonialImages.map((url, index) => (
                          <div key={index} className="relative">
                            <img src={url} alt={`Upload ${index + 1}`} className="w-full h-20 object-cover rounded border" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" />
                    {loading ? "Posting..." : editingTestimonial ? "Update Testimonial" : "Post Testimonial"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Existing Testimonials */}
            <Card>
              <CardHeader>
                <CardTitle>My Testimonials</CardTitle>
              </CardHeader>
              <CardContent>
                {testimonialsLoading ? (
                  <div className="space-y-4">
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-32"></div>
                    ))}
                  </div>
                ) : testimonials.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    You haven't posted any testimonials yet. Share your experience above!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{testimonial.user_name}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(testimonial.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTestimonial(testimonial)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteTestimonial(testimonial.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{testimonial.description}</p>
                        
                        {testimonial.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {testimonial.images.map((image, index) => (
                              <img
                                key={index}
                                src={image}
                                alt={`Testimonial ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
