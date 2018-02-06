var Reasons_ConditionalsBuilder = require('./builder');

module.exports = class {

    constructor ($el, conditionals)
    {

        if (!$el || !$el.length) {
            return;
        }

        this.$el = $el;

        this.conditionals = conditionals;
        
        this.settings = {
            formSelector : 'form:first',
            fieldSettingsSelector : 'a.settings',
            fieldSelector : '.fld-field',
            tabSelector : '.fld-tabs .fld-tab'
        };

        this.templates = {
            input : function(settings)
            {
                return '<input type="' + settings.type + '" name="' + (settings.name || '') + '" value="' + (settings.value || '') + '" />';
            },
            modal : function()
            {
                return '<div class="modal elementselectormodal reasonsModal"><div class="body" /><div class="footer"><div class="buttons rightalign first"><div class="btn close submit">Done</div></div></div></div>';
            }
        };

        this.init();

    }

    init ()
    {
        
        // Get available toggle field IDs
        var toggleFields = Craft.ReasonsPlugin.getToggleFields();
        this.toggleFieldIds = $.map(toggleFields, function(toggleField){
            return parseInt(toggleField.id);
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
        this.$el
            .append(this.$conditionalsInput)
            .append(this.$conditionalsIdInput)
            // Attach submit event listener
            .on('submit', $.proxy(this.onFormSubmit, this));

        // Defer refresh to RAF
        Garnish.requestAnimationFrame($.proxy(function () {
            this.refresh();
        }, this));

        this.$el.on('mousedown', this.settings.fieldSelector, $.proxy(this.onFieldMouseDown, this));
        Garnish.$doc.on('click', '.menu a', $.proxy(this.onFieldSettingsMenuItemClick, this));

    }

    destroy ()
    {
        this.$el.off('mousedown', this.settings.fieldSelector, $.proxy(this.onFieldMouseDown, this));
        Garnish.$doc.on('click', '.menu a', $.proxy(this.onFieldSettingsMenuItemClick, this));
    }

    refresh ()
    {
        var self = this,
            conditionals = {},
            $fields,
            $field,
            fieldId,
            toggleFields;

        // Loop over tabs
        this.$el.find(this.settings.tabSelector).each(function(){

            // Get all fields for this tab
            $fields = $(this).find(self.settings.fieldSelector);

            // Get all toggle fields for this tab
            toggleFields = [];
            $fields.each(function(){
                $field = $(this);
                fieldId = parseInt($field.data('id'));
                if (self.toggleFieldIds.indexOf(fieldId) > -1){
                    var toggleField = Craft.ReasonsPlugin.getToggleFieldById(fieldId);
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
                    $field.data('_reasonsBuilder', new Reasons_ConditionalsBuilder({
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
                        .insertBefore($menu.find('ul:first li:last'))
                        .find('a:first')
                            .data('_reasonsField', $field)
                            .attr('data-action', 'toggle-conditionals')
                            .text(Craft.t('Edit conditionals'));

                    $field.data('_reasonsSettingsMenuItemInitialized',true);

                }

            });

        });

        if (Object.keys(conditionals).length === 0){
            this.$conditionalsInput.attr('value', '');
        } else {
            this.$conditionalsInput.attr('value', JSON.stringify(conditionals));
        }
    }

    /*
    *   Event handlers
    *
    */
    onFieldMouseDown (e)
    {
        var self = this,
            mouseUpHandler = function(e)
            {
                $('body').off('mouseup', mouseUpHandler);
                Garnish.requestAnimationFrame(function () {
                    self.refresh();
                });
            };

        $('body').on('mouseup', mouseUpHandler);
    }

    onFieldSettingsMenuItemClick (e)
    {

        var $trigger = $(e.target),
            $field = $trigger.data('_reasonsField');

        if ($trigger.data('action') === 'toggle-conditionals')
        {

            e.preventDefault();
            e.stopPropagation();

            if (!$trigger.data('_reasonsModal'))
            {

                // Create modal
                var self = this,
                    builder = $field.data('_reasonsBuilder'),
                    $modal = $(this.templates.modal()),
                    modal = new Garnish.Modal($modal, {
                        resizable : true,
                        autoShow : false,
                        onShow : function()
                        {
                            Garnish.requestAnimationFrame(function () {
                                self.refresh();
                            });
                        },
                        onHide : function()
                        {
                            Garnish.requestAnimationFrame(function () {
                                self.refresh();
                            });
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

        }

        Garnish.requestAnimationFrame($.proxy(function () {
            this.refresh();
        }, this));

    }

    onFormSubmit ()
    {
        this.refresh();
    }

}
