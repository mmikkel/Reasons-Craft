var Reasons = exports;

if (window.$) $(function(){ Reasons.data = window._ReasonsData || false; });

Reasons.getToggleFields = function () {
    return Reasons.data.toggleFields || [];
};

Reasons.getToggleFieldById = function(fieldId)
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
};

Reasons.getConditionalsDataByEntryTypeId = function(entryTypeId)
{
    var conditionals;
    for (var i = 0; i < Reasons.data.conditionals.length; ++i){
        conditionals = Reasons.data.conditionals[i];
        if (conditionals.typeId == entryTypeId){
            return conditionals;
        }
    }
    return false;
};

Reasons.getEntryTypeIdsBySectionId = function(sectionId)
{
    return Reasons.data.entryTypeIds && Reasons.data.entryTypeIds.hasOwnProperty(sectionId) ? Reasons.data.entryTypeIds[sectionId] : false;
};

Reasons.getFieldIdByHandle = function(fieldHandle)
{
    return Reasons.data.fieldIds && Reasons.data.fieldIds.hasOwnProperty(fieldHandle) ? Reasons.data.fieldIds[fieldHandle] : false;
};
