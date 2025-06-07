
const BASE_URL = 'https://31feebf7-e5df-4a20-a48c-e4773ab3e301-00-2bs1z8i4q1q1g.janeway.replit.dev';

interface ApiCallOptions {
  method?: string;
  body?: any;
  token?: string | null;
}

export const apiCall = async (endpoint: string, options: ApiCallOptions = {}) => {
  const { method = 'GET', body, token } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const useTasks = () => {
  const token = localStorage.getItem('token');
  
  const getTasks = () => apiCall('/api/tasks', { token });
  const getTask = (id: string) => apiCall(`/api/tasks/${id}`, { token });
  const createTask = (taskData: any) => apiCall('/api/tasks', { method: 'POST', body: taskData, token });
  const updateTask = (id: string, taskData: any) => apiCall(`/api/tasks/${id}`, { method: 'PUT', body: taskData, token });
  const deleteTask = (id: string) => apiCall(`/api/tasks/${id}`, { method: 'DELETE', token });
  const toggleTask = (id: string) => apiCall(`/api/tasks/${id}/toggle`, { method: 'PATCH', token });
  const reorderTasks = (taskIds: string[]) => apiCall('/api/tasks/reorder', { method: 'POST', body: { taskIds }, token });
  const breakdownTask = (id: string) => apiCall(`/api/tasks/${id}/breakdown`, { method: 'POST', token });

  return {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    breakdownTask,
  };
};
