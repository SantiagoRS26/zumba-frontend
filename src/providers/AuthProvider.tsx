"use client";

import { createContext, useState, useEffect } from "react";

type AuthContextType = {
	token: string | null;
	role: string | null;
	// ...
};

export const AuthContext = createContext<AuthContextType>({
	token: null,
	role: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [role, setRole] = useState<string | null>(null);

	useEffect(() => {
		const t = localStorage.getItem("token");
		const r = localStorage.getItem("role");
		setToken(t);
		setRole(r);
	}, []);

	return (
		<AuthContext.Provider value={{ token, role }}>
			{children}
		</AuthContext.Provider>
	);
}
