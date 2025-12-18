// src/pages/TasksPage.js - GÜNCELLENMİŞ VERSİYON
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    fetchTasks, createTask, updateTask, deleteTask, fetchLabels, createLabel, fetchProjects,
} from "../api";
import { useAuth } from "../App";

// --- SVG İKONLAR ---
const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

function buildTaskRequestFromTask(task) {
    return {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || null,
        labelIds: (task.labels || []).map((l) => l.id),
    };
}

export default function TasksPage() {
    const { projectId } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [labels, setLabels] = useState([]);
    const [selectedLabelIds, setSelectedLabelIds] = useState([]);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#ff7a18");

    // Edit states
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTaskTitle, setEditTaskTitle] = useState("");
    const [editTaskDate, setEditTaskDate] = useState("");
    const [openLabelEditorTaskId, setOpenLabelEditorTaskId] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const [tasksData, labelsData] = await Promise.all([fetchTasks(projectId), fetchLabels()]);
                setTasks(tasksData);
                setLabels(labelsData);
            } catch (err) { console.error(err); alert("Hata oluştu"); } finally { setLoading(false); }
            try {
                const allProjects = await fetchProjects();
                const current = allProjects.find((p) => String(p.id) === String(projectId));
                setProject(current || null);
            } catch (err) { console.warn(err); }
        }
        load();
    }, [projectId]);

    if (!user) { navigate("/login"); return null; }
    const handleLogout = () => { logout(); navigate("/login"); };

    // --- Helper for Date Picker Click ---
    // Bu fonksiyon inputun herhangi bir yerine tıklanınca takvimi açar
    const handleDateClick = (e) => {
        try {
            if (e.target && e.target.showPicker) {
                e.target.showPicker();
            }
        } catch (error) {
            // Tarayıcı desteklemiyorsa (eski safari vb.) normal davranış devam eder
        }
    };

    // Logic Functions (Aynen Korundu)
    const toggleSelectedLabelForNewTask = (id) => setSelectedLabelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTask(projectId, { title, description, dueDate: dueDate || null, status: "TODO", priority: "MEDIUM", labelIds: selectedLabelIds });
        } catch (err) { console.error(err); }
    };
    const handleDeleteTask = async (id) => { if(window.confirm("Silinsin mi?")) { try { await deleteTask(id); setTasks(prev => prev.filter(t => t.id !== id)); } catch(e) {} } };

    const startTaskEdit = (task) => { setEditingTaskId(task.id); setEditTaskTitle(task.title); setEditTaskDate(task.dueDate || ""); setOpenLabelEditorTaskId(null); };
    const cancelTaskEdit = () => { setEditingTaskId(null); setEditTaskTitle(""); setEditTaskDate(""); };

    const handleSaveTaskEdit = async (taskId) => {
        const existing = tasks.find((t) => t.id === taskId);
        if (!existing) return;
        const updatedTask = { ...existing, title: editTaskTitle, dueDate: editTaskDate || null };
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
        setEditingTaskId(null);
        try { await updateTask(taskId, buildTaskRequestFromTask(updatedTask)); } catch (err) { console.error(err); }
    };

    const handleUpdateTaskField = async (taskId, field, value) => {
        const existing = tasks.find(t => t.id === taskId);
        if (!existing) return;
        const updated = { ...existing, [field]: value };
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        try { await updateTask(taskId, buildTaskRequestFromTask(updated)); } catch(e) {}
    };

    const isLabelChecked = (task, labelId) => (task.labels || []).some(l => l.id === labelId);
    const handleToggleLabel = async (taskId, labelId) => {
        const task = tasks.find(t => t.id === taskId);
        if(!task) return;
        const has = isLabelChecked(task, labelId);
        const newLabels = has ? task.labels.filter(l => l.id !== labelId) : [...(task.labels||[]), labels.find(l=>l.id===labelId)];
        const updated = { ...task, labels: newLabels };
        setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
        try { await updateTask(taskId, buildTaskRequestFromTask(updated)); } catch(e){}
    };

    const handleCreateLabel = async (e) => { e.preventDefault(); try { const l = await createLabel({ name: newLabelName, color: newLabelColor }); setLabels(prev=>[...prev, l]); setNewLabelName(""); } catch(e){} };

    const renderLabelChip = (l, s="md") => <span key={l.id} className={`label-chip ${s==="sm"?"label-chip-sm":""}`} style={{backgroundColor:l.color||"#555"}}>{l.name}</span>;

    return (
        <div className="page-wrapper">
            {/* FULL WIDTH HEADER */}
            <header className="full-sticky-header">
                <div className="header-content-centered">
                    <div>
                        <Link to="/projects" className="back-link">← Projelere dön</Link>
                        <div className="title-row">
                            <h1 className="page-title">Görevler</h1>
                            {project && <span className="project-pill">{project.name}</span>}
                        </div>
                        <p className="page-subtitle">{project?.description || `Proje #${projectId}`}</p>
                    </div>
                    <div className="projects-user">
                        <span className="projects-user-chip">👤 {user.username}</span>
                        <button className="btn-ghost" onClick={handleLogout}>Çıkış</button>
                    </div>
                </div>
            </header>

            <div className="app-shell">
                <div className="tasks-card">
                    <div className="projects-layout">
                        {/* SIDEBAR */}
                        <aside className="projects-sidebar sticky-sidebar">
                            <div className="sidebar-card">
                                <h2 className="sidebar-title">⚡ Hızlı Görev</h2>
                                <form className="sidebar-form" onSubmit={handleCreate}>
                                    <div className="form-group">
                                        <label className="form-label">Başlık</label>
                                        <input className="form-input" value={title} onChange={e=>setTitle(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Açıklama</label>
                                        <textarea className="form-input form-textarea" value={description} onChange={e=>setDescription(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Son Tarih</label>
                                        {/* YENİ GÖREV TARİH SEÇİCİSİ - İKON BEYAZ OLUCAK */}
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={dueDate}
                                            onChange={e=>setDueDate(e.target.value)}
                                            onClick={handleDateClick} /* Heryere tıklayınca açılır */
                                        />
                                    </div>
                                    {labels.length>0 && (
                                        <div className="form-group">
                                            <div className="label-selector-container">
                                                {labels.map(l => (
                                                    <div key={l.id} className={`label-pill-option ${selectedLabelIds.includes(l.id)?"selected":""}`} onClick={()=>toggleSelectedLabelForNewTask(l.id)} style={{borderColor:selectedLabelIds.includes(l.id)?l.color:"transparent", backgroundColor:selectedLabelIds.includes(l.id)?`${l.color}33`:"rgba(255,255,255,0.05)"}}>
                                                        <span className="label-dot" style={{backgroundColor:l.color}}></span>{l.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <button className="btn-primary full-width mt-2">+ Ekle</button>
                                </form>
                            </div>
                            <div className="sidebar-card">
                                <h2 className="sidebar-title">🏷️ Etiketler</h2>
                                <form className="label-management-form" onSubmit={handleCreateLabel}>
                                    <input className="form-input label-name-input" placeholder="Yeni etiket..." value={newLabelName} onChange={e=>setNewLabelName(e.target.value)} />
                                    <input type="color" className="color-picker-input" value={newLabelColor} onChange={e=>setNewLabelColor(e.target.value)} />
                                    <button className="btn-icon-add">+</button>
                                </form>
                                <div className="existing-labels-row">
                                    {labels.map(l => renderLabelChip(l, "sm"))}
                                </div>
                            </div>
                        </aside>

                        {/* MAIN LIST */}
                        <main className="projects-main-content">
                            <h2 className="section-title">Yapılacaklar ({tasks.length})</h2>
                            {loading ? (
                                // 3 tane sahte yükleme çubuğu gösterir
                                <>
                                    <div className="skeleton"></div>
                                    <div className="skeleton"></div>
                                    <div className="skeleton"></div>
                                </>
                            ) : (
                                <ul className="task-list-container">
                                    {tasks.map(task => (
                                        <li key={task.id} className="task-card-item">
                                            <div className="task-header-row">
                                                {editingTaskId === task.id ? (
                                                    // --- EDIT MODE ---
                                                    <div className="task-edit-row">
                                                        <input className="form-input edit-title-input" value={editTaskTitle} onChange={e=>setEditTaskTitle(e.target.value)} autoFocus />

                                                        {/* MODERNLEŞTİRİLMİŞ EDİT TARİH GİRİŞİ */}
                                                        <input
                                                            type="date"
                                                            className="date-edit-input"
                                                            value={editTaskDate}
                                                            onChange={e=>setEditTaskDate(e.target.value)}
                                                            onClick={handleDateClick} /* Heryere tıklayınca açılır */
                                                        />

                                                        <div className="edit-actions-row">
                                                            <button className="btn-icon-action save" onClick={()=>handleSaveTaskEdit(task.id)} title="Kaydet"><CheckIcon /></button>
                                                            <button className="btn-icon-action cancel" onClick={cancelTaskEdit} title="İptal"><XIcon /></button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // --- VIEW MODE ---
                                                    <>
                                                        <span className="task-item-title">{task.title}</span>
                                                        <div className="task-header-actions">
                                                            {task.dueDate && <span className="task-item-date">📅 {task.dueDate}</span>}
                                                            <button className="btn-icon-edit" onClick={()=>startTaskEdit(task)}>✎</button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {task.description && <p className="task-item-desc">{task.description}</p>}

                                            <div className="task-controls-row">
                                                <div className="control-group">
                                                    <span className="control-label">Durum</span>
                                                    <select className="mini-select" value={task.status} onChange={e=>handleUpdateTaskField(task.id,"status",e.target.value)}>
                                                        <option value="TODO">Yapılacak</option>
                                                        <option value="IN_PROGRESS">Sürüyor</option>
                                                        <option value="DONE">Bitti</option>
                                                    </select>
                                                </div>
                                                <div className="control-group">
                                                    <span className="control-label">Öncelik</span>
                                                    <select className="mini-select" value={task.priority} onChange={e=>handleUpdateTaskField(task.id,"priority",e.target.value)}>
                                                        <option value="LOW">Düşük</option>
                                                        <option value="MEDIUM">Orta</option>
                                                        <option value="HIGH">Yüksek</option>
                                                    </select>
                                                </div>
                                                <button className="btn-delete-action" onClick={()=>handleDeleteTask(task.id)}>Sil</button>
                                            </div>

                                            <div className="task-footer-row">
                                                <div className="chips-wrapper">
                                                    {task.labels?.map(l=>renderLabelChip(l,"sm"))}
                                                    {task.labels?.length===0 && <span className="no-label-text">Etiketsiz</span>}
                                                </div>
                                                {labels.length > 0 && editingTaskId !== task.id && (
                                                    <button className="btn-link-action" onClick={()=>setOpenLabelEditorTaskId(prev=>prev===task.id?null:task.id)}>
                                                        {openLabelEditorTaskId===task.id?"Kapat":"Etiketle"}
                                                    </button>
                                                )}
                                            </div>

                                            {openLabelEditorTaskId===task.id && (
                                                <div className="inline-label-editor">
                                                    {labels.map(l => (
                                                        <div key={l.id} className={`editor-pill ${isLabelChecked(task,l.id)?"active":""}`} onClick={()=>handleToggleLabel(task.id,l.id)} style={{borderColor:isLabelChecked(task,l.id)?l.color:"rgba(255,255,255,0.1)"}}>
                                                            <span className="dot" style={{backgroundColor:l.color}}></span>{l.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}