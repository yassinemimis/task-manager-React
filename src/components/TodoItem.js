import React, { useState } from 'react';

const TodoItem = ({ todo, onToggle, onDelete, onEdit, onSetPriority }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

const handleEdit = () => {
  if (
    editTitle.trim() &&
    (editTitle !== todo.title || editDescription !== (todo.description || ''))
  ) {
    onEdit(todo._id, editTitle, editDescription); // ✅ استعمل _id
  }
  setIsEditing(false);
};


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleEdit();
    } else if (e.key === 'Escape') {
      setEditTitle(todo.title);
      setEditDescription(todo.description || '');
      setIsEditing(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'bi-exclamation-triangle-fill';
      case 'medium': return 'bi-dash-circle-fill';
      case 'low': return 'bi-check-circle-fill';
      default: return 'bi-circle';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`card border-0 shadow-sm ${todo.completed ? 'bg-light' : ''}`}>
      <div className="card-body p-3">
        <div className="d-flex align-items-start">
          {/* Checkbox */}
          <div className="form-check me-3 mt-1">
            <input
              type="checkbox"
              className="form-check-input fs-5"
              checked={todo.completed}
              onChange={() => onToggle(todo._id)}
              id={`todo-${todo.id}`}
            />
          </div>

          {/* Content */}
          <div className="flex-grow-1">
            {/* Priority Badge & Date */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className={`badge bg-${getPriorityColor(todo.priority)}`}>
                <i className={`bi ${getPriorityIcon(todo.priority)} me-1`}></i>
                {todo.priority === 'high' ? 'عالية' : 
                 todo.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
              </span>
              <small className="text-muted">
                <i className="bi bi-clock me-1"></i>
                {formatDate(todo.createdAt)}
              </small>
            </div>

            {/* Todo Title & Description */}
            {isEditing ? (
              <div className="mb-3">
                {/* Edit Title */}
                <div className="mb-2">
                  <label className="form-label small text-muted">عنوان المهمة</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    autoFocus
                    maxLength={100}
                    placeholder="عنوان المهمة..."
                  />
                </div>
                
                {/* Edit Description */}
                <div className="mb-2">
                  <label className="form-label small text-muted">الوصف (اختياري)</label>
                  <textarea
                    className="form-control"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onKeyDown={handleKeyPress}
                    maxLength={300}
                    rows={3}
                    placeholder="وصف تفصيلي للمهمة..."
                  />
                </div>

                {/* Edit Actions */}
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={handleEdit}
                    type="button"
                  >
                    <i className="bi bi-check me-1"></i>
                    حفظ
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditTitle(todo.title);
                      setEditDescription(todo.description || '');
                      setIsEditing(false);
                    }}
                    type="button"
                  >
                    <i className="bi bi-x me-1"></i>
                    إلغاء
                  </button>
                </div>
                <small className="text-muted d-block mt-1">
                  <i className="bi bi-keyboard me-1"></i>
                  Ctrl + Enter للحفظ، Escape للإلغاء
                </small>
              </div>
            ) : (
              <div className="mb-2">
                {/* Title */}
                <h6 
                  className={`mb-1 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}
                  onDoubleClick={() => !todo.completed && setIsEditing(true)}
                  style={{ 
                    cursor: todo.completed ? 'default' : 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    wordBreak: 'break-word'
                  }}
                >
                  {todo.title}
                </h6>

                {/* Description */}
                {todo.description && (
                  <div className={`small ${todo.completed ? 'text-muted' : 'text-secondary'}`}>
                    <div 
                      className="mb-1"
                      style={{ 
                        cursor: showFullDescription ? 'default' : 'pointer',
                        lineHeight: '1.4'
                      }}
                      onClick={() => todo.description.length > 100 && setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? todo.description : truncateText(todo.description, 100)}
                    </div>
                    {todo.description.length > 100 && (
                      <button
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription ? 'عرض أقل' : 'عرض المزيد'}
                        <i className={`bi bi-chevron-${showFullDescription ? 'up' : 'down'} ms-1`}></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Priority Selector */}
            {!isEditing && !todo.completed && (
              <div className="mb-2">
                <div className="btn-group btn-group-sm" role="group" aria-label="أولوية المهمة">
                  {['high', 'medium', 'low'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      className={`btn ${
                        todo.priority === priority 
                          ? `btn-${getPriorityColor(priority)}`
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => onSetPriority(todo._id, priority)}
                      title={priority === 'high' ? 'أولوية عالية' : 
                             priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                    >
                      <i className={`bi ${getPriorityIcon(priority)}`}></i>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="ms-2">
            <div className="btn-group-vertical btn-group-sm">
              {!isEditing && !todo.completed && (
                <button
                  className="btn btn-outline-primary btn-sm mb-1"
                  onClick={() => setIsEditing(true)}
                  title="تعديل المهمة"
                >
                  <i className="bi bi-pencil"></i>
                </button>
              )}
              
              {showConfirmDelete ? (
                <div className="btn-group-vertical btn-group-sm">
                  <button
                    className="btn btn-danger btn-sm mb-1"
                    onClick={() => {
                      onDelete(todo._id);
                      setShowConfirmDelete(false);
                    }}
                    title="تأكيد الحذف"
                  >
                    <i className="bi bi-check"></i>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowConfirmDelete(false)}
                    title="إلغاء"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setShowConfirmDelete(true)}
                  title="حذف المهمة"
                >
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Hint */}
        {!isEditing && !todo.completed && (
          <div className="text-end mt-2">
            <small className="text-muted">
              <i className="bi bi-cursor me-1"></i>
              انقر مرتين على العنوان للتعديل السريع
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoItem;