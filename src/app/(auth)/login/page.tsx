'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      // El backend asumo retorna: { token, user: { role: "...", ... } }
      const { token, user } = res.data;

      // Guardamos token y rol en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);

      // Redirigir a dashboard (o donde gustes)
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Login fallido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 p-6 border border-gray-200 rounded shadow"
      >
        <h1 className="text-xl font-bold">Iniciar Sesión</h1>
        <Input
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
}