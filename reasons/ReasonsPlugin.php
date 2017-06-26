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

/**
 * Class ReasonsPlugin
 * @package Craft
 */
class ReasonsPlugin extends BasePlugin
{

    protected $_version = '1.0.10';
    protected $_schemaVersion = '1.1';
    protected $_developer = 'Mats Mikkel Rummelhoff';
    protected $_developerUrl = 'http://mmikkel.no';
    protected $_pluginName = 'Reasons';
    protected $_pluginUrl = 'https://github.com/mmikkel/Reasons-Craft';
    protected $_releaseFeedUrl = 'https://raw.githubusercontent.com/mmikkel/Reasons-Craft/master/releases.json';
    protected $_documentationUrl = 'https://github.com/mmikkel/Reasons-Craft/blob/master/README.md';
    protected $_description = 'Adds conditionals to field layouts.';
    protected $_minVersion = '2.5';

    /**
     * @return string
     */
    public function getName()
    {
        return $this->_pluginName;
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return $this->_version;
    }

    /**
     * @return string
     */
    public function getSchemaVersion()
    {
        return $this->_schemaVersion;
    }

    /**
     * @return string
     */
    public function getDeveloper()
    {
        return $this->_developer;
    }

    /**
     * @return string
     */
    public function getDeveloperUrl()
    {
        return $this->_developerUrl;
    }

    /**
     * @return string
     */
    public function getPluginUrl()
    {
        return $this->_pluginUrl;
    }

    /**
     * @return string
     */
    public function getReleaseFeedUrl()
    {
        return $this->_releaseFeedUrl;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->_description;
    }

    /**
     * @return string
     */
    public function getDocumentationUrl()
    {
        return $this->_documentationUrl;
    }

    /**
     * @return string
     */
    public function getCraftRequiredVersion()
    {
        return $this->_minVersion;
    }

    /**
     * @return mixed
     */
    public function isCraftRequiredVersion()
    {
        return version_compare(craft()->getVersion(), $this->getCraftRequiredVersion(), '>=');
    }

    /**
     * @return bool
     */
    public function onBeforeInstall()
    {
        if (!$this->isCraftRequiredVersion()) {
            craft()->userSession->setError(Craft::t('Reasons requires Craft 2.5 or newer, and was not installed.'));
            return false;
        }
    }

    /**
     *
     */
    public function onBeforeUninstall()
    {
        craft()->fileCache->delete($this->getCacheKey());
    }

    /**
     * @return bool
     */
    public function init()
    {

        parent::init();

        if (!craft()->request->isCpRequest() || !craft()->userSession->getUser() || craft()->isConsole()) {
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

            craft()->on('fields.saveFieldLayout', array($this, 'onSaveFieldLayout'));

        }

    }

    /*
    *   Protected methods
    *
    */
    /**
     * @return bool
     */
    protected function ajaxInit()
    {

        if (!craft()->request->isPostRequest()) {
            return false;
        }

        $segments = craft()->request->segments;
        $actionSegment = $segments[count($segments) - 1];

        switch ($actionSegment) {

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
                            $conditionalsKey = 'entryType:' . $element->type->id;
                        } else if (isset($attributes['typeId'])) {
                            $conditionalsKey = 'entryType:' . $attributes['typeId'];
                        } else if (isset($attributes['sectionId'])) {
                            $entryTypes = craft()->sections->getEntryTypesBySectionId((int)$attributes['sectionId']);
                            $entryType = $entryTypes ? array_shift($entryTypes) : false;
                            $conditionalsKey = $entryType ? 'entryType:' . $entryType->id : null;
                        }
                        break;

                    case ElementType::GlobalSet :
                        $conditionalsKey = $element ? 'globalSet:' . $element->id : null;
                        break;

                    case ElementType::Asset :
                        $conditionalsKey = $element ? 'assetSource:' . $element->source->id : null;
                        break;

                    case ElementType::Category :
                        $conditionalsKey = $element ? 'categoryGroup:' . $element->group->id : null;
                        break;

                    case ElementType::Tag :
                        $conditionalsKey = $element ? 'tagGroup:' . $element->group->id : null;
                        break;

                    case ElementType::User :
                        $conditionalsKey = 'users';
                        break;

                }

                if ($conditionalsKey) {
                    craft()->templates->includeJs('Craft.ReasonsPlugin.initElementEditor("' . $conditionalsKey . '");');
                }

