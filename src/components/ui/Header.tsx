import { Users } from 'lucide-react';

interface HeaderProps {
  showNavigation?: boolean;
  children?: React.ReactNode;
}

export function Header({ showNavigation = true, children }: HeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div className="h-14 sm:h-16 bg-indigo-600 shadow-lg">
        <nav className="h-full px-3 sm:px-4">
          <div className="h-full mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="https://i.ibb.co/w0vWcwd/TANS-KOTA-KITA-4.png"
                alt="Trans Kota Kita Logo"
                className="h-6 sm:h-8 w-auto"
              />
              <span className="ml-2 text-base sm:text-xl font-bold text-white">Trans Management</span>
            </div>
            {children}
          </div>
        </nav>
      </div>
    </div>
  );
}