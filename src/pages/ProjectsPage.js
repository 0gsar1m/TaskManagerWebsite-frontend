// src/pages/ProjectsPage.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    fetchProjects,
    createProject,
    deleteProject,
    updateProject,
    fetchMotivation // Motivasyon servisi
} from "../api";
import { useAuth } from "../App";

export default function ProjectsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

    // Motivasyon State'leri
    const [motivation, setMotivation] = useState(null);
    const [motivationLoading, setMotivationLoading] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                // Paralel istek: Projeler ve Motivasyon aynı anda çekilir
                const [projectsData, motivationData] = await Promise.all([
                    fetchProjects(),
                    fetchMotivation().catch(() => null), // Hata olursa null döner, sayfa patlamaz
                ]);

                setProjects(projectsData);
                setMotivation(motivationData);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ... (Create, Delete, Update, Edit fonksiyonları AYNEN KORUNDU) ...
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            const project = await createProject({ name: name.trim(), description: description.trim() || null });
            setProjects((prev) => [...prev, project]);
            setName(""); setDescription("");
        } catch (e) { console.error(e); alert("Proje oluşturulamadı"); }
    };

    async function handleDelete(id) {
        if (!window.confirm("Silmek istiyor musun?")) return;
        try { await deleteProject(id); setProjects((prev) => prev.filter((p) => p.id !== id)); } catch (err) { console.error(err); }
    }

    const startEdit = (p) => { setEditingId(p.id); setEditName(p.name); setEditDescription(p.description || ""); };
    const cancelEdit = () => { setEditingId(null); setEditName(""); setEditDescription(""); };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            await updateProject(editingId, { name: editName.trim(), description: editDescription.trim() || null });
            setProjects((prev) => prev.map((p) => p.id === editingId ? { ...p, name: editName.trim(), description: editDescription.trim() || null } : p));
            cancelEdit();
        } catch (err) { console.error(err); alert("Güncelleme hatası"); }
    };

    const handleLogout = () => { logout(); navigate("/login"); };

    // --- Yeni: Motivasyonu Manuel Yenileme Fonksiyonu ---
    const handleRefreshMotivation = async () => {
        try {
            setMotivationLoading(true);
            const data = await fetchMotivation();
            setMotivation(data);
        } catch (e) {
            console.error(e);
        } finally {
            setMotivationLoading(false);
        }
    };

    if (!user) { navigate("/login"); return null; }

    return (
        <div className="app-shell">
            <div className="projects-container">

                {/* --- GÜNCELLENEN HEADER --- */}
                <header className="projects-header-wrapper">

                    {/* Sol Taraf: Başlık ve Alt Başlık */}
                    <div className="header-left">
                        <h1 className="projects-title">Projelerim</h1>
                        <p className="projects-subtitle">Tüm projelerini buradan yönetebilirsin.</p>

                        {/* Kullanıcı Bilgisi (Sol Alta alındı) */}
                        <div className="user-info-row">
                            <span className="projects-user-chip">👤 {user.username}</span>
                            <button className="btn-ghost-sm" onClick={handleLogout}>Çıkış</button>
                        </div>
                    </div>

                    {/* Sağ Taraf: Motivasyon Kartı (Yeni) */}
                    <div className="motivation-card">
                        <div className="motivation-content">
                            {motivation ? (
                                <>
                                    <p className="quote-text">“{motivation.text}”</p>
                                    <span className="quote-author">— {motivation.author}</span>
                                </>
                            ) : (
                                <p className="quote-text">İlham yükleniyor...</p>
                            )}
                        </div>
                        <button
                            className="btn-icon-refresh"
                            onClick={handleRefreshMotivation}
                            disabled={motivationLoading}
                            title="Yeni Söz Getir"
                        >
                            {motivationLoading ? "..." : "↻"}
                        </button>
                    </div>

                </header>

                <div className="projects-layout">
                    {/* SOL KOLON: Yeni Proje Ekleme (Mevcut kod) */}
                    <aside className="projects-sidebar">
                        <div className="sidebar-card">
                            <h2 className="sidebar-title">✨ Yeni Proje</h2>
                            <form className="sidebar-form" onSubmit={handleCreate}>
                                <div className="form-group">
                                    <label className="form-label">Proje Adı</label>
                                    <input className="form-input" placeholder="Örn. Mobil App" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Açıklama</label>
                                    <textarea className="form-input form-textarea" placeholder="Proje hakkında..." value={description} onChange={(e) => setDescription(e.target.value)} />
                                </div>
                                <button type="submit" className="btn-primary full-width mt-2">Oluştur</button>
                            </form>
                        </div>
                    </aside>

                    {/* SAĞ KOLON: Proje Listesi (Mevcut kod) */}
                    <main className="projects-main-content">
                        <h2 className="section-title">Mevcut Projeler ({projects.length})</h2>
                        {loading ? (
                            <p className="loading-text">Yükleniyor...</p>
                        ) : projects.length === 0 ? (
                            <div className="empty-state">
                                <p>Henüz hiç projen yok.</p>
                                <small>Soldaki panelden ilk projeni oluşturabilirsin.</small>
                            </div>
                        ) : (
                            <div className="grid-list">
                                {projects && Array.isArray(projects) && projects.map((project) => (
                                    <div key={project.id} className="item-card">
                                        {editingId === project.id ? (
                                            <form className="edit-form" onSubmit={handleUpdateProject}>
                                                <input className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} required autoFocus />
                                                <textarea className="form-input form-textarea-sm" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                                                <div className="edit-actions">
                                                    <button type="submit" className="btn-primary-sm">Kaydet</button>
                                                    <button type="button" className="btn-ghost-sm" onClick={cancelEdit}>İptal</button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <div className="card-header">
                                                    <Link to={`/projects/${project.id}/tasks`} className="card-link">{project.name}</Link>
                                                    <div className="card-actions">
                                                        <button className="btn-icon" onClick={() => startEdit(project)} title="Düzenle">✏️</button>
                                                        <button className="btn-icon delete" onClick={() => handleDelete(project.id)} title="Sil">🗑️</button>
                                                    </div>
                                                </div>
                                                {project.description && <p className="card-description">{project.description}</p>}
                                                <div className="card-footer">
                                                    <Link to={`/projects/${project.id}/tasks`} className="btn-ghost-sm">Görevleri Gör →</Link>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}