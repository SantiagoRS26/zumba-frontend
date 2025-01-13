// types/index.ts

export type ClassSession = {
	_id: string;
	day: number;
	month: number;
	year: number;
	startTime?: string;
	endTime?: string;
	teachers: Array<{
	  id: string;
	  username: string;
	  email: string;
	}>;
	attendances: Array<{
	  user: string;
	  status: "present" | "absent";
	}>;
	createdAt: string;
	updatedAt: string;
  };
  

export type MarkAttendance = {
	userId: string;
	status: "present" | "absent";
};

export type UserAttendance = {
	userId: string;
	username: string;
	status: "present" | "absent";
};

export type User = {
	id: string;
	username: string;
	email: string;
	role: string;
	userType: string;
	profilePhoto: string;
	measurements: Record<string, any>;
	createdAt: string;
	updatedAt: string;
};
