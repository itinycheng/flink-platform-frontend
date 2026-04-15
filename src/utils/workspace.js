const WorkspaceKey = 'platform_workspace_id'

export function getWorkspaceId() {
  const id = localStorage.getItem(WorkspaceKey)
  return id ? Number(id) : null
}

export function setWorkspaceId(id) {
  localStorage.setItem(WorkspaceKey, id)
}

export function removeWorkspaceId() {
  localStorage.removeItem(WorkspaceKey)
}
