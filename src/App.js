import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TodoApp from "./components/TodoApp";
import Login from "./components/Login";
import Register from "./components/Register";
import TodoAppWithSidebar from "./components/TodoAppWithSidebar";

import "./App.css";

function App() {
  const isAuthenticated = !!localStorage.getItem("token"); // تحقق من تسجيل الدخول

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* صفحة تسجيل الدخول */}
          <Route path="/login" element={<Login />} />

          {/* صفحة التسجيل */}
          <Route path="/register" element={<Register />} />

          {/* صفحة المهام - متاحة فقط للمستخدم المسجّل */}
          <Route
  path="/todos"
  element={isAuthenticated ? <TodoAppWithSidebar /> : <Navigate to="/login" />}
/>

          {/* أي رابط غير معروف → تحويل لصفحة تسجيل الدخول */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


