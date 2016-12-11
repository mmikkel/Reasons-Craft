import 'babel-polyfill'

import each from 'lib/lodash'

import * as constants from 'core/constants'

import FieldLayoutDesigner from 'modules/FieldLayoutDesigner'
import MatrixConfigurator from 'modules/MatrixConfigurator'
import MatrixInput from 'modules/MatrixInput'
import ElementEditor from 'modules/ElementEditor'
import Parser from 'modules/Parser'


import 'styles/reasons.scss'
import 'lib/jquery-extensions'

export default class Reasons {

  static data = null

  init (data) {

    Reasons.data = data;

    const hijackClasses = { FieldLayoutDesigner, MatrixConfigurator, MatrixInput, ElementEditor }
    for (var className in hijackClasses) {
      const _class = hijackClasses[className]
      const craftClass = Craft[className] || null
      if (!craftClass) {
        continue
      }
      new _class(craftClass)
    }

    $(this.initPrimaryForm.bind(this))

    if (Reasons.data.debug) {
      console.info('Reasons v. '+this.getVersion()+' initialized')
      console.info('Reasons data', Reasons.data)
    }

  }

  getVersion () {
    return Reasons.data ? Reasons.data.version || '' : ''
  }

  initPrimaryForm () {

    this.destroyPrimaryForm();

    const formAttributes = Reasons.getFormAttributes()

    if (formAttributes.context === constants.FORM_PARSER_CONTEXT && formAttributes.conditionals) {
      const $form = Reasons.getPrimaryForm()
      this.parser = new Parser($form, formAttributes.conditionals)
    }

  }

  destroyPrimaryForm () {
    if (this.parser) {
      this.parser.destroy()
      delete this.parser
    }
  }

  setElementEditorSource (elementId, source) {
    if (!Reasons.elementEditorSources) Reasons.elementEditorSources = {}
    Reasons.elementEditorSources[elementId.toString()] = source
  }

  /*
  *   Core methods
  *
  */
  static getPrimaryForm () {
    return (Craft.cp.$primaryForm && Craft.cp.$primaryForm.length) ? Craft.cp.$primaryForm : $('#content form:first')
  }

  static getConditionalsForSource (source) {
    return Reasons.data.conditionals ? Reasons.data.conditionals[source] || null : null
  }

  static getConditionals () {
    return Reasons.data.conditionals ? Reasons.data.conditionals : null
  }

  static getSourceFromAttributes (attributes) {
    return attributes.type + (attributes.id ? ':' + attributes.id : '')
  }

  static getToggleFields () {
      return Reasons.data.toggleFields ? Reasons.data.toggleFields : []
  }

  static getToggleFieldById (fieldId) {
    fieldId = parseInt(fieldId)
    const toggleFields = Reasons.getToggleFields()
    const numToggleFields = toggleFields.length
    for (let i = 0; i < numToggleFields; ++i) {
        if (parseInt(toggleFields[i].id) === fieldId){
            return toggleFields[i]
        }
    }
    return false
  }

  static getFieldIds (context) {
    context = context || 'global'
    return Reasons.data.fieldIds && Reasons.data.fieldIds[context] ? Reasons.data.fieldIds[context] : {}
  }

  static getFieldIdByHandle (fieldHandle, context) {
    const fieldIds = Reasons.getFieldIds(context)
    return fieldIds && fieldIds[fieldHandle] ? fieldIds[fieldHandle] : false
  }

  static getToggleFieldTypes () {
    return Reasons.data.toggleFieldTypes ? Reasons.data.toggleFieldTypes : []
  }

