'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';

type UserData = {
  username: string;
  email?: string;
  // ... otras propiedades
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (!token) {
      // No hay token => no está logueado => redirect a login
      router.replace('/login'); 
      return;
    }
    setRole(storedRole);

    // Llamamos a la API para obtener datos del usuario (si lo deseas).
    // Por ejemplo, GET /users/profile
    api.get('/users/profile')
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error(err);
        // Si el token es inválido, forzamos logout
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.replace('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.replace('/login');
  };

  if (loading) {
    return <p className="p-4">Cargando...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Bienvenido, {user.username}</p>

      {/* Ejemplo: mostrar algo extra si el rol es 'admin' */}
      {role === 'superadmin' && (
        <div className="mt-4">
          <p>Eres administrador, aquí van opciones de gestión.</p>
        </div>
      )}

      <Button variant="destructive" className="mt-4" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </div>
  );
}