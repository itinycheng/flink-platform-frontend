<template>
  <div class="code-area">
    <textarea ref="codeText" v-model="value" :disabled="readOnly" />
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
require('codemirror/mode/shell/shell')

export default {
  name: 'CodeEditor',
  props: {
    mode: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
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
    this.sqlData = CodeMirror.fromTextArea(this.$refs.codeText, {
      value: this.value,
      mode: this.mode,
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
      const language = this.getLangFormatOption()
      const newText = format(this.sqlData.getValue(), { language })
      this.sqlData.setValue(newText)
    },
    getLangFormatOption() {
      switch (this.mode) {
        case 'text/x-sh':
          return ''
        case 'text/x-sql':
          return 'sql'
        case 'text/x-hive':
        default:
          return 'spark'
      }
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

.code-area{
    border:1px solid #eee
}
</style>
