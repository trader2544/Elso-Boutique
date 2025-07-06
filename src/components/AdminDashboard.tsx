
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Welcome to the admin dashboard. Please use the main admin panel navigation to access different sections.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
