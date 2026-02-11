export function formatRole(role?: string | null) {
  if (!role) return 'Sin rol';
  // Custom mappings for Spanish-friendly labels
  const map: Record<string, string> = {
    propietario: 'Propietario',
    administrador: 'Administrador',
    prevendedor: 'Prevendedor',
    transportista: 'Transportista',
  };
  if (role in map) return map[role as keyof typeof map];
  return role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
