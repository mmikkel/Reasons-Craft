/**
 * Reasons Entry Edit Form
 */
(function($){

if (typeof Reasons == 'undefined'){
    Reasons = {};
}

Reasons.EditForm = Garnish.Base.extend({

    $container : null,

    init: function($container,settings)
    {
        this.setSettings( settings, Reasons.EditForm.defaults );
        this.$container = $container;

        this.elementType;

        // Get section ID
        this.sectionId = this.$container.find('input[name="sectionId"]').val();

        if(this.sectionId){
            this.elementType = 'entries';
        }

        // Get entry type ID
        this.$entryTypeSelect = $(this.settings.entryTypeSelectSelector);
        if (this.$entryTypeSelect.length === 0){
            // Only one entry type ID, get it from Reasons
            var entryTypeIds = Reasons.getEntryTypeIdsBySectionId(this.sectionId);
            this.entryTypeId = entryTypeIds && entryTypeIds.length > 0 ? entryTypeIds.shift() : false;
        } else {
            // Set entry type ID
            this.entryTypeId = this.$entryTypeSelect.val();
        }

        // Listen for AJAX complete, to handle entry type switching
        this.currentUrl = window.location.href;
        $(document).ajaxComplete($.proxy(this.onAjaxComplete,this));

        // Add some event listeners
        this.$container
            .on('click', this.settings.fieldsSelector + '[data-toggle="1"]', $.proxy(this.onInputWrapperClick,this))
            .on('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input', $.proxy(this.onFieldInputChange,this));

        this.render();

        console.log('edit form init. section id:', this.sectionId);
        
    },

    render : function()
    {
        if(this.initToggleFields()){
            this.evaluateConditionals();
        }
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
        this.$fieldContainer = $(this.settings.fieldsContainerSelector);
        this.$fields = this.$fieldContainer.find(this.settings.fieldsSelector);

        if (this.$fieldContainer.length === 0 || this.$fields.length === 0){
            return false;
        }

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

    evaluateConditionals : function(fieldId)
    {

        var self = this,
            $targetFields = this.$fieldContainer.find(this.settings.fieldsSelector+'[data-target="1"]'),
            $targetField,
            statements,
            statementValid,
            rules,
            rule,
            $toggleField,
            $toggleFieldInput,
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

                    for ( var j = 0; j < rules.length; ++j) {

                        rule = rules[j];

                        $toggleField = self.$fieldContainer.find(self.settings.fieldsSelector+'[data-id="' + rule.fieldId + '"]');
                        if ($toggleField.length === 0) {
                            continue;
                        }

                        $toggleFieldInput = $toggleField.find('*:input:first');
                        if ($toggleFieldInput.length === 0) {
                            continue;
                        }

                        toggleFieldValue = $toggleFieldInput.val();

                        if($toggleFieldInput.parent().hasClass('lightswitch')){
                            toggleFieldValue = toggleFieldValue === '1' ? 'true' : 'false';
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
        if (requestData.url.indexOf('switchEntryType') === -1) {
            return false;
        }
        this.entryTypeId = this.$entryTypeSelect.val();
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

},
{
    defaults : {
        fieldsContainerSelector : '#fields',
        fieldsSelector : '.field:not(#title-field)',
        entryTypeSelectSelector : '#entryType',
        lightswitchContainerSelector : '.lightswitch',
        positionSelectContainerSelector : '.btngroup'
    }
});

})(jQuery);