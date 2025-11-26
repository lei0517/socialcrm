import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import ManualView from './components/ManualView';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { Platform, User } from './types';
import { db } from './services/db';

type ViewState = 'home' | 'list' | 'detail' | 'manual' | 'admin';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [platform, setPlatform] = useState<Platform>(Platform.XIAOHONGSHU);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check for existing session (if we were using supabase auth persist, but here we just check our fake flow)
  useEffect(() => {
    // In this simple demo, we don't persist session across refresh unless supabase auth is fully used.
    // We will just stop loading.
    setIsAuthChecking(false);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setView('home');
  };

  const handleLogout = () => {
    setUser(null);
    setView('home');
  };

  const handleNavigate = (targetView: ViewState, targetPlatform?: Platform) => {
    setView(targetView);
    if (targetPlatform) {
      setPlatform(targetPlatform);
    }
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setView('detail');
  };

  const handleCreateCustomer = () => {
    setSelectedCustomerId('new');
    setView('detail');
  };

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center bg-gray-50"></div>;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="font-sans text-gray-900">
      {view === 'home' && (
        <Home 
          currentUser={user}
          onNavigate={(v, p) => handleNavigate(v as ViewState, p)} 
          onLogout={handleLogout}
        />
      )}

      {view === 'list' && (
        <CustomerList 
          platform={platform} 
          currentUser={user}
          onNavigateHome={() => setView('home')}
          onSelectCustomer={handleSelectCustomer}
          onCreateCustomer={handleCreateCustomer}
        />
      )}

      {view === 'detail' && selectedCustomerId && (
        <CustomerDetail 
          customerId={selectedCustomerId}
          platform={platform}
          currentUser={user}
          onBack={() => setView('list')}
        />
      )}

      {view === 'manual' && (
        <ManualView 
          platform={platform}
          onBack={() => setView('home')}
        />
      )}

      {view === 'admin' && (
        <UserManagement 
          onBack={() => setView('home')}
        />
      )}
    </div>
  );
};

export default App;