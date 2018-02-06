(function (window){

    if (!window.Craft) {
        return false;
    }

    Craft.ReasonsPlugin = {

        FieldLayoutDesigner : require('./modules/fld'),
        ConditionalsRenderer : require('./modules/render'),

        ASSET_SOURCE_HANDLE :       'assetSource',
        CATEGORY_GROUP_HANDLE :     'categoryGroup',
        TAG_GROUP_HANDLE :          'tagGroup',
        GLOBAL_SET_HANDLE :         'globalSet',
        ENTRY_TYPE_HANDLE :         'entryType',
        SECTION_HANDLE :            'section',
        USERS_HANDLE :              'users',
        FIELDS_HANDLE :             'field',
        SOLSPACE_CALENDAR_HANDLE :  'solspaceCalendar',

        ASSET_SOURCE_ACTION :       'assetSources/saveSource',
        CATEGORY_ACTION :           'categories/saveCategory',
        CATEGORY_GROUP_ACTION :     'categories/saveGroup',
        TAG_ACTION :                'tagManager/saveTag',
        TAG_GROUP_ACTION :          'tags/saveTagGroup',
        GLOBAL_SET_CONTENT_ACTION : 'globals/saveContent',
        GLOBAL_SET_ACTION :         'globals/saveSet',
        ENTRY_ACTION :              'entries/saveEntry',
        ENTRY_REVISION_ACTION :     'entryRevisions/saveDraft',
        ENTRY_TYPE_ACTION :         'sections/saveEntryType',
        USERS_ACTION :              'users/saveUser',
        USERS_FIELDS_ACTION :       'users/saveFieldLayout',
        FIELDS_ACTION :             'fields/saveField',
        SOLSPACE_CALENDAR_EVENTS_ACTION :  'calendar/events/saveEvent',
        SOLSPACE_CALENDAR_SETTINGS_ACTION: 'calendar/calendars/saveCalendar',
        SOLSPACE_CALENDAR_LEGACY_SETTINGS_ACTION : 'calendar/settings/saveSettings', // Solspace Calendar < 1.7.0

        RENDER_CONTEXT :            'render',
        LAYOUT_DESIGNER_CONTEXT :   'fld',
        FIELD_DESIGNER_CONTEXT :    'field',


        /*
        *   Initialize Reasons
        *
        */
        init : function (data)
        {
            this.data = data;
            this.initPrimaryForm();
        },

        /*
        *   Init the primary form. This can be an FLD form, a field designer form or an element editing form
        *
        */
        initPrimaryForm : function ()
        {
            this.destroyPrimaryForm();
            Garnish.requestAnimationFrame((function () {
                var $form = (Craft.cp.$primaryForm && Craft.cp.$primaryForm.length) ? Craft.cp.$primaryForm : $('#content form:first');
                if ($form && $form.length) {
                    this.primaryForm = this.initForm($form);
                }
            }).bind(this));
        },

        destroyPrimaryForm : function ()
        {
            if (this.primaryForm) {
                this.primaryForm.destroy();
                delete this.primaryForm;
            }
        },

        /*
        *   Element editor
        *
        */
        initElementEditor : function (conditionalsKey)
        {

            var conditionals = this.getConditionals(conditionalsKey);

            if (!conditionals) {
                return false;
            }

            var now = new Date().getTime(),
                doInitElementEditor = (function () {

                    var timestamp = new Date().getTime(),
                        $elementEditor = $('.elementeditor:last'),
                        $hud = $elementEditor.length > 0 ? $elementEditor.closest('.hud') : false,
                        elementEditor = $hud && $hud.length > 0 ? $hud.data('elementEditor') : false,
                        $form = elementEditor ? elementEditor.$form : false;

                    if ($form) {
                        elementEditor['_reasonsForm'] = new this.ConditionalsRenderer($form, conditionals);
                        elementEditor.hud.on('hide', $.proxy(this.destroyElementEditorForm, this, elementEditor));
                    } else if (timestamp - now < 2000) { // Poll for 2 secs
                        Garnish.requestAnimationFrame(doInitElementEditor);
                    }

                }).bind(this);

            doInitElementEditor();

        },

        destroyElementEditorForm : function (elementEditor)
        {
            var form = elementEditor._reasonsForm || null;
            if (form) {
                form.destroy();
                delete elementEditor._reasonsForm;
            }
        },

        /*
        *   Init form
        *
        */
        initForm : function ($form)
        {

            var formData = this.getElementSourceFromForm($form),
                context = formData ? this.getFormContext($form) : false;

            if (!formData || !context) {
                return false;
            }

            var conditionalsKey = formData.type + (formData.id ? ':' + formData.id : ''),
                conditionals = this.getConditionals(conditionalsKey);

            switch (context) {

                case this.LAYOUT_DESIGNER_CONTEXT :
                    return new this.FieldLayoutDesigner($form, conditionals);
                    break;

                case this.FIELD_DESIGNER_CONTEXT :
                    return null;
                    //return new this.FieldDesigner($form, conditionals); TODO – Matrix support is coming :)
                    break;

                case this.RENDER_CONTEXT :
                    return conditionals ? new this.ConditionalsRenderer($form, conditionals) : null;

            }

            return null;

        },

        /*
        *   Core methods
        *
        */
        getConditionals : function (key)
        {
            return key ? (this.data.conditionals && this.data.conditionals.hasOwnProperty(key) ? this.data.conditionals[key] : null) : (this.data.conditionals || {});
        },

        getToggleFields : function () {
            return this.data.toggleFields ? this.data.toggleFields : [];
        },

        getToggleFieldById : function(fieldId)
        {
            fieldId = parseInt(fieldId);
            var toggleFields = this.getToggleFields(),
                numToggleFields = toggleFields.length;
            for (var i = 0; i < numToggleFields; ++i) {
                if (parseInt(toggleFields[i].id) === fieldId){
                    return toggleFields[i];
                }
            }
            return false;
        },

        getFieldIds : function ()
        {
            return this.data.fieldIds ? this.data.fieldIds : {};
        },

        getFieldIdByHandle : function (fieldHandle)
        {
            var fieldIds = this.getFieldIds();
            return fieldIds && fieldIds.hasOwnProperty(fieldHandle) ? fieldIds[fieldHandle] : false;
        },

        getToggleFieldTypes : function ()
        {
            return this.data.toggleFieldTypes ? this.data.toggleFieldTypes : [];
        },

        getElementSourceFromForm : function ($form)
        {

            if ($form.data('elementEditor')) {
                return false;
            }

            // Get namespace
            var namespace = $form.find('input[type="hidden"][name="namespace"]').val();
            if (namespace) {
                namespace += '-';
            }

            var action = $form.find('input[type="hidden"][name="action"]').val(),
                type,
                idInputSelector;

            switch (action) {

                case this.ASSET_SOURCE_ACTION :
                    type = this.ASSET_SOURCE_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="sourceId"]';
                    break;

                case this.CATEGORY_ACTION :
                case this.CATEGORY_GROUP_ACTION :
                    type = this.CATEGORY_GROUP_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="groupId"]';
                    break;

                case this.GLOBAL_SET_CONTENT_ACTION:
                case this.GLOBAL_SET_ACTION :
                    type = this.GLOBAL_SET_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="setId"]';
                    break;

                case this.ENTRY_ACTION :
                case this.ENTRY_REVISION_ACTION :
                    var $entryType = $form.find('select#entryType, input[type="hidden"][name="entryTypeId"], input[type="hidden"][name="typeId"], #' + namespace + 'entryType');
                    type = $entryType.length ? this.ENTRY_TYPE_HANDLE : this.SECTION_HANDLE;
                    idInputSelector = $entryType.length ? 'select#entryType, input[type="hidden"][name="entryTypeId"], input[type="hidden"][name="typeId"], #' + namespace + 'entryType' : 'input[type="hidden"][name="sectionId"], #' + namespace + 'section';
                    break;

                case this.ENTRY_TYPE_ACTION :
                    type = this.ENTRY_TYPE_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="entryTypeId"]';
                    break;

                case this.TAG_ACTION :
                case this.TAG_GROUP_ACTION :
                    type = this.TAG_GROUP_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="tagGroupId"], input[type="hidden"][name="groupId"]';
                    break;

                case this.USERS_ACTION :
                case this.USERS_FIELDS_ACTION :
                    type = this.USERS_HANDLE;
                    break;

                case this.FIELDS_ACTION :
                    type = this.FIELDS_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="fieldId"]';
                    break;

                case this.SOLSPACE_CALENDAR_LEGACY_SETTINGS_ACTION :
                    type = this.SOLSPACE_CALENDAR_HANDLE;
                    break;

                case this.SOLSPACE_CALENDAR_EVENTS_ACTION :
                    type = this.SOLSPACE_CALENDAR_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="calendarEvent[calendarId]"]';
                    break;

                case this.SOLSPACE_CALENDAR_SETTINGS_ACTION :
                    type = this.SOLSPACE_CALENDAR_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="calendarId"]';
                    break;

                case this.COMMERCE_PRODUCT_TYPE_ACTION :
                case this.COMMERCE_PRODUCT_ACTION :
                    type = this.COMMERCE_PRODUCT_TYPE_HANDLE;
                    idInputSelector = 'input[type="hidden"][name="typeId"]';
                    break;

            }

            if (!type) {
                return false;
            }

            return {
                type : type,
                id : idInputSelector ? ($form.find(idInputSelector).val() | 0) : false
            };

        },

        getFormContext : function ($form)
        {

            if ($form.data('elementEditor')) {
                return false;
            }

            var action = $form.find('input[type="hidden"][name="action"]').val();

            switch (action) {

                case this.GLOBAL_SET_CONTENT_ACTION :
                case this.ENTRY_ACTION :
                case this.ENTRY_REVISION_ACTION :
                case this.TAG_ACTION :
                case this.CATEGORY_ACTION :
                case this.USERS_ACTION :
                case this.SOLSPACE_CALENDAR_EVENTS_ACTION :
                case this.COMMERCE_PRODUCT_ACTION :
                    return this.RENDER_CONTEXT;

                case this.ASSET_SOURCE_ACTION :
                case this.CATEGORY_GROUP_ACTION :
                case this.GLOBAL_SET_ACTION :
                case this.ENTRY_TYPE_ACTION :
                case this.TAG_GROUP_ACTION :
                case this.USERS_FIELDS_ACTION :
                case this.SOLSPACE_CALENDAR_LEGACY_SETTINGS_ACTION :
                case this.SOLSPACE_CALENDAR_SETTINGS_ACTION :
                case this.COMMERCE_PRODUCT_TYPE_ACTION :
                    return this.LAYOUT_DESIGNER_CONTEXT;

                case this.FIELDS_ACTION :
                    return this.FIELD_DESIGNER_CONTEXT;

            }

            return false;

        }

    };

}(window));

if (window.jQuery) {
    /*!
     * jQuery.fn.hasAttr()
     *
     * Copyright 2011, Rick Waldron
     * Licensed under MIT license.
     *
     */
    (function( jQuery ) {
      jQuery.fn.hasAttr = function( name ) {
          for ( var i = 0, l = this.length; i < l; i++ ) {
              if ( !!( this.attr( name ) !== undefined ) ) {
                  return true;
              }
          }
          return false;
      };
    })( jQuery );
}
