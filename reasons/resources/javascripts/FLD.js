/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "javascripts/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(3);


/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	var Reasons = exports;
	
	$(function () {
	    Reasons.data = window._ReasonsData || false;
	});
	
	Reasons.getToggleFields = function () {
	    return Reasons.data.toggleFields || [];
	};
	
	Reasons.getToggleFieldById = function (fieldId) {
	    fieldId = parseInt(fieldId);
	    var toggleFields = Reasons.getToggleFields(),
	        numToggleFields = toggleFields.length;
	    for (var i = 0; i < numToggleFields; ++i) {
	        if (parseInt(toggleFields[i].id) === fieldId) {
	            return toggleFields[i];
	        }
	    }
	    return false;
	};
	
	Reasons.getConditionalsDataByEntryTypeId = function (entryTypeId) {
	    var conditionals;
	    for (var i = 0; i < Reasons.data.conditionals.length; ++i) {
	        conditionals = Reasons.data.conditionals[i];
	        if (conditionals.typeId == entryTypeId) {
	            return conditionals;
	        }
	    }
	    return false;
	};
	
	Reasons.getEntryTypeIdsBySectionId = function (sectionId) {
	    return Reasons.data.entryTypeIds && Reasons.data.entryTypeIds.hasOwnProperty(sectionId) ? Reasons.data.entryTypeIds[sectionId] : false;
	};
	
	Reasons.getFieldIdByHandle = function (fieldHandle) {
	    return Reasons.data.fieldIds && Reasons.data.fieldIds.hasOwnProperty(fieldHandle) ? Reasons.data.fieldIds[fieldHandle] : false;
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Reasons = __webpack_require__(2);
	
	Reasons.Builder = __webpack_require__(4);
	
	Reasons.FLD = {
	
	    settings: {
	        fieldLayoutFormSelector: '#fieldlayoutform',
	        formSelector: 'form:first',
	        fieldSettingsSelector: 'a.settings',
	        fieldSelector: '.fld-field',
	        tabSelector: '.fld-tabs .fld-tab'
	    },
	
	    init: function init() {
	
	        // Get DOM elements
	        this.$container = $(this.settings.fieldLayoutFormSelector);
	        if (this.$container.length === 0) return false;
	        this.$form = this.$container.parents(this.settings.formSelector);
	        if (this.$form.length === 0) return false;
	
	        // Get database ID and initial conditionals
	        var entryTypeId = parseInt(Craft.path.substring(Craft.path.indexOf('entrytypes/')).split('/')[1]) || 'new',
	            conditionalsData = Reasons.getConditionalsDataByEntryTypeId(entryTypeId);
	        if (conditionalsData) {
	            this.id = conditionalsData.id;
	            this.conditionals = conditionalsData.conditionals;
	        }
	
	        // Get available toggle field IDs
	        var self = this;
	        this.toggleFieldIds = [];
	        $.map(Reasons.getToggleFields(), function (toggleField) {
	            self.toggleFieldIds.push(parseInt(toggleField.id));
	        });
	
	        // This hidden input will store our serialized conditionals
	        this.$conditionalsInput = $(this.templates.input({
	            name: '_reasons',
	            type: 'hidden'
	        }));
	
	        // This hidden input stores the conditional's ID
	        this.$conditionalsIdInput = $(this.templates.input({
	            name: '_reasonsId',
	            value: this.id || '',
	            type: 'hidden'
	        }));
	
	        // Append the hidden input fields
	        this.$form.append(this.$conditionalsInput).append(this.$conditionalsIdInput)
	        // Attach submit event listener
	        .on('submit', $.proxy(this.onFormSubmit, this));
	
	        // Defer refresh
	        setTimeout($.proxy(this.refresh, this), 0);
	
	        // Hack time. Make sure stuff is kept up to date when fields move around
	        this.$container.on('mousedown', this.settings.fieldSelector, $.proxy(this.onFieldMouseDown, this));
	    },
	
	    refresh: function refresh() {
	
	        var self = this,
	            conditionals = {},
	            $fields,
	            $field,
	            fieldId,
	            toggleFields;
	
	        // Loop over tabs
	        this.$container.find(this.settings.tabSelector).each(function () {
	
	            // Get all fields for this tab
	            $fields = $(this).find(self.settings.fieldSelector);
	
	            // Get all toggle fields for this tab
	            toggleFields = [];
	            $fields.each(function () {
	                $field = $(this);
	                fieldId = parseInt($field.data('id'));
	                if (self.toggleFieldIds.indexOf(fieldId) > -1) {
	                    var toggleField = Reasons.getToggleFieldById(fieldId);
	                    if (toggleField) {
	                        toggleFields.push(toggleField);
	                    }
	                }
	            });
	
	            // Loop over fields
	            $fields.each(function () {
	
	                $field = $(this);
	                fieldId = parseInt($field.data('id'));
	
	                if (!$field.data('_reasonsBuilder')) {
	
	                    // Create builder
	                    $field.data('_reasonsBuilder', new Reasons.Builder({
	                        fieldId: fieldId,
	                        toggleFields: toggleFields,
	                        rules: self.conditionals && self.conditionals.hasOwnProperty(fieldId) ? self.conditionals[fieldId] : null
	                    }));
	                } else {
	
	                    // Refresh builder
	                    $field.data('_reasonsBuilder').update({
	                        toggleFields: toggleFields
	                    });
	                }
	
	                // Get rules
	                var rules = $field.data('_reasonsBuilder').getConditionals();
	                if (rules) {
	                    conditionals[fieldId] = rules;
	                    $field.addClass('reasonsHasConditionals');
	                } else {
	                    $field.removeClass('reasonsHasConditionals');
	                }
	
	                if (!$field.data('_reasonsSettingsMenuItemInitialized')) {
	
	                    // Create settings menu item
	                    var $button = $field.find(self.settings.fieldSettingsSelector),
	                        menubtn = $button.data('menubtn') || false;
	
	                    if (!menubtn) {
	                        return;
	                    }
	
	                    var $menu = menubtn.menu.$container;
	                    $menu.find('ul').children(':first').clone(true).prependTo($menu.find('ul:first')).find('a:first').data('_reasonsField', $field).attr('data-action', 'toggle-conditionals').text(Craft.t('Manage conditionals')).on('click', $.proxy(self.onFieldSettingsMenuItemClick, self));
	
	                    $field.data('_reasonsSettingsMenuItemInitialized', true);
	                }
	            });
	        });
	
	        if (Object.keys(conditionals).length === 0) {
	            this.$conditionalsInput.attr('value', '');
	        } else {
	            this.$conditionalsInput.attr('value', JSON.stringify(conditionals));
	        }
	    },
	
	    onFieldMouseDown: function onFieldMouseDown(e) {
	
	        var self = this,
	            mouseUpHandler = function mouseUpHandler(e) {
	            $('body').off('mouseup', mouseUpHandler);
	            self.refresh();
	        };
	
	        $('body').on('mouseup', mouseUpHandler);
	    },
	
	    onFieldSettingsMenuItemClick: function onFieldSettingsMenuItemClick(e) {
	
	        e.preventDefault();
	        e.stopPropagation();
	
	        var $trigger = $(e.target),
	            $field = $trigger.data('_reasonsField');
	
	        if (!$trigger.data('_reasonsModal')) {
	
	            // Create modal
	            var self = this,
	                builder = $field.data('_reasonsBuilder'),
	                $modal = $(this.templates.modal()),
	                modal = new Garnish.Modal($modal, {
	                resizable: true,
	                autoShow: false,
	                onShow: function onShow() {
	                    self.refresh();
	                },
	                onHide: function onHide() {
	                    self.refresh();
	                }
	            });
	
	            // Add builder to modal
	            builder.get().appendTo($modal.find('.body'));
	
	            $modal.on('click', '.close', function (e) {
	                modal.hide();
	            });
	
	            $trigger.data('_reasonsModal', modal);
	        }
	
	        $trigger.data('_reasonsModal').show();
	    },
	
	    onFormSubmit: function onFormSubmit() {
	        this.refresh();
	    },
	
	    templates: {
	        input: function input(settings) {
	            return '<input type="' + settings.type + '" name="' + (settings.name || '') + '" value="' + (settings.value || '') + '" />';
	        },
	        modal: function modal() {
	            return '<div class="modal elementselectormodal reasonsModal"><div class="body" /><div class="footer"><div class="buttons rightalign first"><div class="btn close submit">Done</div></div></div></div>';
	        }
	    }
	
	};
	
	$(function () {
	    Reasons.FLD.init();
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Reasons = __webpack_require__(2);
	
	module.exports = Garnish.Base.extend({
	
	    $container: null,
	
	    init: function init(settings) {
	
	        this.setSettings(settings, Reasons.Builder.defaults);
	
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
	        this.$container.on('click', '.reasonsAddRule', $.proxy(this.onReasonsAddRuleClick, this)).on('click', '.reasonsRemoveRule', $.proxy(this.onReasonsRemoveRuleClick, this)).on('click', '.reasonsAddStatement', $.proxy(this.onReasonsAddStatementClick, this)).on('change', '.reasonsRuleToggleField select', $.proxy(this.onReasonsRuleToggleFieldChange, this)).on('change', '.reasonsRuleCompare select', $.proxy(this.onReasonsRuleCompareChange, this)).on('change', '.reasonsRuleValue *:input', $.proxy(this.onReasonsRuleValueChange, this));
	
	        // Clean out the builder
	        this.$builder.html('');
	
	        // Update toggle fields
	        this.setToggleFields(this.settings.toggleFields);
	
	        // Render existing rules
	        if (this.settings.rules && this.settings.rules.length > 0) {
	            for (var i = 0; i < this.settings.rules.length; ++i) {
	                this.addStatement({
	                    rules: this.settings.rules[i]
	                });
	            }
	        }
	
	        this.refresh();
	
	        Reasons.Builder.instances.push(this);
	    },
	
	    get: function get() {
	        return this.$container;
	    },
	
	    disable: function disable() {
	        this.$container.addClass('disabled');
	    },
	
	    enable: function enable() {
	        this.$container.removeClass('disabled');
	    },
	
	    update: function update(settings) {
	
	        // Set new settings
	        this.setSettings(settings, this.settings);
	
	        // Set new toggle fields
	        this.setToggleFields(this.settings.toggleFields);
	
	        // Refresh
	        this.refresh();
	    },
	
	    setToggleFields: function setToggleFields(toggleFields) {
	
	        this.settings.toggleFields = [];
	        this.settings.toggleFieldIds = [];
	
	        for (var i = 0; i < toggleFields.length; ++i) {
	            if (parseInt(toggleFields[i].id) !== this.fieldId) {
	                this.settings.toggleFields.push(toggleFields[i]);
	                this.settings.toggleFieldIds.push(parseInt(toggleFields[i].id));
	            }
	        }
	
	        // Update rule template
	        var toggleFieldSelectOptions = '';
	        for (var i = 0; i < this.settings.toggleFields.length; ++i) {
	            toggleFieldSelectOptions += this.templates.toggleSelectOption(this.settings.toggleFields[i]);
	        }
	        this.$rule.find('.reasonsRuleToggleField select').html(toggleFieldSelectOptions);
	    },
	
	    refresh: function refresh() {
	
	        this.settings.rules = [];
	
	        var toggleFields = this.settings.toggleFields;
	
	        // If no toggle fields, GTFO
	        if (toggleFields.length === 0) {
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
	            toggleSelectOpts,
	            toggleFieldId;
	
	        $statements.each(function () {
	
	            statement = [];
	            $statement = $(this);
	            $rules = $statement.find('.reasonsRule');
	
	            $rules.each(function () {
	
	                $rule = $(this);
	
	                $toggleSelect = $rule.find('.reasonsRuleToggleField select');
	                toggleSelectValue = parseInt($toggleSelect.val());
	
	                // Remove rules where the selected toggle field no longer exists
	                if (self.settings.toggleFieldIds.indexOf(toggleSelectValue) === -1) {
	                    $rule.remove();
	                    return;
	                }
	
	                // Re-render toggle select
	                toggleSelectOpts = '';
	                for (var i = 0; i < self.settings.toggleFields.length; ++i) {
	                    toggleSelectOpts += self.templates.toggleSelectOption(toggleFields[i], parseInt(toggleFields[i].id) === toggleSelectValue);
	                }
	                $toggleSelect.html(toggleSelectOpts);
	
	                // Create the rule
	                statement.push({
	                    fieldId: toggleSelectValue,
	                    compare: $rule.find('.reasonsRuleCompare select').val(),
	                    value: $rule.find('.reasonsRuleValue *:input:first').val()
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
	
	    getConditionals: function getConditionals() {
	        return this.settings.rules && this.settings.rules.length > 0 ? this.settings.rules : false;
	    },
	
	    addStatement: function addStatement(settings) {
	
	        settings = $.extend({
	            rules: false
	        }, settings);
	
	        var $statement = this.$statement.clone(true),
	            rules = settings.rules;
	
	        // Append the statement
	        this.$builder.append($statement);
	
	        if (!rules) {
	
	            // This is a new statement. Just add a default rule
	            this.addRule({
	                target: $statement
	            });
	        } else {
	
	            for (var i = 0; i < rules.length; ++i) {
	                this.addRule($.extend({
	                    target: $statement
	                }, rules[i]));
	            }
	        }
	
	        return $statement;
	    },
	
	    addRule: function addRule(settings) {
	
	        settings = $.extend({
	            fieldId: null,
	            compare: null,
	            value: null
	        }, settings);
	
	        var $rule = this.$rule.clone(true),
	            $target = settings.target || this.$builder.find('.reasonsStatement:last'),
	            fieldId = settings.fieldId,
	            compare = settings.compare,
	            value = settings.value,
	            toggleField;
	
	        // Build the rule
	        if (fieldId) {
	            $rule.find('.reasonsRuleToggleField select').val(fieldId);
	        }
	
	        // Validate selected value TODO: Buggy/incomplete
	        // if(fieldId !== null){
	        //     toggleField = Reasons.getToggleFieldById(fieldId);
	        //     if (!toggleField){
	        //         return false;
	        //     }
	        //     if(value !== null && toggleField.settings.options){
	        //         var possibleValues = [];
	        //         for (var i = 0; i < toggleField.settings.options.length; ++i){
	        //             possibleValues.push(toggleField.settings.options[i].value);
	        //         }
	        //         console.log('*****',possibleValues);
	        //         if(possibleValues.indexOf(value) === -1){
	        //             return false;
	        //         }
	        //     }
	        // }
	
	        // Append the rule
	        if ($target.length > 0) {
	            $target.find('.reasonsRules:first').append($rule);
	        } else {
	            return false;
	        }
	
	        $rule.find('.reasonsRuleToggleField select').trigger('change');
	
	        if (compare) {
	            $rule.find('.reasonsRuleCompare select').val(compare);
	        }
	
	        if (value) {
	            $rule.find('.reasonsRuleValue *:input:first').val(value);
	        }
	
	        return $rule;
	    },
	
	    onReasonsAddRuleClick: function onReasonsAddRuleClick(e) {
	        e.preventDefault();
	        var $target = $(e.currentTarget).parents('.reasonsStatement');
	        this.addRule({
	            target: $target
	        });
	    },
	
	    onReasonsRemoveRuleClick: function onReasonsRemoveRuleClick(e) {
	        e.preventDefault();
	        var $target = $(e.currentTarget),
	            $rule = $target.parents('.reasonsRule');
	        $rule.remove();
	        this.refresh();
	    },
	
	    onReasonsAddStatementClick: function onReasonsAddStatementClick(e) {
	        e.preventDefault();
	        this.addStatement();
	    },
	
	    onReasonsRuleToggleFieldChange: function onReasonsRuleToggleFieldChange(e) {
	
	        e.preventDefault();
	
	        // Render toggle value
	        var $target = $(e.currentTarget),
	            $rule = $target.parents('.reasonsRule'),
	            $ruleValue = $rule.find('.reasonsRuleValue'),
	            toggleFieldId = $target.val(),
	            toggleField = Reasons.getToggleFieldById(toggleFieldId),
	            toggleFieldType = toggleField.type,
	            toggleFieldSettings = toggleField.settings,
	            ruleValueContent = '';
	
	        switch (toggleFieldType) {
	
	            // Lightswitch - true/false
	            case 'Lightswitch':
	                ruleValueContent = this.templates.select([{ 'true': Craft.t('on') }, { 'false': Craft.t('off') }]);
	                break;
	
	            // Option based inputs
	            case 'Dropdown':case 'MultiSelect':case 'Checkboxes':case 'RadioButtons':
	                var values = toggleFieldSettings.options,
	                    options = [],
	                    option;
	                for (var i = 0; i < values.length; ++i) {
	                    option = {};
	                    option[values[i].value] = values[i].label;
	                    options.push(option);
	                }
	                ruleValueContent = this.templates.select(options);
	                break;
	
	            // Number input
	            case 'Number':
	                ruleValueContent = this.templates.number(toggleFieldSettings);
	                break;
	
	            // // Color input
	            // case 'Color' :
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
	                    option[values[i]] = values[i].charAt(0).toUpperCase() + values[i].slice(1);
	                    options.push(option);
	                }
	                ruleValueContent = this.templates.select(options);
	                break;
	
	            // Just render a plain text input for anything else
	            default:
	                ruleValueContent = this.templates.input(toggleFieldSettings);
	        }
	
	        $ruleValue.html(ruleValueContent);
	    },
	
	    onReasonsRuleCompareChange: function onReasonsRuleCompareChange(e) {
	        e.preventDefault();
	    },
	
	    onReasonsRuleValueChange: function onReasonsRuleValueChange(e) {
	        e.preventDefault();
	    }
	
	}, {
	    defaults: {
	        fieldId: null,
	        toggleFields: null,
	        rules: null,
	        templates: {
	            select: function select(options) {
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
	                return '<div class="select"><select>' + selectOptions.join('') + '</select></div>';
	            },
	            toggleSelectOption: function toggleSelectOption(toggleField, selected) {
	                return '<option value="' + toggleField.id + '" data-type="' + toggleField.type + '"' + (selected ? ' selected' : '') + '>' + toggleField.name + '</option>';
	            },
	            number: function number(settings) {
	                return '<div class="input"><input class="text" type="number" value="0" min="' + settings.min + '" max="' + settings.max + '" autocomplete="off"></div>';
	            },
	            input: function input(settings) {
	                var input = '';
	                settings = $.extend({
	                    initialRows: 4,
	                    placeholder: '',
	                    multiline: false
	                }, settings);
	                if (settings.multiline === '1') {
	                    input += '<textarea rows="' + settings.initialRows + '" placeholder="' + settings.placeholder + '" autocomplete="off"></textarea>';
	                } else {
	                    input += '<input class="text" type="text" size="20" value="" placeholder="' + settings.placeholder + '" autocomplete="off">';
	                }
	                return '<div class="input">' + input + '</div>';
	            },
	            builderUi: function builderUi() {
	                return '<div class="reasonsBuilderUi">' + '<div class="wrapper">' + '<div class="heading"><span>' + Craft.t('Show this field if') + '</span></div>' + '<div class="reasonsBuilder">' + '<div class="reasonsStatement">' + '<span class="delimiter">' + Craft.t('or') + '</span>' + '<div class="reasonsRules">' + '<div class="reasonsRule">' + '<div class="reasonsRuleParams">' + '<div class="select reasonsRuleToggleField"><select /></div>' + '<div class="select reasonsRuleCompare">' + '<select>' + '<option value="==">' + Craft.t('is equal to') + '</option>' + '<option value="!=">' + Craft.t('is not equal to') + '</option>' + '</select>' + '</div>' + '<div class="reasonsRuleValue" />' + '</div>' + '<div class="reasonsRuleAmend">' + '<a class="delete icon reasonsRemoveRule" title="' + Craft.t('Remove rule') + '"></a>' + '<a class="add icon reasonsAddRule" title="' + Craft.t('and') + '"></a>' + '</div>' + '<span class="reasonsRuleLead">' + Craft.t('and') + '</span>' + '</div>' + '</div>' + '</div>' + '</div>' + '<div class="reasonsAdd">' + '<a class="btn reasonsAddStatement">' + Craft.t('Add rules') + '</a>' + '</div>' + '</div>' + '<div class="reasonsMessage"></div>' + '</div>';
	            }
	        }
	    },
	    instances: []
	});

/***/ }
/******/ ]);
//# sourceMappingURL=FLD.js.map