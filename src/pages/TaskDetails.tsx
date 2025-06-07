import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Play, Trash2, Edit, CheckCircle, Circle, Brain } from 'lucide-react';
import { useTasks } from '../utils/api';
import { toast } from '@/hooks/use-toast';
import EditTaskModal from '../components/EditTaskModal';
import Confetti from 'react-confetti';

interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  isDone: boolean;
  totalEstimatedTime?: number;
  subTasks?: any[];
}

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { getTask, toggleTask, deleteTask, breakdownTask } = useTasks();

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  useEffect(() => {
    // Show confetti when task is newly completed
    if (task?.isDone) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [task?.isDone]);

  const loadTask = async () => {
    if (!id) return;
    
    try {
      const taskData = await getTask(id);
      setTask(taskData);
      console.log('Loaded task:', taskData);
    } catch (error) {
      console.error('Failed to load task:', error);
      toast({
        title: "Error",
        description: "Failed to load task",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!task) return;
    
    try {
      await toggleTask(task.id);
      setTask(prev => prev ? { ...prev, isDone: !prev.isDone } : null);
      toast({
        title: "Success",
        description: task.isDone ? "Task marked as todo" : "Task completed!",
      });
    } catch (error) {
      console.error('Failed to toggle task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(task.id);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleBreakdown = async () => {
    if (!task) return;
    
    setBreakdownLoading(true);
    try {
      const result = await breakdownTask(task.id);
      console.log('Breakdown result:', result);
      // The API returns the updated task data with subTasks
      setTask(prev => prev ? { 
        ...prev, 
        subTasks: result.subTasks || result.subtasks || [],
        totalEstimatedTime: result.totalEstimatedTime || prev.totalEstimatedTime 
      } : null);
      toast({
        title: "Success",
        description: "Task broken down successfully",
      });
    } catch (error) {
      console.error('Failed to breakdown task:', error);
      toast({
        title: "Error",
        description: "Failed to breakdown task",
        variant: "destructive",
      });
    } finally {
      setBreakdownLoading(false);
    }
  };

  const calculateTotalEstimatedTime = () => {
    if (!task?.subTasks || task.subTasks.length === 0) {
      return task?.totalEstimatedTime || 0;
    }
    
    const subtaskTotal = task.subTasks.reduce((total, subtask) => {
      return total + (subtask.estimatedTime || 0);
    }, 0);
    
    return subtaskTotal || task?.totalEstimatedTime || 0;
  };

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
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading task...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Task not found</p>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Go back to tasks
          </Link>
        </div>
      </div>
    );
  }

  const totalEstimatedTime = calculateTotalEstimatedTime();

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Task Details</h1>
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-w-lg mx-auto">
          {/* Task Header */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            <div className="flex items-start space-x-4 mb-4">
              <button
                onClick={handleToggle}
                className={`mt-1 transition-colors duration-200 ${
                  task.isDone ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'
                }`}
              >
                {task.isDone ? <CheckCircle size={24} /> : <Circle size={24} />}
              </button>
              
              <div className="flex-1">
                <h2 className={`text-xl font-bold text-gray-800 mb-2 ${
                  task.isDone ? 'line-through' : ''
                }`}>
                  {task.title}
                </h2>
                
                {task.description && (
                  <p className={`text-gray-600 mb-4 ${
                    task.isDone ? 'line-through' : ''
                  }`}>
                    {task.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="space-y-2">
                  {task.date && (
                    <div className="flex items-center text-gray-500">
                      <Calendar size={16} className="mr-2" />
                      <span>{formatDate(task.date)}</span>
                    </div>
                  )}
                  
                  {task.time && (
                    <div className="flex items-center text-gray-500">
                      <Clock size={16} className="mr-2" />
                      <span>{formatTime(task.time)}</span>
                    </div>
                  )}

                  {totalEstimatedTime > 0 && (
                    <div className="flex items-center text-gray-500">
                      <Clock size={16} className="mr-2" />
                      <span>Total estimated: {totalEstimatedTime} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {totalEstimatedTime > 0 && (
                <Link
                  to={`/focus?task=${task.id}`}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Play size={16} className="mr-2" />
                  Focus
                </Link>
              )}
              <button 
                onClick={() => setShowEditModal(true)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Subtasks</h3>
              {!task.subTasks || task.subTasks.length === 0 ? (
                <button
                  onClick={handleBreakdown}
                  disabled={breakdownLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Brain size={16} className="mr-2" />
                  {breakdownLoading ? 'Breaking down...' : 'AI Breakdown'}
                </button>
              ) : null}
            </div>

            {task.subTasks && task.subTasks.length > 0 ? (
              <div className="space-y-3">
                {task.subTasks.map((subtask, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-2xl">
                    <Circle size={16} className="text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{subtask.title}</p>
                      {subtask.description && (
                        <p className="text-gray-600 text-sm mt-1">{subtask.description}</p>
                      )}
                      {subtask.estimatedTime && (
                        <p className="text-gray-500 text-xs mt-1">{subtask.estimatedTime} min</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Brain size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="mb-2">No subtasks yet</p>
                <p className="text-sm">Use AI to break this task down into smaller steps</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Task Modal */}
        <EditTaskModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          task={task}
          onTaskUpdated={loadTask}
        />
      </div>
    </>
  );
};

export default TaskDetails;
