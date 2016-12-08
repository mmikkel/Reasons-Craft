module.exports = class {

    constructor ($el, conditionals)
    {

        this.settings = {
            fieldsSelector: '.field:not(#title-field)',
            livePreviewEditorSelector: '.lp-editor',
            elementEditorSelector: '.elementeditor',
            lightswitchContainerSelector: '.lightswitch',
            positionSelectContainerSelector: '.btngroup'
        };

        this.$el = $el;
        this.id = this.$el.attr('id');

        if (!this.id) {
            this.id = '_reasonsForm-' + Math.random().toString(36).slice(2);
            this.$el.attr('id', this.id);
        }

        this.conditionals = conditionals;

        $(this.init.bind(this));

        return this;

    }

    init ()
    {
        this.addEventListeners();
        this.addLivePreviewListeners();
        this.render();
    }

    addEventListeners()
    {

        Garnish.$doc
            .on('click', this.settings.fieldsSelector + '[data-toggle="1"]', this.onInputWrapperClick.bind(this))
            .on('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input, '+this.settings.fieldsSelector + '[data-toggle="1"] '+this.settings.lightswitchContainerSelector, this.onFieldInputChange.bind(this))
            .on('click', 'a[data-buttonbox-value]', this.onFieldInputChange.bind(this));

        // Init element selects
        var self = this,
            elementSelectClassnames = ['elementselect', 'categoriesfield'],
            elementSelect;

        for (var i = 0; i < elementSelectClassnames.length; ++i) {
            $(this.settings.fieldsSelector + ' .' + elementSelectClassnames[i]).each(function () {
                if ($(this).hasAttr('data-reasonselementselect')) {
                    return;
                }
                var now = new Date().getTime(),
                    getElementSelect = (function () {
                        elementSelect = $(this).data('elementSelect');
                        if (elementSelect) {
                            elementSelect.on('selectElements', self.onElementSelectChange.bind(self));
                            elementSelect.on('removeElements', self.onElementSelectChange.bind(self));
                            $(this).attr('data-reasonselementselect', '');
                            self.onElementSelectChange();
                        } else if (new Date().getTime() - now < 2000) {
                            Garnish.requestAnimationFrame(getElementSelect);
                        }
                    }).bind(this);
                getElementSelect();
            });
        }

    }

    removeEventListeners()
    {

        Garnish.$doc
            .off('click', this.settings.fieldsSelector + '[data-toggle="1"]', this.onInputWrapperClick.bind(this))
            .off('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input, '+this.settings.fieldsSelector + '[data-toggle="1"] '+this.settings.lightswitchContainerSelector, this.onFieldInputChange.bind(this))
            .off('click', 'a[data-buttonbox-value]', this.onFieldInputChange.bind(this));

        var self = this,
            elementSelect;

        $('[data-reasonselementselect]').each(function () {
            elementSelect = $(this).data('elementSelect');
            if (elementSelect) {
                elementSelect.off('selectElements', self.onElementSelectChange.bind(self));
                elementSelect.off('removeElements', self.onElementSelectChange.bind(self));
            }
            $(this).removeAttr('[data-reasonselementselect]');
        });

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
        var fieldIds = Object.keys(this.conditionals);
        var toggleFieldIds = [];
        var statements;

        for (var i = 0; i < fieldIds.length; ++i) {
            statements = this.conditionals[fieldIds[i]][0];
            for (var j = 0; j < statements.length; ++j) {
              toggleFieldIds.push(statements[j].fieldId);
            }
        }

        // Loop over fields and add data-id attribute
        var self = this,
            $field,
            fieldHandlePath,
            fieldHandle,
            fieldId;

        this.$fields.each(function () {

            $field = $(this);

            if ($field.attr('id') === undefined) return;

            // Get field handle
            fieldHandlePath = $field.attr('id').split('-');

            if (fieldHandlePath.length < 3 || fieldHandlePath.length > 4) return; // Only basic fields for now!
            fieldHandle = fieldHandlePath.slice(-2, -1)[0] || false;

            if (!fieldHandle) return;
            fieldId = Craft.ReasonsPlugin.getFieldIdByHandle(fieldHandle);

            if (fieldId){
                $field.attr('data-id', fieldId);
            }

            // Is this a target field?
            if (self.conditionals[fieldId]){
                $field.attr('data-target', 1);
            }

            // Is this a toggle field
            if (toggleFieldIds.indexOf(parseInt(fieldId)) > -1){
                $field.attr('data-toggle', 1);
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
            .removeAttr('aria-hidden')
            .removeAttr('tabindex')
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
                            case 'Lightswitch':
                                $toggleFieldInput = $toggleField.find('*:input:first');
                                if ($toggleFieldInput.length > 0) {
                                    toggleFieldValue = $toggleFieldInput.val() === '1' ? 'true': 'false';
                                }
                                break;
                            case 'Checkboxes': case 'RadioButtons': case 'ButtonBox_Buttons': case 'ButtonBox_Stars': case 'ButtonBox_Width':
                                toggleFieldValue = $toggleField.find('input:checkbox:checked,input:radio:checked').map(function(){
                                    return $(this).val();
                                }).get();
                                break;
                            case 'Entries': case 'Categories': case 'Tags': case 'Assets': case 'Users': case 'Calendar_Event':
                                var elementSelect = $toggleField.find('[data-reasonselementselect]').data('elementSelect') || null;
                                toggleFieldValue = elementSelect && elementSelect.totalSelected ? 'notnull' : 'null';
                                break;
                            default:
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
                    $targetField
                        .addClass('reasonsHide')
                        .attr('aria-hidden', 'true')
                        .attr('tabindex', '-1');
                }

        });
    }

    /*
    *   Live preview
    *
    */
    onLivePreviewEnter ()
    {
        this.isLivePreview = true;
        this.render();
    }

    onLivePreviewExit ()
    {
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

    onElementSelectChange (e)
    {
        Garnish.requestAnimationFrame(this.evaluateConditionals.bind(this));
    }

}
