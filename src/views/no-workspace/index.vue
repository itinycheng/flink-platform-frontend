<template>
  <div class="no-workspace-container">
    <div class="no-workspace-box">
      <i class="el-icon-warning-outline icon" />
      <h2 class="title">No Workspace Available</h2>
      <p class="desc">You are logged in, but your account has not been assigned to any workspace. Please contact your administrator.</p>
      <el-button type="primary" @click="handleLogout">Sign Out</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoWorkspace',
  methods: {
    handleLogout() {
      this.$store.dispatch('user/logout')
    }
  }
}
</script>

<style lang="scss" scoped>
.no-workspace-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f0f2f5;
}

.no-workspace-box {
  text-align: center;
  padding: 60px 80px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .icon {
    font-size: 64px;
    color: #e6a23c;
    margin-bottom: 24px;
  }

  .title {
    font-size: 22px;
    color: #303133;
    margin: 0 0 16px;
  }

  .desc {
    font-size: 14px;
    color: #606266;
    margin: 0 0 32px;
    line-height: 1.8;
  }
}
</style>
