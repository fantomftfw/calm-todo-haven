
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Calendar, CheckCircle, Circle, Mic, Inbox } from 'lucide-react';
import { useTasks } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
import VoiceAssistantModal from '../components/VoiceAssistantModal';
import DateHeader from '../components/DateHeader';
import WeekView from '../components/WeekView';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  isDone: boolean;
  totalEstimatedTime?: number;
  subTasks?: any[];
  createdAt?: string;
  order?: number;
}

const Home = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeekView, setShowWeekView] = useState(false);
  const [currentView, setCurrentView] = useState<'calendar' | 'inbox'>('calendar');
  const { user } = useAuth();
  const { getTasks, toggleTask, reorderTasks } = useTasks();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      // Sort tasks by creation order and schedule
      const sortedTasks = (data || []).sort((a: Task, b: Task) => {
        // First, separate scheduled vs unscheduled tasks
        const aHasSchedule = !!(a.date || a.time);
        const bHasSchedule = !!(b.date || b.time);
        
        if (aHasSchedule && !bHasSchedule) return -1; // Scheduled tasks first
        if (!aHasSchedule && bHasSchedule) return 1;
        
        // Within the same category, sort by order or creation time
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        
        // Fallback to creation time (newest first for unscheduled)
        if (!aHasSchedule && !bHasSchedule) {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        
        // For scheduled tasks, sort by date/time
        if (aHasSchedule && bHasSchedule) {
          const aDateTime = new Date(`${a.date || '1970-01-01'} ${a.time || '00:00'}`);
          const bDateTime = new Date(`${b.date || '1970-01-01'} ${b.time || '00:00'}`);
          return aDateTime.getTime() - bDateTime.getTime();
        }
        
        return 0;
      });
      
      setTasks(sortedTasks);
      console.log('Loaded tasks:', sortedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTask(taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isDone: !task.isDone } : task
      ));
      toast({
        title: "Success",
        description: "Task updated successfully",
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

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const todoTasks = getFilteredTasks().filter(task => !task.isDone);
    const allDayTasks = todoTasks.filter(task => !task.date && !task.time);
    
    const reorderedTasks = Array.from(allDayTasks);
    const [reorderedItem] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, reorderedItem);

    try {
      await reorderTasks(reorderedTasks.map(task => task.id));
      loadTasks(); // Reload to get the updated order
    } catch (error) {
      console.error('Failed to reorder tasks:', error);
      toast({
        title: "Error",
        description: "Failed to reorder tasks",
        variant: "destructive",
      });
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowWeekView(false);
    setCurrentView('calendar');
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  };

  const isSelectedDate = (taskDate: string) => {
    if (!taskDate) return false;
    const task = new Date(taskDate);
    return task.toDateString() === selectedDate.toDateString();
  };

  const getFilteredTasks = () => {
    if (currentView === 'inbox') {
      // Show only tasks without dates
      return tasks.filter(task => !task.date);
    } else {
      // Show only tasks for the selected date
      return tasks.filter(task => task.date && isSelectedDate(task.date));
    }
  };

  const filteredTasks = getFilteredTasks();
  const todoTasks = filteredTasks.filter(task => !task.isDone);
  const doneTasks = filteredTasks.filter(task => task.isDone);
  
  // Sort scheduled tasks by time
  const scheduledTasks = todoTasks.filter(task => task.date || task.time).sort((a, b) => {
    const aDateTime = new Date(`${a.date || '1970-01-01'} ${a.time || '00:00'}`);
    const bDateTime = new Date(`${b.date || '1970-01-01'} ${b.time || '00:00'}`);
    return aDateTime.getTime() - bDateTime.getTime();
  });
  
  const allDayTasks = todoTasks.filter(task => !task.date && !task.time);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Good morning, {user?.name || 'there'}! 👋
        </h1>
        <p className="text-gray-600">Let's make today productive</p>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setCurrentView('calendar')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            currentView === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="mr-2" size={16} />
          Calendar
        </button>
        <button
          onClick={() => setCurrentView('inbox')}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            currentView === 'inbox'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Inbox className="mr-2" size={16} />
          Inbox ({tasks.filter(task => !task.date).length})
        </button>
      </div>

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <>
          {/* Date Header */}
          <DateHeader 
            selectedDate={selectedDate}
            isExpanded={showWeekView}
            onToggle={() => setShowWeekView(!showWeekView)}
          />

          {/* Week View */}
          {showWeekView && (
            <WeekView
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onWeekChange={handleWeekChange}
            />
          )}
        </>
      )}

      {/* Inbox View Header */}
      {currentView === 'inbox' && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Inbox className="mr-2 text-blue-500" size={20} />
            Inbox
          </h2>
          <p className="text-gray-600 text-sm mt-1">Tasks without scheduled dates</p>
        </div>
      )}

      {/* To Do Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Circle className="mr-2 text-blue-500" size={20} />
          To Do ({todoTasks.length})
        </h2>

        {/* Scheduled Tasks (only in calendar view) */}
        {currentView === 'calendar' && scheduledTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onToggle={handleToggleTask}
          />
        ))}

        {/* All-Day Tasks (Draggable) - only in inbox view */}
        {currentView === 'inbox' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-day-tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {allDayTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? 'opacity-75' : ''}`}
                        >
                          <TaskCard 
                            task={task} 
                            onToggle={handleToggleTask}
                            isDraggable={true}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {todoTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Circle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>
              {currentView === 'inbox' 
                ? 'No unscheduled tasks yet!'
                : 'No tasks for this date. Add one to get started!'
              }
            </p>
          </div>
        )}
      </div>

      {/* Done Section */}
      {doneTasks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="mr-2 text-green-500" size={20} />
            Done ({doneTasks.length})
          </h2>
          {doneTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggle={handleToggleTask}
            />
          ))}
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 flex flex-col space-y-3">
        {/* Voice Assistant Button */}
        <button
          onClick={() => setShowVoiceModal(true)}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <Mic size={24} />
        </button>
        
        {/* Add Task Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Modals */}
      <AddTaskModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskAdded={loadTasks}
      />

      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onTasksCreated={loadTasks}
      />
    </div>
  );
};

export default Home;
