'use client';

import React from 'react';

type Attendance = {
  classId: string;
  title: string;
  date: string;
  status: 'present' | 'absent';
};

interface AttendanceSectionProps {
  attendances: Attendance[];
}

export function AttendanceSection({ attendances }: AttendanceSectionProps) {
  return (
    <section className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold">Asistencias</h2>
      <div className="mt-2">
        {attendances.length === 0 ? (
          <p className="text-sm text-gray-500">No hay asistencias registradas</p>
        ) : (
          <table className="w-full text-sm mt-2 border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Clase</th>
                <th className="px-3 py-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((a) => (
                <tr key={a.classId} className="border-b">
                  <td className="px-3 py-2">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-3 py-2">{a.title}</td>
                  <td className="px-3 py-2">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}