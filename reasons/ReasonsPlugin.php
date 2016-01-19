<?php namespace Craft;

/**
 * Reasons by Mats Mikkel Rummelhoff
 *
 * @author      Mats Mikkel Rummelhoff <http://mmikkel.no>
 * @package     Reasons
 * @since       Craft 2.3
 * @copyright   Copyright (c) 2015, Mats Mikkel Rummelhoff
 * @license     http://opensource.org/licenses/mit-license.php MIT License
 * @link        https://github.com/mmikkel/Reasons-Craft
 */

class ReasonsPlugin extends BasePlugin
{

    protected   $_version = '1.0.2',
                $_schemaVersion = '1.1',
                $_developer = 'Mats Mikkel Rummelhoff',
                $_developerUrl = 'http://mmikkel.no',
                $_pluginName = 'Reasons',
                $_pluginUrl = 'https://github.com/mmikkel/Reasons-Craft',
                $_releaseFeedUrl = 'https://raw.githubusercontent.com/mmikkel/Reasons-Craft/master/releases.json',
                $_documentationUrl = 'https://github.com/mmikkel/Reasons-Craft/blob/master/README.md',
                $_description = 'Adds conditionals to field layouts.',
                $_minVersion = '2.5';

    public function getName()
    {
        return $this->_pluginName;
    }

    public function getVersion()
    {
        return $this->_version;
    }

    public function getSchemaVersion()
    {
        return $this->_schemaVersion;
    }

    public function getDeveloper()
    {
        return $this->_developer;
    }

    public function getDeveloperUrl()
    {
        return $this->_developerUrl;
    }

    public function getPluginUrl()
    {
        return $this->_pluginUrl;
    }

    public function getReleaseFeedUrl()
    {
        return $this->_releaseFeedUrl;
    }

    public function getDescription()
    {
        return $this->_description;
    }

    public function getDocumentationUrl()
    {
        return $this->_documentationUrl;
    }

    public function getCraftRequiredVersion()
    {
        return $this->_minVersion;
    }

    public function isCraftRequiredVersion()
    {
        return version_compare(craft()->getVersion(), $this->getCraftRequiredVersion(), '>=');
    }

    public function onBeforeInstall()
    {
        if (!$this->isCraftRequiredVersion()) {
            craft()->userSession->setError(Craft::t('Reasons requires Craft 2.5 or newer, and was not installed.'));
            return false;
        }
    }

    public function onBeforeUninstall()
    {
        craft()->fileCache->delete($this->getCacheKey());
    }

    public function init()
    {

        parent::init();

        if(!craft()->request->isCpRequest() || craft()->isConsole()) {
            return false;
        }

        if (!$this->isCraftRequiredVersion()) {
            craft()->userSession->setError(Craft::t('Reasons requires Craft 2.5 or newer, and has been disabled.'));
            return false;
        }

        if (craft()->request->isAjaxRequest()) {

            $this->ajaxInit();

        } else {

            $this->includeResources();
        
            craft()->templates->includeJs('if (window.Craft && window.Craft.ReasonsPlugin) {
                Craft.ReasonsPlugin.init('.$this->getData().');
            }');
            
            craft()->on('fields.saveFieldLayout', array($this,'onSaveFieldLayout'));

        }

    }

