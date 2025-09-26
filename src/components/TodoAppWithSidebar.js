import React, { useState, useEffect } from 'react';
import axios from "axios";

const API_URL = "https://task-manager-onhy.onrender.com/api/tasks";

const TodoAppWithSidebar = () => {
  const [todos, setTodos] = useState([]);
  const [currentView, setCurrentView] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);


  const [editingTodo, setEditingTodo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditSubTaskModal, setShowEditSubTaskModal] = useState(false);
  const [subTaskToEdit, setSubTaskToEdit] = useState(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [currentTodoId, setCurrentTodoId] = useState(null);
  const [subTaskTitle, setSubTaskTitle] = useState("");
  const [subTaskDescription, setSubTaskDescription] = useState("");
  const [newSubTaskDescription, setNewSubTaskDescription] = useState("");
  const storedProfile = localStorage.getItem("userProfile");
  const [userProfile, setUserProfile] = useState(
    storedProfile ? JSON.parse(storedProfile) : null
  );
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    dueDate: '',
    subTasks: [] // ✅
  });


  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const categories = [
    { id: 'work', name: 'Work', icon: 'bi-briefcase', color: '#3b82f6' },
    { id: 'personal', name: 'Personal', icon: 'bi-person', color: '#10b981' },
    { id: 'health', name: 'Health', icon: 'bi-heart-pulse', color: '#ef4444' },
    { id: 'shopping', name: 'Shopping', icon: 'bi-cart3', color: '#f59e0b' },
    { id: 'finance', name: 'Finance', icon: 'bi-currency-dollar', color: '#8b5cf6' }
  ];

  const views = [
    { id: 'all', name: 'All Tasks', icon: 'bi-list-ul', count: todos.length },
    { id: 'today', name: 'Today', icon: 'bi-calendar-day', count: getTodayTodos().length },
    { id: 'upcoming', name: 'Upcoming', icon: 'bi-calendar-week', count: getUpcomingTodos().length },
    { id: 'completed', name: 'Completed', icon: 'bi-check-circle', count: todos.filter(t => t.completed).length },
    { id: 'important', name: 'Important', icon: 'bi-star', count: todos.filter(t => t.priority === 'high').length }
  ];
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // ✅ جلب المهام من API
  useEffect(() => {
    fetchTodos();
  }, []);
  const handleEditClick = (todo) => {
    setEditingTodo(todo); // نخزن المهمة الحالية
    setShowEditModal(true); // نفتح المودال
  };


  // ========================= API Config =========================
  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`
    }
  };

  // ========================= Fetch Todos =========================
  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL, axiosConfig);
      setTodos(res.data.data || []);
    } catch (error) {
      console.error("❌ Error fetching todos:", error);
    }
  };

  // ========================= إضافة مهمة =========================
  const addTodo = async () => {
    if (!newTodo.title.trim()) return alert("أدخل عنوان المهمة");

    try {
      const todoToSend = {
        ...newTodo,
        completed: false,
        dueDate:
          newTodo.dueDate && newTodo.dueDate.trim()
            ? newTodo.dueDate
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        subTasks: newTodo.subTasks || []
      };

      const res = await axios.post(API_URL, todoToSend, axiosConfig);
      setTodos([res.data.data, ...todos]);

      // إعادة تعيين الحقول
      setNewTodo({
        title: "",
        description: "",
        priority: "medium",
        category: "personal",
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        subTasks: []
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("❌ Error adding todo:", error);
    }
  };

  // ========================= تعديل مهمة =========================
  const updateTodo = async () => {
    if (!editingTodo) return alert("لا توجد مهمة محددة للتعديل");

    try {
      const todoToSend = {
        ...editingTodo,
        dueDate:
          editingTodo.dueDate && editingTodo.dueDate.trim()
            ? editingTodo.dueDate
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        subTasks: editingTodo.subTasks || []
      };

      const res = await axios.put(`${API_URL}/${editingTodo._id}`, todoToSend, axiosConfig);
      setTodos(todos.map(t => (t._id === editingTodo._id ? res.data.data : t)));
      setShowEditModal(false);
      setEditingTodo(null);
    } catch (error) {
      console.error("❌ Error updating todo:", error);
    }
  };

  // ========================= تبديل حالة المهمة =========================
  const toggleTodo = async id => {
    const todo = todos.find(t => t._id === id);
    if (!todo) return;

    try {
      const res = await axios.put(
        `${API_URL}/${id}`,
        { ...todo, completed: !todo.completed },
        axiosConfig
      );
      setTodos(todos.map(t => (t._id === id ? res.data.data : t)));
    } catch (error) {
      console.error("❌ Error toggling todo:", error);
    }
  };

  // ========================= حذف مهمة =========================
  const deleteTodo = async id => {
    try {
      await axios.delete(`${API_URL}/${id}`, axiosConfig);
      setTodos(todos.filter(t => t._id !== id));
    } catch (error) {
      console.error("❌ Error deleting todo:", error);
    }
  };

  // ========================= إضافة مهمة فرعية =========================
  const addSubTask = async (todoId, subTask) => {
    if (!subTask?.title?.trim()) {
      alert("أدخل عنوان المهمة الفرعية");
      return null;
    }

    try {
      const res = await axios.post(
        `${API_URL}/${todoId}/subtasks`,
        {
          title: subTask.title.trim(),
          description: subTask.description?.trim() || "",
          completed: subTask.completed || false
        },
        axiosConfig
      );

      // إعادة تعيين الحقول بعد النجاح
      setShowSubTaskModal(false);
      setSubTaskTitle("");
      setSubTaskDescription("");

      return res.data.data; // ✅ إرجاع المهمة بعد الإضافة
    } catch (error) {
      console.error("❌ Error adding subtask:", error);
      alert("حدث خطأ في إضافة المهمة الفرعية");
      return null;
    }
  };


  // ========================= تعديل مهمة فرعية =========================
  const updateSubTask = async (todoId, subTaskId, data) => {
    if (!todoId || !subTaskId) return null;

    try {
      const res = await axios.put(
        `${API_URL}/${todoId}/subtasks/${subTaskId}`,
        {
          title: data.title?.trim() || "",
          description: data.description?.trim() || "",
          completed: data.completed ?? false
        },
        axiosConfig
      );

      return res.data.data; // ✅ إرجاع المهمة بعد التحديث
    } catch (error) {
      console.error("❌ Error updating subtask:", error);
      return null;
    }
  };


  // ========================= حذف مهمة فرعية =========================
  const deleteSubTask = async (todoId, subTaskId) => {
    if (!todoId || !subTaskId) return;

    try {
      const res = await axios.delete(
        `${API_URL}/${todoId}/subtasks/${subTaskId}`,
        axiosConfig
      );

      return res.data.data; // ✅ ارجع المهمة بعد حذف الـ subtask
    } catch (error) {
      console.error("❌ Error deleting subtask:", error);
      return null;
    }
  };


  // ========================= تبديل حالة المهمة الفرعية =========================
  const toggleSubTask = async (todoId, subTaskIndex) => {
    const todo = todos.find(t => t._id === todoId);
    if (!todo) return;

    const updatedSubTasks = [...todo.subTasks];
    updatedSubTasks[subTaskIndex].completed = !updatedSubTasks[subTaskIndex].completed;

    try {
      const res = await axios.put(
        `${API_URL}/${todoId}`,
        { ...todo, subTasks: updatedSubTasks },
        axiosConfig
      );
      setTodos(todos.map(t => (t._id === todoId ? res.data.data : t)));
    } catch (error) {
      console.error("❌ Error toggling subtask:", error);
    }
  };


  // ✅ مسح المكتملة
  const clearCompleted = async () => {
    try {
      const res = await axios.delete(`https://task-manager-onhy.onrender.com/api/tasks/clear/completed`, axiosConfig);
      setTodos(res.data.data);
    } catch (error) {
      console.error("❌ Error clearing completed todos:", error);
    }
  };

  // ✅ مسح الكل
  const clearAll = async () => {
    try {
      const res = await axios.delete(`https://task-manager-onhy.onrender.com/api/tasks/clear/all`, axiosConfig);
      setTodos(res.data.data);
    } catch (error) {
      console.error("❌ Error clearing all todos:", error);
    }
  };


  const handleSaveSubTask = async (todoId, subTask) => {
    if (!subTask.title.trim()) {
      alert("أدخل عنوان المهمة الفرعية");
      return;
    }
    try {
      const updated = await addSubTask(todoId, subTask);
      setTodos(todos.map(t => t._id === todoId ? updated : t));
      setShowSubTaskModal(false);
      setSubTaskTitle("");
      setSubTaskDescription("");
    } catch (error) {
      console.error("❌ Error adding subtask:", error);
      alert(error.message || "حدث خطأ في إضافة المهمة الفرعية");
    }
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#6b7280';
  };

  const getCurrentViewName = () => {
    const view = views.find(v => v.id === currentView);
    if (view) return view.name;
    const category = categories.find(cat => cat.id === currentView);
    return category ? category.name : 'جميع المهام';
  };
  function getTodayTodos() {
    const today = new Date().toISOString().split('T')[0];

    return todos.filter(todo => {
      const todoDate = todo.dueDate?.split('T')[0]; // استخدام optional chaining
      return todoDate === today;
    });
  }


  // دالة تعديل subTask
  const handleSaveEditSubTask = async () => {
    if (!newSubTaskTitle.trim() || !subTaskToEdit) return;

    try {

      const updated = await updateSubTask(currentTodoId, subTaskToEdit._id, {
        title: newSubTaskTitle.trim(),
        description: newSubTaskDescription,
      });

      setTodos(todos.map(t => t._id === currentTodoId ? updated : t));
      setShowEditSubTaskModal(false);
      setNewSubTaskTitle("");
      setNewSubTaskDescription("");
      setSubTaskToEdit(null);
    } catch (error) {
      console.error("Error updating subtask:", error);
      alert("حدث خطأ في تعديل المهمة الفرعية");
    }
  };





  const handleOpenEditSubTask = (todoId, sub) => {

    setCurrentTodoId(todoId);

    setSubTaskToEdit(sub);
    setNewSubTaskTitle(sub.title || "");

    setNewSubTaskDescription(sub.description || "");

    setShowEditSubTaskModal(true);
  };



  const handleDeleteSubTask = async (e, todoId, subTaskId) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من حذف هذه المهمة الفرعية؟")) {
      try {
        const updated = await deleteSubTask(todoId, subTaskId);
        setTodos(todos.map(t => t._id === todoId ? updated : t));
      } catch (error) {
        console.error("Error deleting subtask:", error);
        alert("حدث خطأ في حذف المهمة الفرعية");
      }
    }
  };

  function getUpcomingTodos() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);


    return todos.filter(todo => {
      const dueDate = new Date(todo.dueDate);
      return dueDate > today && dueDate <= nextWeek;
    });
  }

  const getFilteredTodos = () => {
    let filtered = todos;

    // Filter by view
    switch (currentView) {
      case 'today':
        filtered = getTodayTodos();
        break;
      case 'upcoming':
        filtered = getUpcomingTodos();
        break;
      case 'completed':
        filtered = todos.filter(todo => todo.completed);
        break;
      case 'important':
        filtered = todos.filter(todo => todo.priority === 'high');
        break;
      default:
        if (categories.find(cat => cat.id === currentView)) {
          filtered = todos.filter(todo => todo.category === currentView);
        }
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(todo =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  return (
    <div className="d-flex vh-100 bg-light">
     {sidebarCollapsed && (
        <button
          className="btn btn-outline-primary d-md-none position-fixed"
          style={{
            top: '15px',
            left: '15px',
            zIndex: 1050,
            borderRadius: '10px',
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Open sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
      )}

      {/* Overlay for mobile - Fixed positioning issues */}
      {!sidebarCollapsed && (
        <div
          className="d-md-none position-fixed"
          style={{
            top: 0,
            left: 0,
            width: "100vw", // Fixed: was "300px" which doesn't cover full screen
            height: "100vh", // Fixed: was h-100 class with conflicting width
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1040,
          }}
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Close sidebar"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`bg-white shadow-sm border-end ${
          isDesktop 
            ? "d-block position-relative" 
            : `position-fixed ${sidebarCollapsed ? "d-none" : ""}`
        }`}
        style={{
          // Mobile styles
          ...(!isDesktop && {
            top: 0,
            left: 0,
            zIndex: 1045,
          }),
          // Common styles
          width: sidebarCollapsed ? "90px" : "300px",
          transition: "all 0.3s ease",
          minHeight: "100vh",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >

  {/* Sidebar Header */}
  <div className="p-3 border-bottom">
    <div className="d-flex align-items-center justify-content-between">
      {!sidebarCollapsed && (
        <div className="d-flex align-items-center">
          <div
            className="rounded-3 me-3 d-flex align-items-center justify-content-center"
            style={{
              width: '80px',
              height: '80px',
             
            }}
          >
            <img  src="/logo.png" alt="Logo" style={{ width: '70px', height: '70px' }} />
          </div>
          <div>
            <h5 className="mb-0 fw-bold">TaskBoost</h5>
            <small className="text-muted">Task Management</small>
          </div>
        </div>
      )}
      <button
        className="btn btn-sm btn-outline-secondary border-0 d-none d-md-block"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
      </button>
      
      {/* Close button للهاتف المحمول */}
      <button
        className="btn btn-sm btn-outline-secondary border-0 d-md-none"
        onClick={() => setSidebarCollapsed(true)}
      >
        <i className="bi bi-x-lg"></i>
      </button>
    </div>
  </div>

  {/* Search */}
  {!sidebarCollapsed && (
    <div className="p-2">
      <div className="position-relative">
        <input
          type="text"
          className="form-control ps-5 border-0 bg-light"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ borderRadius: '10px' }}
        />
        <i className="bi bi-search position-absolute text-muted" style={{
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}></i>
      </div>
    </div>
  )}

  {/* Quick Add Button */}
  <div className="p-3">
    <button
      className="btn w-100 text-white fw-semibold"
      style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '10px',
        border: 'none'
      }}
      onClick={() => {
        setShowAddForm(true);
        // إغلاق السايدبار على الهاتف بعد النقر
        if (window.innerWidth <= 768) {
          setSidebarCollapsed(true);
        }
      }}
    >
      <i className="bi bi-plus-lg me-2"></i>
      {!sidebarCollapsed && 'New Task'}
    </button>
  </div>

  {/* Navigation Views */}
  <div className="px-3">
    <div className="list-group list-group-flush">
      {views.map(view => (
        <button
          key={view.id}
          className={`list-group-item list-group-item-action border-0 d-flex align-items-center justify-content-between mb-1 ${
            currentView === view.id ? 'active' : ''
          }`}
          style={{
            borderRadius: '8px',
            backgroundColor: currentView === view.id ? '#667eea' : 'transparent',
            color: currentView === view.id ? 'white' : '#374151'
          }}
          onClick={() => {
            setCurrentView(view.id);
            // إغلاق السايدبار على الهاتف بعد النقر
            if (window.innerWidth <= 768) {
              setSidebarCollapsed(true);
            }
          }}
        >
          <div className="d-flex align-items-center">
            <i className={`${view.icon} me-3`}></i>
            {!sidebarCollapsed && <span>{view.name}</span>}
          </div>
          {!sidebarCollapsed && (
            <span className={`badge ${
              currentView === view.id ? 'bg-white text-primary' : 'bg-light text-dark'
            }`}>
              {view.count}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>

  {/* Categories */}
  <div className="px-3">
    {!sidebarCollapsed && (
      <h6 className="text-muted mb-2 fw-semibold small">Categories</h6>
    )}
    <div className="list-group list-group-flush">
      {categories.map(category => {
        const categoryTodos = todos.filter(t => t.category === category.id);
        return (
          <button
            key={category.id}
            className={`list-group-item list-group-item-action border-0 d-flex align-items-center justify-content-between mb-1 ${
              currentView === category.id ? 'active' : ''
            }`}
            style={{
              borderRadius: '8px',
              backgroundColor: currentView === category.id ? category.color : 'transparent',
              color: currentView === category.id ? 'white' : '#374151'
            }}
            onClick={() => {
              setCurrentView(category.id);
              // إغلاق السايدبار على الهاتف بعد النقر
              if (window.innerWidth <= 768) {
                setSidebarCollapsed(true);
              }
            }}
          >
            <div className="d-flex align-items-center">
              <div
                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: category.color
                }}
              ></div>
              <i className={`${category.icon} me-2`}></i>
              {!sidebarCollapsed && <span>{category.name}</span>}
            </div>
            {!sidebarCollapsed && (
              <span className={`badge ${
                currentView === category.id ? 'bg-white text-dark' : 'bg-light text-dark'
              }`}>
                {categoryTodos.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>

  {/* User Profile */}
  {!sidebarCollapsed && (
    <div className="mt-auto p-3">
      <div className="d-flex align-items-center p-3 bg-light rounded-3">
        <div
          className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white"
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)'
          }}
        >
          <i className="bi bi-person fs-5"></i>
        </div>
        <div>
          <div className="fw-semibold">{userProfile?.name}</div>
          <small className="text-muted">{userProfile?.email}</small>
        </div>
      </div>
    </div>
  )}
</div>
      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
    {/* Header */}
<div className="bg-white shadow-sm border-bottom">
  <div className="container-fluid p-3">
    {/* Mobile Header */}
    <div className="d-md-none">
      {/* Top row: Title and menu button */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="flex-grow-1">
          <h5 className="mb-0 fw-bold text-truncate">{getCurrentViewName()}</h5>
        </div>
        <button 
          className="btn btn-outline-secondary btn-sm ms-2"
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#mobileActions"
          aria-expanded="false" 
          aria-controls="mobileActions"
        >
          <i className="bi bi-three-dots"></i>
        </button>
      </div>
      
      {/* Subtitle */}
      <p className="text-muted mb-2 small">
        You have {getFilteredTodos().filter(t => !t.completed).length} tasks remaining
      </p>
      
      {/* Collapsible actions for mobile */}
      <div className="collapse" id="mobileActions">
        <div className="d-flex flex-column gap-2 pt-2 border-top">
          <button
            className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center"
            onClick={clearCompleted}
          >
            <i className="bi bi-check2-circle me-2"></i>
            Clear Completed
          </button>
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
            onClick={clearAll}
          >
            <i className="bi bi-trash me-2"></i>
            Clear All
          </button>
        </div>
      </div>
    </div>

    {/* Desktop Header */}
    <div className="d-none d-md-flex align-items-center justify-content-between">
      {/* Left: Title + subtitle */}
      <div className="me-4">
        <h4 className="mb-1 fw-bold">{getCurrentViewName()}</h4>
        <p className="text-muted mb-0">
          You have {getFilteredTodos().filter(t => !t.completed).length} tasks remaining
        </p>
      </div>

      {/* Right: Actions */}
      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        {/* Options dropdown for desktop */}
        <div className="dropdown">
          <button 
            className="btn btn-outline-secondary"
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <i className="bi bi-three-dots"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={clearCompleted}>
                <i className="bi bi-check2-circle me-2"></i>
                Clear Completed
              </button>
            </li>
            <li>
              <button className="dropdown-item text-danger" onClick={clearAll}>
                <i className="bi bi-trash me-2"></i>
                Clear All
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item">
                <i className="bi bi-gear me-2"></i>
                Settings
              </button>
            </li>
          </ul>
        </div>

        {/* Quick action buttons - show on larger screens */}
        <div className="d-none d-lg-flex gap-2">
          <button
            className="btn btn-outline-success"
            onClick={clearCompleted}
            title="Clear Completed Tasks"
          >
            <i className="bi bi-check2-circle"></i>
            <span className="d-none d-xl-inline ms-1">Clear Completed</span>
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={clearAll}
            title="Clear All Tasks"
          >
            <i className="bi bi-trash"></i>
            <span className="d-none d-xl-inline ms-1">Clear All</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


        {/* Todo List */}
        <div className="flex-grow-1 p-4 overflow-auto">
          {getFilteredTodos().length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted mb-3"></i>
              <h5 className="text-muted">No tasks available</h5>
              <p className="text-muted">Start by adding a new task</p>
            </div>
          ) : (
            <div className="row g-3">
              {getFilteredTodos().map(todo => (
                <div key={todo._id} className="col-12">
                  <div className={`card border-0 shadow-sm h-100 ${todo.completed ? 'opacity-75' : ''}`}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start">
                        {/* Checkbox */}
                        <div className="me-3">
                          <input
                            type="checkbox"
                            className="form-check-input fs-5"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo._id)}
                            style={{ marginTop: '2px' }}
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1">
                          {/* Priority & Category */}
                          <div className="d-flex align-items-center mb-2">
                            <span
                              className="badge me-2"
                              style={{
                                backgroundColor: getPriorityColor(todo.priority),
                                fontSize: '10px'
                              }}
                            >
                              {todo.priority === 'high' ? 'High' :
                                todo.priority === 'medium' ? 'Medium' : 'Low'}
                            </span>
                            <span
                              className="badge"
                              style={{
                                backgroundColor: getCategoryColor(todo.category),
                                fontSize: '10px'
                              }}
                            >
                              {categories.find(cat => cat.id === todo.category)?.name}
                            </span>
                          </div>

                          {/* Title */}
                          <h6 className={`mb-2 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}>
                            {todo.title}
                          </h6>

                          {/* Description */}
                          {todo.description && (
                            <p className={`small mb-2 ${todo.completed ? 'text-muted' : 'text-secondary'}`}>
                              {todo.description}
                            </p>
                          )}

                          {/* ✅ Sub-todos */}
                          {todo.subTasks && todo.subTasks.length > 0 && (
                            <div className="mt-3 subtasks-container">
                              {/* Sub-tasks Header */}
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-list-task me-2 text-primary" style={{ fontSize: '14px' }}></i>
                                  <span className="small fw-semibold text-secondary">
                                    Sub-tasks ({todo.subTasks.filter(sub => sub.completed).length}/{todo.subTasks.length})
                                  </span>
                                </div>
                                {/* Progress Bar */}
                                <div
                                  className="progress ms-3"
                                  style={{
                                    height: '4px',
                                    width: '60px',
                                    backgroundColor: '#e9ecef'
                                  }}
                                >
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                      width: `${(todo.subTasks.filter(sub => sub.completed).length / todo.subTasks.length) * 100}%`,
                                      backgroundColor: todo.subTasks.filter(sub => sub.completed).length === todo.subTasks.length
                                        ? '#28a745' : '#007bff',
                                      transition: 'width 0.3s ease'
                                    }}
                                  ></div>
                                </div>
                              </div>

                              {/* Sub-tasks List */}
                              <div
                                className="border-start ps-3 ms-2"
                                style={{
                                  borderColor: '#dee2e6',
                                  borderWidth: '2px'
                                }}
                              >
                                {todo.subTasks.map((sub, idx) => (
                                  <div
                                    key={idx}
                                    className="subtask-item d-flex align-items-start py-2 px-2 rounded mb-1 position-relative"
                                    style={{
                                      transition: 'all 0.2s ease',
                                      border: '1px solid transparent',
                                      cursor: 'pointer',
                                      backgroundColor: sub.completed ? '#f8f9fa' : 'white'
                                    }}
                                  >
                                    {/* Custom Checkbox */}
                                    <div className="position-relative me-3 mt-1">
                                      <input
                                        type="checkbox"
                                        className="form-check-input position-absolute opacity-0"
                                        checked={sub.completed}
                                        onChange={() => toggleSubTask(todo._id, idx)}
                                        style={{ cursor: 'pointer' }}
                                      />
                                      <div
                                        className={`d-flex align-items-center justify-content-center rounded-circle ${sub.completed ? 'bg-success text-white' : 'border border-2 border-secondary bg-white'
                                          }`}
                                        style={{
                                          width: '18px',
                                          height: '18px',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => toggleSubTask(todo._id, idx)}
                                      >
                                        {sub.completed && (
                                          <i className="bi bi-check" style={{ fontSize: '12px', fontWeight: 'bold' }}></i>
                                        )}
                                      </div>
                                    </div>

                                    {/* Sub-task Content */}
                                    <div className="flex-grow-1" onClick={() => toggleSubTask(todo._id, idx)}>
                                      <span
                                        className={`d-block small ${sub.completed
                                          ? 'text-decoration-line-through text-muted'
                                          : 'text-dark'
                                          }`}
                                        style={{
                                          lineHeight: '1.4',
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        {sub.title}
                                      </span>

                                      {/* Sub-task description if exists */}
                                      {sub.description && (
                                        <span className="d-block text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                                          {sub.description}
                                        </span>
                                      )}
                                    </div>

                                    {/* Sub-task Actions */}
                                    <div className="subtask-actions d-flex align-items-center ms-2">
                                      <button
                                        className="btn btn-sm btn-outline-secondary border-0 p-1"
                                        style={{ fontSize: '11px' }}
                                        title="Edit Sub-task"
                                        onClick={() => handleOpenEditSubTask(todo._id, sub)}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>

                                      <button
                                        className="btn btn-sm btn-outline-danger border-0 p-1 ms-1"
                                        style={{ fontSize: '11px' }}
                                        title="Delete Sub-task"
                                        onClick={(e) => handleDeleteSubTask(e, todo._id, sub._id)}
                                      >
                                        <i className="bi bi-trash3"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Due Date */}
                          <div className="d-flex align-items-center text-muted">
                            <i className="bi bi-calendar3 me-1"></i>
                            <small>{new Date(todo.dueDate).toLocaleDateString('en-US')}</small>
                          </div>

                          {/* Add New Sub-task Button */}
                          <button
                            className="btn btn-sm btn-outline-primary border-dashed mt-2 ms-3 d-flex align-items-center add-subtask-btn"
                            style={{
                              fontSize: '12px',
                              borderStyle: 'dashed',
                              borderWidth: '1px',
                              backgroundColor: 'transparent'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentTodoId(todo._id);
                              setShowSubTaskModal(true);
                            }}
                          >
                            <i className="bi bi-plus-circle me-1"></i>
                            Add New Sub-task
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="ms-2">
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-secondary border-0"
                              data-bs-toggle="dropdown"
                            >
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleEditClick(todo)} // ✅ Pass the task
                                >
                                  <i className="bi bi-pencil me-2"></i>Edit
                                </button>
                              </li>

                              <li>
                                <button
                                  className="dropdown-item text-danger"
                                  onClick={() => deleteTodo(todo._id)}
                                >
                                  <i className="bi bi-trash me-2"></i>Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Add Todo Modal */}
      {
        showAddForm && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Add New Task</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddForm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Task Title</label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      placeholder="Enter task title..."
                      value={newTodo.title}
                      onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control border-0 bg-light"
                      rows={3}
                      placeholder="Detailed description of the task..."
                      value={newTodo.description}
                      onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Subtasks</label>
                    {newTodo.subTasks.map((st, idx) => (
                      <div key={idx} className="d-flex align-items-center mb-2">
                        <input
                          type="text"
                          className="form-control border-0 bg-light me-2"
                          value={st.title}
                          onChange={(e) => {
                            const updated = [...newTodo.subTasks];
                            updated[idx].title = e.target.value;
                            setNewTodo({ ...newTodo, subTasks: updated });
                          }}
                          style={{ borderRadius: '10px' }}
                        />
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setNewTodo({
                              ...newTodo,
                              subTasks: newTodo.subTasks.filter((_, i) => i !== idx),
                            });
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      className="btn btn-sm btn-outline-primary mt-2"
                      onClick={() =>
                        setNewTodo({
                          ...newTodo,
                          subTasks: [...newTodo.subTasks, { title: "", completed: false }],
                        })
                      }
                    >
                      + Add Subtask
                    </button>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Priority</label>
                      <select
                        className="form-select border-0 bg-light"
                        value={newTodo.priority}
                        onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                        style={{ borderRadius: '10px' }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Category</label>
                      <select
                        className="form-select border-0 bg-light"
                        value={newTodo.category}
                        onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                        style={{ borderRadius: '10px' }}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Due Date</label>
                      <input
                        type="date"
                        className="form-control border-0 bg-light"
                        value={newTodo.dueDate}
                        onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                        style={{ borderRadius: '10px' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddForm(false)}
                    style={{ borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn text-white fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '10px',
                      border: 'none'
                    }}
                    onClick={addTodo}
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {
        showEditModal && editingTodo && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Edit Task</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Task Title</label>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      placeholder="Enter task title..."
                      value={editingTodo.title}
                      onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control border-0 bg-light"
                      rows={3}
                      placeholder="Detailed description of the task..."
                      value={editingTodo.description}
                      onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                      style={{ borderRadius: '10px' }}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Priority</label>
                      <select
                        className="form-select border-0 bg-light"
                        value={editingTodo.priority}
                        onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value })}
                        style={{ borderRadius: '10px' }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Category</label>
                      <select
                        className="form-select border-0 bg-light"
                        value={editingTodo.category}
                        onChange={(e) => setEditingTodo({ ...editingTodo, category: e.target.value })}
                        style={{ borderRadius: '10px' }}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Due Date</label>
                      <input
                        type="date"
                        className="form-control border-0 bg-light"
                        value={editingTodo.dueDate}
                        onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                        style={{ borderRadius: '10px' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                    style={{ borderRadius: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn text-white fw-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '10px',
                      border: 'none'
                    }}
                    onClick={updateTodo}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      <style jsx>{`
        .collapsed-sidebar .list-group-item span,
        .collapsed-sidebar .badge,
        .collapsed-sidebar small {
          display: none;
        }
        
        .transition-all {
          transition: all 0.3s ease;
        }
        
        .list-group-item:hover {
          transform: translateX(-2px);
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        @media (max-width: 768px) {
          .collapsed-sidebar {
            width: 0 !important;
            overflow: hidden;
          }
        }
      `}</style>
      {showEditSubTaskModal && (
        <>
          {/* Backdrop */}
          <div
            className="edit-subtask-backdrop"
            onClick={() => setShowEditSubTaskModal(false)}
          />

          {/* Modal */}
          <div className="edit-subtask-modal">
            <div className="edit-subtask-dialog">
              <div className="edit-subtask-content">
                {/* Header with gradient */}
                <div className="edit-subtask-header">
                  <div className="d-flex align-items-center">
                    <div className="edit-subtask-icon me-3">
                      <i className="bi bi-pencil-square text-white"></i>
                    </div>
                    <div>
                      <h5 className="text-white mb-0 fw-bold">Edit Subtask</h5>
                      <small className="text-white-75">Update the subtask details</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="edit-subtask-close-btn"
                    onClick={() => setShowEditSubTaskModal(false)}
                    aria-label="Close"
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                {/* Body with enhanced form */}
                <div className="edit-subtask-body">
                  {/* Title */}
                  <div className="edit-subtask-field mb-4">
                    <label className="edit-subtask-label">
                      <i className="bi bi-type me-2 text-primary"></i>
                      Subtask Title
                      <span className="text-danger ms-1">*</span>
                    </label>
                    <div className="edit-subtask-input-wrapper">
                      <input
                        type="text"
                        className="edit-subtask-input"
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        placeholder="Example: Review required documents"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (newSubTaskTitle.trim()) {
                              handleSaveEditSubTask();
                            }
                          } else if (e.key === 'Escape') {
                            setShowEditSubTaskModal(false);
                          }
                        }}
                      />
                      <div className="edit-subtask-focus-line"></div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="edit-subtask-field mb-4">
                    <label className="edit-subtask-label">
                      <i className="bi bi-card-text me-2 text-success"></i>
                      Subtask Description (Optional)
                    </label>
                    <div className="edit-subtask-input-wrapper">
                      <textarea
                        className="edit-subtask-textarea"
                        value={newSubTaskDescription}
                        onChange={(e) => setNewSubTaskDescription(e.target.value)}
                        placeholder="Add a detailed description of the subtask..."
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            e.preventDefault();
                            if (newSubTaskTitle.trim()) {
                              handleSaveEditSubTask();
                            }
                          }
                        }}
                      ></textarea>
                      <div className="edit-subtask-focus-line"></div>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="tips-section">
                    <div className="tip-card">
                      <i className="bi bi-lightbulb-fill text-warning"></i>
                      <div className="tip-content">
                        <strong>Tip:</strong>
                        <span>Use Ctrl + Enter for quick save</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with enhanced buttons */}
                <div className="edit-subtask-footer">
                  <div className="d-flex gap-3 w-100">
                    <button
                      className="edit-subtask-btn edit-subtask-btn-cancel flex-fill"
                      onClick={() => setShowEditSubTaskModal(false)}
                      type="button"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button
                      className="edit-subtask-btn edit-subtask-btn-save flex-fill"
                      onClick={handleSaveEditSubTask}
                      disabled={!newSubTaskTitle.trim()}
                      type="button"
                    >
                      <i className="bi bi-check-circle me-2"></i>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}


      <style jsx>{`
  /* Backdrop */
  .edit-subtask-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.55);
    z-index: 1040;
    animation: fadeInBackdrop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Modal */
  .edit-subtask-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .edit-subtask-dialog {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
  }

  .edit-subtask-content {
    background: white;
    border-radius: 24px;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
    animation: slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: center;
  }

  /* Header */
  .edit-subtask-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem 2.5rem;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .edit-subtask-icon {
    width: 55px;
    height: 55px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    backdrop-filter: blur(10px);
  }

  .text-white-75 {
    opacity: 0.85;
  }

  .edit-subtask-close-btn {
    width: 44px;
    height: 44px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
  }

  .edit-subtask-close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  /* Body */
  .edit-subtask-body {
    padding: 2.5rem;
    background: #fff;
  }

  .edit-subtask-field {
    position: relative;
  }

  .edit-subtask-label {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
  }

  .edit-subtask-input-wrapper {
    position: relative;
  }

  .edit-subtask-input,
  .edit-subtask-textarea {
    width: 100%;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    padding: 1.25rem 1.5rem;
    font-size: 1rem;
    background: #fafafa;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
    resize: none;
    line-height: 1.5;
  }

  .edit-subtask-input:focus,
  .edit-subtask-textarea:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.1),
      0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .edit-subtask-focus-line {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0 0 16px 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-50%);
  }

  .edit-subtask-input:focus + .edit-subtask-focus-line,
  .edit-subtask-textarea:focus + .edit-subtask-focus-line {
    width: 100%;
  }

  /* Tips */
  .edit-subtask-tips {
    margin-top: 1.5rem;
  }

  .edit-subtask-tip-card {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #f59e0b;
    border-radius: 16px;
    padding: 1.25rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .edit-subtask-tip-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .edit-subtask-tip-content strong {
    color: #92400e;
    margin-bottom: 0.25rem;
  }

  .edit-subtask-tip-content span {
    color: #b45309;
    font-size: 0.85rem;
  }

  /* Footer */
  .edit-subtask-footer {
    padding: 2rem 2.5rem 2.5rem;
    background: linear-gradient(to bottom, #fafafa 0%, #f3f4f6 100%);
    border-top: 1px solid #e5e7eb;
  }

  .edit-subtask-btn {
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
  }

  .edit-subtask-btn-cancel {
    background: white;
    color: #6b7280;
    border: 2px solid #e5e7eb;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .edit-subtask-btn-cancel:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .edit-subtask-btn-save {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .edit-subtask-btn-save:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .edit-subtask-btn-save:disabled {
    background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    opacity: 0.7;
  }

  /* Animations */
  @keyframes fadeInBackdrop {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUpModal {
    from {
      opacity: 0;
      transform: translateY(60px) scale(0.92);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Character counter (if needed) */
  .edit-subtask-char-counter {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    font-size: 0.75rem;
    color: #9ca3af;
    pointer-events: none;
  }

  /* Responsive */
  @media (max-width: 576px) {
    .edit-subtask-modal {
      padding: 15px;
    }
    
    .edit-subtask-content {
      border-radius: 20px;
    }
    
    .edit-subtask-header {
      padding: 1.5rem;
    }
    
    .edit-subtask-body {
      padding: 2rem 1.5rem;
    }
    
    .edit-subtask-footer {
      padding: 1.5rem;
      flex-direction: column;
    }
    
    .edit-subtask-icon {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }
    
    .edit-subtask-close-btn {
      width: 40px;
      height: 40px;
    }
  }



  /* RTL Support */
  [dir="rtl"] .edit-subtask-icon {
    margin-right: 0;
    margin-left: 1rem;
  }
  
  [dir="rtl"] .edit-subtask-label i {
    margin-right: 0;
    margin-left: 0.5rem;
  }
  
  [dir="rtl"] .text-danger {
    margin-right: 0.25rem;
    margin-left: 0;
  }
`}</style>
      {showSubTaskModal && (
        <>
          {/* Enhanced Backdrop */}
          <div
            className="modal-backdrop-enhanced"
            onClick={() => setShowSubTaskModal(false)}
          />

          {/* Modal Container */}
          <div className="modal-container-enhanced">
            <div className="modal-content-card">
              {/* Header Section */}
              <div className="modal-header-gradient">
                <div className="header-content">
                  <div className="header-icon">
                    <i className="bi bi-plus-circle-fill"></i>
                  </div>
                  <div className="header-text">
                    <h4 className="modal-title">Add New Subtask</h4>
                    <p className="modal-subtitle">Enter the details of the subtask</p>
                  </div>
                </div>
                <button
                  className="close-button"
                  onClick={() => setShowSubTaskModal(false)}
                  type="button"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {/* Form Section */}
              <div className="modal-form-section">
                {/* Title Input */}
                <div className="input-group-enhanced">
                  <label className="input-label">
                    <i className="bi bi-type me-2"></i>
                    Subtask Title
                    <span className="required-star">*</span>
                  </label>
                  <div className="input-container-enhanced">
                    <input
                      type="text"
                      className="form-input-enhanced"
                      placeholder="Example: Review required documents"
                      value={subTaskTitle}
                      onChange={(e) => setSubTaskTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSaveSubTask(currentTodoId, {
                            title: subTaskTitle,
                            description: subTaskDescription,
                            completed: false,
                          });
                        }
                      }}
                    />
                    <div className="input-focus-line"></div>
                  </div>
                </div>

                {/* Description Input */}
                <div className="input-group-enhanced">
                  <label className="input-label">
                    <i className="bi bi-card-text me-2"></i>
                    Description (Optional)
                  </label>
                  <div className="input-container-enhanced">
                    <textarea
                      className="form-textarea-enhanced"
                      placeholder="Add a detailed description for the subtask..."
                      value={subTaskDescription}
                      onChange={(e) => setSubTaskDescription(e.target.value)}
                      rows="3"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleSaveSubTask(currentTodoId, {
                            title: subTaskTitle,
                            description: subTaskDescription,
                            completed: false,
                          });
                        }
                      }}
                    />
                    <div className="input-focus-line"></div>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="tips-section">
                  <div className="tip-card">
                    <i className="bi bi-lightbulb-fill text-warning"></i>
                    <div className="tip-content">
                      <strong>Tip:</strong>
                      <span>Use Ctrl + Enter for quick save</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowSubTaskModal(false)}
                  type="button"
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancel
                </button>
                <button
                  className="btn-save"
                  onClick={() =>
                    handleSaveSubTask(currentTodoId, {
                      title: subTaskTitle,
                      description: subTaskDescription,
                      completed: false,
                    })
                  }
                  disabled={!subTaskTitle.trim()}
                  type="button"
                >
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Save Subtask
                </button>
              </div>
            </div>
          </div>
        </>
      )}


      <style jsx>{`
  /* Backdrop */
  .modal-backdrop-enhanced {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1040;
    animation: fadeInBackdrop 0.3s ease;
  }

  /* Modal Container */
  .modal-container-enhanced {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    padding: 20px;
  }

  /* Modal Card */
  .modal-content-card {
    background: white;
    border-radius: 24px;
    width: 100%;
    max-width: 500px;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    animation: slideInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
  }

  /* Header */
  .modal-header-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    position: relative;
    color: white;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    backdrop-filter: blur(10px);
  }

  .header-text {
    flex: 1;
  }

  .modal-title {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .modal-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .close-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  /* Form Section */
  .modal-form-section {
    padding: 2rem;
  }

  .input-group-enhanced {
    margin-bottom: 1.5rem;
  }

  .input-label {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .required-star {
    color: #ef4444;
    margin-left: 0.25rem;
  }

  .input-container-enhanced {
    position: relative;
  }

  .form-input-enhanced,
  .form-textarea-enhanced {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    font-size: 1rem;
    background: #fafafa;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    resize: none;
    font-family: inherit;
  }

  .form-input-enhanced:focus,
  .form-textarea-enhanced:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  .input-focus-line {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0 0 16px 16px;
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  .form-input-enhanced:focus + .input-focus-line,
  .form-textarea-enhanced:focus + .input-focus-line {
    width: 100%;
  }

  /* Tips Section */
  .tips-section {
    margin-top: 1rem;
  }

  .tip-card {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #f59e0b;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
  }

  .tip-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tip-content strong {
    color: #92400e;
  }

  .tip-content span {
    color: #b45309;
  }

  /* Action Buttons */
  .modal-actions {
    padding: 1.5rem 2rem 2rem;
    display: flex;
    gap: 1rem;
  }

  .btn-cancel,
  .btn-save {
    flex: 1;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-cancel {
    background: #f3f4f6;
    color: #6b7280;
    border: 2px solid #e5e7eb;
  }

  .btn-cancel:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .btn-save {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }

  .btn-save:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .btn-save:disabled {
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Animations */
  @keyframes fadeInBackdrop {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInModal {
    from {
      opacity: 0;
      transform: translateY(50px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Mobile Responsiveness */
  @media (max-width: 576px) {
    .modal-container-enhanced {
      padding: 10px;
    }
    
    .modal-content-card {
      border-radius: 20px;
    }
    
    .modal-header-gradient {
      padding: 1.5rem;
    }
    
    .modal-form-section {
      padding: 1.5rem;
    }
    
    .modal-actions {
      padding: 1rem 1.5rem 1.5rem;
      flex-direction: column;
    }
    
    .header-icon {
      width: 50px;
      height: 50px;
      font-size: 1.2rem;
    }
    
    .modal-title {
      font-size: 1.1rem;
    }
  }

  /* RTL Support */
  [dir="rtl"] .close-button {
    left: 1.5rem;
    right: auto;
  }
  
  [dir="rtl"] .input-label i {
    margin-right: 0;
    margin-left: 0.5rem;
  }
  
  [dir="rtl"] .required-star {
    margin-right: 0.25rem;
    margin-left: 0;
  }
`}</style>

    </div >
  );
};

export default TodoAppWithSidebar;