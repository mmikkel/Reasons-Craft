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
 * Class Reasons_ConditionalsModel
 * @package Craft
 */
class Reasons_ConditionalsModel extends BaseModel
{

    /**
     * @access protected
     * @return array
     */
    protected function defineAttributes()
    {
        return array(
            'id' => AttributeType::Number,
            'fieldLayoutId' => AttributeType::Number,
            'conditionals' => AttributeType::Mixed,
        );
    }

}
