import { NavItem } from 'types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'PDF Tools',
    url: '#',
    icon: 'fileText',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [
      {
        title: 'Process PDFs',
        url: '/dashboard/pdf-splitter',
        icon: 'fileText',
        shortcut: ['p', 's']
      },
      {
        title: 'Processing History',
        url: '/dashboard/processing-history',
        icon: 'history',
        shortcut: ['p', 'h']
      },
      {
        title: 'Pattern Extraction Tool',
        url: '/dashboard/pattern-extraction',
        icon: 'search',
        shortcut: ['p', 'e']
      }
    ]
  },
  {
    title: 'Email Tools',
    url: '#',
    icon: 'mail',
    shortcut: ['e', 'e'],
    isActive: false,
    items: [
      {
        title: 'Email Distribution',
        url: '/dashboard/email-distribution',
        icon: 'mail',
        shortcut: ['e', 'd']
      },
      {
        title: 'Email Templates',
        url: '/dashboard/email-templates',
        icon: 'fileEdit',
        shortcut: ['e', 't']
      },
      {
        title: 'Campaign History',
        url: '/dashboard/campaigns',
        icon: 'history',
        shortcut: ['e', 'h']
      }
    ]
  },
  {
    title: 'Customers',
    url: '#',
    icon: 'users',
    shortcut: ['c', 'c'],
    isActive: false,
    items: [
      {
        title: 'Customer Database',
        url: '/dashboard/clients',
        icon: 'users',
        shortcut: ['c', 'd']
      },
      {
        title: 'Import/Export',
        url: '/dashboard/clients/import',
        icon: 'upload',
        shortcut: ['c', 'i']
      },
      {
        title: 'Customer Analytics',
        url: '/dashboard/clients/analytics',
        icon: 'barChart3',
        shortcut: ['c', 'a']
      }
    ]
  },
  {
    title: 'Analytics',
    url: '/dashboard/analytics',
    icon: 'barChart3',
    shortcut: ['a', 'a'],
    isActive: false,
    items: []
  },
  {
    title: 'Account',
    url: '#',
    icon: 'billing',
    isActive: false,
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Billing',
        url: '/dashboard/billing',
        icon: 'billing',
        shortcut: ['b', 'b']
      },
      {
        title: 'Team',
        url: '/dashboard/team',
        icon: 'users',
        shortcut: ['t', 't']
      }
    ]
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