    /*
    *   Protected methods
    *
    */
    protected function ajaxInit()
    {

        if (!craft()->request->isPostRequest())
        {
            return false;
        }

        $segments = craft()->request->segments;
        $actionSegment = $segments[count($segments)-1];

        switch ($actionSegment)
        {

            case 'switchEntryType' :
                
                craft()->templates->includeJs('Craft.ReasonsPlugin.initPrimaryForm();');

                break;

            case 'getEditorHtml' :
                
                $elementId = (int)craft()->request->getPost('elementId');
                $element = $elementId ? craft()->elements->getElementById($elementId) : null;
                $elementType = $element ? $element->elementType : craft()->request->getPost('elementType');
                $attributes = craft()->request->getPost('attributes');
                
                $conditionalsKey = null;

                switch ($elementType) {
                    
                    case ElementType::Entry :
                        if ($element) {
                            $conditionalsKey = 'entryType:'.$element->type->id;
                        } else if (isset($attributes['typeId'])) {
                            $conditionalsKey = 'entryType:'.$attributes['typeId'];
                        } else if (isset($attributes['sectionId'])) {
                            $entryTypes = craft()->sections->getEntryTypesBySectionId((int)$attributes['sectionId']);
                            $entryType = $entryTypes ? array_shift($entryTypes) : false;
                            $conditionalsKey = $entryType ? 'entryType:'.$entryType->id : null;
                        }
                        break;

                    case ElementType::GlobalSet :
                        $conditionalsKey = $element ? 'globalSet:'.$element->id : null;
                        break;

                    case ElementType::Asset :
                        $conditionalsKey = $element ? 'assetSource:'.$element->source->id : null;
                        break;

                    case ElementType::Category :
                        $conditionalsKey = $element ? 'categoryGroup:'.$element->group->id : null;
                        break;

                    case ElementType::Tag :
                        $conditionalsKey = $element ? 'tagGroup:'.$element->group->id : null;
                        break;

                    case ElementType::User :
                        $conditionalsKey = 'users';
                        break;

                }     

                if ($conditionalsKey) {
                    craft()->templates->includeJs('Craft.ReasonsPlugin.initElementEditor("'.$conditionalsKey.'");');
                }

                break;

        }

    }

    protected function includeResources()
    {
        $cssFile = 'stylesheets/reasons.css';
        $jsFile = 'javascripts/reasons.js';
        $manifest = $this->getRevisionManifest();
        craft()->templates->includeCssResource('reasons/' . ($manifest ? $manifest->$cssFile : $cssFile));
        craft()->templates->includeJsResource('reasons/' . ($manifest ? $manifest->$jsFile : $jsFile));
    }

    protected function getData()
    {
        if (!$data = craft()->fileCache->get($this->getCacheKey())) {
            $data = array(
                'conditionals' => $this->getConditionals(),
                'toggleFieldTypes' => $this->getToggleFieldTypes(),
                'toggleFields' => $this->getToggleFields(),
                'fieldIds' => $this->getFieldIds(),
            );
            craft()->fileCache->set($this->getCacheKey(), $data, 1800); // Cache for 30 minutes
        }
        return json_encode($data);
    }

