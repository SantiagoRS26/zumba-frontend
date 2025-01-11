// hooks/useFetchClasses.ts
"use client"; // si necesitas usar este hook en un entorno de cliente

import { useState, useEffect } from "react";
import { getClasses } from "@/services/classService";
import { ClassSession } from "@/types"; // Ajusta según tu proyecto

/**
 * Hook que se encarga de obtener la lista de clases,
 * con la posibilidad de filtrar por mes y año.
 */
export function useFetchClasses(month?: string, year?: string) {
	const [classes, setClasses] = useState<ClassSession[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		setLoading(true);
		try {
			const params: any = {};
			if (month) params.month = month;
			if (year) params.year = year;

			const res = await getClasses(params);
			setClasses(res.data);
		} catch (error) {
			console.error("Error al obtener clases:", error);
			// Aquí podrías manejar errores con toasts, logs, etc.
			alert("Error al cargar clases.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [month, year]);

	return { classes, loading, refetch: fetchData };
}
