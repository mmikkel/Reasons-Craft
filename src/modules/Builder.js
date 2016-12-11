import { each, find, reduce, capitalize } from 'lib/lodash'

import Reasons from 'reasons'

export default class Builder {

  static settings = {
    fieldId: null,
    fieldRequired: null,
    toggleFields: null,
    conditionals: null,
    onChange: null
  }

  constructor (settings) {

    this.setSettings(settings)

    this.fieldId = this.settings.fieldId
    this.$container = $(Builder.templates.builderUi())
    this.$ui = this.$container.find('.reasonsBuilder:first')

    // Create rule template
    this.$rule = this.$container.find('.reasonsRule:first').clone(true)

    // Create statement template
    this.$statement = this.$container.find('.reasonsStatement:first').clone(true)
    this.$statement.find('.reasonsRule').remove();

    this.$message = this.$container.find('.reasonsMessage:first')

    // Add some event listeners
    this.$container
      .on('click', '.reasonsAddRule', this.onAddRuleBtnClick.bind(this))
      .on('click', '.reasonsRemoveRule', this.onRemoveRuleBtnClick.bind(this))
      .on('click', '.reasonsAddStatement', this.onAddStatementBtnClick.bind(this))
      .on('change', '.reasonsRuleToggleField select', this.onRuleToggleFieldChange.bind(this))
      .on('change', '.reasonsRuleCompare select', this.onRuleCompareChange.bind(this))
      .on('change blur keyup', '.reasonsRuleValue *:input', this.onRuleValueChange.bind(this))

    this.$ui.html('');

    if (this.settings.toggleFields) {
      this.setToggleFields(this.settings.toggleFields)
    }

    // Render initial rules
    if (this.settings.conditionals) {
      each(this.settings.conditionals, (rules) => {
        this.addStatement({
          rules
        })
      })
    }

    this.render();

  }

  setSettings (settings) {
    this.settings = Object.assign({}, this.settings || Builder.settings, settings)
  }

  destroy () {
    this.$container.off('click change blur keyup')
    delete this.$container
    delete this.$ui
    delete this.$statement
    delete this.$message
    delete this.settings
    delete this.fieldId
  }

  get () {
    return this.$container
  }

  disable () {
    this.$container.addClass('disabled')
  }

  enable () {
    this.$container.removeClass('disabled')
  }

  update (settings) {
    this.setSettings(settings);
    this.setToggleFields(this.settings.toggleFields);
    this.render();
  }

  setToggleFields (fields) {

    let toggleFieldSelectOptions = ''

    this.settings.toggleFields = reduce(fields, (toggleFields, toggleField) => {
      let toggleFieldId = toggleField.id.toString()
      let fieldId = this.fieldId.toString()
      if (toggleFieldId != fieldId) {
        toggleFieldSelectOptions += Builder.templates.toggleSelectOption(toggleField)
        toggleField.id = toggleFieldId
        toggleFields.push(toggleField)
      }
      return toggleFields
    }, [])

    this.$rule.find('.reasonsRuleToggleField select').html(toggleFieldSelectOptions)

  }

  getToggleFieldById (id) {
    id = id.toString()
    return find(this.settings.toggleFields || [], {id})
  }

  render() {
    this._doRender()
    this.onChange()
  }

  _doRender () {

    if (this.settings.fieldRequired) {
      this.disable()
      this.$message.text(Craft.t('This field is required and can\'t have conditionals.'))
      return false
    }

    this.settings.conditionals = [];

    const toggleFields = this.settings.toggleFields || []

    if (!toggleFields.length){
      this.disable()
      this.$message.text(Craft.t('No toggle fields available.'))
      return false
    }

    this.enable()
    this.$message.text('')

    const $statements = this.$container.find('.reasonsStatement')

    each($statements, (statement) => {

      let $statement = $(statement)
      let rules = []
      let $rules = $statement.find('.reasonsRule')

      each ($rules, (rule) => {

        let $rule = $(rule)
        let $toggleSelect = $rule.find('.reasonsRuleToggleField select')
        let toggleSelectValue = $toggleSelect.val().toString() // Toggle field ID
        let toggleFieldAttributes = this.getToggleFieldById(toggleSelectValue)

        if (!toggleFieldAttributes) {
          $rule.remove()
          return
        }

        // Re-render toggle select
        let toggleSelectOpts = ''
        each(toggleFields, (toggleField) => {
          toggleSelectOpts += Builder.templates.toggleSelectOption(toggleField, toggleField.id.toString() === toggleSelectValue);
        })
        $toggleSelect.html(toggleSelectOpts)

        // Re-render the rule value input
        const $ruleValueContainer = $rule.find('.reasonsRuleValue')
        const $ruleValueInput = $ruleValueContainer.find(':input')
        const ruleValue = $ruleValueInput.val()
        if ($ruleValueContainer.data('type') !== toggleFieldAttributes.type) {
          // Jump ship and abort if the value input doesn't match the toggle field's type (i.e. the latter changed)
          $rule.remove()
          return
        } else if (JSON.stringify($ruleValueContainer.data('settings')) !== JSON.stringify(toggleFieldAttributes.settings)) {
          // Re-render rule value input if the settings changed
          console.log('rule value --- ', ruleValue)
          this.renderRuleValueContentForToggleSelect($toggleSelect, ruleValue)
        }

        // TODO: Filter the comparisons based on field type

        // Create the rule
        rules.push({
          fieldId: toggleSelectValue,
          value: ruleValue,
          compare: $rule.find('.reasonsRuleCompare select').val()
        });

      })

      if (!rules.length) {
        $statement.remove()
        return
      }

      this.settings.conditionals.push(rules);

    })

  }

