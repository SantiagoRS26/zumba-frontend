'use client';

import React from 'react';

type Payment = {
  _id: string;
  totalAmount: number;
  status: 'pending' | 'partial' | 'completed';
};

interface PaymentsSectionProps {
  payments: Payment[];
}

export function PaymentsSection({ payments }: PaymentsSectionProps) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold">Pagos</h2>
      <div className="mt-2">
        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">No hay pagos registrados</p>
        ) : (
          <table className="w-full text-sm mt-2 border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="px-3 py-2">{p.status}</td>
                  <td className="px-3 py-2">{p.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
