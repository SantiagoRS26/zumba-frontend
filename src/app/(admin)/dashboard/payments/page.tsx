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
import { useRouter } from 'next/navigation';

// Tipos de datos (adaptados al nuevo modelo)
type User = {
  _id: string;
  username: string;
  email?: string;
};

type MonthsPaid = {
  month: number;
  year: number;
};

type Payment = {
  _id: string;
  paymentType: 'monthly' | 'single' | 'teacher' | 'sponsor';
  user: User | null;
  monthsPaid: MonthsPaid[]; // Ej: [{month:1, year:2025},{month:2,year:2025}]
  classSession?: string;    // ID o un objeto expandido
  amount: number;
  method: 'cash' | 'transfer' | 'card' | 'other';
  status: 'pending' | 'completed';
  notes?: string;
  createdAt: string;
};

export default function PaymentsPage() {
  const router = useRouter();

  // Lista de pagos
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para crear o editar un pago
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Formulario para crear/editar un Payment
  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'monthly',
    userId: '',
    monthsPaid: '',       // Podrías manejar un solo campo de texto y luego parsear 
    classSessionId: '',   // si es "single" o "teacher"
    amount: '',
    method: 'cash',
    status: 'pending',
    notes: '',
  });

  // Cargar todos los pagos
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments');
      setPayments(res.data);
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      alert('Error al cargar pagos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ------------------------
  // CREAR O EDITAR PAGO
  // ------------------------

  const handleOpenCreatePayment = () => {
    setEditingPayment(null);
    setPaymentForm({
      paymentType: 'monthly',
      userId: '',
      monthsPaid: '',
      classSessionId: '',
      amount: '',
      method: 'cash',
      status: 'pending',
      notes: '',
    });
    setShowPaymentDialog(true);
  };

  const handleOpenEditPayment = (payment: Payment) => {
    setEditingPayment(payment);

    // Convertir monthsPaid a un string (si está en un array)
    let monthsPaidString = '';
    if (payment.monthsPaid && payment.monthsPaid.length > 0) {
      // Ej: "1-2025,2-2025"
      monthsPaidString = payment.monthsPaid
        .map((m) => `${m.month}-${m.year}`)
        .join(',');
    }

    setPaymentForm({
      paymentType: payment.paymentType,
      userId: payment.user?._id || '',
      monthsPaid: monthsPaidString,
      classSessionId: payment.classSession || '',
      amount: payment.amount.toString(),
      method: payment.method,
      status: payment.status,
      notes: payment.notes || '',
    });
    setShowPaymentDialog(true);
  };

  const handleSavePayment = async () => {
    try {
      // Parsear monthsPaid si es "monthly" o "sponsor"
      let parsedMonths: MonthsPaid[] = [];
      if (
        (paymentForm.paymentType === 'monthly' ||
          paymentForm.paymentType === 'sponsor') &&
        paymentForm.monthsPaid.trim() !== ''
      ) {
        // Suponiendo que el input es algo como: "1-2025,2-2025"
        parsedMonths = paymentForm.monthsPaid.split(',').map((item) => {
          const [m, y] = item.split('-');
          return { month: parseInt(m, 10), year: parseInt(y, 10) };
        });
      }

      // Construir payload final
      const payload = {
        paymentType: paymentForm.paymentType,
        userId: paymentForm.userId || null,
        monthsPaid: parsedMonths,           // si es monthly / sponsor
        classSessionId: paymentForm.classSessionId || null,
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        status: paymentForm.status,
        notes: paymentForm.notes,
      };

      if (editingPayment) {
        // Actualizar
        await api.put(`/payments/${editingPayment._id}`, payload);
        alert('Pago actualizado correctamente.');
      } else {
        // Crear
        await api.post('/payments', payload);
        alert('Pago creado correctamente.');
      }

      setShowPaymentDialog(false);
      fetchPayments();
    } catch (error) {
      console.error('Error al guardar pago:', error);
      alert('Error al guardar pago.');
    }
  };

  // ------------------------
  // ELIMINAR PAGO
  // ------------------------
  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('¿Seguro de eliminar este pago?')) return;
    try {
      await api.delete(`/payments/${paymentId}`);
      alert('Pago eliminado correctamente.');
      fetchPayments();
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      alert('Error al eliminar pago.');
    }
  };

  // ------------------------
  // RENDER
  // ------------------------

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gestión de Pagos</h1>
        <Button onClick={handleOpenCreatePayment}>Crear Pago</Button>
      </div>

      {loading ? (
        <p>Cargando pagos...</p>
      ) : payments.length === 0 ? (
        <p>No hay pagos registrados.</p>
      ) : (
        <table className="w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Usuario</th>
              <th className="px-4 py-2 text-left">Meses</th>
              <th className="px-4 py-2 text-left">Clase (ID)</th>
              <th className="px-4 py-2 text-left">Monto</th>
              <th className="px-4 py-2 text-left">Método</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              // Mostrar monthsPaid como string
              const monthsString = p.monthsPaid
                ?.map((m) => `${m.month}/${m.year}`)
                .join(', ');

              return (
                <tr key={p._id} className="border-b border-gray-200">
                  <td className="px-4 py-2">{p.paymentType}</td>
                  <td className="px-4 py-2">
                    {p.user ? p.user.username : 'N/A'}
                  </td>
                  <td className="px-4 py-2">{monthsString || '---'}</td>
                  <td className="px-4 py-2">
                    {p.classSession ? p.classSession : '---'}
                  </td>
                  <td className="px-4 py-2 font-semibold">{p.amount}</td>
                  <td className="px-4 py-2">{p.method}</td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {/* Botón para editar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditPayment(p)}
                    >
                      Editar
                    </Button>
                    {/* Botón para eliminar */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePayment(p._id)}
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

      {/* Modal CREAR/EDITAR PAGO */}
      {showPaymentDialog && (
        <Dialog open onOpenChange={() => setShowPaymentDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPayment ? 'Editar Pago' : 'Crear Pago'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              {/* Tipo de pago */}
              <label className="block text-sm font-medium text-gray-700">
                Tipo de pago:
              </label>
              <select
                className="border border-gray-300 rounded px-2 py-1 w-full"
                value={paymentForm.paymentType}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    paymentType: e.target.value,
                  }))
                }
              >
                <option value="monthly">Mensualidad</option>
                <option value="single">Clase suelta</option>
                <option value="teacher">Pago a Profesor</option>
                <option value="sponsor">Patrocinio/Empresa</option>
              </select>

              {/* ID de Usuario (si aplica) */}
              <Input
                placeholder="ID del Usuario"
                value={paymentForm.userId}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    userId: e.target.value,
                  }))
                }
              />

              {/* Si es monthly o sponsor, permitimos introducir varios meses. 
                  Ejemplo: "1-2025,2-2025" */}
              {(paymentForm.paymentType === 'monthly' ||
                paymentForm.paymentType === 'sponsor') && (
                <>
                  <label className="block text-sm font-medium text-gray-700">
                    Meses (Ej: 1-2025,2-2025)
                  </label>
                  <Input
                    placeholder="1-2025,2-2025"
                    value={paymentForm.monthsPaid}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        monthsPaid: e.target.value,
                      }))
                    }
                  />
                </>
              )}

              {/* Si es single o teacher, especificar classSession */}
              {(paymentForm.paymentType === 'single' ||
                paymentForm.paymentType === 'teacher') && (
                <Input
                  placeholder="ID de la ClassSession"
                  value={paymentForm.classSessionId}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      classSessionId: e.target.value,
                    }))
                  }
                />
              )}

              {/* Monto total a pagar */}
              <Input
                placeholder="Monto (ej: 20000)"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />

              {/* Método de pago */}
              <label className="block text-sm font-medium text-gray-700">
                Método de pago:
              </label>
              <select
                className="border border-gray-300 rounded px-2 py-1 w-full"
                value={paymentForm.method}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    method: e.target.value,
                  }))
                }
              >
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="card">Tarjeta</option>
                <option value="other">Otro</option>
              </select>

              {/* Estado */}
              <label className="block text-sm font-medium text-gray-700">
                Estado:
              </label>
              <select
                className="border border-gray-300 rounded px-2 py-1 w-full"
                value={paymentForm.status}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
              </select>

              {/* Notas (opcional) */}
              <Input
                placeholder="Notas"
                value={paymentForm.notes}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePayment}>
                {editingPayment ? 'Guardar Cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
