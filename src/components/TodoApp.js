import React, { useState, useEffect } from 'react';
import axios from "axios";
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';
import TodoStats from './TodoStats';
import '../styles/TodoApp.css';
const API_URL = "https://task-manager-onhy.onrender.com/api/tasks"; 
const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed

  // Load todos from localStorage on component mount
// ✅ صحيح: useEffect واحد فقط
useEffect(() => {
  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data); // جاب المهام من الـ API
    } catch (error) {
      console.error("❌ Error fetching todos:", error);
    }
  };
  fetchTodos();
}, []);


 const addTodo = async (title, description) => {
  try {
    const res = await axios.post(API_URL, {
      title,
      description,
      priority: "medium"
    });
    setTodos([res.data, ...todos]); 
  } catch (error) {
    console.error("❌ Error adding todo:", error);
  }
};

const deleteTodo = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    setTodos(todos.filter(t => t._id !== id));
  } catch (error) {
    console.error("❌ Error deleting todo:", error);
  }
};


const toggleComplete = async (id) => {
  try {
    const todo = todos.find(t => t._id === id);
    const res = await axios.put(`${API_URL}/${id}`, {
      ...todo,
      completed: !todo.completed
    });
    setTodos(todos.map(t => t._id === id ? res.data : t));
  } catch (error) {
    console.error("❌ Error updating todo:", error);
  }
};


const clearCompleted = async () => {
  if (window.confirm("هل تريد حذف جميع المهام المنجزة؟")) {
    try {
      const res = await axios.delete(`${API_URL}/clear/completed`);
      setTodos(res.data.data); // استعمل البيانات القادمة من السيرفر
    } catch (error) {
      console.error("❌ Error clearing completed todos:", error);
    }
  }
};

const clearAll = async () => {
  if (window.confirm("هل أنت متأكد من حذف جميع المهام؟")) {
    try {
      const res = await axios.delete(`${API_URL}/clear/all`);
      setTodos(res.data.data); // رح تكون []
    } catch (error) {
      console.error("❌ Error clearing all todos:", error);
    }
  }
};


const editTodo = async (id, newTitle, newDescription) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, {
      title: newTitle,
      description: newDescription
    });
    setTodos(todos.map(t => t._id === id ? res.data : t));
  } catch (error) {
    console.error("❌ Error editing todo:", error);
  }
};
const setPriority = async (id, priority) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, { priority });
    setTodos(todos.map(todo =>
      todo._id === id ? res.data : todo
    ));
  } catch (error) {
    console.error("❌ Error setting priority:", error);
  }
};


  // Filter todos based on current filter
  const getFilteredTodos = () => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  };

  const filteredTodos = getFilteredTodos();

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8 col-xl-6">
          {/* Header Card */}
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-header bg-primary text-white py-4">
              <div className="d-flex align-items-center justify-content-center">
                <i className="bi bi-check2-square fs-2 me-3"></i>
                <h1 className="mb-0 fw-bold">قائمة المهام الذكية</h1>
              </div>
              <p className="text-center mb-0 mt-2 opacity-75">نظم مهامك بكفاءة وإنتاجية</p>
            </div>
          </div>

          {/* Add Todo Form */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <TodoForm onAddTodo={addTodo} />
            </div>
          </div>

          {/* Statistics */}
          <TodoStats todos={todos || []} />


          {/* Filter Tabs */}
          {todos.length > 0 && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body py-3">
                <div className="btn-group w-100" role="group">
                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="filter" 
                    id="all" 
                    checked={filter === 'all'}
                    onChange={() => setFilter('all')}
                  />
                  <label className="btn btn-outline-primary" htmlFor="all">
                    <i className="bi bi-list-ul me-2"></i>
                    الكل ({todos.length})
                  </label>

                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="filter" 
                    id="active" 
                    checked={filter === 'active'}
                    onChange={() => setFilter('active')}
                  />
                  <label className="btn btn-outline-warning" htmlFor="active">
                    <i className="bi bi-clock me-2"></i>
                    النشطة ({todos.filter(t => !t.completed).length})
                  </label>

                  <input 
                    type="radio" 
                    className="btn-check" 
                    name="filter" 
                    id="completed" 
                    checked={filter === 'completed'}
                    onChange={() => setFilter('completed')}
                  />
                  <label className="btn btn-outline-success" htmlFor="completed">
                    <i className="bi bi-check-circle me-2"></i>
                    المكتملة ({todos.filter(t => t.completed).length})
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Todo List */}
          <div className="card shadow-sm border-0">
            <div className="card-body">
              {filteredTodos.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted opacity-50"></i>
                  <h4 className="text-muted mt-3">
                    {todos.length === 0 
                      ? 'لا توجد مهام حتى الآن' 
                      : filter === 'active' 
                        ? 'لا توجد مهام نشطة' 
                        : 'لا توجد مهام مكتملة'
                    }
                  </h4>
                  <p className="text-muted">
                    {todos.length === 0 && 'أضف مهمة جديدة لتبدأ في التنظيم!'}
                  </p>
                </div>
              ) : (
                <div className="row g-3">
                  {filteredTodos.map((todo) => (
                    <div key={todo._id} className="col-12">
                      <TodoItem
                        todo={todo}
                        onToggle={toggleComplete}
                        onDelete={deleteTodo}
                        onEdit={editTodo}
                        onSetPriority={setPriority}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {todos.length > 0 && (
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-md-6">
                    <button
                      className="btn btn-outline-warning w-100"
                      onClick={clearCompleted}
                      
                    >
                      <i className="bi bi-trash3 me-2"></i>
                      حذف المكتملة ({todos.filter(todo => todo.completed).length})
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn btn-outline-danger w-100"
                      onClick={clearAll}
                    >
                      <i className="bi bi-trash me-2"></i>
                      حذف جميع المهام
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;