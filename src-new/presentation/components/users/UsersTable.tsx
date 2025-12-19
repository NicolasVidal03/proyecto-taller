import React from 'react';
import { User } from '../../../domain/entities/User';
import { formatRole } from '../../utils/format';

type UsersTableProps = {
  users: User[];
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
  busyUserId?: number | null;
};

const UsersTable: React.FC<UsersTableProps> = ({ users, onEdit, onDeactivate, busyUserId }) => {
  if (!users.length) {
    return (
      <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
        No hay usuarios cargados todavía.
      </div>
    );
  }

  const isBusy = (id: number) => busyUserId != null && busyUserId === id;

  return (
    <div className="overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-4 text-left font-semibold">Usuario</th>
            <th className="px-4 py-4 text-left font-semibold">Nombre</th>
            <th className="px-4 py-4 text-left font-semibold">Rol</th>
            <th className="px-4 py-4 text-left font-semibold">Sucursal</th>
            <th className="px-4 py-4 text-left font-semibold">CI</th>
            <th className="w-40 px-4 py-4 text-left font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {users.map(user => {
            const isProtected = user.role === 'super_admin';
            return (
              <tr key={user.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900">{user.username}</td>
                <td className="px-4 py-3 text-lead-600">
                  {user.names} {user.lastName} {user.secondLastName}
                </td>
                <td className="px-4 py-3 capitalize text-lead-600">{formatRole(user.role)}</td>
                <td className="px-4 py-3 text-lead-600">{user.branchId ?? '—'}</td>
                <td className="px-4 py-3 text-lead-600">{user.ci ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      disabled={isBusy(user.id) || isProtected}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeactivate(user)}
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                      disabled={isBusy(user.id) || !user.state || isProtected}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
