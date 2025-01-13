// services/classService.ts
import api from "@/lib/axios";
import { ClassSession, MarkAttendance } from "@/types"; // <-- Ajusta la ruta si necesitas

/**
 * Obtiene las clases, aceptando filtros opcionales de mes y año
 */
export async function getClasses(params: { month?: string; year?: string }) {
	return await api.get<ClassSession[]>("/class-sessions", { params });
}

/**
 * Crea una nueva clase
 */
export async function createClass(payload: Partial<ClassSession>) {
	return await api.post("/class-sessions", payload);
}

/**
 * Actualiza una clase existente
 */
export async function updateClass(id: string, payload: Partial<ClassSession>) {
	return await api.put(`/class-sessions/${id}`, payload);
}

/**
 * Elimina una clase
 */
export async function deleteClass(id: string) {
	return await api.delete(`/class-sessions/${id}`);
}

/**
 * Actualiza la asistencia de una clase
 */
export async function updateAttendance(
	classId: string,
	attendances: MarkAttendance[]
) {
	console.log("attendances: ", attendances);
	return await api.put(`/class-sessions/${classId}/attendance`, {
		attendances,
	});
}

export async function assignTeacherToClass(classId: string, teacherId: string) {
	return api.put(`/class-sessions/${classId}/assign-teacher`, { teacherId });
  }
