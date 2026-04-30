import { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, overdue: 0 });
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchMyTasks();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/tasks/dashboard');
      setStats(res.data);
    } catch (err) {
      toast.error('Failed to load stats');
    }
  };

  const fetchMyTasks = async () => {
    try {
      const res = await API.get('/tasks/my-tasks');
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/tasks/${id}/status`, { status });
      toast.success('Status updated!');
      fetchMyTasks();
      fetchStats();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Welcome back, {user?.name}!</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-gray-500 mt-1">Total Tasks</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-4xl font-bold text-green-500">{stats.completed}</p>
            <p className="text-gray-500 mt-1">Completed</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-4xl font-bold text-red-500">{stats.overdue}</p>
            <p className="text-gray-500 mt-1">Overdue</p>
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">My Tasks</h3>
          {tasks.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tasks assigned to you yet!</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border p-4 rounded-lg">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    {task.project_name && (
                      <p className="text-xs text-blue-500 mt-1">{task.project_name}</p>
                    )}
                    {task.due_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold
                      ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'}`}>
                      {task.priority}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="border text-sm px-2 py-1 rounded-lg"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
