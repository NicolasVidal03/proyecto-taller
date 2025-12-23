import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../domain/entities/User';
import { useToast } from './shared/Toast';

type Props = {
  user: User | null;
  onViewProfile?: () => void;
  onChangePassword?: () => void;
  onLogout: () => void;
};

const UserDropdown: React.FC<Props> = ({ user, onViewProfile, onChangePassword, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const handleView = () => {
    setOpen(false);
    if (onViewProfile) return onViewProfile();
    navigate('/profile');
  };

  const handleChangePassword = () => {
    setOpen(false);
    if (onChangePassword) return onChangePassword();
    navigate('/change-password');
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await onLogout();
    } catch (err) {
      toast.error('Error cerrando sesión');
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200 focus:outline-none"
        aria-haspopup
        aria-expanded={open}
      >
        {user?.names ? user.names.charAt(0) : 'S'}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-white/10 shadow-lg z-50">
          <div className="py-2">
            <button onClick={handleView} className="w-full text-left px-4 py-2 text-sm hover:bg-lead-100">👤 Ver mis datos</button>
            <button onClick={handleChangePassword} className="w-full text-left px-4 py-2 text-sm hover:bg-lead-100">🔑 Cambiar contraseña</button>
            <div className="border-t border-lead-200 my-1" />
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-lead-100 text-rose-600">🚪 Cerrar Sesión</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
