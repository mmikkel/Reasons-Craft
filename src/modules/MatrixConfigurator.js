import * as _ from 'lib/lodash'

import Reasons from 'reasons'
import Builder from 'modules/Builder'

// TODO: Handle errors on save! Put the conditionals in localStorage

export default class MatrixConfigurator {

  constructor (coreClass) {

    const self = this
    const fn = coreClass.prototype

    const fnInit = fn.init
    fn.init = function () {
      fnInit.apply(this, arguments)
      self.afterInit(this)
    }

  }

  afterInit (configurator) {

    this.configurator = configurator;

    // Init existing block types
    this.blockTypes = {}
    this.initBlockTypes()

    // Make sure new block types are initialized
    const self = this
    const blockTypeSort = this.configurator.blockTypeSort
    const addItems = blockTypeSort.addItems
    blockTypeSort.addItems = function () {
      addItems.apply(this, arguments)
      self.initBlockTypes()
    }

  }

  initBlockTypes () {
    _.each(this.configurator.blockTypes, (blockType, id) => {
      if (!this.blockTypes[id]) this.blockTypes[id] = this.initBlockType(blockType)
    })
  }

  initBlockType (blockType) {

    const toggleFields = this.getToggleFieldsForBlockType(blockType)

    // Make sure we have a block type ID we can work with – i.e. add the block type handle to any temporary ("new") ID
    const blockTypeId = this.addHandleToNewBlockTypeId(blockType)

    if (!blockType._reasons) {

      const conditionals = this.getConditionalsForBlockType(blockType) || {};

      blockType._reasons = {
        $input: $('<input type="hidden" name="'+this.getInputName(blockTypeId)+'" value="" />').appendTo(blockType.$item),
        conditionals,
        toggleFields
      }

      // Override some methods
      const self = this
      const fnAddField = blockType.addField
      blockType.addField = function () {
        fnAddField.apply(this, arguments)
        self.initBlockType(this)
      }

    } else {
      blockType._reasons = Object.assign({}, blockType._reasons, { toggleFields })
      blockType._reasons.$input.attr('name', this.getInputName(blockTypeId))
    }

    // Init fields in block type
    _.each(blockType.fields, (field) => {
      this.initField(field)
    })

    return blockType;

  }

  destroyBlockType (blockType) {
    if (blockType._reasons) {
      delete blockType._reasons
    }
  }

  initField (field) {

    const toggleFields = this.getToggleFieldsForField(field)
    const fieldRequired = field.$requiredCheckbox.prop('checked')

    if (!field._reasons) {

      const conditionals = this.getConditionalsForField(field)

      field._reasons = {
        builder: new Builder({
          fieldId: field.id,
          onChange: this.onConditionalsChange.bind(this, field),
          conditionals,
          fieldRequired,
          toggleFields
        })
      }

      field.$fieldSettingsContainer
        .on('change blur keyup', ':input', this.onFieldSettingsChange.bind(this, field))
        .on('click keyup', '.lightswitch', this.onFieldSettingsChange.bind(this, field))
        //.on('click', 'a[data-buttonbox-value]', this.onFieldSettingsChange.bind(this, field))
        .children('a.delete:last').before($('<div><hr /></div>').prepend(field._reasons.builder.get()));

      const self = this
      const fnSelfDestruct = field.selfDestruct
      field.selfDestruct = function () {
        fnSelfDestruct.apply(this, arguments)
        self.destroyField(this)
      }

      // Override the stock `confirmDelete` method, in order to display a custom confirm dialog for toggle fields being removed
      field.removeListener(field.$deleteBtn, 'click')
      field.addListener(field.$deleteBtn, 'click', this.confirmDeleteField.bind(this, field))

      // In a similar manner, override the stock `onTypeSelectChange` method
      field.removeListener(field.$typeSelect, 'change')
      field.addListener(field.$typeSelect, 'change', this.onTypeSelectChange.bind(this, field))

      this.onConditionalsChange(field)

    } else {

      // Update the conditionals builder
      field._reasons.builder.update({
        fieldRequired,
        toggleFields
      })
    }

  }

  confirmDeleteField (field) {
    if (!this.isActiveToggleField(field)) {
      field.confirmDelete()
    } else if (confirm(Craft.t('Warning: Deleting this field will also delete all conditionals where the field is used as a toggle.\nAre you sure you want to delete this field?'))) {
      field.selfDestruct()
    }
  }

