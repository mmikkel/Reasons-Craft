import * as _ from 'lib/lodash'

import Reasons from 'reasons'

// Performance issue w/ Lightswitches?

export default class Parser {

  static settings = {
    fieldSelector: '.field',
    livePreviewEditorSelector: '.lp-editor',
    elementEditorSelector: '.elementeditor',
    lightswitchContainerSelector: '.lightswitch',
    positionSelectContainerSelector: '.btngroup',
    tabsNavSelector: 'nav#tabs li'
  }

  constructor ($el, conditionals, settings, context) {

    if (!$el || !$el.length || !conditionals) {
      return false
    }

    this.$el = $el

    if (this.$el.hasAttr('data-reasonsparser')) return false

    this.id = 'reasonsparser-'+Math.random().toString(36).slice(2)
    this.$el.attr('data-reasonsparser', this.id)

    this.settings = Object.assign({}, Parser.settings, settings || {})
    this.conditionals = conditionals

    // Set some event listeners
    this.inputWrapperClickHandler = this.onInputWrapperClick.bind(this)
    this.fieldInputChangeHandler = this.onFieldInputChange.bind(this)

    // Initialize!
    this.init()

    console.info('initialized parser', this.id)

    return this

    // if (!$el || !$el.length || !conditionals) {
    //   return false
    // }
    //
    // this.$el = $el
    //
    // if (this.$el.hasAttr('data-reasonsid')) {
    //   return false
    // }
    //
    // this.id = 'reasonsparser-'+Math.random().toString(36).slice(2)
    // this.$el.attr('data-reasonsid', this.id)
    //
    // const $tabs = this.$el.find('nav#tabs .tab')
    //
    // this.conditionals = conditionals
    // this.settings = Object.assign({}, Parser.settings, {
    //   hasTabs: $tabs.length > 1
    // }, settings || {})
    //
    // this.$tabs = this.settings.hasTabs ? $tabs : null
    //
    // this.init()

  }

  init () {

    this.addEventListeners()
    this.addLivePreviewListeners()
    this.initFields()

    this.render()

  }

  initFields () {

    const $fields = this.$el.find('div.field:not(div.field div.field)')

    console.log('init ', $fields.length, 'fields')

    // Prevent nested fields instantiation
    // let $field
    // _.each($fields, (field) => {
    //
    //   $field = $(field)
    //
    //
    //
    //   //if (!$field.parentsUntil(this.$el, '.field').length) this.initField($field)
    //   // How many .field containers from this.$el to this field?
    //   //if ($field.parent().closest(this.settings.fieldSelector).length === 1) this.initField($field)
    // })

  }

  initField ($field) {
    console.log('init field', this.id)
    $field.attr('data-reasonstoggle', this.id)
  }

  addEventListeners () {
    const toggleFieldSelector = '[data-reasonstoggle]'
    Garnish.$doc
      //.on('click', toggleFieldSelector, this.inputWrapperClickHandler)
      .on('change keyup', [toggleFieldSelector, ':input'].join(' '), this.fieldInputChangeHandler)
      // Special case for ButtonBox
      .on('click', [toggleFieldSelector, 'a[data-buttonbox-value]'].join(' '), this.fieldInputChangeHandler)
  }

  removeEventListeners () {
    const toggleFieldSelector = '[data-reasonstoggle="'+this.id+'"]'
    Garnish.$doc
      .off('click', toggleFieldSelector, this.inputWrapperClickHandler)
      .off('change keyup', [toggleFieldSelector, ':input'].join(' '), this.fieldInputChangeHandler)
      // Special case for ButtonBox
      .off('click', [toggleFieldSelector, 'a[data-buttonbox-value]'].join(' '), this.fieldInputChangeHandler)
  }

  addLivePreviewListeners () {

  }

  removeLivePreviewListeners () {

  }

  render () {

  }

  parse () {

    console.log('parse conditionals', this.id, this.condtionals)

  }

  destroy () {
    this.removeLivePreviewListeners()
    this.removeEventListeners()
    delete this.$el
    delete this.id
    delete this.settings
    delete this.conditionals
    delete this.inputWrapperClickHandler
    delete this.fieldInputChangeHandler
  }

