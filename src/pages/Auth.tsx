import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, Phone, Sparkles } from "lucide-react";

const Auth = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate("/");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back! 💕",
        description: "Signed in successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Welcome to ELSO! 🎉",
        description: "Account created! Please check your email to verify.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="mb-6 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        {/* Logo & Welcome */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg shadow-pink-200/50">
              <img 
                src="/lovable-uploads/348f1448-0870-4006-b782-dfb9a8d5927f.png" 
                alt="ELSO Boutique" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">ELSO BOUTIQUE</h1>
          <p className="text-gray-600 mt-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            Your fashion destination
            <Sparkles className="w-4 h-4 text-pink-500" />
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl shadow-pink-200/40 bg-white/80 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-center">Welcome</CardTitle>
              <CardDescription className="text-center">Sign in or create an account to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-pink-50">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-semibold"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-semibold"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-pink-500" />
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-pink-500" />
                        Password
                      </Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold uppercase tracking-wider" 
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-pink-500" />
                        Full Name
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-pink-500" />
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-4 h-4 text-pink-500" />
                        Phone (Optional)
                      </Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-pink-500" />
                        Password
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 border-gray-200 focus:border-pink-400 focus:ring-pink-400"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold uppercase tracking-wider" 
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
