// components/GenerateClassesDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  getAllSchedules,
  generateClassesFromSchedule,
  deleteSchedule,
} from '@/services/scheduleService';
import { ScheduleFormDialog } from '@/components/classes/ScheduleFormDialog';

type GenerateClassesDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // callback para cuando se generen exitosamente
};

export function GenerateClassesDialog({ open, onClose, onSuccess }: GenerateClassesDialogProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');

  const [fromMonth, setFromMonth] = useState(1);
  const [fromYear, setFromYear] = useState(2025);
  const [toMonth, setToMonth] = useState(1);
  const [toYear, setToYear] = useState(2025);

  const [useSameScheduleForNextMonths, setUseSameScheduleForNextMonths] = useState(true);

  // Diálogo para crear un schedule nuevo
  const [createScheduleDialogOpen, setCreateScheduleDialogOpen] = useState(false);

  // Cargar los schedules al abrir
  useEffect(() => {
    if (open) {
      fetchSchedules();
    }
  }, [open]);

  const fetchSchedules = async () => {
    try {
      const res = await getAllSchedules();
      setSchedules(res.data);
      if (res.data.length > 0) {
        setSelectedScheduleId(res.data[0]._id);
      } else {
        setSelectedScheduleId('');
      }
    } catch (error) {
      console.error('Error al obtener schedules:', error);
      alert('No se pudieron cargar los schedules.');
    }
  };

  const handleGenerate = async () => {
    if (!selectedScheduleId) {
      alert('Selecciona un schedule o crea uno primero.');
      return;
    }
    try {
      const start = fromMonth;
      const end = toMonth;
      for (let m = start; m <= end; m++) {
        await generateClassesFromSchedule(selectedScheduleId, m, fromYear);
      }
      alert(`Clases generadas de ${fromMonth}/${fromYear} a ${toMonth}/${toYear}`);
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al generar clases:', error);
      alert('Error al generar clases. Revisa la consola.');
    }
  };

  const handleCreateScheduleSuccess = (newSchedule: any) => {
    setSchedules((prev) => [...prev, newSchedule]);
    setSelectedScheduleId(newSchedule._id);
  };

  /** Eliminar schedule */
  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('¿Seguro de eliminar este schedule?')) return;
    try {
      await deleteSchedule(id);
      alert('Schedule eliminado correctamente.');
      // Quitar de la lista local
      setSchedules((prev) => prev.filter((sch) => sch._id !== id));
      // Si estaba seleccionado, limpiar la selección
      if (selectedScheduleId === id) {
        setSelectedScheduleId('');
      }
    } catch (error) {
      console.error('Error al eliminar schedule:', error);
      alert('No se pudo eliminar. Revisa la consola.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar Clases desde un Schedule</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          {/* SELECTOR DE SCHEDULE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Seleccionar Schedule:
            </label>
            {schedules.length === 0 ? (
              <p className="text-sm text-gray-500">
                No hay schedules disponibles. Crea uno.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <select
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  value={selectedScheduleId}
                  onChange={(e) => setSelectedScheduleId(e.target.value)}
                >
                  {schedules.map((sch) => (
                    <option key={sch._id} value={sch._id}>
                      {sch.name || `Schedule (${sch._id})`}
                    </option>
                  ))}
                </select>
                {/* Botón Eliminar para el schedule seleccionado (opcional) */}
                {selectedScheduleId && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteSchedule(selectedScheduleId)}
                  >
                    Eliminar Schedule Seleccionado
                  </Button>
                )}
              </div>
            )}

            {/* Botón crear schedule */}
            <Button
              variant="outline"
              onClick={() => setCreateScheduleDialogOpen(true)}
              className="mt-2"
            >
              Crear Nuevo Schedule
            </Button>
          </div>

          {/* Mes/Año de inicio */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mes inicio (1..12)"
              value={fromMonth}
              onChange={(e) => setFromMonth(Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Año inicio"
              value={fromYear}
              onChange={(e) => setFromYear(Number(e.target.value))}
            />
          </div>

          {/* Mes/Año de fin */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Mes fin (1..12)"
              value={toMonth}
              onChange={(e) => setToMonth(Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="Año fin"
              value={toYear}
              onChange={(e) => setToYear(Number(e.target.value))}
            />
          </div>

          {/* Checkbox para reutilizar el mismo schedule en meses posteriores */}
          <div className="flex items-center mt-2">
            <input
              id="useSameSchedule"
              type="checkbox"
              checked={useSameScheduleForNextMonths}
              onChange={() => setUseSameScheduleForNextMonths((prev) => !prev)}
            />
            <label htmlFor="useSameSchedule" className="ml-2 text-sm">
              Usar el mismo horario para los siguientes meses
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleGenerate}>Generar</Button>
        </DialogFooter>
      </DialogContent>

      {/* Diálogo CREAR SCHEDULE */}
      <ScheduleFormDialog
        open={createScheduleDialogOpen}
        onClose={() => setCreateScheduleDialogOpen(false)}
        onCreated={handleCreateScheduleSuccess}
      />
    </Dialog>
  );
}
