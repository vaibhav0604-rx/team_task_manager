import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', assigned_to: '', due_date: '', priority: 'medium'
  });

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, []);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      toast.error('Failed to load project');
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', { ...taskForm, project_id: id });
      toast.success('Task created!');
      setTaskForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
      setShowTaskForm(false);
      fetchTasks();
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Status updated!');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted!');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        {project && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <h2 className="text-2xl font-bold text-blue-600">{project.name}</h2>
              <p className="text-gray-500 mt-1">{project.description}</p>
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Team Members:</h4>
                <div className="flex gap-2 flex-wrap">
                  {project.members?.map((member) => (
                    <span key={member.id} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {member.name} ({member.role})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tasks</h3>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                + Add Task
              </button>
            </div>

            {/* Task Form */}
            {showTaskForm && (
              <div className="bg-white p-6 rounded-xl shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
                <form onSubmit={handleCreateTask} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Task Title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={2}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={taskForm.assigned_to}
                      onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                      className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Assign To...</option>
                      {project.members?.map((member) => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                      Create Task
                    </button>
                    <button type="button" onClick={() => setShowTaskForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-400">No tasks yet! Click "Add Task" to create one.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold
                          ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'}`}>
                          {task.priority}
                        </span>
                        {task.assigned_to_name && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            👤 {task.assigned_to_name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            📅 {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="border text-sm px-2 py-1 rounded-lg"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;