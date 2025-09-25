import React from 'react';

const TodoStats = ({ todos }) => {
  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = totalCount - completedCount;

  if (totalCount === 0) return null;

  return (
    <div className="row text-center mb-3">
      <div className="col-4">
        <div className="card bg-light">
          <div className="card-body py-2">
            <h6 className="card-title text-primary mb-1">المجموع</h6>
            <h4 className="mb-0">{totalCount}</h4>
          </div>
        </div>
      </div>
      <div className="col-4">
        <div className="card bg-light">
          <div className="card-body py-2">
            <h6 className="card-title text-success mb-1">مكتملة</h6>
            <h4 className="mb-0">{completedCount}</h4>
          </div>
        </div>
      </div>
      <div className="col-4">
        <div className="card bg-light">
          <div className="card-body py-2">
            <h6 className="card-title text-warning mb-1">متبقية</h6>
            <h4 className="mb-0">{pendingCount}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoStats;