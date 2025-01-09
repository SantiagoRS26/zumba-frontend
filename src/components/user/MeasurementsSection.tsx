'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type Measurement = {
  _id: string;
  date: string;
  weight?: number;
  height?: number;
  chest?: number;
  waist?: number;
  hips?: number;
};

interface MeasurementsSectionProps {
  userId: string;
  measurements: Measurement[];
  // Para refrescar el listado tras crear/editar/eliminar
  onRefresh: () => void;
}

export function MeasurementsSection({
  userId,
  measurements,
  onRefresh,
}: MeasurementsSectionProps) {
  // Para mostrar/ocultar modales
  const [showDialog, setShowDialog] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);

  // Campos del formulario
  const [formValues, setFormValues] = useState({
    weight: '',
    height: '',
    chest: '',
    waist: '',
    hips: '',
  });

  // Abrir modal de Crear
  const handleOpenCreate = () => {
    setEditingMeasurement(null); // No estamos editando
    setFormValues({
      weight: '',
      height: '',
      chest: '',
      waist: '',
      hips: '',
    });
    setShowDialog(true);
  };

  // Abrir modal de Editar
  const handleOpenEdit = (m: Measurement) => {
    setEditingMeasurement(m);
    setFormValues({
      weight: m.weight?.toString() || '',
      height: m.height?.toString() || '',
      chest: m.chest?.toString() || '',
      waist: m.waist?.toString() || '',
      hips: m.hips?.toString() || '',
    });
    setShowDialog(true);
  };

  // Guardar (crear o editar)
  const handleSave = async () => {
    try {
      if (editingMeasurement) {
        // Editar medición
        const measId = editingMeasurement._id;
        await api.put(`/measurements/${measId}`, {
          weight: parseFloat(formValues.weight),
          height: parseFloat(formValues.height),
          chest: parseFloat(formValues.chest),
          waist: parseFloat(formValues.waist),
          hips: parseFloat(formValues.hips),
        });
        alert('Medición actualizada correctamente.');
      } else {
        // Crear nueva medición
        await api.post('/measurements', {
          userId,
          weight: parseFloat(formValues.weight),
          height: parseFloat(formValues.height),
          chest: parseFloat(formValues.chest),
          waist: parseFloat(formValues.waist),
          hips: parseFloat(formValues.hips),
        });
        alert('Medición registrada correctamente.');
      }
      setShowDialog(false);
      onRefresh();
    } catch (error) {
      console.error('Error al guardar medición:', error);
      alert('Ocurrió un error al guardar la medición.');
    }
  };

  // Eliminar
  const handleDelete = async (measId: string) => {
    if (!window.confirm('¿Seguro de eliminar esta medición?')) return;
    try {
      await api.delete(`/measurements/${measId}`);
      alert('Medición eliminada correctamente.');
      onRefresh();
    } catch (error) {
      console.error('Error al eliminar medición:', error);
      alert('Ocurrió un error al eliminar la medición.');
    }
  };

  return (
    <section className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Medidas</h2>
        <Button onClick={handleOpenCreate}>Agregar Medición</Button>
      </div>
      <div className="mt-2">
        {measurements.length === 0 ? (
          <p className="text-sm text-gray-500">No hay mediciones registradas</p>
        ) : (
          <table className="w-full text-sm mt-2 border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Peso</th>
                <th className="px-3 py-2 text-left">Estatura</th>
                <th className="px-3 py-2 text-left">Pecho</th>
                <th className="px-3 py-2 text-left">Cintura</th>
                <th className="px-3 py-2 text-left">Cadera</th>
                <th className="px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m) => (
                <tr key={m._id} className="border-b">
                  <td className="px-3 py-2">{new Date(m.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{m.weight ?? '-'}</td>
                  <td className="px-3 py-2">{m.height ?? '-'}</td>
                  <td className="px-3 py-2">{m.chest ?? '-'}</td>
                  <td className="px-3 py-2">{m.waist ?? '-'}</td>
                  <td className="px-3 py-2">{m.hips ?? '-'}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(m)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(m._id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para crear/editar */}
      {showDialog && (
        <Dialog open onOpenChange={() => setShowDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMeasurement ? 'Editar Medición' : 'Nueva Medición'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Input
                placeholder="Peso (kg)"
                value={formValues.weight}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, weight: e.target.value }))
                }
              />
              <Input
                placeholder="Altura (cm)"
                value={formValues.height}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, height: e.target.value }))
                }
              />
              <Input
                placeholder="Pecho (cm)"
                value={formValues.chest}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, chest: e.target.value }))
                }
              />
              <Input
                placeholder="Cintura (cm)"
                value={formValues.waist}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, waist: e.target.value }))
                }
              />
              <Input
                placeholder="Cadera (cm)"
                value={formValues.hips}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, hips: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingMeasurement ? 'Guardar Cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
