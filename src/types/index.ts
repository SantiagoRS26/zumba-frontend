// types/index.ts

export type ClassSession = {
	_id: string;
	day: number;
	month: number;
	year: number;
	startTime?: string;
	endTime?: string;
	attendance: Array<{
		user: string;
		status: "present" | "absent";
	}>;
};

export type MarkAttendance = {
	userId: string;
	status: "present" | "absent";
};
