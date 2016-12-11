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
