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

    private $_plugin = null;

    /*
    * Returns the Reasons plugin for use in variables and the like
    *
    */
    /**
     * @return null
     */
    public function getPlugin()
    {
        if ($this->_plugin === null) {
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
            return true;
        }

        return false;

    }

}
