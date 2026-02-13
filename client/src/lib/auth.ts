const API_URL = "http://localhost:5000/api/auth";

export interface User {
  id: string;
  name: string;
  email: string;
}

/* ---------------- SIGNUP ---------------- */

export async function signup(name: string, email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    // ✅ Store token & user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return { success: true, user: data.user };

  } catch (err) {
    return { success: false, error: "Network error" };
  }
}

/* ---------------- LOGIN ---------------- */

export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error };
    }

    // ✅ Store token & user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return { success: true, user: data.user };

  } catch (err) {
    return { success: false, error: "Network error" };
  }
}

/* ---------------- LOGOUT ---------------- */

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/* ---------------- TOKEN ---------------- */

export function getToken(): string | null {
  return localStorage.getItem("token");
}

/* ---------------- CURRENT USER ---------------- */

export function getCurrentUser(): User | null {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null; // ✅ Prevent crash if JSON corrupted
  }
}

/* ---------------- AUTH CHECK ---------------- */

export function isAuthenticated(): boolean {
  return !!getToken();
}