  getConditionals () {
    return !this.settings.fieldRequired && this.settings.toggleFields && this.settings.toggleFields.length && this.settings.conditionals && this.settings.conditionals.length > 0 ? this.settings.conditionals : false;
  }

  renderRuleValueContentForToggleSelect ($select, ruleValue) {

    const toggleFieldId = $select.val().toString()
    const toggleField = this.getToggleFieldById(toggleFieldId)
    const toggleFieldType = toggleField.type
    const toggleFieldSettings = toggleField.settings

    const $rule = $select.closest('.reasonsRule')
    const $ruleValue = $rule.find('.reasonsRuleValue')

    let ruleValueContent = ''

    switch (toggleFieldType) {

      // Lightswitch - true/false
      case 'Lightswitch':
        ruleValueContent = Builder.templates.select([
          { true: Craft.t('on') },
          { false: Craft.t('off') }
        ])
        break

      // Option based inputs
      case 'Dropdown': case 'MultiSelect': case 'Checkboxes': case 'RadioButtons': case 'ButtonBox_Buttons': case 'ButtonBox_Colours': case 'ButtonBox_TextSize': case 'ButtonBox_Width':
        var values = toggleFieldSettings.options
        var options = []
        var option
        for (var i = 0; i < values.length; ++i){
          option = {}
          option[values[i].value] = values[i].label
          options.push(option)
        }
        ruleValueContent = Builder.templates.select(options, (toggleFieldType === 'MultiSelect' || toggleFieldType === 'Checkboxes'))
        break

      // Number input
      case 'Number':
        ruleValueContent = Builder.templates.number(toggleFieldSettings)
        break

      // Button Box – Stars
      case 'ButtonBox_Stars':
        var numStars = parseInt(toggleFieldSettings.numStars) + 1
        var option
        var options = []
        for (var i = 0; i < numStars; ++i) {
          option = {}
          option[''+i] = i
          options.push(option)
        }
        ruleValueContent = Builder.templates.select(options)
        break;

      // Position Select
      case 'PositionSelect':
        var values = toggleFieldSettings.options
        var options = []
        var option
        for (var i = 0; i < values.length; ++i) {
          option = {}
          option[values[i]] = Craft.t(capitalize(values[i]))
          options.push(option)
        }
        ruleValueContent = Builder.templates.select(options)
        break

      // Relational fields
      case 'Entries': case 'Categories': case 'Tags': case 'Assets': case 'Users': case 'Calendar_Event':
        var options = [
          {
            'null': Craft.t('Empty').toLowerCase()
          },
          {
            'notnull': Craft.t('Not empty').toLowerCase()
          }
        ]
        ruleValueContent = Builder.templates.select(options)
        break

        // Just render a plain text input for anything else
      default :
        ruleValueContent = Builder.templates.input(toggleFieldSettings)

    }

    $ruleValue
      .html(ruleValueContent)
      .data({
        settings: toggleFieldSettings,
        type: toggleFieldType
      })

    if (ruleValue) $ruleValue.find(':input').val(ruleValue)

  }

  addStatement (statement) {

    statement = Object.assign({}, {
      rules: false
    }, statement)

    const $statement = this.$statement.clone(true)
    const rules = statement.rules;

    // Append the statement
    this.$ui.append($statement);

    if (!rules) {

        // This is a new statement. Just add a default rule
        this.addRule({
          target: $statement
        });

    } else {

        each(rules, (rule) => {
          this.addRule(Object.assign({}, {
            target: $statement
          }, rule))
        })

    }

    return $statement;

  }

