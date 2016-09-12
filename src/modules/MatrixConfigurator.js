import Reasons from 'reasons'
import Builder from 'modules/Builder'

import { OPTION_BASED_FIELDTYPES } from 'core/settings'

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
      this.initBlockType(this.configurator.blockTypes[id]);
    }

  }

  update () {



  }

  initBlockType (blockType) {

    // Sneaky.
    blockType._reasons = {
      $input: $('<input type="hidden" name="types[Matrix][blockTypes]['+blockType.id+'][_reasonsPlugin]" value="" />').appendTo(blockType.$item)
    };
    
    // Init fields
    for (var id in blockType.fields) {
      this.initField(blockType.fields[id]);
    }
    
    return blockType;

  }

  destroyBlockType () {

  }

  updateBlockType () {

  }

  onBlockTypeAdded () {

  }

  onBlockTypeRemoved () {

  }

  initField (field) {

    console.log(field, field.id);

    const toggleFields = this.getToggleFieldsForField(field);
    const conditionals = this.getConditionalsForField(field);
    
    // Create the builder
    const builder = new Builder({
      fieldId: field.id,
      toggleFields: toggleFields,
      rules: conditionals,
      onChange: this.onConditionalsBuilderChange.bind(field)
    });

    field.$fieldSettingsContainer.children('a.delete:last').before($('<div><hr /></div>').prepend(builder.get()));

    // Again, sneaky.
    field._reasons = {
      builder
    }

  }

  destroyField () {

  }

  // Whenever a field's type changes, we'll need to re-evaluate the whole block type

  /*
    Re-eval block if

    - A field's type changes
    - A field's handle changes (or, not neccessary actually)
    - 

  */

  onFieldTypeChange (e) {

    // const $target = $(e.currentTarget);
    // const $field = $target.closest('[data-id]');
    // const $block = $field.parent();

    // console.log('update block', $block.data('id'));

  }

  onFieldAdded () {

  }

  onFieldRemoved () {

  }

  onConditionalsBuilderChange () {
    // Add/remove js-reasons-has-conditionals className for field
    // if builder.getConditionals()
  }

  /*
  * Convenience methods
  *
  */

  getToggleFieldsForField (field) {
    const toggleFieldTypes = Reasons.getToggleFieldTypes();
    const blockType = field.blockType;
    let toggleFields = [];
    let siblingField;
    for (var id in blockType.fields) {
      siblingField = blockType.fields[id];
      if (siblingField.id === field.id) continue;
      if (toggleFieldTypes.indexOf(siblingField.selectedFieldType) > -1) {
        toggleFields.push(this.getToggleFieldDataFromField(siblingField));
      }
    }
    return toggleFields;
  }

  getToggleFieldDataFromField (field) {
    const fieldType = field.selectedFieldType;

    let settings = null;
    return {
      id: field.id,
      handle: field.$handleInput.val(),
      name: field.$nameInput.val(),
      type: fieldType,
      contentAttribute: null,
      settings: this.getToggleFieldSettingsFromField(field)
    };
  }

  getToggleFieldSettingsFromField (field) {
    if (field.selectedFieldType === 'Dropdown') {
      //console.log
    }
    return null;
  }

  getConditionalsForField () {
    return null;
  }

}