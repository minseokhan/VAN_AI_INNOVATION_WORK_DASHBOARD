export function isAdmin(user: { role: string }): boolean {
  return user.role === "ADMIN";
}

export function canEditProject(user: { id: string; role: string }, memberUserIds: string[]): boolean {
  return isAdmin(user) || memberUserIds.includes(user.id);
}
