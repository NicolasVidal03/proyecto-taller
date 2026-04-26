import React from 'react';
import { User } from '../../../domain/entities/User';
import { BranchMap, getBranchName } from '../../utils/branchHelpers';
import { formatRole } from '../../utils/format';

function canManageUser(actorRole: string, targetRole: string): boolean {
  if (actorRole === 'gerente')       return targetRole !== 'gerente';
  if (actorRole === 'administrador') return targetRole === 'prevendedor' || targetRole === 'transportista';
  return false;
}

type UsersTableProps = {
  users: User[];
  branchMap: BranchMap;
  currentUserRole: string;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
  onResetPassword?: (user: User) => void;
  showResetButton?: boolean;
  busyUserId?: number | null;
};

const roleBadgeCls = (role: string) => {
  if (role === 'gerente')       return 'bg-purple-100 text-purple-800';
  if (role === 'administrador') return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
};

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  branchMap,
  currentUserRole,
  onEdit,
  onDeactivate,
  onResetPassword,
  showResetButton,
  busyUserId,
}) => {
  const isEmpty  = users.length === 0;
  const isBusy   = (id: number) => busyUserId != null && busyUserId === id;

  if (isEmpty) {
    return (
      <div className="rounded-lg border border-lead-200 bg-lead-50 px-4 py-8 text-center text-sm text-lead-500 shadow-lg">
        No hay usuarios para mostrar.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {users.map(user => {
          const canManage = canManageUser(currentUserRole, user.role);
          const busy      = isBusy(user.id);

          return (
            <div
              key={user.id}
              className="rounded-xl border border-lead-200 bg-lead-50 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-brand-900">
                    {user.lastName}{user.secondLastName ? ` ${user.secondLastName}` : ''}, {user.names}
                  </p>
                  <p className="text-xs text-lead-500">@{user.userName}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeCls(user.role)}`}>
                  {formatRole(user.role)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-lead-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">
                  🏢 {getBranchName(branchMap, user.branchId)}
                </span>
                {user.ci && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lead-100 px-2.5 py-1 font-medium text-lead-700">
                    CI: {user.ci}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {canManage ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      disabled={busy}
                      className="flex-1 rounded-lg bg-brand-100 px-3 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeactivate(user)}
                      disabled={busy}
                      className="flex-1 rounded-lg bg-accent-100 px-3 py-2 text-xs font-semibold text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                    {showResetButton && onResetPassword && (
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        disabled={busy}
                        className="flex-1 rounded-lg bg-lead-200 px-3 py-2 text-xs font-semibold text-lead-800 transition hover:bg-lead-300 disabled:opacity-50"
                      >
                        Resetear
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-lead-400 italic">Sin permisos</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-lead-200 bg-lead-50 shadow-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-600 text-xs uppercase tracking-wider text-white">
            <tr>
              <th className="px-4 py-4 text-left font-semibold">Usuario</th>
              <th className="px-4 py-4 text-left font-semibold">Nombre</th>
              <th className="px-4 py-4 text-left font-semibold">Rol</th>
              <th className="px-4 py-4 text-left font-semibold">Sucursal</th>
              <th className="px-4 py-4 text-left font-semibold">CI</th>
              <th className="w-40 px-4 py-4 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lead-200">
            {users.map(user => {
              const canManage = canManageUser(currentUserRole, user.role);
              const busy      = isBusy(user.id);

              return (
                <tr key={user.id} className="transition-colors hover:bg-white">
                  <td className="px-4 py-3 font-medium text-brand-900">{user.userName}</td>
                  <td className="px-4 py-3 text-lead-600">
                    <span>{user.lastName}{user.secondLastName ? ` ${user.secondLastName}` : ''},</span>
                    <span className="ml-1">{user.names}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeCls(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {getBranchName(branchMap, user.branchId)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-lead-600">{user.ci ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {canManage ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(user)}
                            disabled={busy}
                            className="rounded bg-brand-100 px-3 py-1.5 font-medium text-brand-700 transition hover:bg-brand-200 disabled:opacity-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeactivate(user)}
                            disabled={busy}
                            className="rounded bg-accent-100 px-3 py-1.5 font-medium text-accent-700 transition hover:bg-accent-200 disabled:opacity-50"
                          >
                            Eliminar
                          </button>
                          {showResetButton && onResetPassword && (
                            <button
                              type="button"
                              onClick={() => onResetPassword(user)}
                              disabled={busy}
                              className="rounded bg-lead-200 px-3 py-1.5 font-medium text-lead-800 transition hover:bg-lead-300 disabled:opacity-50"
                            >
                              Resetear
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-lead-400 italic">Sin permisos</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UsersTable;