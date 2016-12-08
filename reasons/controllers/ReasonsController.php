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
 * Class ReasonsController
 * @package Craft
 */

class ReasonsController extends BaseController {

  public function actionGetEditorHtml()
  {

    register_shutdown_function(function () {

      // Try to get the source for the element being getEditorHtml'd
      $elementId = (int) craft()->request->getPost('elementId');
      $element = $elementId ? craft()->elements->getElementById($elementId) : null;
      $elementType = $element ? $element->elementType : craft()->request->getPost('elementType');
      $attributes = craft()->request->getPost('attributes');

      $source = null;

      switch ($elementType) {

        case ElementType::Entry :
          if ($element) {
            $source = 'entryType:' . $element->type->id;
          } else if (isset($attributes['typeId'])) {
            $source = 'entryType:' . $attributes['typeId'];
          } else if (isset($attributes['sectionId'])) {
            $entryTypes = craft()->sections->getEntryTypesBySectionId((int)$attributes['sectionId']);
            $entryType = $entryTypes ? array_shift($entryTypes) : false;
            $source = $entryType ? 'entryType:' . $entryType->id : null;
          }
          break;

        case ElementType::GlobalSet :
          $source = $element ? 'globalSet:' . $element->id : null;
          break;

        case ElementType::Asset :
          $source = $element ? 'assetSource:' . $element->source->id : null;
          break;

        case ElementType::Category :
          $source = $element ? 'categoryGroup:' . $element->group->id : null;
          break;

        case ElementType::Tag :
          $source = $element ? 'tagGroup:' . $element->group->id : null;
          break;

        case ElementType::User :
          $source = 'users';
          break;

      }

      if ($source) {
        $json = JsonHelper::decode(ob_get_clean());
        $json['_reasonsSource'] = $source;
        echo JsonHelper::encode($json);
      }

    });

    craft()->runController('elements/getEditorHtml');

  }

}
