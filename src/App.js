// src/App.js
import React, { createContext, useContext, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function PrivateRoute({ children }) {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    const [user, setUser] = useState(null);

    const logout = () => {
        setUser(null);        // context’ten kullanıcıyı düşürür
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/projects"
                        element={
                            <PrivateRoute>
                                <ProjectsPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/projects/:projectId/tasks"
                        element={
                            <PrivateRoute>
                                <TasksPage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
