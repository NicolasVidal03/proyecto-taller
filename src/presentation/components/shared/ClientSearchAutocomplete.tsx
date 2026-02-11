import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '../../../domain/entities/Client';
import { useDebounce } from '../../hooks/useDebounce';
import { container } from '../../../infrastructure/config/container';

interface ClientSearchAutocompleteProps {
  value: number | null;
  initialClientName?: string;
  onChange: (clientId: number | null, clientName: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * Componente de búsqueda con autocompletado para seleccionar clientes.
 * Muestra el nombre completo del cliente seleccionado y guarda el ID internamente.
 * 
 * Client entity: { id, name, lastName, secondLastName, phone, ci }
 */
const ClientSearchAutocomplete: React.FC<ClientSearchAutocompleteProps> = ({
  value,
  initialClientName = '',
  onChange,
  disabled = false,
  error,
  placeholder = 'Buscar cliente por nombre o apellido...',
}) => {
  const [inputValue, setInputValue] = useState(initialClientName);
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(inputValue, 300);

  // Función para obtener el nombre completo del cliente
  const getClientFullName = useCallback((client: Client): string => {
    return `${client.lastName} ${client.secondLastName} ${client.name}`.trim();
  }, []);

  // Cargar cliente inicial si hay un valor
  useEffect(() => {
    const loadInitialClient = async () => {
      if (value && !selectedClient) {
        try {
          const client = await container.clients.getById(value);
          if (client) {
            setSelectedClient(client);
            setInputValue(getClientFullName(client));
          }
        } catch (err) {
          console.error('Error cargando cliente inicial:', err);
        }
      }
    };
    loadInitialClient();
  }, [value, selectedClient, getClientFullName]);

  // Sincronizar inputValue con initialClientName cuando cambie
  useEffect(() => {
    if (initialClientName && !selectedClient) {
      setInputValue(initialClientName);
    }
  }, [initialClientName, selectedClient]);

  // Efecto para buscar cuando cambia el término de búsqueda
  useEffect(() => {
    const search = async () => {
      // No buscar si está deshabilitado o si el input está vacío
      if (disabled || !debouncedSearch.trim()) {
        setSuggestions([]);
        return;
      }

      // No buscar si el valor actual coincide con el cliente seleccionado
      if (selectedClient && debouncedSearch === getClientFullName(selectedClient)) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await container.clients.search({
          search: debouncedSearch,
          limit: 10,
        });
        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        console.error('Error buscando clientes:', err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedSearch, disabled, selectedClient, getClientFullName]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Si el usuario borra el input, limpiar la selección
    if (!newValue.trim()) {
      setSelectedClient(null);
      onChange(null, '');
    } else if (selectedClient && newValue !== getClientFullName(selectedClient)) {
      // Si el usuario modifica el texto después de seleccionar, limpiar selección
      setSelectedClient(null);
      onChange(null, '');
    }
  };

  const handleSelectClient = (client: Client) => {
    const fullName = getClientFullName(client);
    setSelectedClient(client);
    setInputValue(fullName);
    setSuggestions([]);
    setIsOpen(false);
    onChange(client.id, fullName);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && !selectedClient) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedClient(null);
    setSuggestions([]);
    setIsOpen(false);
    onChange(null, '');
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm pr-10 ${
            error ? 'border-red-500' : 'border-lead-300 bg-white'
          } ${disabled ? 'bg-lead-100 cursor-not-allowed' : ''}`}
        />
        
        {/* Indicador de carga */}
        {isLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-4 w-4 text-lead-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}

        {/* Botón limpiar */}
        {inputValue && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-lead-400 hover:text-lead-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Indicador de seleccionado */}
        {selectedClient && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-lead-200 bg-white shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => handleSelectClient(client)}
              className="w-full px-4 py-3 text-left hover:bg-lead-50 transition-colors border-b border-lead-100 last:border-b-0"
            >
              <div className="font-medium text-brand-900">
                {getClientFullName(client)}
              </div>
              <div className="text-xs text-lead-500 mt-0.5">
                {client.ci ? `CI: ${client.ci}` : 'Sin CI'}
                {client.phone && ` • Tel: ${client.phone}`}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isOpen && suggestions.length === 0 && debouncedSearch.trim() && !isLoading && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-lead-200 bg-white shadow-lg p-4 text-center text-sm text-lead-500">
          No se encontraron clientes con "{debouncedSearch}"
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      
      {/* Info del cliente seleccionado */}
      {selectedClient && (
        <p className="mt-1 text-xs text-green-600">
          ✓ Cliente seleccionado: ID #{selectedClient.id}
        </p>
      )}
    </div>
  );
};

export default ClientSearchAutocomplete;
