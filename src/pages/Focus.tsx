
import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useTasks } from '../utils/api';

interface Task {
  id: string;
  title: string;
  totalEstimatedTime?: number;
  isDone: boolean;
}

const Focus = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const { getTasks } = useTasks();

  useEffect(() => {
    loadTasks();
  }, []);

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
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60); // 25 minute focus
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

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
      setTimeLeft((task.totalEstimatedTime || 25) * 60);
    }
    setIsBreak(false);
    setIsRunning(true);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (selectedTask) {
      setTimeLeft((selectedTask.totalEstimatedTime || 25) * 60);
    } else {
      setTimeLeft(25 * 60);
    }
    setIsBreak(false);
  };

  const progress = selectedTask 
    ? (((selectedTask.totalEstimatedTime || 25) * 60 - timeLeft) / ((selectedTask.totalEstimatedTime || 25) * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

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

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-8">
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
      </div>

      {/* Task Selection */}
      {!isRunning && tasks.length > 0 && (
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
      {!isRunning && (
        <div className="text-center mt-8">
          <button
            onClick={() => startFocusSession()}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-colors"
          >
            Start 25min Focus Session
          </button>
        </div>
      )}
    </div>
  );
};

export default Focus;
