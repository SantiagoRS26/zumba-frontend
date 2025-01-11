// components/ClassFormDialog.tsx
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
import { ClassSession } from "@/types"; // Ajusta según tu proyecto

type Props = {
	open: boolean;
	onClose: () => void;
	initialData?: ClassSession | null; // si es para editar, vendrá con datos
	onSubmit: (payload: Partial<ClassSession>) => Promise<void>;
};

export function ClassFormDialog({
	open,
	onClose,
	initialData,
	onSubmit,
}: Props) {
	const [form, setForm] = useState({
		day: "",
		month: "",
		year: "",
		startTime: "",
		endTime: "",
	});

	// Al abrir el diálogo, inicializar el formulario
	useEffect(() => {
		if (initialData) {
			setForm({
				day: initialData.day.toString(),
				month: initialData.month.toString(),
				year: initialData.year.toString(),
				startTime: initialData.startTime || "",
				endTime: initialData.endTime || "",
			});
		} else {
			setForm({
				day: "",
				month: "",
				year: "",
				startTime: "",
				endTime: "",
			});
		}
	}, [initialData]);

	const handleChange = (field: string, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			const payload = {
				day: parseInt(form.day, 10),
				month: parseInt(form.month, 10),
				year: parseInt(form.year, 10),
				startTime: form.startTime || "",
				endTime: form.endTime || "",
			};
			await onSubmit(payload);
			onClose();
		} catch (error) {
			// Manejo de error
			console.error("Error al guardar la clase:", error);
			alert("Error al guardar la clase.");
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{initialData ? "Editar Clase" : "Crear Clase"}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-2 py-2">
					<Input
						placeholder="Día (1..31)"
						value={form.day}
						onChange={(e) => handleChange("day", e.target.value)}
					/>
					<Input
						placeholder="Mes (1..12)"
						value={form.month}
						onChange={(e) => handleChange("month", e.target.value)}
					/>
					<Input
						placeholder="Año (ej: 2025)"
						value={form.year}
						onChange={(e) => handleChange("year", e.target.value)}
					/>
					<div className="flex gap-2">
						<Input
							placeholder="Hora inicio (hh:mm)"
							value={form.startTime}
							onChange={(e) => handleChange("startTime", e.target.value)}
						/>
						<Input
							placeholder="Hora fin (hh:mm)"
							value={form.endTime}
							onChange={(e) => handleChange("endTime", e.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={onClose}>
						Cancelar
					</Button>
					<Button onClick={handleSave}>
						{initialData ? "Guardar Cambios" : "Crear"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
