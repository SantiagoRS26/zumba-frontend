// components/ScheduleFormDialog.tsx
"use client";

import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSchedule } from "@/services/scheduleService";

// Para opciones de día de la semana
const DAYS = [
	{ label: "Domingo", value: 0 },
	{ label: "Lunes", value: 1 },
	{ label: "Martes", value: 2 },
	{ label: "Miércoles", value: 3 },
	{ label: "Jueves", value: 4 },
	{ label: "Viernes", value: 5 },
	{ label: "Sábado", value: 6 },
];

type TimeSlot = {
	dayOfWeek: number;
	startTime: string;
	endTime: string;
};

type Props = {
	open: boolean;
	onClose: () => void;
	onCreated?: (newSchedule: any) => void;
};

export function ScheduleFormDialog({ open, onClose, onCreated }: Props) {
	const [name, setName] = useState("");
	// Este array va a contener varios "timeSlots"
	const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
		{ dayOfWeek: 1, startTime: "", endTime: "" }, // un row por defecto: Lunes
	]);

	const handleAddRow = () => {
		setTimeSlots((prev) => [
			...prev,
			{ dayOfWeek: 1, startTime: "", endTime: "" },
		]);
	};

	const handleRemoveRow = (index: number) => {
		setTimeSlots((prev) => prev.filter((_, i) => i !== index));
	};

	const handleChangeSlot = (
		index: number,
		field: keyof TimeSlot,
		value: string
	) => {
		setTimeSlots((prev) =>
			prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
		);
	};

	const handleCreate = async () => {
		try {
			if (timeSlots.length === 0) {
				alert("Debes ingresar al menos un dayOfWeek con horario");
				return;
			}

			// Transformar los timeSlots en el formato esperado
			const daysOfWeek = timeSlots.map((slot) => slot.dayOfWeek);
			const startTime = timeSlots[0].startTime; // Asegúrate de manejar múltiples horarios si es necesario
			const endTime = timeSlots[0].endTime; // Igual que para startTime

			if (!startTime || !endTime) {
				alert("Asegúrate de ingresar una hora de inicio y fin válida");
				return;
			}

			// Llamar a createSchedule enviando el formato correcto
			const res = await createSchedule({
				name,
				daysOfWeek,
				startTime,
				endTime,
			});

			alert("¡Horario creado correctamente!");
			if (onCreated) {
				onCreated(res.data.schedule);
			}
			onClose();
			// Reset
			setName("");
			setTimeSlots([{ dayOfWeek: 1, startTime: "", endTime: "" }]);
		} catch (error) {
			console.error("Error al crear schedule:", error);
			alert("No se pudo crear el horario. Revisa la consola.");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Crear Horario (Schedule) con múltiples días/horas
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-3 py-2">
					<Input
						placeholder="Nombre del Horario"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					<p className="text-sm text-gray-600">
						Agrega uno o varios "timeSlots" (día de la semana + hora inicio y
						fin).
					</p>
					<div className="space-y-2">
						{timeSlots.map((slot, index) => (
							<div
								key={index}
								className="flex items-center gap-2">
								{/* dayOfWeek */}
								<select
									className="border border-gray-300 rounded px-2 py-1"
									value={slot.dayOfWeek}
									onChange={(e) =>
										handleChangeSlot(index, "dayOfWeek", e.target.value)
									}>
									{DAYS.map((day) => (
										<option
											key={day.value}
											value={day.value}>
											{day.label}
										</option>
									))}
								</select>

								{/* startTime */}
								<Input
									placeholder="Hora inicio (hh:mm)"
									value={slot.startTime}
									onChange={(e) =>
										handleChangeSlot(index, "startTime", e.target.value)
									}
								/>

								{/* endTime */}
								<Input
									placeholder="Hora fin (hh:mm)"
									value={slot.endTime}
									onChange={(e) =>
										handleChangeSlot(index, "endTime", e.target.value)
									}
								/>

								{/* botón para eliminar este row */}
								<Button
									variant="destructive"
									size="sm"
									onClick={() => handleRemoveRow(index)}>
									X
								</Button>
							</div>
						))}
					</div>

					<Button
						variant="outline"
						onClick={handleAddRow}>
						Agregar otro día/horario
					</Button>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={handleCreate}>Crear</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
