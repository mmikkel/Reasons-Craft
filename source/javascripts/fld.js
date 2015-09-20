var Reasons = require('./reasons');

Reasons.Builder = require('./modules/builder');

Reasons.FLD = {

    settings : {
        fieldLayoutFormSelector : '#fieldlayoutform',
        formSelector : 'form:first',
        fieldSettingsSelector : 'a.settings',
        fieldSelector : '.fld-field',
        tabSelector : '.fld-tabs .fld-tab'
    },

    init : function ()
    {

        // Get DOM elements
        this.$container = $(this.settings.fieldLayoutFormSelector);
        if (this.$container.length === 0) return false;
        this.$form = this.$container.parents(this.settings.formSelector);
        if (this.$form.length === 0) return false;

        // Get database ID and initial conditionals
        var entryTypeId = parseInt(Craft.path.substring(Craft.path.indexOf('entrytypes/')).split('/')[1]) || 'new',
            conditionalsData = Reasons.getConditionalsDataByEntryTypeId(entryTypeId);
        if (conditionalsData)
        {
            this.id = conditionalsData.id;
            this.conditionals = conditionalsData.conditionals;
        }

        // Get available toggle field IDs
        var self = this;
        this.toggleFieldIds = [];
        $.map(Reasons.getToggleFields(), function(toggleField){
            self.toggleFieldIds.push(parseInt(toggleField.id));
        });

        // This hidden input will store our serialized conditionals
        this.$conditionalsInput = $(this.templates.input({
            name : '_reasons',
            type : 'hidden'
        }));

        // This hidden input stores the conditional's ID
        this.$conditionalsIdInput = $(this.templates.input({
            name : '_reasonsId',
            value : this.id || '',
            type : 'hidden'
        }));

        // Append the hidden input fields
        this.$form
            .append(this.$conditionalsInput)
            .append(this.$conditionalsIdInput)
            // Attach submit event listener
            .on('submit', $.proxy(this.onFormSubmit, this));

        // Defer refresh
        setTimeout($.proxy(this.refresh,this),0);

        // Hack time. Make sure stuff is kept up to date when fields move around
        this.$container.on('mousedown', this.settings.fieldSelector, $.proxy(this.onFieldMouseDown, this));

    },

    refresh : function()
    {

        var self = this,
            conditionals = {},
            $fields,
            $field,
            fieldId,
            toggleFields;

        // Loop over tabs
        this.$container.find(this.settings.tabSelector).each(function(){

            // Get all fields for this tab
            $fields = $(this).find(self.settings.fieldSelector);

            // Get all toggle fields for this tab
            toggleFields = [];
            $fields.each(function(){
                $field = $(this);
                fieldId = parseInt($field.data('id'));
                if (self.toggleFieldIds.indexOf(fieldId) > -1){
                    var toggleField = Reasons.getToggleFieldById(fieldId);
                    if (toggleField){
                        toggleFields.push(toggleField);
                    }
                }
            });

            // Loop over fields
            $fields.each(function(){

                $field = $(this);
                fieldId = parseInt($field.data('id'));

                if (!$field.data('_reasonsBuilder')){

                    // Create builder
                    $field.data('_reasonsBuilder',new Reasons.Builder({
                        fieldId : fieldId,
                        toggleFields : toggleFields,
                        rules : self.conditionals && self.conditionals.hasOwnProperty(fieldId) ? self.conditionals[fieldId] : null
                    }));

                } else {

                    // Refresh builder
                    $field.data('_reasonsBuilder').update({
                        toggleFields : toggleFields
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

                if (!$field.data('_reasonsSettingsMenuItemInitialized')){

                    // Create settings menu item
                    var $button = $field.find(self.settings.fieldSettingsSelector),
                        menubtn = $button.data('menubtn') || false;

                    if (!menubtn){
                        return;
                    }

                    var $menu = menubtn.menu.$container;
                    $menu
                        .find('ul')
                        .children(':first')
                        .clone(true)
                        .prependTo($menu.find('ul:first'))
                        .find('a:first')
                            .data('_reasonsField', $field)
                            .attr('data-action', 'toggle-conditionals')
                            .text(Craft.t('Manage conditionals'))
                            .on('click', $.proxy(self.onFieldSettingsMenuItemClick, self));

                    $field.data('_reasonsSettingsMenuItemInitialized',true);

                }

            });

        });

        if (Object.keys(conditionals).length === 0){
            this.$conditionalsInput.attr('value','');
        } else {
            this.$conditionalsInput.attr('value',JSON.stringify(conditionals));
        }

    },

    onFieldMouseDown : function ( e )
    {

        var self = this,
            mouseUpHandler = function(e)
            {
                $('body').off('mouseup', mouseUpHandler);
                self.refresh();
            };

        $('body').on('mouseup', mouseUpHandler);

    },

    onFieldSettingsMenuItemClick : function(e) {

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
                    resizable : true,
                    autoShow : false,
                    onShow : function()
                    {
                        self.refresh();
                    },
                    onHide : function()
                    {
                        self.refresh();
                    }
                });

            // Add builder to modal
            builder.get().appendTo($modal.find('.body'));

            $modal.on('click', '.close', function (e) {
                modal.hide();
            } );

            $trigger.data('_reasonsModal', modal);

        }

        $trigger.data('_reasonsModal').show();

    },

    onFormSubmit : function()
    {
        this.refresh();
    },

    templates : {
        input : function(settings)
        {
            return '<input type="' + settings.type + '" name="' + (settings.name || '') + '" value="' + (settings.value || '') + '" />';
        },
        modal : function()
        {
            return '<div class="modal elementselectormodal reasonsModal"><div class="body" /><div class="footer"><div class="buttons rightalign first"><div class="btn close submit">Done</div></div></div></div>';
        }
    }

};

if (window.$) $(function(){ Reasons.FLD.init(); });
