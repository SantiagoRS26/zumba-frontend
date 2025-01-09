'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AdminSidebar from '@/components/sidebar/AdminSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificación de token para restringir acceso (simplificado)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login'); // Redirige al login si no hay token
    }
  }, [router]);

  // Manejar apertura/cierre del menú en móvil
  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (hidden en mobile, visible en md+) */}
      <aside
        className={`
          hidden md:flex
          w-64
          flex-col
          bg-white
          border-r border-gray-200
        `}
      >
        <AdminSidebar />
      </aside>

      {/* Sidebar móvil (slide over) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          {/* Drawer */}
          <aside
            className={`
              relative z-40 w-64
              bg-white
              border-r border-gray-200
              p-4
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar />
          </aside>
        </div>
      )}

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col">
        {/* Header / Navbar */}
        <header className="w-full h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between md:justify-end">
          {/* Botón para abrir menu en mobile */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={toggleMobileMenu}
          >
            {/* Icono hamburguesa (puedes usar lucide o heroicons) */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>

          {/* Puedes añadir un UserProfile, Logout, etc. en la esquina */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-gray-600">Admin</span>
            {/* Podrías poner aquí un menú de usuario, notificaciones, etc. */}
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
