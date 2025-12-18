// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api";
import { useAuth } from "../App";

function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const data = await loginRequest(username, password);
            setUser({ username: data.username, role: data.role });
            navigate("/projects");
        } catch (err) {
            console.error(err);
            setError("Kullanıcı adı veya şifre hatalı");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="login-layout">
            <div className="login-panel">
                <div className="login-header">
                    <h1 className="login-title">MyTasks - Giriş</h1>
                    <p className="login-subtitle">
                        Web dersi projesi için sade ama iş gören bir görev yöneticisi.
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label className="login-label">Kullanıcı adı</label>
                        <input
                            className="login-input"
                            type="text"
                            placeholder="örn. emir2"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label className="login-label">Şifre</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="Şifren"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <p className="login-error">{error}</p>}

                    {/* --- BUTON GRUBU --- */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                        <button
                            type="submit"
                            className="login-submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? "Giriş yapılıyor..." : "Giriş yap"}
                        </button>

                        <button
                            type="button" /* Formu submit etmemesi için type button önemli */
                            className="login-register-btn"
                            onClick={() => navigate("/register")}
                        >
                            Hesap Oluştur
                        </button>
                    </div>

                </form>

                <div className="login-footer">
                    <span>© 2025 MyTasks</span>
                    <span className="login-footer-sep">·</span>
                    <span>
                        Test kullanıcısı: <code>emir2 / secret123</code>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;