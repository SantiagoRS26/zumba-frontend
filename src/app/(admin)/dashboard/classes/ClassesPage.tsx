// app/classes/page.tsx (por ejemplo)
'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { useFetchClasses } from '@/hooks/useFetchClasses';
import { createClass, updateClass, deleteClass, updateAttendance } from '@/services/classService';

import { Button } from '@/components/ui/button';
import { ClassFormDialog } from "@/components/classes/ClassFormDialog";
import { AttendanceDialog } from "@/components/classes/AttendanceDialog";

import { ClassSession } from '@/types';
import { GenerateClassesDialog } from '@/components/classes/GenerateClassesDialog'; // <-- Importa tu nuevo componente

export default function ClassesPage() {
  const searchParams = useSearchParams();
  const filterMonth = searchParams.get('month') || '';
  const filterYear = searchParams.get('year') || '';

  const { classes, loading, refetch } = useFetchClasses(filterMonth, filterYear);

  // Diálogo para crear/editar clase manualmente
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

  // Diálogo para asistencia
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);

  // Diálogo para “Generar clases” a partir de un schedule
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // ------------------------------------------------
  // HANDLERS: crear / editar
  // ------------------------------------------------
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassDialogOpen(true);
  };

  const handleOpenEditClass = (cls: ClassSession) => {
    setEditingClass(cls);
    setClassDialogOpen(true);
  };

  const handleSaveClass = async (payload: Partial<ClassSession>) => {
    if (editingClass) {
      // Editar
      await updateClass(editingClass._id, payload);
      alert('Clase actualizada correctamente.');
    } else {
      // Crear
      await createClass(payload);
      alert('Clase creada correctamente.');
    }
    refetch();
  };

  // ------------------------------------------------
  // HANDLERS: eliminar
  // ------------------------------------------------
  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm('¿Seguro de eliminar esta clase?')) return;
    await deleteClass(classId);
    alert('Clase eliminada correctamente.');
    refetch();
  };

  // ------------------------------------------------
  // HANDLERS: asistencia
  // ------------------------------------------------
  const handleOpenAttendance = (cls: ClassSession) => {
    setSelectedClass(cls);
    setAttendanceDialogOpen(true);
  };

  const handleSaveAttendance = async (attendanceData: any) => {
    if (!selectedClass) return;
    await updateAttendance(selectedClass._id, attendanceData);
    alert('Asistencia registrada/actualizada.');
    refetch();
  };

  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold">Gestión de Clases</h1>

        {/* Botón para generar clases en lote a partir de un schedule */}
        <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
          Generar Clases por Schedule
        </Button>

        {/* Botón para crear clase manual */}
        <Button onClick={handleOpenCreateClass}>Crear Clase</Button>
      </div>

      {loading ? (
        <p>Cargando clases...</p>
      ) : classes.length === 0 ? (
        <p>No hay clases registradas.</p>
      ) : (
        <table className="w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Horario</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => {
              const dateStr = `${cls.day}/${cls.month}/${cls.year}`;
              const timeStr = cls.startTime
                ? `${cls.startTime} - ${cls.endTime}`
                : 'Sin horario';
              return (
                <tr key={cls._id} className="border-b border-gray-200">
                  <td className="px-4 py-2">{dateStr}</td>
                  <td className="px-4 py-2">{timeStr}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenAttendance(cls)}
                    >
                      Asistencia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditClass(cls)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClass(cls._id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Diálogo CREAR/EDITAR CLASE */}
      <ClassFormDialog
        open={classDialogOpen}
        onClose={() => setClassDialogOpen(false)}
        initialData={editingClass}
        onSubmit={handleSaveClass}
      />

      {/* Diálogo ASISTENCIA */}
      <AttendanceDialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        classData={selectedClass ?? undefined}
        onSave={handleSaveAttendance}
      />

      {/* Diálogo para GENERAR CLASES por schedule */}
      <GenerateClassesDialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        onSuccess={refetch} // para refrescar la lista de clases luego de generar
      />
    </div>
  );
}
