<?php namespace Craft;

/**
 * Reasons by Mats Mikkel Rummelhoff
 *
 * @author      Mats Mikkel Rummelhoff <http://mmikkel.no>
 * @package     Reasons
 * @since       Craft 2.3
 * @copyright   Copyright (c) 2015, Mats Mikkel Rummelhoff
 * @license     http://opensource.org/licenses/mit-license.php MIT License
 * @link        https://github.com/mmikkel/dashcols-craft
 */

class ReasonsService extends BaseApplicationComponent
{

	private $_plugin = null;

	/*
	* Returns the Reasons plugin for use in variables and the like
	*
	*/
	public function getPlugin()
	{
		if ($this->_plugin === null)
		{
			$this->_plugin = craft()->plugins->getPlugin('reasons');
		}
		return $this->_plugin;
	}

	public function getAllConditionals()
	{

		$conditionals = array();
		$records = Reasons_ConditionalsRecord::model()->findAll();

		foreach ($records as $record)
		{
			$conditionals[] = Reasons_ConditionalsModel::populateModel($record)->getAttributes();
		}

		return $conditionals;

	}

	public function getConditionalsByEntryTypeId($fieldLayoutId = null)
	{
		return array();
	}

	public function saveConditionals(Reasons_ConditionalsModel $conditionalsModel)
	{
		
		if ($conditionalsRecord = Reasons_ConditionalsRecord::model()->findByAttributes(array(
				'typeId' => $conditionalsModel->typeId
			)))
		{
			$conditionalsModel->id = $conditionalsRecord->id;
		} else {
			$conditionalsRecord = new Reasons_ConditionalsRecord();
		}

		$conditionalsRecord->sectionId = $conditionalsModel->sectionId;
		$conditionalsRecord->typeId = $conditionalsModel->typeId;
		$conditionalsRecord->conditionals = $conditionalsModel->conditionals;
		$conditionalsRecord->validate();
		$conditionalsModel->addErrors( $conditionalsRecord->getErrors() );

		if (!$conditionalsModel->hasErrors())
		{

			$transaction = craft()->db->getCurrentTransaction() === null ? craft()->db->beginTransaction() : null;

			try	{

				if (!$conditionalsModel->id)
				{
					$conditionalsRecord->save();
				} else {
					$conditionalsRecord->update();
				}

				$conditionalsModel->id = $conditionalsRecord->id;

				if ($transaction !== null)
				{
					$transaction->commit();
				}

			} catch (\Exception $e) {

				if ($transaction !== null)
				{
					$transaction->rollback();
				}

				throw $e;

			}

			return true;

		}

		return false;

	}

	public function getEntryTypeIds()
	{
		if ($entryTypeRecords = EntryTypeRecord::model()->ordered()->findAll()){
			$entryTypes = EntryTypeModel::populateModels($entryTypeRecords);
			$sectionsWithEntryTypeIds = array();
			foreach ($entryTypes as $entryType) {
				if (!isset($sectionsWithEntryTypeIds[$entryType->sectionId])){
					$sectionsWithEntryTypeIds[$entryType->sectionId] = array();
				}
				$sectionsWithEntryTypeIds[$entryType->sectionId][] = $entryType->id;
			}
			return !empty($sectionsWithEntryTypeIds) ? $sectionsWithEntryTypeIds : false;
		}
		return false;
	}

	/*
	*	Returns all toggle-able fields
	*
	*/
	public function getToggleFields()
	{
		$toggleFieldTypes = array(
			'Lightswitch',
			'Dropdown',
			'Checkboxes',
			'MultiSelect',
			'RadioButtons',
			'Number',
			'PositionSelect',
			'PlainText',
		);
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

	public function getFieldIds()
	{
		$handles = array();
		$fields = craft()->fields->getAllFields();
		foreach ($fields as $field){
			$handles[$field->handle] = $field->id;
		}
		return $handles;
	}

}