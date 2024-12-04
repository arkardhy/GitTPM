import { LogOut } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  showNavigation?: boolean;
  onLogout?: () => void;
  onMenuToggle?: () => void;
  children?: React.ReactNode;
}

export function Header({ showNavigation = true, onLogout, onMenuToggle, children }: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="h-16 sm:h-20 bg-gradient-to-r from-indigo-600 to-indigo-800 shadow-lg">
        <nav className="h-full px-4 sm:px-6">
          <div className="h-full mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showNavigation && onMenuToggle && (
                <button
                  onClick={onMenuToggle}
                  className="text-white p-2 rounded-md hover:bg-indigo-700 lg:hidden"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className="flex items-center">
                <img
                  src="https://cdn.discordapp.com/attachments/1128648614932131870/1128648845396541601/TANS_KOTA_KITA__4_.png?ex=67518e26&is=67503ca6&hm=2336771aa4bae853a837bc15656ae21aac78baa023f9bba0f869636955620be1"
                  alt="Trans Kota Kita Logo"
                  className="h-8 sm:h-10 w-auto"
                />
                <span className="ml-3 text-lg sm:text-xl font-bold text-white hidden sm:block">
                  Trans Management System
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {onLogout && (
                <Button
                  onClick={onLogout}
                  variant="secondary"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign Out
                </Button>
              )}
              {children}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}