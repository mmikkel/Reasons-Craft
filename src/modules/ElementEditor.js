import Reasons from 'reasons'
import EditForm from './EditForm'

export default class ElementEditor {

  constructor (elementEditorClass) {

    const self = this
    const fn = elementEditorClass.prototype

    const fnShowHud = fn.showHud
    fn.showHud = function (response) {
      fnShowHud.apply(this, arguments)
      self.source = response['_reasonsSource'] || null
      self.showHud(this)
    }

    const fnCloseHud = fn.closeHud
    fn.closeHud = function () {
      fnCloseHud.apply(this, arguments)
      self.closeHud(this)
    }

    this.source = null

  }

  showHud (elementEditor) {

    this.destroy()

    if (!this.source) return false

    const conditionals = Reasons.getConditionalsForSource(this.source)

    if (!conditionals) return false

    this.editForm = new EditForm(elementEditor.$form, conditionals)
    elementEditor.hud.on('hide', this.destroy.bind(this))

  }

  closeHud () {
    this.destroy()
  }

  destroy () {

    if (this.editForm) {
      this.editForm.destroy()
      delete this.editForm
    }

  }

}
