"use client";

import { useState } from "react";
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

type Props = {
  onClose: () => void;
};

export default function CreateUserDialog({ onClose }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("user");
  const [userType, setUserType] = useState<"student"|"teacher"|"sponsor"|"admin">("student");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await api.post("auth/register", {
        username,
        password,
        email,
        roleName,
        userType, // <-- ENVIAR userType
      });
      onClose();
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Hubo un error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear nuevo usuario</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
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
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Seleccionar rol (si sigues usando "roleName") */}
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

          {/* Seleccionar userType */}
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
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
