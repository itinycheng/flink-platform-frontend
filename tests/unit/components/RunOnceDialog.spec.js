import { shallowMount } from '@vue/test-utils'
import RunOnceDialog from '@/components/RunOnceDialog/index.vue'

describe('RunOnceDialog.vue', () => {
  it('open() shows the dialog and resets the time', () => {
    const wrapper = shallowMount(RunOnceDialog)
    wrapper.setData({ scheduleTime: '2026-01-01 00:00:00' })
    wrapper.vm.open(() => {})
    expect(wrapper.vm.visible).toBe(true)
    expect(wrapper.vm.scheduleTime).toBe(null)
  })

  it('open() sets the title to include the flow name', () => {
    const wrapper = shallowMount(RunOnceDialog)
    wrapper.vm.open(() => {}, 'my_etl_flow')
    expect(wrapper.vm.dialogTitle).toBe('Run Once - my_etl_flow')
  })

  it('title falls back to "Run Once" without a name', () => {
    const wrapper = shallowMount(RunOnceDialog)
    wrapper.vm.open(() => {})
    expect(wrapper.vm.dialogTitle).toBe('Run Once')
  })

  it('run passes the picked time when one is selected', () => {
    const wrapper = shallowMount(RunOnceDialog)
    const onConfirm = jest.fn()
    wrapper.vm.open(onConfirm)
    wrapper.setData({ scheduleTime: '2026-06-30 14:00:00' })
    wrapper.vm.handleRun()
    expect(onConfirm).toHaveBeenCalledWith('2026-06-30 14:00:00')
    expect(wrapper.vm.visible).toBe(false)
  })

  it('run passes null when no time is selected', () => {
    const wrapper = shallowMount(RunOnceDialog)
    const onConfirm = jest.fn()
    wrapper.vm.open(onConfirm)
    wrapper.vm.handleRun()
    expect(onConfirm).toHaveBeenCalledWith(null)
    expect(wrapper.vm.visible).toBe(false)
  })

  it('closing clears the picked time', () => {
    const wrapper = shallowMount(RunOnceDialog)
    wrapper.setData({ scheduleTime: '2026-06-30 14:00:00' })
    wrapper.vm.handleClose()
    expect(wrapper.vm.scheduleTime).toBe(null)
  })
})
