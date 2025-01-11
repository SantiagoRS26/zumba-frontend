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

type Props = {
	open: boolean;
	onClose: () => void;
	onCreated?: (newSchedule: any) => void; // callback para cuando se crea
};

const DAYS = [
	{ label: "Domingo", value: 0 },
	{ label: "Lunes", value: 1 },
	{ label: "Martes", value: 2 },
	{ label: "Miércoles", value: 3 },
	{ label: "Jueves", value: 4 },
	{ label: "Viernes", value: 5 },
	{ label: "Sábado", value: 6 },
];

export function ScheduleFormDialog({ open, onClose, onCreated }: Props) {
	const [name, setName] = useState("");
	const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");

	const handleCheckboxChange = (dayValue: number) => {
		setDaysOfWeek((prev) => {
			// si ya está seleccionado, lo sacamos, si no, lo agregamos
			if (prev.includes(dayValue)) {
				return prev.filter((d) => d !== dayValue);
			} else {
				return [...prev, dayValue];
			}
		});
	};

	const handleCreate = async () => {
		try {
			if (daysOfWeek.length === 0) {
				alert("Debes seleccionar al menos un día de la semana");
				return;
			}

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
					<DialogTitle>Crear Horario (Schedule)</DialogTitle>
				</DialogHeader>
				<div className="space-y-2 py-2">
					<Input
						placeholder="Nombre del Horario"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					{/* Checkboxes para los días de la semana */}
					<div className="text-sm">
						<p className="font-semibold mb-1">Días de la semana:</p>
						<div className="flex flex-col gap-1">
							{DAYS.map((day) => (
								<label
									key={day.value}
									className="flex items-center gap-2">
									<input
										type="checkbox"
										checked={daysOfWeek.includes(day.value)}
										onChange={() => handleCheckboxChange(day.value)}
									/>
									{day.label}
								</label>
							))}
						</div>
					</div>

					{/* Horas */}
					<div className="flex gap-2">
						<Input
							placeholder="Hora inicio (hh:mm)"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
						/>
						<Input
							placeholder="Hora fin (hh:mm)"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
						/>
					</div>
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
