<template>
  <el-dialog title="Tag Configuration" :visible.sync="visible" width="40%">
    <el-form :model="formData">
      <el-form-item>
        <el-select v-model="formData.tags" multiple style="width:100%">
          <el-option
            v-for="tag in tagList"
            :key="tag.id"
            :label="tag.name"
            :value="tag.code"
          >
            <span style="float: left">{{ tag.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item style="text-align: right;">
        <el-button @click.stop="cancelForm()">Cancel</el-button>
        <el-button type="primary" @click.stop="submitForm()">Confirm</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { getTagList } from '@/api/tag'
import { updateFlow } from '@/api/job-flow'

export default {
  name: 'EditTagDialog',
  data() {
    return {
      visible: false,
      row: {},
      formData: {},
      tagList: []
    }
  },

  methods: {
    init(data = {}) {
      this.row = data
      const { id, tags } = data
      this.formData = { id, tags }
      getTagList().then((result) => {
        this.tagList = result
        this.visible = true
      })
    },

    submitForm() {
      updateFlow(this.formData).then(res => {
        this.row.tags = this.formData.tags
        this.cancelForm()
      })
    },

    cancelForm() {
      this.visible = false
      this.resetForm()
    },

    resetForm() {
      this.formData = {}
    }
  }
}
</script>