  static getFormAttributes ($form) {

    if (!$form || !$form.length) {
      $form = Reasons.getPrimaryForm()
      if (!$form || !$form.length) {
        return false
      }
    }

    // Get namespace
    let namespace = $form.find('input[type="hidden"][name="namespace"]').val()
    if (namespace) {
        namespace += '-'
    }

    const action = $form.find('input[type="hidden"][name="action"]').val()
    let type
    let idInputSelector

    switch (action) {

        case constants.ASSET_SOURCE_ACTION :
            type = constants.ASSET_SOURCE_HANDLE
            idInputSelector = 'input[type="hidden"][name="sourceId"]'
            break;

        case constants.CATEGORY_ACTION :
        case constants.CATEGORY_GROUP_ACTION :
            type = constants.CATEGORY_GROUP_HANDLE;
            idInputSelector = 'input[type="hidden"][name="groupId"]'
            break;

        case constants.GLOBAL_SET_CONTENT_ACTION:
        case constants.GLOBAL_SET_ACTION :
            type = constants.GLOBAL_SET_HANDLE
            idInputSelector = 'input[type="hidden"][name="setId"]'
            break;

        case constants.ENTRY_ACTION :
            const $entryType = $form.find('select#entryType, input[type="hidden"][name="entryTypeId"], input[type="hidden"][name="typeId"], #' + namespace + 'entryType')
            type = $entryType.length ? constants.ENTRY_TYPE_HANDLE : constants.SECTION_HANDLE
            idInputSelector = $entryType.length ? 'select#entryType, input[type="hidden"][name="entryTypeId"], input[type="hidden"][name="typeId"], #' + namespace + 'entryType' : 'input[type="hidden"][name="sectionId"], #' + namespace + 'section'
            break;

        case constants.ENTRY_TYPE_ACTION :
            type = constants.ENTRY_TYPE_HANDLE
            idInputSelector = 'input[type="hidden"][name="entryTypeId"]'
            break;

        case constants.TAG_ACTION :
        case constants.TAG_GROUP_ACTION :
            type = constants.TAG_GROUP_HANDLE
            idInputSelector = 'input[type="hidden"][name="tagGroupId"], input[type="hidden"][name="groupId"]'
            break;

        case constants.USERS_ACTION :
        case constants.USERS_FIELDS_ACTION :
            type = constants.USERS_HANDLE
            break;

        case constants.FIELDS_ACTION :
            type = constants.FIELDS_HANDLE
            idInputSelector = 'input[type="hidden"][name="fieldId"]'
            break;

        case constants.SOLSPACE_CALENDAR_SETTINGS_ACTION :
        case constants.SOLSPACE_CALENDAR_EVENTS_ACTION :
            type = constants.SOLSPACE_CALENDAR_HANDLE
            break;

        case constants.COMMERCE_PRODUCT_TYPE_ACTION :
        case constants.COMMERCE_PRODUCT_ACTION :
            type = constants.COMMERCE_PRODUCT_TYPE_HANDLE
            idInputSelector = 'input[type="hidden"][name="typeId"]'
            break;

    }

    if (!type) {
        return false
    }

    let attrs = {
        type : type,
        context : Reasons.getFormContext($form),
        id : idInputSelector ? ($form.find(idInputSelector).val() | 0) : false
    }

    const source = Reasons.getSourceFromAttributes(attrs)
    attrs['conditionals'] = Reasons.getConditionalsForSource(source)

    return attrs

  }

  static getFormContext ($form) {

      if ($form.data('elementEditor')) {
          return false
      }

      const action = $form.find('input[type="hidden"][name="action"]').val()

      switch (action) {

          case constants.GLOBAL_SET_CONTENT_ACTION :
          case constants.ENTRY_ACTION :
          case constants.TAG_ACTION :
          case constants.CATEGORY_ACTION :
          case constants.USERS_ACTION :
          case constants.SOLSPACE_CALENDAR_EVENTS_ACTION :
          case constants.COMMERCE_PRODUCT_ACTION :
              return constants.FORM_PARSER_CONTEXT

          case constants.ASSET_SOURCE_ACTION :
          case constants.CATEGORY_GROUP_ACTION :
          case constants.GLOBAL_SET_ACTION :
          case constants.ENTRY_TYPE_ACTION :
          case constants.TAG_GROUP_ACTION :
          case constants.USERS_FIELDS_ACTION :
          case constants.SOLSPACE_CALENDAR_SETTINGS_ACTION :
          case constants.COMMERCE_PRODUCT_TYPE_ACTION :
              return constants.FIELD_LAYOUT_DESIGNER_CONTEXT

          // case constants.FIELDS_ACTION :
          //     return FIELD_DESIGNER_CONTEXT;

      }

      return false

  }

  static getElementEditorSource (elementId) {
    return Reasons.elementEditorSources ? Reasons.elementEditorSources[elementId.toString()] || null : null
  }

}
