import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Upload } from "lucide-react";

interface Profile {
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
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // Testimonial form state
  const [testimonialForm, setTestimonialForm] = useState({
    description: "",
    images: [] as string[]
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserTestimonials();
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
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchUserTestimonials = async () => {
    if (!user) return;

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
    }
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    setLoading(true);
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
      setLoading(false);
    }
  };

  const addTestimonialImage = (imageUrl: string) => {
    setTestimonialForm({
      ...testimonialForm,
      images: [...testimonialForm.images, imageUrl]
    });
  };

  const removeTestimonialImage = (index: number) => {
    const newImages = testimonialForm.images.filter((_, i) => i !== index);
    setTestimonialForm({
      ...testimonialForm,
      images: newImages
    });
  };

  const submitTestimonial = async () => {
    if (!user || !testimonialForm.description.trim() || testimonialForm.images.length === 0) {
      toast({
        title: "Error",
        description: "Please add a description and at least one image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("testimonials")
        .insert({
          user_id: user.id,
          user_name: profile?.full_name || "Anonymous",
          description: testimonialForm.description,
          images: testimonialForm.images,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testimonial posted successfully!",
      });

      // Reset form and refresh testimonials
      setTestimonialForm({ description: "", images: [] });
      fetchUserTestimonials();
    } catch (error) {
      console.error("Error posting testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to post testimonial",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonialId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });

      fetchUserTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  if (!user || !profile) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="testimonials">My Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>

              <Button onClick={updateProfile} disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <div className="space-y-6">
            {/* Post New Testimonial */}
            <Card>
              <CardHeader>
                <CardTitle>Share Your Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Your Review</Label>
                  <Textarea
                    id="description"
                    placeholder="Share your experience with our products..."
                    value={testimonialForm.description}
                    onChange={(e) =>
                      setTestimonialForm({
                        ...testimonialForm,
                        description: e.target.value
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {testimonialForm.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Testimonial ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeTestimonialImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                      <ImageUpload
                        onImageUploaded={addTestimonialImage}
                        currentImage=""
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={submitTestimonial} 
                  disabled={loading || !testimonialForm.description.trim() || testimonialForm.images.length === 0}
                  className="w-full"
                >
                  {loading ? "Posting..." : "Post Testimonial"}
                </Button>
              </CardContent>
            </Card>

            {/* Existing Testimonials */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Your Testimonials</h3>
              {testimonials.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    You haven't posted any testimonials yet.
                  </CardContent>
                </Card>
              ) : (
                testimonials.map((testimonial) => (
                  <Card key={testimonial.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold">{testimonial.user_name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(testimonial.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTestimonial(testimonial.id)}
                        >
                          Delete
                        </Button>
                      </div>
                      
                      <p className="mb-4">{testimonial.description}</p>
                      
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {testimonial.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Testimonial ${index + 1}`}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
