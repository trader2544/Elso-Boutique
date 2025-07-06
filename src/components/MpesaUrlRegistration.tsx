
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, Globe } from "lucide-react";

const MpesaUrlRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("");
  const [validationUrl, setValidationUrl] = useState("");
  const { toast } = useToast();

  const handleRegisterUrls = async () => {
    if (!callbackUrl || !validationUrl) {
      toast({
        title: "Error",
        description: "Please provide both callback and validation URLs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // This would typically call the M-Pesa URL registration API
      // For now, we'll just simulate the registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: "M-Pesa URLs registered successfully",
      });
    } catch (error) {
      console.error("Error registering M-Pesa URLs:", error);
      toast({
        title: "Error",
        description: "Failed to register M-Pesa URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          M-Pesa URL Registration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="callback-url">Callback URL</Label>
          <Input
            id="callback-url"
            type="url"
            placeholder="https://your-domain.com/api/mpesa/callback"
            value={callbackUrl}
            onChange={(e) => setCallbackUrl(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="validation-url">Validation URL</Label>
          <Input
            id="validation-url"
            type="url"
            placeholder="https://your-domain.com/api/mpesa/validation"
            value={validationUrl}
            onChange={(e) => setValidationUrl(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleRegisterUrls}
          disabled={loading}
          className="w-full"
        >
          <Globe className="w-4 h-4 mr-2" />
          {loading ? "Registering..." : "Register URLs"}
        </Button>

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-2">Instructions:</p>
          <ul className="space-y-1 text-xs">
            <li>• Callback URL: Where M-Pesa sends transaction confirmations</li>
            <li>• Validation URL: Where M-Pesa sends transaction validations</li>
            <li>• URLs must be publicly accessible HTTPS endpoints</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MpesaUrlRegistration;
