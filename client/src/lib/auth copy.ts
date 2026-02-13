// Simple localStorage-based auth system

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const USERS_KEY = "food_tracker_users";
const SESSION_KEY = "food_tracker_session";

function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Simple hash for demo purposes (not cryptographically secure)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function signup(name: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: Omit<User, "passwordHash"> }> {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "Email already registered" };
  }
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const user: User = { id, name, email: email.toLowerCase(), passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(SESSION_KEY, id);
  const { passwordHash: _, ...safeUser } = user;
  return { success: true, user: safeUser };
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: Omit<User, "passwordHash"> }> {
  const users = getUsers();
  const user = users.find(u => u.email === email.toLowerCase());
  if (!user) return { success: false, error: "Invalid email or password" };
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) return { success: false, error: "Invalid email or password" };
  localStorage.setItem(SESSION_KEY, user.id);
  const { passwordHash: _, ...safeUser } = user;
  return { success: true, user: safeUser };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): Omit<User, "passwordHash"> | null {
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) return null;
  const users = getUsers();
  const user = users.find(u => u.id === sessionId);
  if (!user) return null;
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}
