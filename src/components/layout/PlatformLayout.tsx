import React from 'react';
import { Building2, FileText, Mail, Home, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PlatformLayoutProps {
  children: React.ReactNode;
}

const PlatformLayout: React.FC<PlatformLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navigationItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: Home,
      description: 'Platform overview and quick access'
    },
    {
      path: '/tools/pdf-splitter',
      label: 'PDF Splitter',
      icon: FileText,
      description: 'Split multi-page PDFs by account'
    },
    {
      path: '/tools/email-distribution',
      label: 'Email Distribution',
      icon: Mail,
      description: 'Send personalized emails with attachments'
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className='bg-gradient-subtle min-h-screen'>
      {/* New Water Systems Header */}
      <div className='bg-blue-600 px-6 py-3 text-white shadow-lg'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <Link
            href='/'
            className='flex items-center gap-3 transition-opacity hover:opacity-80'
          >
            <Building2 className='h-6 w-6' />
            <div>
              <span className='text-lg font-semibold'>NEW WATER SYSTEMS</span>
              <div className='text-xs opacity-80'>Business Tools Platform</div>
            </div>
          </Link>
          <div className='text-sm'>Hi Lisa! 👋</div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className='border-b bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-6'>
          <nav className='flex space-x-1 py-3'>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border border-blue-200 bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } `}
                >
                  <Icon className='h-4 w-4' />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className='flex-1'>{children}</main>

      {/* New Water Systems Footer */}
      <footer className='mt-12 border-t bg-muted/30'>
        <div className='mx-auto max-w-7xl p-6 text-center'>
          <div className='flex items-center justify-center gap-2 text-muted-foreground'>
            <Building2 className='h-4 w-4' />
            <span className='text-sm'>
              © 2024 New Water Systems - Professional Business Tools Platform
            </span>
          </div>
          <p className='mt-2 text-xs text-muted-foreground'>
            Streamlined tools for efficient business operations and customer
            management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PlatformLayout;
