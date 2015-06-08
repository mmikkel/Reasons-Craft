<?php namespace Craft;

/**
 * Reasons makes it easy to add custom fields to element index tables.
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

    protected   $_version = '0.1.2',
                $_developer = 'Mats Mikkel Rummelhoff',
                $_developerUrl = 'http://mmikkel.no',
                $_pluginName = 'Reasons',
                $_pluginUrl = 'https://github.com/mmikkel/Reasons-Craft',
                $_minVersion = '2.3';

    public function getName()
    {
        return $this->_pluginName;
    }

    public function getVersion()
    {
        return $this->_version;
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

    public function init () {

        parent::init();

        if(
            !$this->isCraftRequiredVersion()
            || craft()->request->isAjaxRequest()
            || !craft()->request->isCpRequest()) {
            return false;
        }

        $this->includeResources();
        $this->addEventListeners();

    }

    public function getCraftRequiredVersion()
    {
        return $this->_minVersion;
    }

    public function isCraftRequiredVersion()
    {
        return version_compare(craft()->getVersion(), $this->getCraftRequiredVersion(),'>=');
    }

    protected function includeResources()
    {

        // TODO Only load necessary resources
        $data = json_encode(array(
            'conditionals' => craft()->reasons->getAllConditionals(),
            'toggleFields' => craft()->reasons->getToggleFields(),
            'entryTypeIds' => craft()->reasons->getEntryTypeIds(),
            'fieldIds' => craft()->reasons->getFieldIds(),
            'noToggleFieldsMessage' => Craft::t('No toggle fields available.'),
        ));

        $isDevMode = craft()->config->get('devMode');

        craft()->templates->includeCssResource('reasons/css/' . (!$isDevMode ? 'compressed/' : '') . 'reasons.css');
        craft()->templates->includeJsResource('reasons/js/' . (!$isDevMode ? 'compressed/' : '') . 'reasons.js');

        craft()->templates->includeJs('(function($){Reasons.settings='.$data.';Reasons.init();})(jQuery);');

    }

    protected function addEventListeners()
    {
        craft()->on('sections.saveEntryType',array($this,'onSaveEntryType'));
    }

    public function onSaveEntryType(Event $e)
    {
        
        $entryType = $e->params['entryType'];
        
        $conditionalsModel = new Reasons_ConditionalsModel();
        $conditionalsModel->sectionId = $entryType->sectionId;
        $conditionalsModel->typeId = $entryType->id;
        $conditionalsModel->conditionals = craft()->request->getPost('_reasons');;

        craft()->reasons->saveConditionals($conditionalsModel);

    }

}
