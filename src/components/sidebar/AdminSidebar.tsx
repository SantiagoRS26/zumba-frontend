'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // si usas un helper para clases condicionales

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', href: '/dashboard' },
    { name: 'Usuarios', href: '/dashboard/users' },
    { name: 'Pagos', href: '/dashboard/payments' },
    { name: 'Clases', href: '/dashboard/classes' },
    // Agrega más según tu lógica
  ];

  return (
    <nav className="flex-1 p-4">
      <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
      <ul className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'block rounded px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
