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

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Reasons = __webpack_require__(2);
	
	Reasons.EditForm = {
	
	    settings: {
	        editFormSelector: '#entry-form',
	        fieldsContainerSelector: '#fields',
	        fieldsSelector: '.field:not(#title-field)',
	        entryTypeSelectSelector: '#entryType',
	        lightswitchContainerSelector: '.lightswitch',
	        positionSelectContainerSelector: '.btngroup'
	    },
	
	    init: function init() {
	        this.$container = $(this.settings.editFormSelector);
	        if (this.$container.length === 0) return false;
	        this.sectionId = parseInt(this.$container.find('input[name="sectionId"]').val());
	
	        if (this.sectionId) {
	            this.elementType = 'entries'; // TODO: Will change this when we can haz more element types
	        }
	
	        // Get entry type ID
	        this.$entryTypeSelect = $(this.settings.entryTypeSelectSelector);
	        if (this.$entryTypeSelect.length === 0) {
	            // Only one entry type ID, get it from Reasons
	            var entryTypeIds = Reasons.getEntryTypeIdsBySectionId(this.sectionId);
	            this.entryTypeId = entryTypeIds && entryTypeIds.length > 0 ? entryTypeIds.shift() : false;
	        } else {
	            // Set entry type ID
	            this.entryTypeId = this.$entryTypeSelect.val();
	        }
	
	        // Listen for AJAX complete, to handle entry type switching
	        this.currentUrl = window.location.href;
	        $(document).ajaxComplete($.proxy(this.onAjaxComplete, this));
	
	        // Add some event listeners
	        this.$container.on('click', this.settings.fieldsSelector + '[data-toggle="1"]', $.proxy(this.onInputWrapperClick, this)).on('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input', $.proxy(this.onFieldInputChange, this));
	
	        this.render();
	    },
	
	    render: function render() {
	        if (this.initToggleFields()) {
	            this.evaluateConditionals();
	        }
	    },
	
	    initToggleFields: function initToggleFields() {
	
	        var conditionalsData = Reasons.getConditionalsDataByEntryTypeId(this.entryTypeId);
	
	        if (conditionalsData && conditionalsData.sectionId == this.sectionId && conditionalsData.typeId == this.entryTypeId && conditionalsData.conditionals) {
	            this.conditionals = conditionalsData.conditionals;
	        } else {
	            return false;
	        }
	
	        // Get all current fields
	        this.$fieldContainer = $(this.settings.fieldsContainerSelector);
	        this.$fields = this.$fieldContainer.find(this.settings.fieldsSelector);
	
	        if (this.$fieldContainer.length === 0 || this.$fields.length === 0) {
	            return false;
	        }
	
	        // Get toggle field IDs
	        var toggleFieldIds = [];
	        for (fieldId in this.conditionals) {
	            for (var i = 0; i < this.conditionals[fieldId].length; ++i) {
	                toggleFieldIds.push(this.conditionals[fieldId][i][0].fieldId);
	            }
	        }
	
	        // Loop over fields and add data-id attribute
	        var self = this,
	            $field,
	            fieldHandle,
	            fieldId;
	
	        this.$fields.each(function () {
	            $field = $(this);
	            fieldHandle = $field.attr('id').split('-')[1] || false;
	            fieldId = Reasons.getFieldIdByHandle(fieldHandle);
	            if (fieldId) {
	                $field.attr('data-id', fieldId);
	            }
	            // Is this a target field?
	            if (self.conditionals[fieldId]) {
	                $field.attr('data-target', 1);
	            }
	            // Is this a toggle field
	            if (toggleFieldIds.indexOf(parseInt(fieldId)) > -1) {
	                $field.attr('data-toggle', 1);
	            }
	        });
	
	        return true;
	    },
	
	    evaluateConditionals: function evaluateConditionals(fieldId) {
	
	        var self = this,
	            $targetFields = this.$fieldContainer.find(this.settings.fieldsSelector + '[data-target="1"]'),
	            $targetField,
	            statements,
	            statementValid,
	            rules,
	            rule,
	            $toggleField,
	            $toggleFieldInput,
	            toggleFieldData,
	            toggleFieldValue;
	
	        $targetFields.removeClass('reasonsHide').each(function () {
	
	            $targetField = $(this);
	            statements = self.conditionals[$targetField.data('id')] || false;
	
	            if (!statements) {
	                return;
	            }
	
	            var numStatements = statements.length,
	                numValidStatements = numStatements;
	
	            for (var i = 0; i < numStatements; ++i) {
	
	                statementValid = true;
	                rules = statements[i];
	
	                for (var j = 0; j < rules.length; ++j) {
	
	                    rule = rules[j];
	
	                    $toggleField = self.$fieldContainer.find(self.settings.fieldsSelector + '[data-id="' + rule.fieldId + '"]');
	                    if ($toggleField.length === 0) {
	                        continue;
	                    }
	
	                    toggleFieldData = Reasons.getToggleFieldById(rule.fieldId);
	                    toggleFieldValue = null;
	
	                    switch (toggleFieldData.type) {
	                        case 'Lightswitch':
	                            $toggleFieldInput = $toggleField.find('*:input:first');
	                            if ($toggleFieldInput.length > 0) {
	                                toggleFieldValue = $toggleFieldInput.val() === '1' ? 'true' : 'false';
	                            }
	                            break;
	                        case 'Checkboxes':case 'RadioButtons':
	                            toggleFieldValue = $toggleField.find('input:checkbox:checked,input:radio:checked').map(function () {
	                                return $(this).val();
	                            }).get();
	                            break;
	                        default:
	                            $toggleFieldInput = $toggleField.find('*:input:first');
	                            toggleFieldValue = $toggleFieldInput.val();
	                            break;
	                    }
	
	                    // Flatten array values for easier comparisons
	                    if ($.isArray(toggleFieldValue)) {
	                        toggleFieldValue = toggleFieldValue.join('');
	                    }
	                    if ($.isArray(rule.value)) {
	                        rule.value = rule.value.join('');
	                    }
	
	                    // Compare trigger field value to expected value
	                    switch (rule.compare) {
	                        case '!=':
	                            if (toggleFieldValue == rule.value) {
	                                statementValid = false;
	                            }
	                            break;
	                        case '==':default:
	                            if (toggleFieldValue != rule.value) {
	                                statementValid = false;
	                            }
	                            break;
	                    }
	
	                    console.log('toggle', toggleFieldValue, 'rule', rule.value, rule.compare);
	                    console.log('----');
	
	                    if (!statementValid) {
	                        numValidStatements--;
	                        break;
	                    }
	                }
	            }
	
	            if (numValidStatements <= 0) {
	                $targetField.addClass('reasonsHide');
	            }
	        });
	    },
	
	    onAjaxComplete: function onAjaxComplete(e, status, requestData) {
	        if (requestData.url.indexOf('switchEntryType') === -1) {
	            return false;
	        }
	        this.entryTypeId = this.$entryTypeSelect.val();
	        this.render();
	    },
	
	    onInputWrapperClick: function onInputWrapperClick(e) {
	        $(e.currentTarget).find('input:first').trigger('change');
	    },
	
	    onFieldInputChange: function onFieldInputChange(e) {
	        this.evaluateConditionals();
	    }
	
	};
	
	$(function () {
	    Reasons.EditForm.init();
	});

/***/ },
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

/***/ }
/******/ ]);
//# sourceMappingURL=EditForm.js.map