import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import toast, { Toaster } from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (err) {
      toast.error('Failed to load projects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', form);
      toast.success('Project created!');
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">+ New Project</button>
        </div>
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border px-4 py-2 rounded-lg" required />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border px-4 py-2 rounded-lg" rows={3} />
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </form>
          </div>
        )}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-400 text-lg">No projects yet!</p>
            <p className="text-gray-400 text-sm mt-1">Click "New Project" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link to={`/projects/${project.id}`} key={project.id} className="bg-white p-6 rounded-xl shadow hover:shadow-md transition block">
                <h3 className="text-lg font-bold text-blue-600">{project.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{project.description}</p>
                <p className="text-xs text-gray-400 mt-3">Created: {new Date(project.created_at).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;