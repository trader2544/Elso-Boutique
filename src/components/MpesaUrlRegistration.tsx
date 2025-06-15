
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Settings } from "lucide-react";

const MpesaUrlRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [responseData, setResponseData] = useState<any>(null);
  const { toast } = useToast();

  const handleRegisterUrls = async () => {
    setLoading(true);
    setRegistrationStatus('idle');

    try {
      console.log('🔧 Initiating M-Pesa URL registration...');
      
      const { data, error } = await supabase.functions.invoke('mpesa-register-url');

      if (error) {
        console.error('❌ Registration error:', error);
        throw error;
      }

      console.log('✅ Registration response:', data);
      
      if (data.success) {
        setRegistrationStatus('success');
        setResponseData(data);
        toast({
          title: "Success! 🎉",
          description: "M-Pesa callback URLs have been registered successfully.",
        });
      } else {
        setRegistrationStatus('error');
        setResponseData(data);
        toast({
          title: "Registration Failed",
          description: data.details || "Failed to register callback URLs",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      setRegistrationStatus('error');
      setResponseData(error);
      toast({
        title: "Error",
        description: error.message || "Failed to register callback URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>M-Pesa Callback URL Registration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>What this does:</strong> This registers your callback URL with Safaricom's M-Pesa API 
            to ensure that payment notifications are sent to your server when customers complete payments.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Callback URL to be registered:</p>
          <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
            https://vpqjobkdwrbdxnvwnuke.supabase.co/functions/v1/mpesa-callback
          </p>
        </div>

        <Button
          onClick={handleRegisterUrls}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Registering URLs...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Register Callback URLs</span>
            </div>
          )}
        </Button>

        {registrationStatus === 'success' && responseData && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">Registration Successful!</span>
            </div>
            <div className="text-sm text-green-600 space-y-1">
              <p><strong>Response:</strong> {responseData.responseDescription}</p>
              <p><strong>Shortcode:</strong> {responseData.shortcode}</p>
              <p><strong>Confirmation URL:</strong> {responseData.registeredUrls?.confirmationUrl}</p>
            </div>
          </div>
        )}

        {registrationStatus === 'error' && responseData && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-700">Registration Failed</span>
            </div>
            <div className="text-sm text-red-600 space-y-1">
              <p><strong>Error:</strong> {responseData.details || responseData.message}</p>
              {responseData.errorCode && (
                <p><strong>Error Code:</strong> {responseData.errorCode}</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> You typically only need to do this once per environment. 
            After successful registration, M-Pesa will send callbacks to your registered URL 
            for all transactions on your shortcode.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MpesaUrlRegistration;
