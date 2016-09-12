import Reasons from 'reasons'
import Builder from 'modules/Builder'
import BuilderModal from 'modules/BuilderModal'

export default class FieldLayoutDesigner {

  constructor (fldClass) {
    
    const fn = fldClass.prototype;
    const fnFieldDrag = fldClass.FieldDrag.prototype;
    const self = this;

    const fnInit = fn.init;
    fn.init = function () {
      fnInit.apply(this, arguments);
      self.init(this);
    }

    const fnInitField = fn.initField;
    fn.initField = function ($field) {
      fnInitField.apply(this, arguments);
      // Create the "Edit conditionals" field settings menu option
      const menu = $field.find('.settings').data('menubtn').menu || null;
      const $remove = menu && menu.$container ? menu.$container.find('a[data-action="remove"]').parent() : null;
      const $toggle = $('<li><a data-action="toggle-reasons">'+Craft.t('Edit conditionals')+'</a></li>');
      if ($remove && $remove.length) {
        $toggle
          .insertBefore($remove)
          .find('a')
            .data('menu', menu)
            .on('click', self.onReasonsToggleOptionSelect.bind(self));
      }
      self.update();
    }

    const fnRemoveFieldById = fn.removeFieldById;
    fn.removeFieldById = function (fieldId) {
      const $field = this.$allFields.filter('[data-id='+fieldId+']:first');
      if ($field && $field.length && $field.data('_reasonsPlugin')) {
        $field.data('_reasonsPlugin').destroy();
        $field.data('_reasonsPlugin', null);
      }
      fnRemoveFieldById.apply(this, arguments);
      self.update();
    }

    const fnFieldDragOnDragStop = fnFieldDrag.onDragStop;
    fnFieldDrag.onDragStop = function () {
      fnFieldDragOnDragStop.apply(this, arguments);
      self.update();
    }
    
  }

  init (fld) {

    const formAttributes = Reasons.getFormAttributes();
    if (!formAttributes) return false;
    
    this.fld = fld;
    this.$input = $('<input type="hidden" name="_reasonsPlugin" value="" />').appendTo(this.fld.$container);

    this.setConditionals(formAttributes.conditionals);
    this.update();

  }

  toggleModal ($field) {

    const self = this;

    new BuilderModal($field.data('_reasonsPlugin'), {
      onHide: function () {
        self.onBuilderModalHide(this);
      }
    });

  }

  update () {

    if (!this.fld) return false;

    const self = this;

    let conditionals = {};
    let $tab;
    let $field;
    let $fieldsInTab;
    let fieldId;
    let toggleFieldsInTab;
    let toggleField;

    this.fld.$tabContainer.children().each(function () {
      
      $tab = $(this);
      $fieldsInTab = $tab.children('.fld-tabcontent').children();

      toggleFieldsInTab = [];
      $fieldsInTab.each(function () {
        toggleField = Reasons.getToggleFieldById($(this).data('id'));
        if (toggleField) toggleFieldsInTab.push(toggleField);
      });
      
      $fieldsInTab.each(function () {
        
        $field = $(this);
        fieldId = $field.data('id');
        
        if (!$field.data('_reasonsPlugin')) {
          // Create the conditionals builder
          $field.data('_reasonsPlugin', new Builder({
            fieldId: fieldId,
            toggleFields: toggleFieldsInTab,
            rules: self.getConditionals(fieldId)
          }));
        } else {
          $field.data('_reasonsPlugin').update({
            toggleFields: toggleFieldsInTab
          });
        }

        // Get rules
        let rules = $field.data('_reasonsPlugin').getConditionals();
        if (rules) {
            conditionals[fieldId] = rules;
            $field.addClass('js-reasons-has-conditionals');
        } else {
            $field.removeClass('js-reasons-has-conditionals');
        }

      });
      
    });

    this.setConditionals(conditionals);

  }

  getConditionals (fieldId) {
    if (fieldId) {
      return this.conditionals && this.conditionals.hasOwnProperty(fieldId) ? this.conditionals[fieldId] : null;
    }
    return this.conditionals || null;
  }

  setConditionals (conditionals) {
    this.conditionals = conditionals;
    if (!this.conditionals || Object.keys(this.conditionals).length === 0){
        this.$input.attr('value', '');
    } else {
        this.$input.attr('value', JSON.stringify(this.conditionals));
    }
  }

  onBuilderModalHide (modal) {
    this.update();
  }

  onReasonsToggleOptionSelect (e) {

    e.preventDefault();
    e.stopPropagation();

    const option = e.currentTarget;
    const menu = $(option).data('menu');
    const $field = menu.$anchor.parent();

    menu.hide();

    this.toggleModal($field);

  }

}