import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Clock, Calendar, CheckCircle, Circle } from 'lucide-react';
import { useTasks } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import TaskCard from '../components/TaskCard';
import AddTaskModal from '../components/AddTaskModal';
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
}

const Home = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();
  const { getTasks, toggleTask, reorderTasks } = useTasks();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks();
      // API returns tasks directly as an array
      setTasks(data || []);
      console.log('Loaded tasks:', data);
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

    const todoTasks = tasks.filter(task => !task.isDone);
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

  const todoTasks = tasks.filter(task => !task.isDone);
  const doneTasks = tasks.filter(task => task.isDone);
  const scheduledTasks = todoTasks.filter(task => task.date || task.time);
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

      {/* To Do Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Circle className="mr-2 text-blue-500" size={20} />
          To Do ({todoTasks.length})
        </h2>

        {/* Scheduled Tasks */}
        {scheduledTasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onToggle={handleToggleTask}
          />
        ))}

        {/* All-Day Tasks (Draggable) */}
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

        {todoTasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Circle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No tasks yet. Add one to get started!</p>
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

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        <Plus size={24} />
      </button>

      {/* Add Task Modal */}
      <AddTaskModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onTaskAdded={loadTasks}
      />
    </div>
  );
};

export default Home;
