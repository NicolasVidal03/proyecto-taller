import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@modules/auth/providers/AuthProvider';
import { http } from '@shared/api/httpClient';

const SuperAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authorized = user?.role === 'super_admin';
  const [form, setForm] = useState({
    username: '',
    names: '',
    last_name: '',
    second_last_name: '',
    rol: 'admin',
    branch_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      await http.post('/users', {
        username: String(form.username),
        names: String(form.names),
        last_name: String(form.last_name),
        second_last_name: String(form.second_last_name || ''),
        rol: String(form.rol),
        branch_id: Number(form.branch_id),
      });
      setMessage('Usuario creado');
    } catch (err) {
      console.error('create user error', err);
      setMessage('Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="p-6">
        <p>No autorizado. Esta sección es solo para super_admin.</p>
        <button className="btn-primary mt-4" type="button" onClick={() => navigate('/users')}>
          Ir a Usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold">Panel Super Admin</h1>
      <p className="mb-6 text-sm text-gray-600">Crear usuarios con roles: admin, prevendedor, transportista.</p>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Usuario</label>
          <input
            className="input w-full"
            value={form.username}
            onChange={event => setForm({ ...form, username: event.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Nombres</label>
          <input
            className="input w-full"
            value={form.names}
            onChange={event => setForm({ ...form, names: event.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Apellido Paterno</label>
          <input
            className="input w-full"
            value={form.last_name}
            onChange={event => setForm({ ...form, last_name: event.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Apellido Materno</label>
          <input
            className="input w-full"
            value={form.second_last_name}
            onChange={event => setForm({ ...form, second_last_name: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Rol</label>
          <select
            className="input w-full"
            value={form.rol}
            onChange={event => setForm({ ...form, rol: event.target.value })}
          >
            <option value="admin">admin</option>
            <option value="prevendedor">prevendedor</option>
            <option value="transportista">transportista</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Branch ID</label>
          <input
            type="number"
            className="input w-full"
            value={form.branch_id}
            onChange={event => setForm({ ...form, branch_id: Number(event.target.value) })}
            required
          />
        </div>
        <div className="md:col-span-2">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </div>
        {message ? <div className="md:col-span-2 mt-2 text-sm">{message}</div> : null}
      </form>
    </div>
  );
};

export default SuperAdminPage;
