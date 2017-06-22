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
 * Class ReasonsService
 * @package Craft
 */
class ReasonsService extends BaseApplicationComponent
{

    private $_plugin;
    private $_conditionals;
    private $_matrixBlockTypes;
    private $_fields;
    private $_sources;
    private $_mappedConditionals;

    /*
    * Returns the Reasons plugin for use in variables and the like
    *
    */
    /**
     * @return null
     */
    public function getPlugin()
    {
        if (!isset($this->_plugin)) {
            $this->_plugin = craft()->plugins->getPlugin('reasons');
        }
        return $this->_plugin;
    }

    public function getData()
    {
        $doCacheData = !craft()->config->get('devMode');
        $cacheKey = $this->getPlugin()->getCacheKey();
        $data = $doCacheData ? craft()->fileCache->get($cacheKey) : null;
        if (!$data) {
            $data = array(
                'version' => $this->getPlugin()->getVersion(),
                'debug' => craft()->config->get('devMode'),
                'conditionals' => $this->getSourceMappedConditionals(),
                'toggleFieldTypes' => $this->getToggleFieldTypes(),
                'toggleFields' => $this->getToggleFields(),
                'fields' => $this->getFields(),
            );
            if ($doCacheData) {
                craft()->fileCache->set($cacheKey, $data, 1800); // Cache for 30 minutes
            }
        }
        return $data;
    }

    protected function getAllConditionals()
    {
      if (!isset($this->_conditionals)) {
        $this->_conditionals = array();
        $records = Reasons_ConditionalsRecord::model()->findAll();
        if ($records) {
            foreach ($records as $record) {
                $model = Reasons_ConditionalsModel::populateModel($record);
                if ($model->conditionals && $model->conditionals != '') {
                  $this->_conditionals[] = $model;
                }
            }
        }
      }
      return $this->_conditionals;
    }

    protected function getMatrixBlockTypes()
    {
      if (!isset($this->_matrixBlockTypes)) {
        $this->_matrixBlockTypes = array();
        $records = MatrixBlockTypeRecord::model()->findAll();
        if ($records) {
          foreach ($records as $record) {
            $this->_matrixBlockTypes[] = MatrixBlockTypeModel::populateModel($record);
          }
        }
      }
      return $this->_matrixBlockTypes;
    }

    protected function getSourceMap()
    {
      if (!isset($this->_sources)) {

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

        // Matrix block types
        $matrixBlockTypes = $this->getMatrixBlockTypes();
        foreach ($matrixBlockTypes as $matrixBlockType) {
          // This looks like a mess (well I guess the whole thing does :D) but we need to be able to query blocks by both ID and handle so yeah
          $fieldId = $matrixBlockType->fieldId;
          $fieldLayoutId = $matrixBlockType->fieldLayoutId;
          $sources['matrixBlockType:'.$matrixBlockType->id] = $fieldLayoutId;
          $sources['matrixField:'.$fieldId.':'.$matrixBlockType->handle] = $fieldLayoutId;
        }

        // Users
        $usersFieldLayout = craft()->fields->getLayoutByType(ElementType::User);
        if ($usersFieldLayout) {
            $sources['users'] = $usersFieldLayout->id;
        }

        // Solspace Calendar
        $solspaceCalendarPlugin = craft()->plugins->getPlugin('calendar');
        if ($solspaceCalendarPlugin && $solspaceCalendarPlugin->getDeveloper() === 'Solspace') {
            $solspaceCalendarFieldLayout = craft()->fields->getLayoutByType('Calendar_Event');
            if ($solspaceCalendarFieldLayout) {
                $sources['solspaceCalendar'] = $solspaceCalendarFieldLayout->id;
            }
        }

        // Commerce – TODO
        // $commercePlugin = craft()->plugins->getPlugin('commerce');
        // if ($commercePlugin && $commercePlugin->getDeveloper() === 'Pixel & Tonic') {
        //     // Product types
        //     $productTypes = craft()->commerce_productTypes->getAllProductTypes();
        //     if ($productTypes) {
        //         foreach ($productTypes as $productType) {
        //             $sources['commerceProductType:'.$productType->id] =
        //         }
        //     }
        // }

        $this->_sources = $sources;

      }
      return $this->_sources;
    }

