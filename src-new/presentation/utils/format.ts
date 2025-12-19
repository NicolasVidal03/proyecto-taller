export function formatRole(role?: string | null) {
  if (!role) return 'Sin rol';
  return role.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
