import { User } from "@domain/entities";
import { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

type DistributorSelectorProps = {
    users: User[];
    onSelect: (user: User) => void;
    initialUser?: User | null;
    status: string;
};

const PresalesDistributorSelector: React.FC<DistributorSelectorProps> = ({
    users,
    onSelect,
    initialUser,
    status
}) => {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

    const inputRef = useRef<HTMLInputElement>(null);  // ← ref al input

    useEffect(() => {
        if (initialUser) {
            setSearch(`${initialUser.names} ${initialUser.lastName}`);
            setSelectedId(initialUser.id);
        }
    }, [initialUser?.id]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter(u => {
            const fullName = `${u.names} ${u.lastName} ${u.secondLastName}`.toLowerCase();
            return fullName.includes(term) || u.userName.toLowerCase().includes(term);
        });
    }, [users, search]);

    const handleSelect = (user: User) => {
        setSelectedId(user.id);
        setSearch(`${user.names} ${user.lastName}`);
        setShowDropdown(false);
        onSelect(user);
    };

    // Calcular posición del dropdown basado en el input
    const handleFocus = () => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
        setShowDropdown(true);
    };

    return (
        <div className="relative w-full">
            <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) setSelectedId(null);
                }}
                onFocus={handleFocus}
                placeholder="Asignar transportista..."
                className={`input-plain w-full transition-opacity 
                    ${status === 'pendiente'
                        ? 'opacity-100'
                        : 'opacity-60 cursor-not-allowed bg-lead-100'
                    }`}
                disabled={status === 'pendiente' ? false : true}
            />

            {/* Portal — se renderiza directo en el body */}
            {showDropdown && createPortal(
                <>
                    {/* Overlay para cerrar */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />

                    {/* Dropdown posicionado con las coordenadas del input */}
                    <div
                        className="absolute z-50 max-h-60 overflow-auto rounded-xl bg-white border border-lead-200 shadow-lg"
                        style={{
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            width: dropdownPos.width,
                        }}
                    >
                        {filtered.length > 0 ? (
                            filtered.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onClick={() => handleSelect(user)}
                                    className={`w-full text-left px-4 py-3 hover:bg-lead-50 transition-colors border-b border-lead-100 last:border-b-0 ${selectedId === user.id ? 'bg-brand-50 text-brand-700' : ''
                                        }`}
                                >
                                    <p className="font-medium text-sm text-lead-800">
                                        {user.names} {user.lastName} {user.secondLastName}
                                    </p>
                                    <p className="text-xs text-lead-500">
                                        @{user.userName} • {user.role}
                                    </p>
                                </button>
                            ))
                        ) : search ? (
                            <div className="p-4">
                                <p className="text-sm text-lead-500 text-center">
                                    No se encontraron transportistas
                                </p>
                            </div>
                        ) : null}
                    </div>
                </>,
                document.body  // ← se monta fuera de la tabla
            )}
        </div>
    );
};

export default PresalesDistributorSelector;