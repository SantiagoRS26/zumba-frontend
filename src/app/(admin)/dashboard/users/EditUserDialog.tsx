"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";

type User = {
  id: string;
  username: string;
  email?: string;
  role?: string | { name: string };
  userType?: "student" | "teacher" | "sponsor" | "admin";
};

type Props = {
  user: User;
  onClose: () => void;
};

export default function EditUserDialog({ user, onClose }: Props) {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const initialRole = typeof user.role === "string" ? user.role : user.role?.name;
  const [roleName, setRoleName] = useState(initialRole || "user");

  const [userType, setUserType] = useState<User["userType"]>(user.userType || "student");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Actualiza estados si el prop user cambia
    setUsername(user.username || "");
    setEmail(user.email || "");
    setRoleName(initialRole || "user");
    setUserType(user.userType || "student");
  }, [user, initialRole]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/users/${user.id}`, {
        username,
        email,
        roleName,
        userType, // <-- AÑADIR userType
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Input
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Rol */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Rol</label>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>

          {/* userType */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Tipo de Usuario</label>
            <select
              className="border border-gray-300 rounded px-2 py-1"
              value={userType}
              onChange={(e) => setUserType(e.target.value as any)}
            >
              <option value="student">Estudiante</option>
              <option value="teacher">Profesor</option>
              <option value="sponsor">Sponsor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
