<template>
  <el-dialog
    title="Create Project"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="visible"
  >
    <el-form ref="formData" :model="formData" :rules="formRules">
      <el-form-item label="Project Name" prop="name" :label-width="labelWidth">
        <el-input v-model="formData.name" style="width: 90%"></el-input>
      </el-form-item>
      <el-form-item
        label="Description"
        prop="description"
        :label-width="labelWidth"
      >
        <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          v-model="formData.description"
          style="width: 90%"
        >
        </el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="cancelForm()">Cancel</el-button>
      <el-button type="primary" @click="submitForm()">
        Confirm
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ProjectCreateDialog",
  data() {
    return {
      visible: false,
      labelWidth: "120px",
      formData: {},
      formRules: {
        name: [
          { required: true, message: "Please enter name", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    submitForm() {
      this.$refs['formData'].validate((valid) => {
        if (!valid) {
          return false
        }

        this.$http.post('/jobFlow/create', this.formData).then(res => {
          if (res.data.code === 0){
            this.$router.push('/project/create/'+res.data.data)
          }
        })
      });
    },

    cancelForm() {
      this.$refs['formData'].resetFields()
      this.visible = false
    },
  },
};
</script>