    protected function getConditionals()
    {

        $r = array();
        $sources = array();

        // Entry types
        $entryTypeRecords = EntryTypeRecord::model()->findAll();
        if ($entryTypeRecords) {
            foreach ($entryTypeRecords as $entryTypeRecord) {
                $entryType = EntryTypeModel::populateModel($entryTypeRecord);
                $sources['entryType:'.$entryType->id] = $entryType->fieldLayoutId;
                $sources['section:'.$entryType->sectionId] = $entryType->fieldLayoutId;
            }
        }

        // Category groups
        $allCategoryGroups = craft()->categories->getAllGroups();
        foreach ($allCategoryGroups as $categoryGroup) {
            $sources['categoryGroup:'.$categoryGroup->id] = $categoryGroup->fieldLayoutId;
        }

        // Tag groups
        $allTagGroups = craft()->tags->getAllTagGroups();
        foreach ($allTagGroups as $tagGroup) {
            $sources['tagGroup:'.$tagGroup->id] = $tagGroup->fieldLayoutId;
        }

        // Asset sources
        $allAssetSources = craft()->assetSources->getAllSources();
        foreach ($allAssetSources as $assetSource) {
            $sources['assetSource:'.$assetSource->id] = $assetSource->fieldLayoutId;
        }

        // Global sets
        $allGlobalSets = craft()->globals->getAllSets();
        foreach ($allGlobalSets as $globalSet) {
            $sources['globalSet:'.$globalSet->id] = $globalSet->fieldLayoutId;
        }

        // Matrix blocks
        $matrixBlockTypeRecords = MatrixBlockTypeRecord::model()->findAll();
        if ($matrixBlockTypeRecords) {
            foreach ($matrixBlockTypeRecords as $matrixBlockTypeRecord) {
                $matrixBlockType = MatrixBlockTypeModel::populateModel($matrixBlockTypeRecord);
                $sources['matrixBlockType:'.$matrixBlockType->id] = $matrixBlockType->fieldLayoutId;
            }
        }

        // Users
        $usersFieldLayout = craft()->fields->getLayoutByType(ElementType::User);
        if ($usersFieldLayout) {
            $sources['users'] = $usersFieldLayout->id;
        }

        // Get all conditionals
        $conditionals = array();
        $conditionalsRecords = Reasons_ConditionalsRecord::model()->findAll();
        if ($conditionalsRecords) {
            foreach ($conditionalsRecords as $conditionalsRecord) {
                $conditionalsModel = Reasons_ConditionalsModel::populateModel($conditionalsRecord);
                if ($conditionalsModel->conditionals && $conditionalsModel->conditionals != '') {
                    $conditionals['fieldLayout:'.$conditionalsModel->fieldLayoutId] = $conditionalsModel->conditionals;
                }
            }
        }

        // Map conditionals to sources
        foreach ($sources as $sourceId => $fieldLayoutId) {
            if (isset($conditionals['fieldLayout:'.$fieldLayoutId])) {
                $r[$sourceId] = $conditionals['fieldLayout:'.$fieldLayoutId];
            }
        }

        return $r;

    }

    protected function getToggleFieldTypes()
    {
        return array(
            'Lightswitch',
            'Dropdown',
            'Checkboxes',
            'MultiSelect',
            'RadioButtons',
            'Number',
            'PositionSelect',
            'PlainText',
        );
    }

    /*
    *   Returns all toggleable fields
    *
    */
    protected function getToggleFields()
    {
        $toggleFieldTypes = $this->getToggleFieldTypes();
        $toggleFields = array();
        $fields = craft()->fields->getAllFields();
        foreach($fields as $field){
            $fieldType = $field->getFieldType();
            $classHandle = $fieldType && is_object($fieldType) && $fieldType->classHandle ? $fieldType->classHandle : false;
            if (!$classHandle) {
                continue;
            }
            if (in_array($classHandle, $toggleFieldTypes)) {
                $toggleFields[] = array(
                    'id' => $field->id,
                    'handle' => $field->handle,
                    'name' => $field->name,
                    'type' => $classHandle,
                    'settings' => $field->settings,
                );
            }
        }
        return $toggleFields;
    }

    protected function getFieldIds()
    {
        $handles = array();
        $fields = craft()->fields->getAllFields();
        foreach ($fields as $field){
            $handles[$field->handle] = $field->id;
        }
        return $handles;
    }

    protected function getRevisionManifest()
    {
        $manifestPath = craft()->path->getPluginsPath().'/reasons/resources/rev-manifest.json';
        return (IOHelper::fileExists($manifestPath) && $manifest = IOHelper::getFileContents($manifestPath)) ? json_decode($manifest) : false;
    }

    protected function getCacheKey()
    {
        return $this->_pluginName.'_'.$this->_version.'_'.$this->_schemaVersion;
    }

    /*
    *   Event handlers
    *
    */
    public function onSaveFieldLayout(Event $e)
    {
        $conditionals = craft()->request->getPost('_reasons');
        if ($conditionals) {
            $fieldLayout = $e->params['layout'];
            $conditionalsModel = new Reasons_ConditionalsModel();
            $conditionalsModel->fieldLayoutId = $fieldLayout->id;
            $conditionalsModel->conditionals = craft()->request->getPost('_reasons');
            craft()->reasons->saveConditionals($conditionalsModel);
        }
        craft()->fileCache->delete($this->getCacheKey());
    }

}
