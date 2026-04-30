import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: '',
    priority: 'medium'
  });
  const [memberForm, setMemberForm] = useState({ email: '', role: 'member' });

  const currentMember = project?.members?.find((member) => String(member.id) === String(user?.id));
  const isProjectAdmin = user?.role === 'admin' || currentMember?.role === 'admin';

  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load project');
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tasks');
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
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/members`, memberForm);
      toast.success('Member added!');
      setMemberForm({ email: '', role: 'member' });
      setShowMemberForm(false);
      fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status });
      toast.success('Status updated!');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      toast.success('Task deleted!');
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const deleteProject = async () => {
    const confirmed = window.confirm('Delete this project and all its tasks?');
    if (!confirmed) return;

    try {
      await API.delete(`/projects/${id}`);
      toast.success('Project deleted!');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const canUpdateStatus = (task) => {
    return isProjectAdmin || String(task.assigned_to) === String(user?.id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        {project && (
          <>
            <div className="bg-white p-6 rounded-xl shadow mb-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-600">{project.name}</h2>
                  <p className="text-gray-500 mt-1">{project.description}</p>
                </div>
                {isProjectAdmin && (
                  <button
                    onClick={deleteProject}
                    className="self-start bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100"
                  >
                    Delete Project
                  </button>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="font-semibold text-sm text-gray-600">Team Members</h4>
                  {isProjectAdmin && (
                    <button
                      onClick={() => setShowMemberForm(!showMemberForm)}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold hover:bg-blue-200"
                    >
                      + Add Member
                    </button>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {project.members?.map((member) => (
                    <span key={member.id} className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {member.name} ({member.role})
                    </span>
                  ))}
                </div>

                {isProjectAdmin && showMemberForm && (
                  <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-3 mt-4">
                    <input
                      type="email"
                      placeholder="Member email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
                    />
                    <select
                      value={memberForm.role}
                      onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                      className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                      Add
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tasks</h3>
              {isProjectAdmin && (
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  + Add Task
                </button>
              )}
            </div>

            {isProjectAdmin && showTaskForm && (
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                      value={taskForm.assigned_to}
                      onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                      className="border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      required
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

            {tasks.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-400">No tasks yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-white p-4 rounded-xl shadow flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold
                          ${task.priority === 'high' ? 'bg-red-100 text-red-600' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'}`}>
                          {task.priority}
                        </span>
                        {task.assigned_to_name && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {task.assigned_to_name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="border text-sm px-2 py-1 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                        disabled={!canUpdateStatus(task)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      {isProjectAdmin && (
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Delete
                        </button>
                      )}
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
