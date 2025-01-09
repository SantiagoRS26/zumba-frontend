"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { UserInfoSection } from "@/components/user/UserInfoSection";
import { MeasurementsSection } from "@/components/user/MeasurementsSection";
import { PaymentsSection } from "@/components/user/PaymentsSection";
import { AttendanceSection } from "@/components/user/AttendanceSection";

type UserData = {
	_id: string;
	username: string;
	email?: string;
	role?: string;
	profilePhoto?: string;
};

type Measurement = {
	_id: string;
	date: string;
	weight?: number;
	height?: number;
	chest?: number;
	waist?: number;
	hips?: number;
};

type Payment = {
	_id: string;
	totalAmount: number;
	status: "pending" | "partial" | "completed";
};

type Attendance = {
	classId: string;
	title: string;
	date: string;
	status: "present" | "absent";
};

export default function UserDetailPage() {
	const params = useParams();
	const userId = Array.isArray(params.userId)
		? params.userId[0]
		: params.userId;

	const [user, setUser] = useState<UserData | null>(null);
	const [measurements, setMeasurements] = useState<Measurement[]>([]);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [attendances, setAttendances] = useState<Attendance[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchAllData = async () => {
		if (!userId) return;
		setLoading(true);
		try {
			// 1) Datos del usuario
			const userRes = await api.get(`/users/${userId}`);
			setUser(userRes.data);

			// 2) Medidas
			const measRes = await api.get(`/measurements/user/${userId}`);
			setMeasurements(measRes.data);

			// 3) Pagos
			const payRes = await api.get(`/payments/user/${userId}`);
			setPayments(payRes.data);

			// 4) Asistencias
			const attRes = await api.get(`/class-sessions/user/${userId}`);
			setAttendances(attRes.data);
		} catch (error) {
			console.error(error);
			alert("Error al cargar información del usuario.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAllData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	if (!userId) {
		return <p>No se especificó un usuario.</p>;
	}
	if (loading) {
		return <p>Cargando...</p>;
	}
	if (!user) {
		return <p>No se encontró el usuario.</p>;
	}

	return (
		<div className="space-y-6">
			{/* Datos del usuario */}
			<UserInfoSection user={user} />

			{/* Medidas (crear/editar/eliminar) */}
			<MeasurementsSection
				userId={userId}
				measurements={measurements}
				onRefresh={fetchAllData}
			/>

			{/* Pagos */}
			<PaymentsSection payments={payments} />

			{/* Asistencias */}
			<AttendanceSection attendances={attendances} />
		</div>
	);
}
