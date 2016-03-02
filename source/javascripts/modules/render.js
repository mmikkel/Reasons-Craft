module.exports = class {

    constructor ($el, conditionals)
    {

        this.settings = {
            fieldsSelector : '.field:not(#title-field)',
            livePreviewEditorSelector : '.lp-editor',
            elementEditorSelector : '.elementeditor',
            lightswitchContainerSelector : '.lightswitch',
            positionSelectContainerSelector : '.btngroup'
        };

        this.$el = $el;
        this.id = this.$el.attr('id');

        if (!this.id) {
            this.id = '_reasonsForm-' + Math.random().toString(36).slice(2);
            this.$el.attr('id', this.id);
        }

        this.conditionals = conditionals;

        this.addEventListeners();
        this.addLivePreviewListeners();
        
        this.render();

        return this;

    }

    addEventListeners()
    {
        Garnish.$doc
            .on('click', this.settings.fieldsSelector + '[data-toggle="1"]', $.proxy(this.onInputWrapperClick,this))
            .on('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input', $.proxy(this.onFieldInputChange,this));
    }

    removeEventListeners()
    {
        Garnish.$doc
            .off('click', this.settings.fieldsSelector + '[data-toggle="1"]', $.proxy(this.onInputWrapperClick,this))
            .off('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input', $.proxy(this.onFieldInputChange,this));
    }

    addLivePreviewListeners()
    {

        function getLivePreviewInstance()
        {
            if (Craft.livePreview) {
            
                this._livePreview = Craft.livePreview;
                this._livePreview.on('enter', $.proxy(this.onLivePreviewEnter, this));
                this._livePreview.on('exit', $.proxy(this.onLivePreviewExit, this));
                
                if (this._livePreviewPollId) delete this._livePreviewPollId;
            
            } else if (new Date().getTime() - now < 2000) {
                
                this._livePreviewPollId = Garnish.requestAnimationFrame(livePreviewPoller);

            }
        }

        var livePreviewPoller = getLivePreviewInstance.bind(this),
            livePreview,
            now = new Date().getTime();

        livePreviewPoller();

    }

    removeLivePreviewListeners()
    {
        if (this._livePreviewPollId) {
            Garnish.cancelAnimationFrame(this._livePreviewPollId);
            delete this._livePreviewPollId;
        }
        if (this._livePreview) {
            this._livePreview.off('enter', $.proxy(this.onLivePreviewEnter, this));
            this._livePreview.off('exit', $.proxy(this.onLivePreviewExit, this));
            delete this._livePreview;
        }
    }

    destroy()
    {
        this.removeEventListeners();
        this.removeLivePreviewListeners();
    }

    render()
    {
        if(this.initToggleFields()){
            this.evaluateConditionals();
        }
    }

    getFieldsSelector()
    {
        var selectorPath = [this.settings.fieldsSelector];
        if (this.isLivePreview)
        {
            selectorPath.unshift(this.settings.livePreviewEditorSelector);
        } else {
            selectorPath.unshift('#' + this.id);
        }
        return selectorPath.join(' ');
    }

    initToggleFields()
    {

        // Get all current fields
        this.$fields = $(this.getFieldsSelector());

        if (this.$fields.length === 0) {
            return false;
        }

        // Get toggle field IDs
        var toggleFieldIds = [];
        for (fieldId in this.conditionals) {
            for (var i = 0; i < this.conditionals[fieldId].length; ++i){
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
            if ($field.attr('id') === undefined) return;
            fieldHandle = $field.attr('id').split('-').slice(-2, -1)[0] || false;
            fieldId = Craft.ReasonsPlugin.getFieldIdByHandle(fieldHandle);
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

    }

    evaluateConditionals()
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

                        toggleFieldData = Craft.ReasonsPlugin.getToggleFieldById(rule.fieldId);
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
    }

    /*
    *   Live preview
    *
    */
    onLivePreviewEnter ()
    {
        console.log('entered live preview');
        this.isLivePreview = true;
        this.render();
    }

    onLivePreviewExit ()
    {
        console.log('exited live preview');
        this.isLivePreview = false;
        this.render();
    }

    /*
    *   Event handlers
    *
    */
    onInputWrapperClick (e)
    {
        $(e.currentTarget).find('input:first').trigger('change');
    }

    onFieldInputChange (e)
    {
        this.evaluateConditionals();
    }

}