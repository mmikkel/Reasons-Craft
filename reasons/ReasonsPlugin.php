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

    protected $_version = '2.0.0';
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

      if (!craft()->request->isCpRequest() || craft()->isConsole()) {
        return false;
      }

      if (!$this->isCraftRequiredVersion()) {
        craft()->userSession->setError(Craft::t('Reasons requires Craft 2.5 or newer, and has been disabled.'));
        return false;
      }

      craft()->on('fields.saveFieldLayout', array($this, 'onSaveFieldLayout'));

      if (craft()->request->isActionRequest()) {
        $this->actionRequestInit();
      } else if (!craft()->request->isAjaxRequest()) {
        $this->includeResources();
        craft()->templates->includeJs('Craft.ReasonsPlugin.init('.JsonHelper::encode(craft()->reasons->getData()).');');
      }

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

        $conditionals = craft()->request->getPost('_reasonsConditionals');

        if ($conditionals) {

          // Get field layout
          $fieldLayout = $e->params['layout'];
          $fieldLayoutId = $fieldLayout->id;

          // Create conditionals model
          $model = new Reasons_ConditionalsModel();
          $model->fieldLayoutId = $fieldLayoutId;
          $model->conditionals = $conditionals;

          // Save it
          craft()->reasons->saveConditionals($model);

        }

        craft()->fileCache->delete($this->getCacheKey());

    }

    /*
    *   Protected methods
    *
    */
    /**
     * @return bool
     */
    protected function actionRequestInit()
    {

      if (!craft()->request->isActionRequest()) {
        return false;
      }

      $actionPath = implode('/', craft()->request->getActionSegments());

      switch ($actionPath) {
        case 'fields/saveField':
          craft()->runController('reasons/fields/saveField');
          break;
        case 'elements/getEditorHtml':
          craft()->runController('reasons/getEditorHtml');
          break;
        case 'entries/switchEntryType':
          craft()->templates->includeJs('Craft.ReasonsPlugin.initPrimaryForm();');
          break;

      }

    }

    protected function includeResources()
    {
      craft()->templates->includeJsResource('reasons/'.$this->getRevvedResource('reasons.js'));
    }

    /**
     * @return bool|mixed
     */
    protected function getRevisionManifest()
    {
      $manifestPath = craft()->path->getPluginsPath().'/reasons/resources/rev-manifest.json';
      return (IOHelper::fileExists($manifestPath) && $manifest = IOHelper::getFileContents($manifestPath)) ? JsonHelper::decode($manifest) : false;
    }

    protected function getRevvedResource($src)
    {
      $manifest = $this->getRevisionManifest();
      return $manifest[$src] ?: $src;
    }

    /**
     * @return string
     */
    public function getCacheKey()
    {
      return $this->_pluginName.'_'.$this->_version.'_'.$this->_schemaVersion;
    }

}
