import reduce from 'lodash/reduce'
import objectAssign from 'object-assign'

import Reasons from 'reasons'
import Builder from 'modules/Builder'

//import { OPTION_BASED_FIELDTYPES } from 'core/settings'

export default class MatrixConfigurator {

  constructor (matrixClass) {

    const fn = matrixClass.prototype;
    const fnInit = fn.init;
    const self = this;

    fn.init = function () {
      fnInit.apply(this, arguments);
      self.init(this);
    }

  }

  init (configurator) {

    this.configurator = configurator;

    // Init existing block types
    for (var id in this.configurator.blockTypes) {
      this.initBlockType(this.configurator.blockTypes[id])
    }

  }

  update () {



  }

  initBlockType (blockType) {

    const toggleFields = this.getToggleFieldsForBlockType(blockType)

    if (!blockType._reasons) {
      blockType._reasons = {
        // TODO: The input will store all conditionals for this block type
        $input: $('<input type="hidden" name="types[Matrix][blockTypes]['+blockType.id+'][_reasonsPlugin]" value="" />').appendTo(blockType.$item),
        toggleFields
      }
    } else {
      blockType._reasons = objectAssign({}, blockType._reasons, { toggleFields })
    }

    // Init fields in block type
    for (var id in blockType.fields) {
      this.initField(blockType.fields[id])
    }

    return blockType;

  }

  destroyBlockType (blockType) {
    if (blockType._reasons) {
      delete blockType._reasons
    }
  }

  onBlockTypeAdded () {
    // TODO
  }

  onBlockTypeRemoved () {
    // TODO
  }

  initField (field) {

    const toggleFields = this.getToggleFieldsForField(field)

    if (!field._reasons) {

      field._reasons = {
        builder: new Builder({
          fieldId: field.id,
          onChange: this.onConditionalsChange.bind(this, field),
          conditionals: this.getConditionalsForField(field),
          toggleFields
        })
      }

      field.$fieldSettingsContainer
        .on('change', ':input', this.onFieldSettingsChange.bind(this, field))
        .children('a.delete:last').before($('<div><hr /></div>').prepend(field._reasons.builder.get()));

      this.onConditionalsChange(field)

    } else {
      field._reasons.builder.update({
        toggleFields
      })
    }

  }

  destroyField () {
    if (field._reasons) {
      field._reasons.builder.destroy()
      delete field._reasons
    }
  }

  onFieldSettingsChange (field) {
    Garnish.requestAnimationFrame(() => {
      this.initBlockType(field.blockType)
    })
  }

  onFieldAdded () {
    // TODO
  }

  onFieldRemoved () {
    // TODO
  }

  onConditionalsChange (field) {
    if (!field._reasons) return false
    const builder = field._reasons.builder
    const $el = field.$item
    if (builder.getConditionals()) {
      $el.addClass('js-reasons-has-conditionals')
    } else {
      $el.removeClass('js-reasons-has-conditionals')
    }
  }

  /*
  * Convenience methods
  *
  */
  getToggleFieldsForBlockType (blockType) {
    return reduce(blockType.fields, (toggleFields, field) => {
      let toggleFieldData = this.getToggleFieldDataFromField(field)
      if (toggleFieldData) toggleFields.push(toggleFieldData)
      return toggleFields
    }, [])
  }

  getToggleFieldsForField (field) {
    return reduce(field.blockType._reasons.toggleFields, (toggleFields, toggleField) => {
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
        var options = reduce($settings, (options, option) => {
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
        var options = reduce($settings, (options, option) => {
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

  getConditionalsForField () {
    // TODO
    return null;
  }

}
