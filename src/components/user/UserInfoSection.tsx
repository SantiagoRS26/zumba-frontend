'use client';

import React from 'react';
// Librerías, hooks, etc., si necesitas

type UserData = {
  _id: string;
  username: string;
  email?: string;
  role?: string;
  profilePhoto?: string;
};

interface UserInfoProps {
  user: UserData;
}

export function UserInfoSection({ user }: UserInfoProps) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Datos del Usuario</h2>
      <div className="flex items-center gap-4">
        {user.profilePhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePhoto}
            alt="Foto de perfil"
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold">{user.username}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">Rol: {user.role}</p>
        </div>
      </div>
    </section>
  );
}
