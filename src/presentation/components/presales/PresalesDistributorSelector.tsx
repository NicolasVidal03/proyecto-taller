import { User } from "@domain/entities";
import { useEffect, useMemo, useState } from "react";

type DistributorSelectorProps = {
    users: User[];
    onSelect: (user: User) => void;
    initialUser?: User | null;
};

const PresalesDistributorSelector: React.FC<DistributorSelectorProps> = ({ 
    users, 
    onSelect, 
    initialUser 
}) => {
    const [search, setSearch] = useState(
        initialUser ? `${initialUser.names} ${initialUser.lastName}` : ''  // ← valor inicial
    );
    const [selectedId, setSelectedId] = useState<number | null>(
        initialUser?.id ?? null  // ← id inicial
    );
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (initialUser) {
            setSearch(`${initialUser.names} ${initialUser.lastName}`);
            setSelectedId(initialUser.id);
        }
    }, [initialUser?.id]);  // ← se actualiza cuando llega el usuario

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

    return (
        <div className="flex-1 max-w-md relative">
            <input
                type="text"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                    if (!e.target.value) setSelectedId(null);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Buscar por nombre..."
                className="input-plain w-full"
            />
            {showDropdown && filtered.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl bg-white border border-lead-200 shadow-lg">
                    {filtered.map((user) => (
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
                            <p className="text-xs text-lead-500">@{user.userName} • {user.role}</p>
                        </button>
                    ))}
                </div>
            )}
            {showDropdown && filtered.length === 0 && search && (
                <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-lead-200 shadow-lg p-4">
                    <p className="text-sm text-lead-500 text-center">No se encontraron transportistas</p>
                </div>
            )}
            {showDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            )}
        </div>
    );
};

export default PresalesDistributorSelector;