  shouldParse (e) {
    console.log('should I parse or should I go', e.target, this.id)
    // const $target = $(e.target)
    // const parserId = $target.attr('data-reasonstoggle')
    // return parserId && $target.closest('[data-reasonsparser="'+parserId+'"]').length
  }

  onFieldInputChange (e) {
    if (this.shouldParse(e)) this.parse()
  }

  onInputWrapperClick (e) {
    if (this.shouldParse(e)) this.parse()
  }

  // init () {
  //   this.addEventListeners();
  //   this.addLivePreviewListeners();
  //   this.render();
  // }
  //
  // addEventListeners() {
  //
  //   Garnish.$doc
  //     .on('click', this.settings.fieldSelector + '[data-toggle="1"]', this.onInputWrapperClick.bind(this))
  //     .on('change keyup', this.settings.fieldSelector + '[data-toggle="1"] :input, '+this.settings.fieldSelector + '[data-toggle="1"] '+this.settings.lightswitchContainerSelector, this.onFieldInputChange.bind(this))
  //     .on('click', 'a[data-buttonbox-value]', this.onFieldInputChange.bind(this))
  //
  //   // Init element selects
  //   const self = this
  //   const elementSelectClassnames = ['elementselect', 'categoriesfield']
  //   let elementSelect
  //
  //   for (var i = 0; i < elementSelectClassnames.length; ++i) {
  //     $(this.settings.fieldSelector + ' .' + elementSelectClassnames[i]).each(function () {
  //       if ($(this).hasAttr('data-reasonselementselect')) {
  //         return;
  //       }
  //       var now = new Date().getTime()
  //       var getElementSelect = (function () {
  //         elementSelect = $(this).data('elementSelect');
  //         if (elementSelect) {
  //           elementSelect.on('selectElements', self.onElementSelectChange.bind(self))
  //           elementSelect.on('removeElements', self.onElementSelectChange.bind(self))
  //           $(this).attr('data-reasonselementselect', '');
  //           self.onElementSelectChange()
  //         } else if (new Date().getTime() - now < 2000) {
  //           Garnish.requestAnimationFrame(getElementSelect)
  //         }
  //       }).bind(this)
  //       getElementSelect()
  //     })
  //   }
  //
  // }
  //
  // removeEventListeners() {
  //
  //   Garnish.$doc
  //     .off('click', this.settings.fieldSelector + '[data-toggle="1"]', this.onInputWrapperClick.bind(this))
  //     .off('change keyup', this.settings.fieldSelector + '[data-toggle="1"] :input, '+this.settings.fieldSelector + '[data-toggle="1"] '+this.settings.lightswitchContainerSelector, this.onFieldInputChange.bind(this))
  //     .off('click', 'a[data-buttonbox-value]', this.onFieldInputChange.bind(this))
  //
  //   const self = this
  //   let elementSelect
  //
  //   $('[data-reasonselementselect]').each(function () {
  //     elementSelect = $(this).data('elementSelect')
  //     elementSelect.off('selectElements', self.onElementSelectChange.bind(self))
  //     elementSelect.off('removeElements', self.onElementSelectChange.bind(self))
  //     $(this).removeAttr('[data-reasonselementselect]')
  //   })
  //
  // }
  //
  // addLivePreviewListeners() {
  //
  //   function getLivePreviewInstance() {
  //     if (Craft.livePreview) {
  //       this._livePreview = Craft.livePreview
  //       this._livePreview.on('enter', this.onLivePreviewEnter.bind(this))
  //       this._livePreview.on('exit', this.onLivePreviewExit.bind(this))
  //       if (this._livePreviewPollId) delete this._livePreviewPollId
  //     } else if (new Date().getTime() - now < 2000) {
  //       this._livePreviewPollId = Garnish.requestAnimationFrame(livePreviewPoller)
  //     }
  //   }
  //
  //   const livePreviewPoller = getLivePreviewInstance.bind(this)
  //   const now = new Date().getTime()
  //   let livePreview
  //
  //   livePreviewPoller();
  //
  // }
  //
  // removeLivePreviewListeners() {
  //   if (this._livePreviewPollId) {
  //     Garnish.cancelAnimationFrame(this._livePreviewPollId)
  //     delete this._livePreviewPollId
  //   }
  //   if (this._livePreview) {
  //     this._livePreview.off('enter', this.onLivePreviewEnter.bind(this))
  //     this._livePreview.off('exit', this.onLivePreviewExit.bind(this))
  //     delete this._livePreview
  //   }
  // }
  //
  // destroy() {
  //   this.removeEventListeners();
  //   this.removeLivePreviewListeners();
  //   this.$el.removeAttr('data-reasonsid');
  // }
  //
  // render() {
  //   if(this.initToggleFields()){
  //     this.evaluateConditionals();
  //   }
  // }
  //
  // getFieldsSelector() {
  //   const selectorPath = [this.settings.fieldSelector]
  //   if (this.isLivePreview) {
  //     selectorPath.unshift(this.settings.livePreviewEditorSelector)
  //   } else {
  //     selectorPath.unshift('[data-reasonsid="'+this.id+'"]')
  //   }
  //   return selectorPath.join(' ')
  // }
  //
  // initToggleFields() {
  //
  //   // Get all current fields
  //   this.$fields = $(this.getFieldsSelector());
  //
  //   if (!this.$fields.length) {
  //     return false
  //   }
  //
  //   // Get toggle field IDs
  //   var fieldIds = Object.keys(this.conditionals);
  //   var toggleFieldIds = [];
  //   var statements;
  //
  //   for (var i = 0; i < fieldIds.length; ++i) {
  //     statements = this.conditionals[fieldIds[i]][0];
  //     for (var j = 0; j < statements.length; ++j) {
  //       toggleFieldIds.push(statements[j].fieldId);
  //     }
  //   }
  //
  //   // Loop over fields and add data-id attribute
  //   var self = this
  //   var $field
  //   var fieldHandlePath
  //   var fieldHandle
  //   var fieldId
  //
  //   this.$fields.each(function () {
  //
  //     $field = $(this)
  //
  //     if ($field.attr('id') === undefined) return
  //
  //     // Get field handle
  //     fieldHandlePath = $field.attr('id').split('-')
  //
  //     if (fieldHandlePath.length < 3 || fieldHandlePath.length > 4) return // Only basic fields for now!
  //     fieldHandle = fieldHandlePath.slice(-2, -1)[0] || false
  //
  //     if (!fieldHandle) return
  //     fieldId = Reasons.getFieldIdByHandle(fieldHandle)
  //
  //     if (!fieldId) return
  //
  //     fieldId = fieldId.toString()
  //
  //     if (fieldId){
  //       $field.attr('data-id', fieldId)
  //     }
  //
  //     // Is this a target field?
  //     if (self.conditionals[fieldId]){
  //       $field.attr('data-target', 1);
  //     }
  //
  //     // Is this a toggle field
  //     if (toggleFieldIds.indexOf(fieldId) > -1){
  //       $field.attr('data-toggle', 1);
  //     }
  //
  //   });
  //
  //   return true
  //
  // }
  //
  // evaluateConditionals() {
  //
  //   var self = this,
  //       conditionals = this.conditionals,
  //       $targetFields = $(this.getFieldsSelector() + '[data-target="1"]'),
  //       $targetField,
  //       statements,
  //       statementValid,
  //       rules,
  //       rule,
  //       $toggleField,
  //       $toggleFieldInput,
  //       toggleFieldData,
  //       toggleFieldValue;
  //
  //   console.log(':::::::')
  //   console.log('fields selector is', this.getFieldsSelector())
  //   console.log('found', $targetFields.length, 'target fields', conditionals)
  //
  //   if (this.settings.hasTabs) {
  //
  //     this.$el.find(this.settings.tabsNavSelector)
  //       .removeClass('reasonsHide')
  //       .removeAttr('aria-hidden')
  //       .removeAttr('tabindex')
  //   }
  //
  //   $targetFields
  //
  //       .removeClass('reasonsHide')
  //       .removeAttr('aria-hidden')
  //       .removeAttr('tabindex')
  //
  //       .each(function(){
  //
  //           $targetField = $(this);
  //           statements = conditionals[$targetField.data('id')] || false;
  //
  //           console.log('target field id', $targetField.data('id'), statements, conditionals)
  //
  //           if (!statements) {
  //               return;
  //           }
  //
  //           var numStatements = statements.length,
  //               numValidStatements = numStatements;
  //
  //           for (var i = 0; i < numStatements; ++i) {
  //
  //               statementValid = true;
  //               rules = statements[i];
  //
  //               for (var j = 0; j < rules.length; ++j) {
  //
  //                   rule = rules[j];
  //
  //                   $toggleField = $(self.getFieldsSelector() + '[data-id="' + rule.fieldId + '"]');
  //                   if ($toggleField.length === 0) continue;
  //
  //                   toggleFieldData = Reasons.getToggleFieldById(rule.fieldId);
  //                   toggleFieldValue = null;
  //
  //                   switch (toggleFieldData.type)
  //                   {
  //                       case 'Lightswitch':
  //                           $toggleFieldInput = $toggleField.find(':input:first');
  //                           if ($toggleFieldInput.length > 0) {
  //                               toggleFieldValue = $toggleFieldInput.val() === '1' ? 'true': 'false';
  //                           }
  //                           break;
  //                       case 'Checkboxes': case 'RadioButtons': case 'ButtonBox_Buttons': case 'ButtonBox_Stars': case 'ButtonBox_Width':
  //                           toggleFieldValue = $toggleField.find('input:checkbox:checked,input:radio:checked').map(function(){
  //                               return $(this).val();
  //                           }).get();
  //                           break;
  //                       case 'Entries': case 'Categories': case 'Tags': case 'Assets': case 'Users': case 'Calendar_Event':
  //                           var elementSelect = $toggleField.find('[data-reasonselementselect]').data('elementSelect') || null;
  //                           toggleFieldValue = elementSelect && elementSelect.totalSelected ? 'notnull' : 'null';
  //                           break;
  //                       default:
  //                           $toggleFieldInput = $toggleField.find('*:input:first');
  //                           toggleFieldValue = $toggleFieldInput.val();
  //                           break;
  //                   }
  //
  //                   // Flatten array values for easier comparisons
  //                   if ($.isArray(toggleFieldValue))
  //                   {
  //                       toggleFieldValue = toggleFieldValue.join('');
  //                   }
  //                   if ($.isArray(rule.value))
  //                   {
  //                       rule.value = rule.value.join('');
  //                   }
  //
  //                   // Compare trigger field value to expected value
  //                   switch (rule.compare) {
  //                       case '!=' :
  //                           if (toggleFieldValue == rule.value) statementValid = false;
  //                           break;
  //                       case '==' : default :
  //                           if (toggleFieldValue != rule.value) statementValid = false;
  //                           break;
  //                   }
  //
  //                   if (!statementValid) {
  //                       numValidStatements--;
  //                       break;
  //                   }
  //
  //               }
  //
  //           }
  //
  //           if (numValidStatements <= 0){
  //
  //             // Hide this field
  //             $targetField
  //               .addClass('reasonsHide')
  //               .attr('aria-hidden', 'true')
  //               .attr('tabindex', '-1');
  //
  //             // Also hide tab?
  //             const $tab = self.settings.hasTabs ? $targetField.closest('div[id^="tab"]') : null
  //             if ($tab && $tab.length) {
  //               const tabIndex = $tab.index()
  //               const currentTabIndex = self.$tabs.filter(':not(.hidden)').index()
  //               if (tabIndex > 0 && tabIndex !== currentTabIndex) { // Never hide the first tab, or the current tab
  //                 const $visibleFieldsInTab = $tab.find(self.settings.fieldSelector+':not(.reasonsHide)')
  //                 if (!$visibleFieldsInTab.length) {
  //                   self.$el.find(self.settings.tabsNavSelector+':nth('+(tabIndex)+')').addClass('reasonsHide')
  //                 }
  //               }
  //             }
  //
  //           }
  //
  //   });
  // }
  //
  // /*
  // *   Live preview
  // *
  // */
  // onLivePreviewEnter () {
  //   this.isLivePreview = true;
  //   this.render();
  // }
  //
  // onLivePreviewExit () {
  //   this.isLivePreview = false;
  //   this.render();
  // }
  //
  // /*
  // *   Event handlers
  // *
  // */
  // onInputWrapperClick (e) {
  //   $(e.currentTarget).find('input:first').trigger('change');
  // }
  //
  // onFieldInputChange (e) {
  //   this.evaluateConditionals();
  // }
  //
  // onElementSelectChange (e) {
  //   Garnish.requestAnimationFrame(this.evaluateConditionals.bind(this));
  // }

}
