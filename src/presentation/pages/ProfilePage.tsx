import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useEffect } from 'react';
import { useBranches } from '../hooks/useBranches';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { getBranchNameById, branches, fetchBranches } = useBranches();

  // Ensure branches are loaded so names can be resolved
  React.useEffect(() => {
    if (!branches || branches.length === 0) {
      fetchBranches().catch(() => {});
    }
  }, [branches, fetchBranches]);

  if (!user) return <div className="p-6">No se encontró el usuario.</div>;

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: hero / avatar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl overflow-hidden shadow-lg">
            <div className="px-6 py-8 bg-gradient-to-br from-brand-900 via-accent-600 to-lead-700 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl font-bold">
                  {user.names ? user.names.charAt(0) : 'U'}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-white/80">Mi cuenta</p>
                  <h3 className="text-2xl font-bold">{user.names} {user.lastName}</h3>
                  <p className="mt-1 text-sm text-white/80">{user.role?.replace(/_/g, ' ')}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-lead-100 p-3 text-center">
                  <div className="text-sm text-lead-500">Sucursal</div>
                  <div className="mt-1 font-semibold text-lead-800">{getBranchNameById(user.branchId ?? null) || '-'}</div>
                </div>
                <div className="rounded-md border border-lead-100 p-3 text-center">
                  <div className="text-sm text-lead-500">Cédula</div>
                  <div className="mt-1 font-semibold text-lead-800">{user.ci}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white shadow-lg border border-lead-100 overflow-hidden">
            <div className="px-6 py-6 border-b border-lead-100 bg-gradient-to-r from-blue-50 via-accent-50 to-gray-50">
              <h2 className="text-lg font-bold text-lead-900">Detalles de la cuenta</h2>
              <p className="text-sm text-lead-500">Información personal visible en el sistema</p>
            </div>

            <div className="p-6">
              <div className="overflow-hidden rounded-md border border-lead-100">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-blue-600">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white rounded-tl-md">Detalle</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-white rounded-tr-md">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lead-100">
                    <tr className="bg-white">
                      <td className="px-6 py-4 font-semibold text-lead-700 w-1/3">Usuario</td>
                      <td className="px-6 py-4 text-lead-600">{user.userName}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-lead-700">Nombres</td>
                      <td className="px-6 py-4 text-lead-600">{user.names}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 font-semibold text-lead-700">Primer apellido</td>
                      <td className="px-6 py-4 text-lead-600">{user.lastName}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-lead-700">Segundo apellido</td>
                      <td className="px-6 py-4 text-lead-600">{user.secondLastName ?? '-'}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 font-semibold text-lead-700">Cédula (CI)</td>
                      <td className="px-6 py-4 text-lead-600">{user.ci}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-lead-700">Rol</td>
                      <td className="px-6 py-4 text-lead-600">{user.role?.replace(/_/g, ' ')}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="px-6 py-4 font-semibold text-lead-700">Sucursal</td>
                      <td className="px-6 py-4 text-lead-600">{getBranchNameById(user.branchId ?? null) || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