  addRule (rule) {

    rule = Object.assign({}, {
      fieldId: null,
      compare: null,
      value: null
    }, rule)

    const $rule = this.$rule.clone(true)
    const $target = rule.target || this.$ui.find('.reasonsStatement:last')
    const fieldId = rule.fieldId
    const compare = rule.compare
    const value = rule.value

    if (!$target.length) {
      return false
    }

    if (fieldId) {
      $rule.find('.reasonsRuleToggleField select').val(fieldId)
    }

    $target.find('.reasonsRules:first').append($rule);
    $rule.find('.reasonsRuleToggleField select').trigger('change')

    if (compare) {
        $rule.find('.reasonsRuleCompare select').val(compare);
    }

    if (value) {
        $rule.find('.reasonsRuleValue *:input:first').val(value);
    }

    return $rule;

  }

  onAddRuleBtnClick (e) {
    e.preventDefault()
    const target = $(e.currentTarget).closest('.reasonsStatement')
    this.addRule({
      target
    })
    this.render()
  }

  onRemoveRuleBtnClick (e) {
    e.preventDefault()
    const $rule = $(e.currentTarget).closest('.reasonsRule')
    $rule.remove()
    this.render()
    this.render()
  }

  onAddStatementBtnClick (e) {
    e.preventDefault()
    this.addStatement()
  }

  onRuleToggleFieldChange (e) {
    e.preventDefault();
    this.renderRuleValueContentForToggleSelect($(e.currentTarget))
    this.render()
  }

  onRuleCompareChange (e) {
    e.preventDefault()
    this.render()
  }

  onRuleValueChange (e) {
    e.preventDefault()
    this.render()
  }

  onChange () {
    if (this.settings.onChange) {
      this.settings.onChange();
    }
  }

  static templates = {
    select: function(options, isMultiSelect) {
      var selectOptions = []
      var option
      var value
      var label
      for (var i = 0; i < options.length; ++i) {
        option = options[i]
        value = Object.keys(option)[0]
        label = option[value]
        selectOptions.push('<option value="' + value + '">' + label + '</option>')
      }
      return '<div class="' + (isMultiSelect ? 'multiselect': 'select') + '"><select' + (isMultiSelect ? ' multiple': '') + '>' + selectOptions.join('') + '</select></div>'
    },
    toggleSelectOption: function(toggleField, selected) {
      return '<option value="' + toggleField.id + '" data-type="' + toggleField.type + '"' + (selected ? ' selected': '') + '>' + toggleField.name + '</option>'
    },
    number: function(settings) {
      return '<div class="input"><input class="text" type="number" value="0" min="' + settings.min + '" max="' + settings.max + '" autocomplete="off"></div>'
    },
    input: function(settings) {
      var input = ''
      settings = Object.assign({}, {
        initialRows: 4,
        placeholder: '',
        multiline: false
      }, settings || {})
      if (settings.multiline === '1'){
        input += '<textarea rows="' + settings.initialRows + '" placeholder="' + settings.placeholder + '" autocomplete="off"></textarea>'
      } else {
        input += '<input class="text" type="text" size="20" value="" placeholder="' + settings.placeholder + '" autocomplete="off">'
      }
      return '<div class="input">' + input + '</div>'
    },
    builderUi: function() {
      return '<div class="reasonsBuilderUi">' +
                  '<div class="wrapper">' +
                      '<div class="heading"><span>' + Craft.t('Show this field if') + '</span></div>' +
                        '<div class="reasonsBuilder">' +
                            '<div class="reasonsStatement">' +
                                '<span class="delimiter">' + Craft.t('or') + '</span>' +
                                '<div class="reasonsRules">' +
                                    '<div class="reasonsRule">' +
                                        '<div class="reasonsRuleParams">' +
                                            '<div class="select reasonsRuleToggleField"><select /></div>' +
                                            '<div class="select reasonsRuleCompare">' +
                                                '<select>' +
                                                    '<option value="==">' + Craft.t('is equal to') + '</option>' +
                                                    '<option value="!=">' + Craft.t('is not equal to') + '</option>' +
                                                    // TODO: Enable these for Number fields
                                                    // '<option value=">">' + Craft.t('is larger than') + '</option>' +
                                                    // '<option value="<">' + Craft.t('is smaller than') + '</option>' +
                                                '</select>' +
                                            '</div>' +
                                            '<div class="reasonsRuleValue" />' +
                                        '</div>' +
                                        '<div class="reasonsRuleAmend">' +
                                            '<a class="delete icon reasonsRemoveRule" title="' + Craft.t('Remove rule') + '"></a>' +
                                            '<a class="add icon reasonsAddRule" title="' + Craft.t('and') + '"></a>' +
                                        '</div>' +
                                        '<span class="reasonsRuleLead">' + Craft.t('and') + '</span>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="reasonsAdd">' +
                            '<a class="btn reasonsAddStatement">' + Craft.t('Add rules') + '</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="reasonsMessage"></div>' +
                '</div>';
      }
  }

}
