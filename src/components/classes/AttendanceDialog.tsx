// components/AttendanceDialog.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClassSession, MarkAttendance, User, UserAttendance } from "@/types";
import { getAllUsers } from "@/services/userService";

type Props = {
	open: boolean;
	onClose: () => void;
	classData?: ClassSession | null;
	onSave: (attendanceData: MarkAttendance[]) => Promise<void>;
};

export function AttendanceDialog({ open, onClose, classData, onSave }: Props) {
	const [allUsers, setAllUsers] = useState<User[]>([]);
	const [userAttendanceList, setUserAttendanceList] = useState<
		UserAttendance[]
	>([]);

	/**
	 * 1) Cargar todos los usuarios cuando se abre el diálogo
	 *    (o podrías cargarlos en un contexto global, etc.)
	 */
	useEffect(() => {
		if (open) {
			fetchUsers();
		}
	}, [open]);

	const fetchUsers = async () => {
		try {
			const res = await getAllUsers();
			setAllUsers(res.data);
			console.log("Usuarios cargados:", res.data);
		} catch (error) {
			console.error("Error al obtener usuarios:", error);
			alert("No se pudo cargar la lista de usuarios.");
		}
	};

	/**
	 * 2) Cada vez que classData o allUsers cambien,
	 *    sincronizamos userAttendanceList.
	 */
	useEffect(() => {
		if (!classData || !allUsers.length) {
			// Si no tenemos la clase o no hay usuarios, limpiamos
			setUserAttendanceList([]);
			return;
		}
		// classData.attendance = [{ user: userId, status: 'present' }, ...]

		// a) Crear un map con la asistencia
		const attendanceMap = new Map<string, "present" | "absent">();
		classData.attendances.forEach((a) => {
			attendanceMap.set(a.user.toString(), a.status);
		});

		// b) Combinar con la lista de usuarios
		const combined: UserAttendance[] = allUsers.map((u) => {
			// si existe la key en attendanceMap => se usa
			const status = attendanceMap.get(u.id) || "absent";
			return {
				userId: u.id,
				username: u.username,
				status,
			};
		});

		setUserAttendanceList(combined);
	}, [classData, allUsers]);

	/**
	 * 3) Handler para cambiar la asistencia de un usuario en particular
	 */
	const handleChangeUserStatus = (
		index: number,
		newStatus: "present" | "absent"
	) => {
		setUserAttendanceList((prev) =>
			prev.map((item, i) =>
				i === index ? { ...item, status: newStatus } : item
			)
		);
	};

	/**
	 * 4) Al guardar, construimos el array con { userId, status }
	 *    y lo enviamos a onSave
	 */
	const handleSave = async () => {
		try {
			// Convertimos userAttendanceList a array MarkAttendance = { userId, status }
			const finalAttendance: MarkAttendance[] = userAttendanceList.map(
				(ua) => ({
					userId: ua.userId,
					status: ua.status,
				})
			);
			await onSave(finalAttendance);
			onClose();
		} catch (error) {
			console.error("Error al marcar asistencia:", error);
			alert("Error al marcar asistencia.");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Marcar Asistencia</DialogTitle>
				</DialogHeader>
				{/**
				 * Si no hay usuarios, mostramos un mensaje
				 * (o un spinner si gustas)
				 */}
				{!allUsers.length ? (
					<div className="py-4">
						<p>Cargando usuarios o no hay usuarios registrados...</p>
					</div>
				) : (
					<div className="space-y-2 py-2">
						<p className="text-sm text-gray-500">
							Selecciona “Presente” o “Ausente” para cada usuario.
						</p>

						{/* Renderizamos la lista de usuarios */}
						<table className="w-full text-sm border">
							<thead className="bg-gray-100">
								<tr>
									<th className="px-2 py-1 text-left">Usuario</th>
									<th className="px-2 py-1 text-left">Asistencia</th>
								</tr>
							</thead>
							<tbody>
								{userAttendanceList.map((ua, index) => (
									<tr
										key={index}
										className="border-b last:border-b-0">
										<td className="px-2 py-1">
											{/* Mostramos el nombre del usuario */}
											{ua.username}
											{/* si quieres mostrar su _id: (#{ua.userId}) */}
										</td>
										<td className="px-2 py-1">
											<select
												className="border rounded px-2 py-1"
												value={ua.status}
												onChange={(e) =>
													handleChangeUserStatus(
														index,
														e.target.value as "present" | "absent"
													)
												}>
												<option value="present">Presente</option>
												<option value="absent">Ausente</option>
											</select>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={handleSave}>Guardar Asistencia</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
