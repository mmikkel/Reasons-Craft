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
 * The class name is the UTC timestamp in the format of mYYMMDD_HHMMSS_pluginHandle_migrationName
 */
class m160117_000000_reasons_addFieldLayoutIdColumn extends BaseMigration
{
	/**
	 * Any migration code in here is wrapped inside of a transaction.
	 *
	 * @return bool
	 */
	public function safeUp()
	{

		$table = 'reasons';

		/*
		*	Add FK fieldLayoutId column
		*
		*/
		$this->addColumnAfter($table, 'fieldLayoutId', ColumnType::Int, 'id');
		$this->addForeignKey($table, 'fieldLayoutId', 'fieldlayouts', 'id', 'CASCADE', 'CASCADE');

		/*
		*	Set fieldLayoutId for existing rows
		*
		*/
		$entryTypeRecords = EntryTypeRecord::model()->findAll();
		if ($entryTypeRecords)
		{
			$entryTypes = EntryTypeModel::populateModels($entryTypeRecords);	
			foreach ($entryTypes as $entryType)
			{
				if (!isset($entryType->fieldLayoutId) || !$entryType->fieldLayoutId) continue;
				$this->update($table, array(
					'fieldLayoutId' => $entryType->fieldLayoutId,
				), 'typeId=:typeId', array(
					':typeId' => $entryType->id,
				));
			}
		}
		
		/*
		*	Delete typeId column
		*
		*/
		$this->dropForeignKey($table, 'typeId');
		$this->dropColumn($table, 'typeId');

		/*
		*	Delete sectionId column
		*
		*/
		$this->dropForeignKey($table, 'sectionId');
		$this->dropColumn($table, 'sectionId');

		return true;

	}
}