    protected function getSourceMappedConditionals()
    {

      if (!isset($this->_mappedConditionals)) {

        $conditionals = $this->getAllConditionals();

        if (!$conditionals || empty($conditionals)) return array();

        // Map conditionals to field layout ID
        $conditionalsByFieldLayout = array();
        foreach ($conditionals as $conditionalsModel) {
          $conditionalsByFieldLayout['fieldLayout:'.$conditionalsModel->fieldLayoutId] = $conditionalsModel->conditionals;
        }

        // Map conditionals to sources
        $mappedConditionals = array();
        $sourceMap = $this->getSourceMap();

        // Map conditionals to sources
        foreach ($sourceMap as $sourceId => $fieldLayoutId) {
          if (isset($conditionalsByFieldLayout['fieldLayout:'.$fieldLayoutId])) {
            $mappedConditionals[$sourceId] = $conditionalsByFieldLayout['fieldLayout:'.$fieldLayoutId];
          }
        }

        $this->_mappedConditionals = $mappedConditionals;

      }

      return $this->_mappedConditionals;

    }

    /**
     * @return array
     */
    protected function getToggleFieldTypes()
    {

        $stockFieldTypes = array(
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
        );

        $customFieldTypes = array(
            'Calendar_Event',
            'ButtonBox_Buttons',
            'ButtonBox_Colours',
            'ButtonBox_Stars',
            'ButtonBox_TextSize',
            'ButtonBox_Width',
            'PreparseField_Preparse',
        );

        $fieldTypes = array_merge($stockFieldTypes, $customFieldTypes);

        $additionalFieldTypes = craft()->plugins->call('defineAdditionalReasonsToggleFieldTypes', array(), true);

        foreach ($additionalFieldTypes as $pluginHandle => $pluginFieldTypes) {
            $fieldTypes = array_merge($fieldTypes, $pluginFieldTypes);
        }

        return $fieldTypes;

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
                    //'contentAttribute' => $fieldType->defineContentAttribute() ?: false,
                    'settings' => $field->settings,
                );
            }
        }
        return $toggleFields;
    }

    /**
     * @return array
     */
    protected function getFields()
    {
      if (!isset($this->_fields)) {

        // Get all fields
        $fieldRecords = craft()->db->createCommand()
                          ->select('id, handle, context')
                          ->from('fields')
                          ->queryAll();

        // For convenience, we'll rewrite Matrix block type IDs in field contexts to handles
        $matrixBlockTypes = array_reduce($this->getMatrixBlockTypes(), function ($result, $blockType) {
          $result[(string)$blockType->id] = array(
            'fieldId' => $blockType->fieldId,
            'handle' => $blockType->handle,
          );
          return $result;
        }, array());

        $fields = array();

        foreach ($fieldRecords as $record) {
          $context = $record['context'];
          if (strpos($context, 'matrixBlockType') !== false) {
            $context = explode(':', $context);
            $matrixBlockTypeId = array_pop($context);
            if (!isset($matrixBlockTypes[$matrixBlockTypeId])) {
              $context = null;
            } else {
              $matrixBlockType = $matrixBlockTypes[$matrixBlockTypeId];
              $context = 'matrixField:'.$matrixBlockType['fieldId'].':'.$matrixBlockType['handle'];
            }
          }
          if (!$context) continue;
          if (!isset($fields[$context])) $fields[$context] = array();
          $fields[$context][$record['handle']] = $record['id'];
        }

        $this->_fields = $fields;

      }

      return $this->_fields;

    }

    /**
     * @param Reasons_ConditionalsModel $model
     * @return bool
     * @throws \Exception
     */
    public function saveConditionals(Reasons_ConditionalsModel $model)
    {

        $record = new Reasons_ConditionalsRecord();
        $record->fieldLayoutId = $model->fieldLayoutId;
        $record->conditionals = $model->conditionals;
        $record->validate();
        $model->addErrors($record->getErrors());

        if (!$model->hasErrors()) {
            $transaction = craft()->db->getCurrentTransaction() === null ? craft()->db->beginTransaction() : null;
            try {
                $record->save();
                if ($transaction !== null) {
                    $transaction->commit();
                }
            } catch (\Exception $e) {
                if ($transaction !== null) {
                    $transaction->rollback();
                }
                throw $e;
            }

            craft()->fileCache->delete($this->getPlugin()->getCacheKey());

            return true;

        }

        return false;

    }

    public function saveMatrixConditionalsFromPost(FieldModel $field)
    {

      $conditionals = craft()->request->getPost('_reasonsMatrixConditionals');

      if (!$conditionals) {
        return false;
      }

      // First, get all the block types for this field
      $blockTypes = craft()->matrix->getBlockTypesByFieldId($field->id);

      if (!$blockTypes || empty($blockTypes)) {
        return false;
      }

      // Then, loop through the conditionals and figure out the field layout ID they should be saved for
      $blockTypeConditionals = $conditionals['blockTypes'];

      foreach ($blockTypeConditionals as $blockTypeId => $conditionals) {

        $fieldLayoutId = null;

        $blockTypeHandle = substr((string)$blockTypeId, 0, 3) === 'new' ? substr($blockTypeId, strpos($blockTypeId, ':')+1) : null;

        // Find the matching block type
        $blockType = null;
        foreach ($blockTypes as $blockType) {

          if ($blockTypeHandle && $blockType->handle === $blockTypeHandle || !$blockTypeHandle && $blockType->id === $blockTypeId) {

            // This next one is a bit tricky... we'll need to rewrite any "new" field IDs by using their handle as identification
            // This is essentially the reverse of what happens in the JS, but less elegant, because I suck at PHP LOL
            $conditionals = JsonHelper::decode($conditionals);
            $conditionalsToSave = array();

            if (!$conditionals || !is_array($conditionals)) {
              continue;
            }

            $blockTypeFields = $blockType->getFields();

            foreach ($conditionals as $fieldId => $statements) {

              $fieldHandle = substr((string)$fieldId, 0, 3) === 'new' ? substr($fieldId, strpos($fieldId, ':')+1) : null;

              if ($fieldHandle) {
                $fieldId = null;
                foreach ($blockTypeFields as $blockTypeField) {
                  if ($fieldHandle === $blockTypeField->handle) {
                    $fieldId = $blockTypeField->id;
                    break;
                  }
                }
              }

              if (!$fieldId) {
                continue;
              }

              // Then the actual conditionals...
              $statementsToSave = array();

              foreach ($statements as $rules) {

                $rulesToSave = array();

                foreach ($rules as $rule) {

                  $toggleFieldId = $rule['fieldId'];
                  $toggleFieldHandle = substr((string)$toggleFieldId, 0, 3) === 'new' ? substr($toggleFieldId, strpos($toggleFieldId, ':')+1) : null;
                  if ($toggleFieldHandle) {
                    $toggleFieldId = null;
                    foreach ($blockTypeFields as $blockTypeField) {
                      if ($toggleFieldHandle === $blockTypeField->handle) {
                        $toggleFieldId = $blockTypeField->id;
                        break;
                      }
                    }
                  }

                  if (!$toggleFieldId) {
                    continue;
                  }

                  $rulesToSave[] = array_merge($rule, array(
                    'fieldId' => $toggleFieldId,
                  ));

                }

                if (!empty($rulesToSave)) {
                  $statementsToSave[] = $rulesToSave;
                }

              }

              if (!empty($statementsToSave)) {
                $conditionalsToSave[$fieldId] = $statementsToSave;
              }

            }

            if (empty(array_keys($conditionalsToSave))) {
              continue;
            }

            // Create conditionals model
            $model = new Reasons_ConditionalsModel();
            $model->fieldLayoutId = $blockType->fieldLayoutId;
            $model->conditionals = $conditionalsToSave;

            // Save it
            $success = craft()->reasons->saveConditionals($model);

            if ($success) {
              craft()->fileCache->delete($this->getPlugin()->getCacheKey());
            }

          }
        }

      }

      return true;

    }

}
