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
 * Class Reasons_FieldsController
 * @package Craft
 */

class Reasons_FieldsController extends FieldsController {

  public function redirectToPostedUrl($object = null, $default = null)
  {
    if ($object && get_class($object) === 'Craft\FieldModel' && craft()->request->getPost('type') === 'Matrix') {
      craft()->reasons->saveMatrixConditionalsFromPost($object);
    }
    parent::redirectToPostedUrl($object, $default);
  }

}
