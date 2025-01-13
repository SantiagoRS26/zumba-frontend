// components/classes/BulkActionsBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getAllTeachers } from '@/services/userService'; // Ajusta la ruta
import { User } from '@/types';

type Teacher = {
  _id: string;
  username: string;
  // otros campos si gustas
};

type Props = {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkAssignTeacher: (teacherId: string) => void;
};

export function BulkActionsBar({
  selectedCount,
  onBulkDelete,
  onBulkAssignTeacher,
}: Props) {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  // Cargar la lista de profesores al montar
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await getAllTeachers();
      setTeachers(res.data);
      console.log('Profesores cargados:', res.data);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      alert('No se pudo cargar la lista de profesores.');
    }
  };

  const handleAssignTeacher = () => {
    if (!selectedTeacherId) {
      alert('Debes seleccionar un profesor.');
      return;
    }
    console.log('Asignar profesor:', selectedTeacherId);
    onBulkAssignTeacher(selectedTeacherId);
    setSelectedTeacherId('');
  };

  return (
    <div className="flex items-center gap-4 p-4 mb-4 bg-gray-50 border border-gray-200">
      <p className="text-sm">{selectedCount} clase(s) seleccionadas</p>

      {/* Botón para eliminar */}
      <Button variant="destructive" onClick={onBulkDelete}>
        Eliminar seleccionadas
      </Button>

      {/* Asignar profesor: */}
      <div className="flex items-center gap-2">
        {teachers.length === 0 ? (
          <p className="text-sm text-gray-500">No hay profesores cargados.</p>
        ) : (
          <select
            className="border px-2 py-1 text-sm"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="">Selecciona profesor</option>
            {teachers.map((t, index) => (
              <option key={index} value={t.id}>
                {t.username}
              </option>
            ))}
          </select>
        )}

        <Button variant="outline" onClick={handleAssignTeacher}>
          Asignar Profesor
        </Button>
      </div>
    </div>
  );
}