'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'next/navigation';

type ClassSession = {
  _id: string;
  day: number;
  month: number;
  year: number;
  startTime?: string;
  endTime?: string;
  attendance: Array<{
    user: string;        // userId
    status: 'present' | 'absent';
  }>;
};

type MarkAttendance = {
  userId: string;
  status: 'present' | 'absent';
};

export default function ClassesPage() {
  // Lista de clases
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showClassDialog, setShowClassDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);

  // Formulario para crear/editar
  const [classForm, setClassForm] = useState({
    day: '',
    month: '',
    year: '',
    startTime: '',
    endTime: '',
  });

  // Modal de asistencia
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  // Array temporal para "attendances" => { userId, status }
  const [attendanceData, setAttendanceData] = useState<MarkAttendance[]>([]);

  // (Opcional) filtros por query: ?month=1&year=2025
  const searchParams = useSearchParams();
  const filterMonth = searchParams.get('month') || '';
  const filterYear = searchParams.get('year') || '';

  // Cargar las clases
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const query: any = {};
      if (filterMonth) query.month = filterMonth;
      if (filterYear) query.year = filterYear;
      // GET /class-sessions?month=...&year=...
      const res = await api.get('/class-sessions', { params: query });
      setClasses(res.data);
    } catch (error) {
      console.error('Error al obtener clases:', error);
      alert('Error al cargar clases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterYear]);

  // ------------------------
  // CREAR O EDITAR CLASE
  // ------------------------

  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassForm({
      day: '',
      month: '',
      year: '',
      startTime: '',
      endTime: '',
    });
    setShowClassDialog(true);
  };

  const handleOpenEditClass = (cls: ClassSession) => {
    setEditingClass(cls);
    setClassForm({
      day: cls.day.toString(),
      month: cls.month.toString(),
      year: cls.year.toString(),
      startTime: cls.startTime || '',
      endTime: cls.endTime || '',
    });
    setShowClassDialog(true);
  };

  const handleSaveClass = async () => {
    try {
      const payload = {
        day: parseInt(classForm.day, 10),
        month: parseInt(classForm.month, 10),
        year: parseInt(classForm.year, 10),
        startTime: classForm.startTime || '',
        endTime: classForm.endTime || '',
      };

      if (editingClass) {
        // EDITAR
        await api.put(`/class-sessions/${editingClass._id}`, payload);
        alert('Clase actualizada correctamente.');
      } else {
        // CREAR
        await api.post('/class-sessions', payload);
        alert('Clase creada correctamente.');
      }
      setShowClassDialog(false);
      fetchClasses();
    } catch (error) {
      console.error('Error al guardar clase:', error);
      alert('Error al guardar la clase.');
    }
  };

  // ------------------------
  // ELIMINAR CLASE
  // ------------------------
  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm('¿Seguro de eliminar esta clase?')) return;
    try {
      await api.delete(`/class-sessions/${classId}`);
      alert('Clase eliminada correctamente.');
      fetchClasses();
    } catch (error) {
      console.error('Error al eliminar clase:', error);
      alert('Error al eliminar la clase.');
    }
  };

  // ------------------------
  // MARCAR ASISTENCIA
  // ------------------------
  const handleOpenAttendance = (cls: ClassSession) => {
    setSelectedClassId(cls._id);
    // Convertimos attendance en un array editable => { userId, status }
    const data = cls.attendance.map((a) => ({
      userId: a.user.toString(),
      status: a.status,
    }));
    setAttendanceData(data);
    setShowAttendanceDialog(true);
  };

  const handleAddAttendanceRow = () => {
    // Agregar fila en blanco
    setAttendanceData((prev) => [...prev, { userId: '', status: 'present' }]);
  };

  const handleChangeAttendanceRow = (
    index: number,
    field: keyof MarkAttendance,
    value: string
  ) => {
    setAttendanceData((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveAttendanceRow = (index: number) => {
    setAttendanceData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    try {
      // PUT /class-sessions/:classId/attendance
      await api.put(`/class-sessions/${selectedClassId}/attendance`, {
        attendances: attendanceData,
      });
      alert('Asistencia registrada/actualizada.');
      setShowAttendanceDialog(false);
      fetchClasses();
    } catch (error) {
      console.error('Error al marcar asistencia:', error);
      alert('Error al marcar asistencia.');
    }
  };

  // ------------------------
  // RENDER
  // ------------------------
  return (
    <div className='py-8'>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gestión de Clases</h1>
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

      {/* Modal CREAR/EDITAR CLASE */}
      {showClassDialog && (
        <Dialog open onOpenChange={() => setShowClassDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClass ? 'Editar Clase' : 'Crear Clase'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Input
                placeholder="Día (1..31)"
                value={classForm.day}
                onChange={(e) =>
                  setClassForm((prev) => ({ ...prev, day: e.target.value }))
                }
              />
              <Input
                placeholder="Mes (1..12)"
                value={classForm.month}
                onChange={(e) =>
                  setClassForm((prev) => ({ ...prev, month: e.target.value }))
                }
              />
              <Input
                placeholder="Año (por ej: 2025)"
                value={classForm.year}
                onChange={(e) =>
                  setClassForm((prev) => ({ ...prev, year: e.target.value }))
                }
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Hora inicio (hh:mm)"
                  value={classForm.startTime}
                  onChange={(e) =>
                    setClassForm((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="Hora fin (hh:mm)"
                  value={classForm.endTime}
                  onChange={(e) =>
                    setClassForm((prev) => ({
                      ...prev,
                      endTime: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClassDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveClass}>
                {editingClass ? 'Guardar Cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal ASISTENCIA */}
      {showAttendanceDialog && (
        <Dialog open onOpenChange={() => setShowAttendanceDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar Asistencia</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <p className="text-sm text-gray-500">
                Ajusta la asistencia de cada usuario. Ingresa el ID del usuario y el
                estado (<em>present</em> o <em>absent</em>).
              </p>
              {attendanceData.map((item, index) => (
                <div key={index} className="flex gap-2 items-center mb-1">
                  <Input
                    placeholder="User ID"
                    value={item.userId}
                    onChange={(e) =>
                      handleChangeAttendanceRow(index, 'userId', e.target.value)
                    }
                  />
                  <select
                    className="border border-gray-300 rounded px-2 py-1"
                    value={item.status}
                    onChange={(e) =>
                      handleChangeAttendanceRow(index, 'status', e.target.value)
                    }
                  >
                    <option value="present">Presente</option>
                    <option value="absent">Ausente</option>
                  </select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveAttendanceRow(index)}
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddAttendanceRow}>
                Agregar fila
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAttendance}>Guardar Asistencia</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
