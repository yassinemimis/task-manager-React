import React, { useState } from 'react';

const TodoForm = ({ onAddTodo }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim()) {
      setIsLoading(true);
      // Simulate async operation
      setTimeout(() => {
        onAddTodo(title, description);
        setTitle('');
        setDescription('');
        setShowDescription(false);
        setIsLoading(false);
      }, 100);
    }
  };

  const remainingTitleChars = 100 - title.length;
  const remainingDescChars = 300 - description.length;
  const isTitleNearLimit = remainingTitleChars < 20;
  const isDescNearLimit = remainingDescChars < 50;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Title Input */}
        <div className="input-group input-group-lg mb-3">
          <span className="input-group-text bg-primary text-white border-0">
            <i className="bi bi-pencil-square"></i>
          </span>
          <input
            type="text"
            className="form-control border-0 shadow-sm"
            placeholder="عنوان المهمة..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            disabled={isLoading}
            required
          />
          <button 
            type="button"
            className="btn btn-outline-secondary border-0"
            onClick={() => setShowDescription(!showDescription)}
            title={showDescription ? 'إخفاء الوصف' : 'إضافة وصف'}
          >
            <i className={`bi ${showDescription ? 'bi-eye-slash' : 'bi-plus-square'}`}></i>
          </button>
        </div>

        {/* Description Input (Collapsible) */}
        <div className={`collapse ${showDescription ? 'show' : ''}`}>
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-secondary text-white border-0">
                <i className="bi bi-card-text"></i>
              </span>
              <textarea
                className="form-control border-0 shadow-sm"
                placeholder="وصف تفصيلي للمهمة (اختياري)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="d-grid">
          <button 
            className="btn btn-success btn-lg border-0 shadow-sm"
            type="submit"
            disabled={!title.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                جاري الإضافة...
              </>
            ) : (
              <>
                <i className="bi bi-check2-circle me-2"></i>
                إضافة مهمة جديدة
              </>
            )}
          </button>
        </div>
      </form>

      {/* Character Counters */}
      <div className="d-flex justify-content-between align-items-center mt-2">
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          اضغط Enter في العنوان لإضافة المهمة بسرعة
        </small>
        <div className="d-flex gap-2">
          {title.length > 0 && (
            <small className={`badge ${isTitleNearLimit ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
              عنوان: {remainingTitleChars}
            </small>
          )}
          {description.length > 0 && (
            <small className={`badge ${isDescNearLimit ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
              وصف: {remainingDescChars}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoForm;