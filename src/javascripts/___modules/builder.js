var ConditionalsBuilder = Garnish.Base.extend({

    $container : null,

    init: function(settings)
    {

        this.setSettings(settings, ConditionalsBuilder.defaults);

        this.templates = this.settings.templates;
        this.fieldId = this.settings.fieldId;

        this.$container = $(this.templates.builderUi());

        this.$builder = this.$container.find('.reasonsBuilder:first');

        // Create rule template
        this.$rule = this.$container.find('.reasonsRule:first').clone(true);

        // Create statement template
        this.$statement = this.$container.find('.reasonsStatement:first').clone(true);
        this.$statement.find('.reasonsRule').remove();

        this.$message = this.$container.find('.reasonsMessage:first');

        // Add some event listeners
        this.$container
            .on('click', '.reasonsAddRule', $.proxy(this.onReasonsAddRuleClick, this))
            .on('click', '.reasonsRemoveRule', $.proxy(this.onReasonsRemoveRuleClick, this))
            .on('click', '.reasonsAddStatement', $.proxy(this.onReasonsAddStatementClick, this))
            .on('change', '.reasonsRuleToggleField select', $.proxy(this.onReasonsRuleToggleFieldChange, this))
            .on('change', '.reasonsRuleCompare select', $.proxy(this.onReasonsRuleCompareChange, this))
            .on('change', '.reasonsRuleValue *:input', $.proxy(this.onReasonsRuleValueChange, this));

        // Clean out the builder
        this.$builder.html('');

        // Update toggle fields
        this.setToggleFields(this.settings.toggleFields);

        // Render existing rules
        if (this.settings.rules && this.settings.rules.length > 0) {
            for (var i = 0; i < this.settings.rules.length; ++i) {
                this.addStatement({
                    rules : this.settings.rules[i]
                });
            }
        }

        this.refresh();

        ConditionalsBuilder.instances.push(this);

    },

    get : function()
    {
        return this.$container;
    },

    disable : function()
    {
        this.$container.addClass('disabled');
    },

    enable : function()
    {
        this.$container.removeClass('disabled');
    },

    update : function(settings)
    {

        // Set new settings
        this.setSettings(settings, this.settings);

        // Set new toggle fields
        this.setToggleFields(this.settings.toggleFields);

        // Refresh
        this.refresh();

    },

    setToggleFields : function (toggleFields)
    {

        if (!toggleFields) {
            return false;
        }

        this.settings.toggleFields = [];
        this.settings.toggleFieldIds = [];

        for(var i = 0; i < toggleFields.length; ++i){
            if (parseInt(toggleFields[i].id) !== this.fieldId){
                this.settings.toggleFields.push(toggleFields[i]);
                this.settings.toggleFieldIds.push(parseInt(toggleFields[i].id));
            }
        }

        // Update rule template
        var toggleFieldSelectOptions = '';
        for (var i = 0; i < this.settings.toggleFields.length; ++i){
            toggleFieldSelectOptions += this.templates.toggleSelectOption(this.settings.toggleFields[i]);
        }
        this.$rule.find('.reasonsRuleToggleField select').html(toggleFieldSelectOptions);

    },

    refresh : function ()
    {

        this.settings.rules = [];

        var toggleFields = this.settings.toggleFields;

        // If no toggle fields, GTFO
        if (toggleFields.length === 0){
            this.disable();
            this.$message.text(Craft.t('No toggle fields available.'));
            return false;
        } else {
            this.enable();
            this.$message.text('');
        }

        var self = this,
            statement,
            $statements = this.$container.find('.reasonsStatement'),
            $statement,
            $rules,
            $rule,
            $toggleSelect,
            toggleSelectValue,
            toggleSelectOpts;

        $statements.each(function () {

            statement = [];
            $statement = $(this);
            $rules = $statement.find('.reasonsRule');

            $rules.each(function () {

                $rule = $(this);

                $toggleSelect = $rule.find('.reasonsRuleToggleField select');
                toggleSelectValue = parseInt($toggleSelect.val());

                // Remove rules where the selected toggle field no longer exists
                if(self.settings.toggleFieldIds.indexOf(toggleSelectValue) === -1){
                    $rule.remove();
                    return;
                }

                // Re-render toggle select
                toggleSelectOpts = '';
                for (var i = 0; i < self.settings.toggleFields.length; ++i){
                    toggleSelectOpts += self.templates.toggleSelectOption(toggleFields[i], parseInt(toggleFields[i].id) === toggleSelectValue);
                }
                $toggleSelect.html(toggleSelectOpts);

                // Create the rule
                statement.push({
                    fieldId : toggleSelectValue,
                    compare : $rule.find('.reasonsRuleCompare select').val(),
                    value : $rule.find('.reasonsRuleValue *:input:first').val()
                });

            });

            // Remove empty statements
            if (statement.length === 0) {
                $statement.remove();
                return;
            }

            self.settings.rules.push(statement);

        });

    },

    getConditionals : function ()
    {
        return this.settings.rules && this.settings.rules.length > 0 ? this.settings.rules : false;
    },

    addStatement : function(settings)
    {

        settings = $.extend({
            rules : false
        },settings);

        var $statement = this.$statement.clone(true),
            rules = settings.rules;

        // Append the statement
        this.$builder.append($statement);

        if (!rules) {

            // This is a new statement. Just add a default rule
            this.addRule({
                target : $statement
            });

        } else {

            for (var i = 0; i < rules.length; ++i){
                this.addRule($.extend({
                    target : $statement
                },rules[i]));
            }

        }

        return $statement;
    },

    addRule : function(settings)
    {

        settings = $.extend({
            fieldId : null,
            compare : null,
            value : null
        },settings);

        var $rule = this.$rule.clone(true),
            $target = settings.target || this.$builder.find('.reasonsStatement:last'),
            fieldId = settings.fieldId,
            compare = settings.compare,
            value = settings.value;

        // Build the rule
        if (fieldId) {
            $rule.find('.reasonsRuleToggleField select').val(fieldId);
        }

        // Append the rule
        if ($target.length > 0) {
            $target.find('.reasonsRules:first').append($rule);
        } else {
            return false;
        }

        $rule
            .find('.reasonsRuleToggleField select')
            .trigger('change');

        if (compare) {
            $rule.find('.reasonsRuleCompare select').val(compare);
        }

        if (value) {
            $rule.find('.reasonsRuleValue *:input:first').val(value);
        }

        return $rule;

    },

    onReasonsAddRuleClick : function (e)
    {
        e.preventDefault();
        var $target = $(e.currentTarget).parents('.reasonsStatement');
        this.addRule({
            target : $target
        });
    },

    onReasonsRemoveRuleClick : function (e)
    {
        e.preventDefault();
        var $target = $(e.currentTarget),
            $rule = $target.parents('.reasonsRule');
        $rule.remove();
        this.refresh();
    },

    onReasonsAddStatementClick : function (e) {
        e.preventDefault();
        this.addStatement();
    },

    onReasonsRuleToggleFieldChange : function (e) {

        e.preventDefault();

        // Render toggle value
        var $target = $(e.currentTarget),
            $rule = $target.parents('.reasonsRule'),
            $ruleValue = $rule.find('.reasonsRuleValue'),
            toggleFieldId = $target.val(),
            toggleField = Craft.ReasonsPlugin.getToggleFieldById(toggleFieldId),
            toggleFieldType = toggleField.type,
            toggleFieldSettings = toggleField.settings,
            ruleValueContent = '';

        switch (toggleFieldType) {

            // Lightswitch - true/false
            case 'Lightswitch':
                ruleValueContent = this.templates.select([
                    { true : Craft.t('on') },
                    { false : Craft.t('off') }
                ]);
                break;

            // Option based inputs
            case 'Dropdown': case 'MultiSelect': case 'Checkboxes': case 'RadioButtons': case 'ButtonBox_Buttons': case 'ButtonBox_Colours': case 'ButtonBox_TextSize': case 'ButtonBox_Width':
                var values = toggleFieldSettings.options,
                    options = [],
                    option;
                for (var i = 0; i < values.length; ++i){
                    option = {};
                    option[values[i].value] = values[i].label;
                    options.push(option);
                }
                ruleValueContent = this.templates.select(options, (toggleFieldType === 'MultiSelect' || toggleFieldType === 'Checkboxes'));
                break;

            // Number input
            case 'Number':
                ruleValueContent = this.templates.number(toggleFieldSettings);
                break;

            // Button Box – Stars
            case 'ButtonBox_Stars':
                var numStars = parseInt(toggleFieldSettings.numStars) + 1,
                    option,
                    options = [];
                for (var i = 0; i < numStars; ++i) {
                    option = {};
                    option[''+i] = i;
                    options.push(option);
                }
                ruleValueContent = this.templates.select(options);
                break;

            // // Color input
            // case 'Color':
            //     toggleFieldSettings = {
            //         placeholder : '#'
            //     };
            //     ruleValueContent = this.templates.input(toggleFieldSettings);
            //     break;

            // Position Select
            case 'PositionSelect':
                var values = toggleFieldSettings.options,
                    options = [],
                    option;
                for (var i = 0; i < values.length; ++i) {
                    option = {};
                    option[values[ i ]] = values[ i ].charAt(0).toUpperCase() + values[ i ].slice(1);
                    options.push(option);
                }
                ruleValueContent = this.templates.select(options);
                break;

            // Relational fields
            case 'Entries': case 'Categories': case 'Tags': case 'Assets': case 'Users': case 'Calendar_Event':
                var options = [
                    {
                        'null': Craft.t('Empty').toLowerCase()
                    },
                    {
                        'notnull': Craft.t('Not empty').toLowerCase()
                    }
                ];
                ruleValueContent = this.templates.select(options);
                break;

            // Just render a plain text input for anything else
            default :
                ruleValueContent = this.templates.input(toggleFieldSettings);
        }

        $ruleValue.html(ruleValueContent);

    },

    onReasonsRuleCompareChange : function (e)
    {
        e.preventDefault();
    },

    onReasonsRuleValueChange : function (e)
    {
        e.preventDefault();
    }

},
{
    defaults: {
        fieldId : null,
        toggleFields : null,
        rules : null,
        templates : {
            select : function(options,isMultiSelect)
            {
                var selectOptions = [],
                    option,
                    value,
                    label;
                for (var i = 0; i < options.length; ++i) {
                    option = options[i];
                    value = Object.keys(option)[0];
                    label = option[value];
                    selectOptions.push('<option value="' + value + '">' + label + '</option>');
                }
                return '<div class="' + (isMultiSelect ? 'multiselect': 'select') + '"><select' + (isMultiSelect ? ' multiple': '') + '>' + selectOptions.join('') + '</select></div>';
            },
            toggleSelectOption : function(toggleField, selected)
            {
                return '<option value="' + toggleField.id + '" data-type="' + toggleField.type + '"' + (selected ? ' selected': '') + '>' + toggleField.name + '</option>';
            },
            number : function(settings)
            {
                return '<div class="input"><input class="text" type="number" value="0" min="' + settings.min + '" max="' + settings.max + '" autocomplete="off"></div>';
            },
            input : function(settings)
            {
                var input = '';
                settings = $.extend({
                    initialRows : 4,
                    placeholder : '',
                    multiline : false
                },settings);
                if (settings.multiline === '1'){
                    input += '<textarea rows="' + settings.initialRows + '" placeholder="' + settings.placeholder + '" autocomplete="off"></textarea>';
                } else {
                    input += '<input class="text" type="text" size="20" value="" placeholder="' + settings.placeholder + '" autocomplete="off">';
                }
                return '<div class="input">' + input + '</div>';
            },
            builderUi : function()
            {
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
    },
    instances: []
});

module.exports = ConditionalsBuilder;
