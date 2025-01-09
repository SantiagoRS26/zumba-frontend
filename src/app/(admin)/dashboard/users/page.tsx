"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import CreateUserDialog from "./CreateUserDialog";
import EditUserDialog from "./EditUserDialog";
import Link from "next/link";

type User = {
  _id: string;
  username: string;
  email?: string;
  role?:
    | {
        name: string;
      }
    | string;
  userType?: "student" | "teacher" | "sponsor" | "admin"; // <-- AÑADIR
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users"); // GET /users
      setUsers(res.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setShowCreateDialog(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseDialogs = () => {
    // Cerrar ambos diálogos
    setShowCreateDialog(false);
    setSelectedUser(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro de eliminar este usuario?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={handleOpenCreate}>Crear Usuario</Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Rol</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {users.map((u,index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-4 py-2">
                  <Link
                    href={`/dashboard/users/${u._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    {u.username}
                  </Link>
                </td>
                <td className="px-4 py-2">{u.email || ""}</td>
                <td className="px-4 py-2">
                  {typeof u.role === "string" ? u.role : u.role?.name}
                </td>
                <td className="px-4 py-2">{u.userType || ""}</td>
                <td className="px-4 py-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(u)}
                  >
                    Editar
                  </Button>{" "}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(u._id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modales */}
      {showCreateDialog && (
        <CreateUserDialog
          onClose={() => {
            handleCloseDialogs();
            fetchUsers();
          }}
        />
      )}

      {selectedUser && (
        <EditUserDialog
          user={selectedUser}
          onClose={() => {
            handleCloseDialogs();
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}
