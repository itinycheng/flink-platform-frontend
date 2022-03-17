<template>
  <div class="sql-area">
    <textarea ref="sqlText" v-model="value" :disabled="readOnly" />
  </div>
</template>

<script>
import { format } from 'sql-formatter'
import 'codemirror/theme/ambiance.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
const CodeMirror = require('codemirror/lib/codemirror')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/selection/active-line')
require('codemirror/mode/sql/sql')
require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/sql-hint')

export default {
  name: 'SqlEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    sqlStyle: {
      type: String,
      default: 'spark'
    },
    readOnly: {
      type: Boolean
    }
  },
  data() {
    return {
      sqlData: null
    }
  },
  computed: {
    newVal: function() {
      if (this.sqlData) {
        return this.sqlData.getValue()
      } else {
        return ''
      }
    }
  },
  watch: {
    newVal(newV, oldV) {
      if (this.sqlData) {
        this.$emit('changeTextarea', this.sqlData.getValue())
      }
    }
  },

  mounted() {
    this.sqlData = CodeMirror.fromTextArea(this.$refs.sqlText, {
      value: this.value,
      mode: 'text/x-mariadb',
      indentWithTabs: true,
      smartIndent: true,
      lineNumbers: true,
      matchBrackets: true,
      cursorHeight: 1,
      lineWrapping: true,
      readOnly: this.readOnly,
      extraKeys: { 'Ctrl': 'autocomplete' },
      hintOptions: {
        completeSingle: false
      }
    })
    this.sqlData.on('inputRead', () => {
      this.sqlData.showHint()
    })
  },
  methods: {
    setVal(text) {
      this.sqlData.setValue(text)
    },
    format() {
      const newText = format(this.sqlData.getValue(), { language: this.sqlStyle })
      this.sqlData.setValue(newText)
    }
  }
}
</script>

<style>
.CodeMirror {
  color: black;
  direction: ltr;
  line-height: 22px;
  min-height: 200px !important;
}

.CodeMirror-hints{
  z-index: 9999 !important;
}

.sql-area{
    border:1px solid #eee
}
</style>
