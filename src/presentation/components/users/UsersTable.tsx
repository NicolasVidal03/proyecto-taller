import React from 'react';
import { User } from '../../../domain/entities/User';
import { BranchMap, getBranchName } from '../../utils/branchHelpers';
import { formatRole } from '../../utils/format';

type UsersTableProps = {
  users: User[];
  branchMap: BranchMap;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
  onResetPassword?: (user: User) => void;
  showResetButton?: boolean;
  busyUserId?: number | null;
};

const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  branchMap,
  onEdit, 
  onDeactivate, 
  onResetPassword, 
  showResetButton, 
  busyUserId 
}) => {
  const isEmpty = users.length === 0;

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
            <th className="w-40 px-4 py-4 text-center align-middle font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-lead-200">
          {isEmpty ? (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-lead-600" colSpan={6}>
                No hay usuarios para mostrar.
              </td>
            </tr>
          ) : users.map(user => {
            //const isProtected = user.role === 'super_admin';
            return (
              <tr key={user.id} className="transition-colors hover:bg-white">
                <td className="px-4 py-3 font-medium text-brand-900">{user.userName}</td>
                <td className="px-4 py-3 text-lead-600">
                  {user.names} {user.lastName} {user.secondLastName}
                </td>
                <td className="px-4 py-3 capitalize text-lead-600">{formatRole(user.role)}</td>
                <td className="px-4 py-3 text-lead-600">
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                    {getBranchName(branchMap, user.branchId)}
                  </span>
                </td>
                <td className="px-4 py-3 text-lead-600">{user.ci ?? '—'}</td>
                <td className="px-4 py-3 text-center align-middle">
                  <div className="flex items-center justify-center gap-2">
                    
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                      disabled={isBusy(user.id) }
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeactivate(user)}
                      className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                      disabled={isBusy(user.id)}
                    >
                      Eliminar
                    </button>
                    {showResetButton && onResetPassword ? (
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        className="rounded bg-lead-200 px-3 py-1.5 font-medium text-lead-800 transition hover:bg-lead-300 disabled:opacity-50"
                        disabled={isBusy(user.id)}
                      >
                        Resetear
                      </button>
                    ) : null}
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
