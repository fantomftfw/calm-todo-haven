
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, CheckCircle, Circle, GripVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  isDone: boolean;
  totalEstimatedTime?: number;
  subtasks?: any[];
}

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  isDraggable?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, isDraggable = false }) => {
  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md ${
      task.isDone ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start space-x-3">
        {/* Drag Handle */}
        {isDraggable && !task.isDone && (
          <div className="text-gray-400 mt-1">
            <GripVertical size={16} />
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 transition-colors duration-200 ${
            task.isDone ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'
          }`}
        >
          {task.isDone ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>

        {/* Task Content */}
        <Link to={`/tasks/${task.id}`} className="flex-1 min-w-0">
          <div>
            <h3 className={`font-medium text-gray-800 mb-1 ${
              task.isDone ? 'line-through' : ''
            }`}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`text-sm text-gray-600 mb-2 ${
                task.isDone ? 'line-through' : ''
              }`}>
                {task.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {task.date && (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{formatDate(task.date)}</span>
                </div>
              )}
              
              {task.time && (
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatTime(task.time)}</span>
                </div>
              )}

              {task.totalEstimatedTime && (
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{task.totalEstimatedTime}m</span>
                </div>
              )}

              {task.subtasks && task.subtasks.length > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {task.subtasks.length} subtasks
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TaskCard;