                break;

        }

    }

    /**
     *
     */
    protected function includeResources()
    {
        $cssFile = 'stylesheets/reasons.css';
        $jsFile = 'javascripts/reasons.js';
        $manifest = $this->getRevisionManifest();
        craft()->templates->includeCssResource('reasons/' . ($manifest ? $manifest->$cssFile : $cssFile));
        craft()->templates->includeJsResource('reasons/' . ($manifest ? $manifest->$jsFile : $jsFile));
    }

    /**
     * @return string
     */
    protected function getData()
    {
        $doCacheData = !craft()->config->get('devMode');
        $cacheKey = $this->getCacheKey();
        $data = $doCacheData ? craft()->fileCache->get($cacheKey) : null;
        if (!$data) {
            $data = array(
                'conditionals' => $this->getConditionals(),
                'toggleFieldTypes' => $this->getToggleFieldTypes(),
                'toggleFields' => $this->getToggleFields(),
                'fieldIds' => $this->getFieldIds(),
            );
            if ($doCacheData) {
                craft()->fileCache->set($this->getCacheKey(), $data, 1800); // Cache for 30 minutes
            }
        }
        return json_encode($data);
    }

    /**
     * @return array
     */
    protected function getConditionals()
    {

        $r = array();
        $sources = array();

        // Entry types
        $entryTypeRecords = EntryTypeRecord::model()->findAll();
        if ($entryTypeRecords) {
            foreach ($entryTypeRecords as $entryTypeRecord) {
                $entryType = EntryTypeModel::populateModel($entryTypeRecord);
                $sources['entryType:' . $entryType->id] = $entryType->fieldLayoutId;
                $sources['section:' . $entryType->sectionId] = $entryType->fieldLayoutId;
            }
        }

        // Category groups
        $allCategoryGroups = craft()->categories->getAllGroups();
        foreach ($allCategoryGroups as $categoryGroup) {
            $sources['categoryGroup:' . $categoryGroup->id] = $categoryGroup->fieldLayoutId;
        }

        // Tag groups
        $allTagGroups = craft()->tags->getAllTagGroups();
        foreach ($allTagGroups as $tagGroup) {
            $sources['tagGroup:' . $tagGroup->id] = $tagGroup->fieldLayoutId;
        }

        // Asset sources
        $allAssetSources = craft()->assetSources->getAllSources();
        foreach ($allAssetSources as $assetSource) {
            $sources['assetSource:' . $assetSource->id] = $assetSource->fieldLayoutId;
        }

        // Global sets
        $allGlobalSets = craft()->globals->getAllSets();
        foreach ($allGlobalSets as $globalSet) {
            $sources['globalSet:' . $globalSet->id] = $globalSet->fieldLayoutId;
        }

        // Users
        $usersFieldLayout = craft()->fields->getLayoutByType(ElementType::User);
        if ($usersFieldLayout) {
            $sources['users'] = $usersFieldLayout->id;
        }

        // Solspace Calendar
        $solspaceCalendarPlugin = craft()->plugins->getPlugin('calendar');
        if ($solspaceCalendarPlugin && $solspaceCalendarPlugin->getDeveloper() === 'Solspace') {
            // Before 1.7.0, Solspace Calendar used a single Field Layout for all calendars. Let's try and support both the old and the new
            if (version_compare($solspaceCalendarPlugin->getVersion(), '1.7.0', '>=')) {
                $solspaceCalendars = craft()->calendar_calendars->getAllCalendars();
                if ($solspaceCalendars && is_array($solspaceCalendars) && !empty($solspaceCalendars)) {
                    foreach ($solspaceCalendars as $solspaceCalendar) {
                        $sources['solspaceCalendar:'.$solspaceCalendar->id] = $solspaceCalendar->fieldLayoutId;
                    }
                }
            } else {
                $solspaceCalendarFieldLayout = craft()->fields->getLayoutByType('Calendar_Event');
                if ($solspaceCalendarFieldLayout) {
                    $sources['solspaceCalendar'] = $solspaceCalendarFieldLayout->id;
                }
            }
        }

        // Get all conditionals
        $conditionals = array();
        $conditionalsRecords = Reasons_ConditionalsRecord::model()->findAll();
        if ($conditionalsRecords) {
            foreach ($conditionalsRecords as $conditionalsRecord) {
                $conditionalsModel = Reasons_ConditionalsModel::populateModel($conditionalsRecord);
                if ($conditionalsModel->conditionals && $conditionalsModel->conditionals != '') {
                    $conditionals['fieldLayout:' . $conditionalsModel->fieldLayoutId] = $conditionalsModel->conditionals;
                }
            }
        }

        // Map conditionals to sources
        foreach ($sources as $sourceId => $fieldLayoutId) {
            if (isset($conditionals['fieldLayout:' . $fieldLayoutId])) {
                $r[$sourceId] = $conditionals['fieldLayout:' . $fieldLayoutId];
            }
        }

        return $r;

    }

    /**
     * @return array
     */
    protected function getToggleFieldTypes()
    {
        return array(
            // Stock FieldTypes
            'Lightswitch',
            'Dropdown',
            'Checkboxes',
            'MultiSelect',
            'RadioButtons',
            'Number',
            'PositionSelect',
            'PlainText',
            'Entries',
            'Categories',
            'Tags',
            'Assets',
            'Users',
            // Custom FieldTypes
            'Calendar_Event',
            'ButtonBox_Buttons',
            'ButtonBox_Colours',
            'ButtonBox_Stars',
            'ButtonBox_TextSize',
            'ButtonBox_Width',
        );
    }

    /*
    *   Returns all toggleable fields
    *
    */
    /**
     * @return array
     */
    protected function getToggleFields()
    {
        $toggleFieldTypes = $this->getToggleFieldTypes();
        $toggleFields = array();
        $fields = craft()->fields->getAllFields();
        foreach ($fields as $field) {
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

    /**
     * @return array
     */
    protected function getFieldIds()
    {
        $handles = array();
        $fields = craft()->fields->getAllFields();
        foreach ($fields as $field) {
            $handles[$field->handle] = $field->id;
        }
        return $handles;
    }

    /**
     * @return bool|mixed
     */
    protected function getRevisionManifest()
    {
        $manifestPath = craft()->path->getPluginsPath() . '/reasons/resources/rev-manifest.json';
        return (IOHelper::fileExists($manifestPath) && $manifest = IOHelper::getFileContents($manifestPath)) ? json_decode($manifest) : false;
    }

    /**
     * @return string
     */
    protected function getCacheKey()
    {
        return $this->_pluginName . '_' . $this->_version . '_' . $this->_schemaVersion;
    }

    /*
    *   Event handlers
    *
    */
    /**
     * @param Event $e
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
