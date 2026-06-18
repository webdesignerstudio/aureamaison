// Role-Based Access Control (RBAC)
// 1:1 MODULES 16267–17266

export const roleDefinitions = {
  superadmin: {
    label: "Super Admin",
    permissions: ["*"],
  },
  owner: {
    label: "Eigenaar",
    permissions: ["orders.*", "leggers.*", "clients.*", "finance.*", "settings.*", "goedkeuringen.*"],
  },
  keyuser: {
    label: "Key User",
    permissions: ["orders.*", "leggers.read", "clients.read", "goedkeuringen.read"],
  },
  office: {
    label: "Office",
    permissions: ["orders.read", "clients.read", "finance.read"],
  },
  legger: {
    label: "Legger",
    permissions: ["klussen.read", "klussen.accept", "agenda.*", "aanbiedingen.read"],
  },
  client: {
    label: "Klant",
    permissions: ["orders.own", "offertes.own", "facturen.own"],
  },
} as const;

export type Role = keyof typeof roleDefinitions;

/**
 * Check of role een specifieke permission heeft
 */
export function hasPermission(role: string, permission: string): boolean {
  const roleDef = roleDefinitions[role as Role];
  if (!roleDef) return false;

  const perms = roleDef.permissions as readonly string[];

  // Wildcard: superadmin heeft alles
  if (perms.includes("*" as any)) return true;

  // Exact match
  if (perms.includes(permission as any)) return true;

  // Wildcard match (e.g., "orders.*" matches "orders.read")
  const [resource] = permission.split(".");
  if (perms.includes(`${resource}.*` as any)) return true;

  return false;
}

/**
 * Check of role een van meerdere permissions heeft
 */
export function hasAnyPermission(role: string, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check of role alle permissions heeft
 */
export function hasAllPermissions(role: string, permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * React component: conditional render op basis van permission
 */
export function PermissionGuard({
  role,
  permission,
  children,
}: {
  role: string;
  permission: string;
  children: React.ReactNode;
}): React.ReactNode {
  if (!hasPermission(role, permission)) {
    return null;
  }
  return children;
}

/**
 * Get role badge colors
 */
export function getRoleBadgeColors(role: string): { bg: string; text: string } {
  const colors: Record<Role, { bg: string; text: string }> = {
    superadmin: { bg: "rgba(168,85,247,.2)", text: "#a855f7" },
    owner: { bg: "rgba(198,165,107,.2)", text: "#C6A56B" },
    keyuser: { bg: "rgba(34,211,238,.2)", text: "#22d3ee" },
    office: { bg: "rgba(74,158,232,.2)", text: "#4a9ee8" },
    legger: { bg: "rgba(60,184,122,.2)", text: "#3CB87A" },
    client: { bg: "rgba(100,116,139,.2)", text: "#64748b" },
  };

  return colors[role as Role] || colors.client;
}
