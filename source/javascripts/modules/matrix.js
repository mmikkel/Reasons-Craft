var Reasons_ConditionalsBuilder = require('./builder');

module.exports = class {

    constructor ($el, conditionals)
    {
        
        this.$el = $el;
        this.conditionals = conditionals;
        
        this.templates = {
            editButton : function () {
                return '<a href="#" class="reasonsAdd">' + Craft.t('Manage conditionals') + '</a>';
            }
        };
        
        this.init();
        
        return this;

    }

    init ()
    {
        
        // Poll for the configurator DOM element. Would be nice if we could access the MatrixInput instance, but no dice :(
        var $configurator,
            pollStart,
            poller = $.proxy(function (timestamp) {
                if (!pollStart) {
                    pollStart = timestamp;
                }
                $configurator = $('.matrix-configurator > .field:first');
                if ($configurator.length > 0) {
                    this.$el
                        .on('click', '.block-types .btn.add', $.proxy(this.onBlockTypeAddClick, this))
                        .on('click', '.fields .btn.add', $.proxy(this.onFieldAddClick, this))
                        .on('click', '.block-types .matrixconfigitem', $.proxy(this.onMatrixConfigItemClick, this))
                        .on('change', '.field-settings .select:first select', $.proxy(this.onFieldTypeChange, this))
                        .on('click', '.reasonsAdd', $.proxy(this.onReasonsAddButtonClick, this));
                    this.initConfigurator($configurator);
                } else if (timestamp - pollStart < 5000) {
                    Garnish.requestAnimationFrame(poller);
                } else {
                    this.destroy();
                }
            }, this);
        
        Garnish.requestAnimationFrame(poller);
        
    }

    destroy ()
    {
        this.$el
            .off('click', '.block-types .btn.add', $.proxy(this.onBlockTypeAddClick, this))
            .off('click', '.fields .btn.add', $.proxy(this.onFieldAddClick, this))
            .off('click', '.block-types .matrixconfigitem', $.proxy(this.onMatrixConfigItemClick, this))
            .off('change', '.field .select:first select', $.proxy(this.onFieldTypeChange, this))
            .off('click', '.reasonsAdd', $.proxy(this.onReasonsAddButtonClick, this));
    }

    initConfigurator ($el)
    {
        this.$configurator = $el;
        this.$configurator.attr('data-reasons-init', '');
        this.render();
    }

    render ()
    {

        console.log('render!');

        var self = this,
            toggleFieldTypes = Craft.ReasonsPlugin.getToggleFieldTypes(),
            $blockTypes = this.$configurator.find('.field-settings .items > div[data-id]'),
            $blockType,
            $fields,
            $field,
            fieldId,
            fieldName,
            fieldHandle,
            fieldType,
            $toggleFields,
            toggleFields,
            toggleFieldIds,
            toggleFieldSelector,
            $editButton,
            builder;

        $blockTypes.each(function () {
            
            $blockType = $(this);
            $blockType.attr('data-reasons-init', '');

            // Get all fields in block type
            $fields = $blockType.find('> div[data-id]');

            // Get all toggle fields in this block type
            toggleFields = {};
            toggleFieldIds = [];
            $fields.each(function () {
                $field = $(this);
                fieldType = $field.find('.select:first select:first').val();
                if (toggleFieldTypes.indexOf(fieldType) > -1) {
                    
                    fieldId = $field.data('id');
                    fieldName = $field.find('input[type="text"]:first').val();
                    fieldHandle = $field.find('input[type="text"]:nth(1)').val();
                    
                    $field.data({
                        id : fieldId,
                        name : fieldName,
                        handle : fieldHandle,
                        type : fieldType
                    });
                    
                    $field.data('settings', self.getToggleFieldSettings($field));
                    
                    toggleFieldIds.push(fieldId);
                    toggleFields[''+fieldId] = $field;

                }
            });

            // Loop on fields
            $fields.each(function () {

                $field = $(this);
                fieldId = $field.data('id');

                // Get toggle fields available to this field
                if (toggleFieldIds.length > 0) {
                    
                    toggleFieldSelector = $.map(toggleFieldIds, function (toggleFieldId) {
                        return toggleFieldId !== fieldId ? '[data-id="'+toggleFieldId+'"]' : null;
                    }).join(',');

                    if (toggleFieldSelector) {
                        $toggleFields = $fields.filter(toggleFieldSelector);
                    }

                    if (!$field.data('_reasonsBuilder')){

                        // Create builder
                        // $field.data('_reasonsBuilder', new Reasons_ConditionalsBuilder({
                        //     fieldId : fieldId,
                        //     toggleFields : toggleFields,
                        //     rules : self.conditionals && self.conditionals.hasOwnProperty(fieldId) ? self.conditionals[fieldId] : null
                        // }));

                    } else {

                        // Refresh builder
                        // $field.data('_reasonsBuilder').update({
                        //     toggleFields : toggleFields
                        // });

                    }

                }


                // Create or update builder
                // builder = $field.data('_reasonsBuilder');

                // if (!builder) {
                //     $field.data('_reasonsBuilder')
                // }

                if ($field.data('_reasonsInit')) {
                    return;
                }

                // Add edit button
                $editButton = $(self.templates.editButton());
                $editButton.data('field', $field);
                $field
                    .data('_reasonsInit', true)
                    .attr('data-reasons-init', '')
                    .find('.delete').before($editButton);

            });

        });
        
        // var self = this,
        //     $fields = this.$configurator.find('.field-settings .items > div[data-id]'),
        //     $field,
        //     fieldId,
        //     $input,
        //     $editButton;
            
        // $fields.each(function () {
            
        //     $field = $(this);
            
        //     // Add builder
        //     // $field.data('_reasonsBuilder', new Craft.ReasonsPlugin.ConditionalsBuilder({
        //     //     fieldId : fieldId,
        //     //     toggleFields : null,//toggleFields,
        //     //     rules : null,//self.conditionals && self.conditionals.hasOwnProperty(fieldId) ? self.conditionals[fieldId] : null
        //     // }));

        //     if ($field.data('_reasonsInit')) {
        //         return;
        //     }
            
        //     // Add edit button
        //     $editButton = $(self.templates.editButton());
        //     $editButton.data('field', $field);
        //     $field
        //         .data('_reasonsInit', true)
        //         .attr('data-reasons-init', '')
        //         .find('.delete').before($editButton);

        // });

    }

    getToggleFieldSettings ($field)
    {
        var settings = {};
        switch ($field.data('type')) {
            case 'Dropdown' : case 'MultiSelect' : case 'Checkboxes' : case 'RadioButtons' :
                settings.options = {};
                break;
        }
        return settings;
    }

    onBlockTypeAddClick (e)
    {
        
        // Get modal
        var now,
            poller = $.proxy(function(timestamp) {
                if (!now) {
                    now = timestamp;
                }
                var $modal = $('.modal:last'),
                    modal = $modal.length > 0 ? $modal.data('modal') : null;
                if (modal) {
                    modal.on('hide', $.proxy(this.onModalHide, this, modal));
                } else if (timestamp - now < 1000) {
                    Garnish.requestAnimationFrame(poller);
                }
            }, this);
        
        Garnish.requestAnimationFrame(poller);

    }

    onFieldAddClick (e)
    {
        console.log('on field add click');
        Garnish.requestAnimationFrame($.proxy(function () {
            this.render();
        }, this));
    }

    onFieldTypeChange (e)
    {
        console.log('field toggle change');
        Garnish.requestAnimationFrame($.proxy(function () {
            this.render();
        }, this));
    }

    onMatrixConfigItemClick (e) 
    {
        // Garnish.requestAnimationFrame($.proxy(function () {
            
        // }, this));
    }

    onReasonsAddButtonClick (e)
    {
        // var $field = $(e.currentTarget).data('field');
        // if (!$field.data('_reasonsModal'))
     //    {
     //     $field.data('_reasonsModal', new Craft.ReasonsPlugin.ConditionalsBuilderModal($field.data('_reasonsBuilder'), {
     //         onShow : function() {
     //                Garnish.requestAnimationFrame($.proxy(function () {
     //                 this.render();
     //                }, this));
     //            },
     //            onHide : function() {
     //                Garnish.requestAnimationFrame($.proxy(function () {
     //                 this.render();
     //                }, this));
     //            }
     //     }));
     //    }
     //    $field.data('_reasonsModal').show();
    }

    onModalHide (modal)
    {
        modal.off('hide', $.proxy(this.onModalHide, this, modal));
        Garnish.requestAnimationFrame($.proxy(function () {
            this.render();
        }, this));
    }

}