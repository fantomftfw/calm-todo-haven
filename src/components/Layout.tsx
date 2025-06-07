
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckSquare, Timer, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: CheckSquare, label: 'Tasks' },
    { path: '/focus', icon: Timer, label: 'Focus' },
    { path: '/me', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      {children}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-blue-100 px-4 py-2">
        <div className="flex justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Icon size={24} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Layout;
