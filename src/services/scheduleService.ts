// services/scheduleService.ts
import api from '@/lib/axios';

/** Listar todos los schedules */
export async function getAllSchedules() {
  return api.get('/schedules');
}

/** Generar clases en un mes/año a partir de un schedule */
export async function generateClassesFromSchedule(scheduleId: string, month: number, year: number) {
  return api.post('/schedules/generate', {
    scheduleId,
    month,
    year,
  });
}

/** Crear un nuevo schedule */
export async function createSchedule(payload: {
  name: string;
  daysOfWeek: number[];
  startTime?: string;
  endTime?: string;
}) {
  return api.post('/schedules', payload);
}

/** Eliminar un schedule */
export async function deleteSchedule(scheduleId: string) {
  return api.delete(`/schedules/${scheduleId}`);
}