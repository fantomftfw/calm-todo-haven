
import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Clock } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTasks } from '../utils/api';
import { toast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  totalEstimatedTime?: number;
  isDone: boolean;
  subTasks?: any[];
}

const Focus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('task');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // Default 10 minutes
  const [originalTime, setOriginalTime] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showTimeControls, setShowTimeControls] = useState(false);
  const { getTasks, getTask } = useTasks();

  useEffect(() => {
    if (taskId) {
      loadSpecificTask();
    } else {
      loadTasks();
    }
  }, [taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Auto-start break or focus
      if (!isBreak) {
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 minute break
        setOriginalTime(5 * 60);
      } else {
        setIsBreak(false);
        const newTime = selectedTask ? (selectedTask.totalEstimatedTime || 10) * 60 : 10 * 60;
        setTimeLeft(newTime);
        setOriginalTime(newTime);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, selectedTask]);

  const loadSpecificTask = async () => {
    if (!taskId) return;
    
    try {
      const taskData = await getTask(taskId);
      setSelectedTask(taskData);
      const estimatedTime = (taskData.totalEstimatedTime || 10) * 60;
      setTimeLeft(estimatedTime);
      setOriginalTime(estimatedTime);
      console.log('Loaded task for focus:', taskData);
    } catch (error) {
      console.error('Failed to load task:', error);
      toast({
        title: "Error",
        description: "Failed to load task",
        variant: "destructive",
      });
      navigate('/focus');
    }
  };

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      const todoTasks = (data.tasks || []).filter((task: Task) => !task.isDone);
      setTasks(todoTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startFocusSession = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      const estimatedTime = (task.totalEstimatedTime || 10) * 60;
      setTimeLeft(estimatedTime);
      setOriginalTime(estimatedTime);
    }
    setIsBreak(false);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(originalTime);
    setIsBreak(false);
  };

  const addTwoMinutes = () => {
    setTimeLeft(prev => prev + 2 * 60);
    setOriginalTime(prev => prev + 2 * 60);
  };

  const adjustTime = (minutes: number) => {
    const newTime = Math.max(60, originalTime + minutes * 60); // Minimum 1 minute
    setOriginalTime(newTime);
    if (!isRunning) {
      setTimeLeft(newTime);
    }
  };

  const setCustomTime = (minutes: number) => {
    const newTime = minutes * 60;
    setOriginalTime(newTime);
    setTimeLeft(newTime);
    setShowTimeControls(false);
  };

  const progress = originalTime > 0 
    ? ((originalTime - timeLeft) / originalTime) * 100
    : 0;

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {isBreak ? '☕ Break Time' : '🎯 Focus Session'}
        </h1>
        <p className="text-gray-600">
          {selectedTask ? `Working on: ${selectedTask.title}` : 'Choose a task to focus on'}
        </p>
      </div>

      {/* Timer Circle */}
      <div className="relative mx-auto mb-8 w-64 h-64">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={isBreak ? "text-green-500" : "text-blue-500"}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        
        {/* Timer Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-500">
              {isBreak ? 'Break' : 'Focus'}
            </div>
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowTimeControls(!showTimeControls)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center mx-auto mb-4"
        >
          <Clock size={16} className="mr-1" />
          Adjust Timer
        </button>

        {showTimeControls && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={() => adjustTime(-5)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-medium min-w-[100px]">
                {Math.round(originalTime / 60)} min
              </span>
              <button
                onClick={() => adjustTime(5)}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="flex space-x-2 justify-center">
              {[10, 15, 25, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => setCustomTime(mins)}
                  className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
            isRunning 
              ? 'bg-orange-500 hover:bg-orange-600' 
              : isBreak 
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button
          onClick={resetTimer}
          className="w-16 h-16 rounded-full bg-gray-500 hover:bg-gray-600 text-white flex items-center justify-center transition-all duration-200"
        >
          <RotateCcw size={24} />
        </button>

        <button
          onClick={addTwoMinutes}
          className="w-16 h-16 rounded-full bg-purple-500 hover:bg-purple-600 text-white flex items-center justify-center transition-all duration-200"
          title="Add 2 minutes"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Subtasks */}
      {selectedTask?.subTasks && selectedTask.subTasks.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Subtasks</h3>
          <div className="space-y-3">
            {selectedTask.subTasks.map((subtask, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-2xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{subtask.title}</p>
                  {subtask.description && (
                    <p className="text-gray-600 text-sm mt-1">{subtask.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Selection */}
      {!taskId && !isRunning && tasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Choose a task to focus on:
          </h3>
          <div className="space-y-2">
            {tasks.slice(0, 5).map(task => (
              <button
                key={task.id}
                onClick={() => startFocusSession(task)}
                className={`w-full p-4 text-left bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 ${
                  selectedTask?.id === task.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="font-medium text-gray-800">{task.title}</div>
                {task.totalEstimatedTime && (
                  <div className="text-sm text-gray-500 mt-1">
                    {task.totalEstimatedTime} minutes
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Start */}
      {!taskId && !isRunning && (
        <div className="text-center mt-8">
          <button
            onClick={() => startFocusSession()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors"
          >
            Start 10min Focus Session
          </button>
        </div>
      )}
    </div>
  );
};

export default Focus;
