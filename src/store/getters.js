// src/store/getters.js
const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  globalRole: state => state.user.globalRole,
  workspaceId: state => state.workspace.workspaceId,
  workspaceList: state => state.workspace.workspaceList,
  currentWorkspace: state => state.workspace.currentWorkspace
}
export default getters
