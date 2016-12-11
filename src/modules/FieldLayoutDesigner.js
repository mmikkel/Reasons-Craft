import { reduce, each } from 'lib/lodash'

import Reasons from 'reasons'
import Builder from './Builder'
import BuilderModal from './BuilderModal'

// TODO: Add a warning if deleting a field, if that field is a toggle field for a condtional
// TODO: Finish disabling required fields (just need an event handler for when a field is made required)

// TODO: Add conditionals to tab!

export default class FieldLayoutDesigner {

  constructor (fldClass) {

    const fn = fldClass.prototype
    const fnFieldDrag = fldClass.FieldDrag.prototype
    const self = this

    const fnInit = fn.init
    fn.init = function () {
      fnInit.apply(this, arguments)
      self.init(this)
    }

    const fnInitField = fn.initField
    fn.initField = function ($field) {
      fnInitField.apply(this, arguments)
      // Create the "Edit conditionals" field settings menu option
      const menu = $field.find('.settings').data('menubtn').menu || null
      const $remove = menu && menu.$container ? menu.$container.find('a[data-action="remove"]').parent() : null
      const $toggle = $('<li><a data-action="toggle-reasons">'+Craft.t('Edit conditionals')+'</a></li>')
      if ($remove && $remove.length) {
        $toggle
          .insertBefore($remove)
          .find('a')
            .data('menu', menu)
            .on('click', self.onReasonsToggleOptionSelect.bind(self))
      }
      self.update()
    }

    const fnRemoveFieldById = fn.removeFieldById
    fn.removeFieldById = function (fieldId) {
      const $field = this.$allFields.filter('[data-id='+fieldId+']:first')
      if ($field && $field.length && $field.data('_reasonsPlugin')) {
        $field.data('_reasonsPlugin').destroy()
        $field.data('_reasonsPlugin', null)
      }
      fnRemoveFieldById.apply(this, arguments)
      self.update()
    }

    const fnFieldDragOnDragStop = fnFieldDrag.onDragStop
    fnFieldDrag.onDragStop = function () {
      fnFieldDragOnDragStop.apply(this, arguments)
      self.update()
    }

  }

  init (fld) {

    const formAttributes = Reasons.getFormAttributes()

    if (!formAttributes) return false

    this.fld = fld
    this.$input = $('<input type="hidden" name="_reasonsConditionals" value="" />').appendTo(this.fld.$container)

    this.setConditionals(formAttributes.conditionals)
    this.update()

  }

  toggleModal ($field) {

    const self = this

    new BuilderModal($field.data('_reasonsPlugin'), {
      onHide: function () {
        self.onBuilderModalHide(this)
      }
    })

  }

  update () {

    if (!this.fld) {
      return false
    }

    Garnish.requestAnimationFrame(() => {

      const fieldSelector = this.fld.$allFields.selector
      const $fields = this.fld.$tabContainer.find(fieldSelector)

      let conditionals = {}

      // Get all toggle fields
      const toggleFields = reduce($fields, (toggleFields, field) => {
        let toggleField = Reasons.getToggleFieldById($(field).data('id'))
        if (toggleField) {
          toggleFields.push(toggleField)
        }
        return toggleFields
      }, [])

      // If no toggle fields, jump ship early
      if (!toggleFields.length) return false

      // Loop over the fields
      each($fields, (field) => {

        const $field = $(field)
        const fieldId = $field.data('id')
        const fieldRequired = $field.hasClass('fld-required')

        let builder = $field.data('_reasonsPlugin')

        if (builder) {
          // Update field builder
          builder.update({
            toggleFields,
            fieldRequired
          })
        } else {
          // Create new builder
          builder = new Builder({
            fieldId,
            toggleFields,
            fieldRequired,
            conditionals: this.getConditionalsForField(fieldId)
          })
        }

        $field.data('_reasonsPlugin', builder)

        // I can haz conditionals?
        const rules = builder.getConditionals()

        if (rules && rules.length) {
          conditionals[fieldId] = rules
          $field.addClass('js-reasons-has-conditionals')
        } else {
          $field.removeClass('js-reasons-has-conditionals')
        }

      })

      this.setConditionals(conditionals)

    })

  }

  getConditionalsForField (fieldId) {
    return (this.conditionals || {})[fieldId] || null
  }

  getConditionals () {
    return this.conditionals || null
  }

  setConditionals (conditionals) {
    this.conditionals = conditionals
    if (!this.conditionals || Object.keys(this.conditionals).length === 0){
        this.$input.attr('value', '')
    } else {
        this.$input.attr('value', JSON.stringify(this.conditionals))
    }
  }

  onBuilderModalHide (modal) {
    this.update()
  }

  onReasonsToggleOptionSelect (e) {

    e.preventDefault()
    e.stopPropagation()

    const option = e.currentTarget
    const menu = $(option).data('menu')
    const $field = menu.$anchor.parent()

    menu.hide()

    this.toggleModal($field)

  }

}
