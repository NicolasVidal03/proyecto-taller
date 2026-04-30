import React from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useBranches } from '../hooks/useBranches';

const MOBILE_APP_ROLES = ['prevendedor', 'transportista'];

const MobileAppBanner: React.FC<{ role: string }> = ({ role }) => {
  const roleLabel = role.replace(/_/g, ' ');
  const icon = role === 'transportista' ? '🚚' : '🧾';

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl shadow-inner">
          📱
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{icon}</span>
            <h3 className="text-base font-bold text-amber-900 capitalize">{roleLabel}</h3>
            <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-800">
              App móvil requerida
            </span>
          </div>
          <p className="mt-1.5 text-sm text-amber-800 leading-relaxed">
            Tu rol de <span className="font-semibold capitalize">{roleLabel}</span> está diseñado para
            usarse desde la <span className="font-semibold">aplicación móvil de SICME ELECTRIK</span>.
            Desde aquí solo puedes consultar tu perfil y cambiar tu contraseña.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Ver perfil
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Cambiar contraseña
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-800 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
              </svg>
              Funciones completas → App móvil
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { getBranchNameById, branches, fetchBranches } = useBranches();

  React.useEffect(() => {
    if (!branches || branches.length === 0) {
      fetchBranches().catch(() => {});
    }
  }, [branches, fetchBranches]);

  if (!user) return <div className="p-6">No se encontró el usuario.</div>;

  const isMobileRole = MOBILE_APP_ROLES.includes(user.role);

  return (
    <div className="p-6 space-y-6">
      {isMobileRole && <MobileAppBanner role={user.role} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

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
                  <p className="mt-1 text-sm text-white/80 capitalize">{user.role?.replace(/_/g, ' ')}</p>
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
                      <td className="px-6 py-4 text-lead-600 capitalize">{user.role?.replace(/_/g, ' ')}</td>
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