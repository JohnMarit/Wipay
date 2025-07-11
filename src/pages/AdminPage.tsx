import AdminChatSupport from '@/components/AdminChatSupport';
import AdminDashboard from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { checkAdminAccess, getAdminRequirements } from '@/lib/adminAccess';
import { MessageCircle, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminPageProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const AdminPage: React.FC<AdminPageProps> = ({ currentUser }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessReason, setAccessReason] = useState('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'support'>('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const result = await checkAdminAccess(currentUser);

        if (result.isAdmin) {
          console.log('✅ Admin access granted:', result.reason);
          setIsAdmin(true);
          setAccessReason(result.reason);
        } else {
          console.log('❌ Admin access denied:', result.reason);
          setIsAdmin(false);
          setAccessReason(result.reason);
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setIsAdmin(false);
        setAccessReason('Error checking admin access');
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAccess();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const requirements = getAdminRequirements();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            <p className="font-medium mb-2">Admin access is granted to:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              {requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Current user:</strong> {currentUser.email}
            </p>
            <p className="text-sm text-yellow-800">
              <strong>Reason:</strong> {accessReason}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
            >
              Go Back
            </button>
            <button
              onClick={() => window.open('http://localhost:8088', '_blank')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            <strong>✅ Admin Access Granted</strong> - {accessReason}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'support' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('support')}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Support
            </Button>
          </div>
        </div>

        {/* Content */}
        {currentView === 'dashboard' ? (
          <AdminDashboard currentUser={currentUser} />
        ) : (
          <AdminChatSupport currentUser={currentUser} />
        )}
      </div>
    </div>
  );
};

export default AdminPage;
