/**
 * Reasons
 */
(function($){

if (typeof Reasons == 'undefined'){
	Reasons = {};
}

$.extend(Reasons,{
	
	defaults : {
		fldSelector : '#fieldlayoutform',
		conditionals : {}
	},

	init : function()
	{

		// Get settings
		Reasons.settings = $.extend(Reasons.defaults, (Reasons.settings || {}));

		// Where are we?
		var segments = Craft.path.split('/');
		if (segments && segments[0] && segments[0] === 'settings' && segments[1] === 'sections') {
			
			// Ok, so we're dealing with sections and/or entry types. That's good.
			if (Craft.path.indexOf('entrytypes/') > -1){
				
				// Editing an entry type yeah
				var entryTypeId = parseInt(Craft.path.substring(Craft.path.indexOf('entrytypes/')).split('/')[1]) || 'new',
					$fld = $(Reasons.settings.fldSelector); // Just to make sure we can haz field layout designer
				
				if ($fld.length > 0){
		        
		        	// Initialize the conditional designer
		        	var conditionalsObject = this.getConditionalsDataByEntryTypeId(entryTypeId);
		      		new Reasons.FieldLayoutConditionalDesigner($fld,{
		        		id : conditionalsObject ? conditionalsObject.id : null,
		        		conditionals : conditionalsObject ? conditionalsObject.conditionals : null
		        	});

		        }

			} else {
				return false;
			}

		} else {

			var $editForm = false;

			switch (segments[0])
			{
				case 'entries':
					$editForm = $('#entry-form');
					break;

				// case 'categories':
				// 	$editForm = $('#category-form');
				// 	break;

				// case 'users':
				// 	$editForm = $('#userform');
				// 	break;

			}

			if (!$editForm || $editForm.length === 0){
				return false;
			}

			new Reasons.EditForm($editForm);

		}

	},

	getToggleFields : function()
	{
		return this.settings['toggleFields'] || [];
	},

	getToggleFieldById : function(fieldId)
	{
		fieldId = parseInt(fieldId);
		var toggleFields = Reasons.getToggleFields(),
			numToggleFields = toggleFields.length;
		for (var i = 0; i < numToggleFields; ++i) {
			if (parseInt(toggleFields[i].id) === fieldId){
				return toggleFields[i];
			}
		}
		return false;
	},

	getConditionalsDataByEntryTypeId : function(entryTypeId)
	{
		var conditionals;
		for (var i = 0; i < this.settings.conditionals.length; ++i){
			conditionals = this.settings.conditionals[i];
			if (conditionals.typeId == entryTypeId){
				return conditionals;
			}
		}
		return false;
	},

	getEntryTypeIdsBySectionId : function(sectionId)
	{
		return this.settings.entryTypeIds && this.settings.entryTypeIds.hasOwnProperty(sectionId) ? this.settings.entryTypeIds[sectionId] : false;
	},

	getFieldIdByHandle : function(fieldHandle)
	{
		return this.settings.fieldIds && this.settings.fieldIds.hasOwnProperty(fieldHandle) ? this.settings.fieldIds[fieldHandle] : false;
	}

});

})(jQuery);