import React from 'react';
import { Area } from '../../../domain/entities/Area';

interface AreaSelectProps {
  areas: Area[];
  value: number | null;
  onChange: (areaId: number | null) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

const AreaSelect: React.FC<AreaSelectProps> = ({ 
  areas, 
  value, 
  onChange, 
  disabled = false,
  required = false,
  placeholder = 'Seleccionar área'
}) => {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? null : Number(val));
      }}
      className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
      disabled={disabled}
      required={required}
    >
      <option value="">{placeholder}</option>
      {areas.map((area) => (
        <option key={area.id} value={area.id}>
          {area.name}
        </option>
      ))}
    </select>
  );
};

export default AreaSelect;
