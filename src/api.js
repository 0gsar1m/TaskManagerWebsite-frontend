// src/api.js
import axios from "axios";

const API_BASE_URL = "https://taskmanagerwebsite-backend.onrender.com";
// Eski hali şuydu: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
    // 2. ADIM: Buraya yukarıdaki değişkeni veriyoruz
    baseURL: API_BASE_URL,
    withCredentials: true,//JSESION cookie'lerini almak için
});

export default api;

// -------- AUTH --------
export async function loginRequest(username, password) {
    const res = await api.post("/api/auth/login", { username, password });
    return res.data;
}
export async function registerRequest(username, email, password) {
    // Backend DTO: { username, email, password } bekliyor
    const res = await api.post("/api/auth/register", { username, email, password });
    return res.data;
}

// -------- PROJECTS --------
export async function fetchProjects() {
    const res = await api.get("/api/projects");
    return res.data;
}

export async function createProject(payload) {
    const res = await api.post("/api/projects", payload);
    return res.data;
}

export async function deleteProject(projectId) {
    await api.delete(`/api/projects/${projectId}`);
}
export const updateProject = (projectId, data) =>
    api.put(`/api/projects/${projectId}`, data);

// -------- TASKS --------
export async function fetchTasks(projectId) {
    const res = await api.get(`/api/projects/${projectId}/tasks`);
    return res.data;
}

export async function createTask(projectId, payload) {
    const res = await api.post(`/api/projects/${projectId}/tasks`, payload);
    return res.data;
}

export async function deleteTask(taskId) {
    await api.delete(`/api/tasks/${taskId}`);
}

export async function updateTask(taskId, payload) {
    const res = await api.put(`/api/tasks/${taskId}`, payload);
    return res.data;
}
// -------- LABELS --------
export async function fetchLabels() {
    const resp = await api.get("/api/labels");
    return resp.data;
}

export async function createLabel(body) {
    const resp = await api.post("/api/labels", body);
    return resp.data;
}

export async function updateLabel(id, body) {
    const resp = await api.put(`/api/labels/${id}`, body);
    return resp.data;
}

export async function deleteLabel(id) {
    await api.delete(`/api/labels/${id}`);
}
// -------- MOTIVATION --------
export async function fetchMotivation() {
    const res = await api.get("/api/motivation");
    return res.data; // { text, author }
}
