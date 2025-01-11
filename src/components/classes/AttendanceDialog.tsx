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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClassSession, MarkAttendance } from "@/types";

type Props = {
	open: boolean;
	onClose: () => void;
	classData?: ClassSession | null;
	onSave: (attendanceData: MarkAttendance[]) => Promise<void>;
};

export function AttendanceDialog({ open, onClose, classData, onSave }: Props) {
	const [attendanceData, setAttendanceData] = useState<MarkAttendance[]>([]);

	useEffect(() => {
		if (classData) {
			const mapped = classData.attendance.map((a) => ({
				userId: a.user.toString(),
				status: a.status,
			}));
			setAttendanceData(mapped);
		} else {
			setAttendanceData([]);
		}
	}, [classData]);

	const handleAddRow = () => {
		setAttendanceData((prev) => [...prev, { userId: "", status: "present" }]);
	};

	const handleChangeRow = (
		index: number,
		field: keyof MarkAttendance,
		value: string
	) => {
		setAttendanceData((prev) =>
			prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		);
	};

	const handleRemoveRow = (index: number) => {
		setAttendanceData((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = async () => {
		try {
			await onSave(attendanceData);
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
				<div className="space-y-2 py-2">
					<p className="text-sm text-gray-500">
						Ajusta la asistencia de cada usuario. Ingresa el ID del usuario y el
						estado (<em>present</em> o <em>absent</em>).
					</p>
					{attendanceData.map((item, index) => (
						<div
							key={index}
							className="flex gap-2 items-center mb-1">
							<Input
								placeholder="User ID"
								value={item.userId}
								onChange={(e) =>
									handleChangeRow(index, "userId", e.target.value)
								}
							/>
							<select
								className="border border-gray-300 rounded px-2 py-1"
								value={item.status}
								onChange={(e) =>
									handleChangeRow(index, "status", e.target.value)
								}>
								<option value="present">Presente</option>
								<option value="absent">Ausente</option>
							</select>
							<Button
								variant="destructive"
								size="sm"
								onClick={() => handleRemoveRow(index)}>
								Quitar
							</Button>
						</div>
					))}
					<Button
						variant="outline"
						onClick={handleAddRow}>
						Agregar fila
					</Button>
				</div>
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
