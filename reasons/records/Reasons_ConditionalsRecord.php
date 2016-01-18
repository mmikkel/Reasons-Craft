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

class Reasons_ConditionalsRecord extends BaseRecord
{
	public function getTableName()
	{
		return 'reasons';
	}

	/**
	 * @access protected
	 * @return array
	 */
	protected function defineAttributes()
	{
		return array(
			'fieldLayoutId' => AttributeType::Number,
			'conditionals' => AttributeType::Mixed,
		);
	}

	/**
	 * @access public
	 * @return array
	 */
	public function defineRelations()
	{
		return array(
			'fieldLayout' => array(
				static::BELONGS_TO,
				'FieldLayoutRecord',
				'fieldLayoutId',
				'onDelete' => static::CASCADE,
			),
		);
	}

}