  onTypeSelectChange (field) {

    const currentType = field.selectedFieldType
    const desiredType = field.$typeSelect.val()
    const isToggleField = this.isActiveToggleField(field)
    const confirmDialog = 'Warning: Changing this field\'s type will delete all conditionals where the field is used as a toggle.\nAre you sure you want to change the fieldtype?'

    if (desiredType == currentType || !isToggleField || confirm(Craft.t(confirmDialog))) {
      field.setFieldType(desiredType)
    } else {
      field.setFieldType(currentType)
    }

  }

  destroyField (field) {
    if (field._reasons) {
      field._reasons.builder.destroy()
      delete field._reasons
      field.$fieldSettingsContainer.off('change click keyup blur')
      field.removeListener(field.$deleteBtn, 'click')
      this.initBlockType(field.blockType)
    }
  }

  onFieldSettingsChange (field, e) {
    e.stopPropagation()
    if ($(e.currentTarget).closest('.reasonsBuilderUi').length) return false
    this.initBlockType(field.blockType)
  }

  onConditionalsChange (field) {
    if (!field._reasons) return false
    const builder = field._reasons.builder
    const conditionals = builder.getConditionals()
    const $el = field.$item
    if (conditionals) {
      $el.addClass('js-reasons-has-conditionals')
    } else {
      $el.removeClass('js-reasons-has-conditionals')
    }
    this.setConditionalsForField(field, conditionals)
  }

  /*
  * Convenience methods
  *
  */
  getToggleFieldsForBlockType (blockType) {
    return _.reduce(blockType.fields, (toggleFields, field) => {
      let toggleFieldData = this.getToggleFieldDataFromField(field)
      if (toggleFieldData) toggleFields.push(toggleFieldData)
      return toggleFields
    }, [])
  }

  getToggleFieldsForField (field) {
    return _.reduce(field.blockType._reasons.toggleFields, (toggleFields, toggleField) => {
      if (toggleField.id != field.id) toggleFields.push(toggleField)
      return toggleFields
    }, [])
  }

  isToggleField (field) {
    const toggleFieldTypes = Reasons.getToggleFieldTypes()
    return toggleFieldTypes.indexOf(field.selectedFieldType||'') > -1
  }

  getToggleFieldDataFromField (field) {

    if (!this.isToggleField(field)) return null

    const id = field.id
    const name = field.$nameInput.val()
    const handle = field.$handleInput.val()
    const type = field.selectedFieldType
    const settings = this.getToggleFieldSettingsFromField(field)

    return id && name && handle && type && settings ? {
      id, name, handle, type,
      settings: settings !== true ? settings : null
    } : null

  }

  getToggleFieldSettingsFromField (field) {

    const fieldType = field.selectedFieldType
    const $settingsContainer = $(field.initializedFieldTypeSettings[fieldType])

    if (!$settingsContainer || !$settingsContainer.length) return null

    switch (fieldType) {

      // Lightswitch
      case 'Lightswitch':
        return true
        break;

      // Number
      case 'Number':

        var options = {
          min: $settingsContainer.find('input[name$="[min]"]').val(),
          max: $settingsContainer.find('input[name$="[max]"]').val(),
          decimals: $settingsContainer.find('input[name$="[decimals]"]').val(),
        }
        return { options }

      // Plain text fields
      case 'PlainText':
      case 'PreparseField_Preparse':

        var options = {
          multiline: $settingsContainer.find('input[name$="[multiline]"]').val() == 1,
          initialRows: $settingsContainer.find('input[name$="[initialRows]"]').val()
        }
        return { options }

      // Option based fields
      case 'Dropdown':
      case 'Checkboxes':
      case 'MultiSelect':
      case 'RadioButtons':
      // case 'ButtonBox_Buttons':
      // case 'ButtonBox_Colours':
      // case 'ButtonBox_TextSize':
      // case 'ButtonBox_Width':

        var $settings = $settingsContainer.find('table:first tr')
        var options = _.reduce($settings, (options, option) => {
          option = $(option)
          var value = option.find(':input[name$="[value]"]').val()
          var label = option.find(':input[name$="[label]"]').val()
          if (value && value.length && label && label.length) {
            options.push({ label, value })
          }
          return options
        }, [])

        return options.length ? { options } : null

      // Position select
      case 'PositionSelect':

        var $settings = $settingsContainer.find('table:first tr')
        var options = _.reduce($settings, (options, option) => {
          var $input = $(option).find('input[type="hidden"]:first')
          var value = $input.attr('name').split('[').pop().replace(']', '')
          var enabled = $input.val() == 1
          if (enabled && value && value.length) {
            options.push(value)
          }
          return options
        }, [])

        return options.length ? { options } : null

        break;

      // Relational fields
      case 'Entries':
      case 'Categories':
      case 'Tags':
      case 'Assets':
      case 'Users':
      case 'Calendar_Event':
        return true

      // Custom fields
      case 'ButtonBox_Stars':
        // TODO
        break;


    }

    return null;

  }

