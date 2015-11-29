var Reasons = require('./reasons');

Reasons.EditForm = {

    settings : {
        fieldsSelector : '.field:not(#title-field)',
        livePreviewEditorSelector : '.lp-editor',
        elementEditorSelector : '.elementeditor',
        entryTypeSelectSelector : '#entryType',
        lightswitchContainerSelector : '.lightswitch',
        positionSelectContainerSelector : '.btngroup',
    },

    init : function ()
    {

        // Get section ID. This will change in an upcoming release, when we add the remaining built-in element types!
        this.sectionId = parseInt($('input[type="hidden"][name="sectionId"]').val());

        if (this.sectionId) // We'll assume the user is currently editing an entry
        {
            // Init entry type switching
            this.$entryTypeSelect = $(this.settings.entryTypeSelectSelector);
            if (this.$entryTypeSelect.length === 0){
                // Only one entry type ID, get it from Reasons
                var entryTypeIds = Reasons.getEntryTypeIdsBySectionId(this.sectionId);
                this.entryTypeId = entryTypeIds && entryTypeIds.length > 0 ? entryTypeIds.shift() : false;
            } else {
                // Set entry type ID
                this.entryTypeId = this.$entryTypeSelect.val();
            }
            // Init Live Preview support
            if (Craft.livePreview)
            {
                Craft.livePreview.on('enter', $.proxy(this.onLivePreviewEnter, this));
                Craft.livePreview.on('exit', $.proxy(this.onLivePreviewExit, this));
            }
        }
        else
        {
            return false; // TODO Just for now. We're going to support element editors etc, so this will also change.
        }

        // Listen for AJAX complete, to handle entry type switching etc
        this.currentUrl = window.location.href;
        $(document).ajaxComplete($.proxy(this.onAjaxComplete,this));

        // Add some event listeners
        $(document)
            .on('click', this.settings.fieldsSelector + '[data-toggle="1"]', $.proxy(this.onInputWrapperClick,this))
            .on('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input', $.proxy(this.onFieldInputChange,this));

        this.render();

    },

    render : function()
    {
        if(this.initToggleFields()){
            this.evaluateConditionals();
        }
    },

    getFieldsSelector : function ()
    {
        var selectorPath = [this.settings.fieldsSelector];
        if (this.isLivePreview)
        {
            selectorPath.unshift(this.settings.livePreviewEditorSelector);
        }
        else if (this.isElementEditor)
        {
            selectorPath.unshift(this.settings.elementEditorSelector);
        }
        return selectorPath.join(' ');
    },

    initToggleFields : function()
    {

        var conditionalsData = Reasons.getConditionalsDataByEntryTypeId(this.entryTypeId);

        if (conditionalsData && conditionalsData.sectionId == this.sectionId && conditionalsData.typeId == this.entryTypeId && conditionalsData.conditionals) {
            this.conditionals = conditionalsData.conditionals;
        } else {
            return false;
        }

        // Get all current fields
        this.$fields = $(this.getFieldsSelector());

        if (this.$fields.length === 0) return false;

        // Get toggle field IDs
        var toggleFieldIds = [];
        for (fieldId in this.conditionals){
            for (var i = 0; i < this.conditionals[fieldId].length; ++i){
                toggleFieldIds.push(this.conditionals[fieldId][i][0].fieldId);
            }
        }

        // Loop over fields and add data-id attribute
        var self = this,
            $field,
            fieldHandle,
            fieldId;

        this.$fields.each(function(){
            $field = $(this);
            if ($field.attr('id') === undefined) return;
            fieldHandle = $field.attr('id').split('-')[1] || false;
            fieldId = Reasons.getFieldIdByHandle(fieldHandle);
            if (fieldId){
                $field.attr('data-id',fieldId);
            }
            // Is this a target field?
            if (self.conditionals[fieldId]){
                $field.attr('data-target',1);
            }
            // Is this a toggle field
            if (toggleFieldIds.indexOf(parseInt(fieldId)) > -1){
                $field.attr('data-toggle',1);
            }
        });

        return true;

    },

    evaluateConditionals : function()
    {

        var self = this,
            $targetFields = $(this.getFieldsSelector() + '[data-target="1"]'),
            $targetField,
            statements,
            statementValid,
            rules,
            rule,
            $toggleField,
            $toggleFieldInput,
            toggleFieldData,
            toggleFieldValue;

        $targetFields
            .removeClass('reasonsHide')
            .each(function(){

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

                        $toggleField = $(self.getFieldsSelector() + '[data-id="' + rule.fieldId + '"]');
                        if ($toggleField.length === 0)
                        {
                            continue;
                        }

                        toggleFieldData = Reasons.getToggleFieldById(rule.fieldId);
                        toggleFieldValue = null;

                        switch (toggleFieldData.type)
                        {
                            case 'Lightswitch' :
                                $toggleFieldInput = $toggleField.find('*:input:first');
                                if ($toggleFieldInput.length > 0) {
                                    toggleFieldValue = $toggleFieldInput.val() === '1' ? 'true' : 'false';
                                }
                                break;
                            case 'Checkboxes' : case 'RadioButtons' :
                                toggleFieldValue = $toggleField.find('input:checkbox:checked,input:radio:checked').map(function(){
                                    return $(this).val();
                                }).get();
                                break;
                            default :
                                $toggleFieldInput = $toggleField.find('*:input:first');
                                toggleFieldValue = $toggleFieldInput.val();
                                break;
                        }

                        // Flatten array values for easier comparisons
                        if ($.isArray(toggleFieldValue))
                        {
                            toggleFieldValue = toggleFieldValue.join('');
                        }
                        if ($.isArray(rule.value))
                        {
                            rule.value = rule.value.join('');
                        }

                        // Compare trigger field value to expected value
                        switch (rule.compare) {
                            case '!=' :
                                if (toggleFieldValue == rule.value){
                                    statementValid = false;
                                }
                                break;
                            case '==' : default :
                                if (toggleFieldValue != rule.value){
                                    statementValid = false;
                                }
                                break;
                        }

                        if (!statementValid) {
                            numValidStatements--;
                            break;
                        }

                    }

                }

                if (numValidStatements <= 0){
                    $targetField.addClass('reasonsHide');
                }

        });
    },

    onAjaxComplete : function(e, status, requestData)
    {
        if (requestData.url.indexOf('switchEntryType') > -1)
        {
            this.entryTypeId = this.$entryTypeSelect.val();
            this.render();
        }
        // else if (requestData.url.indexOf('getEditorHtml') > -1)
        // {
        //     Garnish.requestAnimationFrame($.proxy(function()
        //     {
        //         var $elementEditor = $(this.settings.elementEditorSelector);
        //         if ($elementEditor.length > 0)
        //         {
        //             var $hud = $elementEditor.closest('.hud');
        //             if ($hud.length > 0 && $hud.data('elementEditor'))
        //             {
        //                 var elementEditor = $hud.data('elementEditor');
        //                 if (elementEditor.hud)
        //                 {
        //                     elementEditor.hud.on('hide', $.proxy(this.onElementEditorHide, this));
        //                 }
        //                 this.onElementEditorShow();
        //             }
        //         }
        //     }, this));
        // }
        else
        {
            return false;
        }
    },

    onLivePreviewEnter : function ()
    {
        this.isLivePreview = true;
        this.render();
    },

    onLivePreviewExit : function ()
    {
        this.isLivePreview = false;
        this.render();
    },

    onElementEditorShow : function ()
    {
        this.isElementEditor = true;
        this.render();
    },

    onElementEditorHide : function ()
    {
        this.isElementEditor = false;
        this.render();
    },

    onInputWrapperClick : function(e)
    {
        $(e.currentTarget).find('input:first').trigger('change');
    },

    onFieldInputChange : function(e)
    {
        this.evaluateConditionals();
    }

};

if (window.$) $(function(){ Reasons.EditForm.init(); });