  /*
  * Checks if a toggle field is part of any conditionals
  *
  */
  isActiveToggleField (field) {
    if (!field._reasons) return false
    const blockType = field.blockType
    if (!blockType._reasons) return false
    const conditionals = blockType._reasons.conditionals || {}
    return !!_.find(_.flattenDeep(_.values(conditionals)), { fieldId: field.id.toString() })
  }

  getConditionalsForBlockType (blockType) {
    if (!parseInt(blockType.id)) return null;
    return Reasons.getConditionalsForSource('matrixBlockType:'+blockType.id);
  }

  setConditionalsForField (field, conditionals) {

    const blockType = field.blockType
    if (!blockType._reasons) return false

    const fieldId = field.id.toString()

    let conditionalsToSave = Object.assign({}, blockType._reasons.conditionals || {})
    conditionalsToSave[fieldId] = conditionals

    this.setConditionalsForBlockType(blockType, conditionalsToSave)

  }

  setConditionalsForBlockType (blockType, conditionals) {

    if (!blockType._reasons) return false

    const blockTypeFieldIds = Object.keys(blockType.fields)
    const blockTypeConditionals = _.reduce(conditionals, (result, value, key) => {
      key = key.toString()
      if (value && blockTypeFieldIds.indexOf(key) > -1) result[key] = value
      return result
    }, {})

    blockType._reasons = Object.assign(blockType._reasons, {
      conditionals: blockTypeConditionals
    })

    this.updateConditionalsInputForBlockType(blockType)

  }

  updateConditionalsInputForBlockType (blockType) {

    if (!blockType._reasons) return false

    // Add field handles to new fields' temporary IDs before serializing
    const conditionals = _.reduce(blockType._reasons.conditionals || {}, (conditionals, statements, fieldId) => {
      fieldId = this.addHandleToNewFieldId(blockType, fieldId)
      conditionals[fieldId] = _.reduce(statements, (statements, rules) => {
        statements.push(_.reduce(rules, (rules, rule) => {
          rules.push(_.mapValues(rule, (value, key) => {
            return key === 'fieldId' ? this.addHandleToNewFieldId(blockType, value) : value
          }))
          return rules
        }, []))
        return statements
      }, [])
      return conditionals
    }, {})

    // Serialize the conditionals and update the hidden input
    const serializedConditionals = Object.keys(conditionals).length ? JSON.stringify(conditionals) : ''
    const $input = blockType._reasons.$input
    if ($input.val() !== serializedConditionals) $input.val(serializedConditionals)

  }

  addHandleToNewBlockTypeId (blockType) {
    return blockType.id.toString().substring(0, 3) === 'new' ? blockType.id+':'+blockType.$handleHiddenInput.val() : blockType.id
  }

  addHandleToNewFieldId (blockType, fieldId) {
    if (!blockType.fields[fieldId]) return fieldId
    return fieldId.toString().substring(0, 3) === 'new' ? fieldId+':'+blockType.fields[fieldId].$handleInput.val() : fieldId
  }

  getConditionalsForField (field) {
    const blockType = field.blockType
    if (!blockType._reasons) return null
    const blockTypeConditionals = blockType._reasons.conditionals || {}
    return blockTypeConditionals[field.id] || null
  }

  getInputName (blockTypeId) {
    return '_reasonsMatrixConditionals[blockTypes]['+blockTypeId+']';
  }

}
