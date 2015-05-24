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

class ReasonsController extends BaseController
{

	/**
	 * @access public
	 * @return mixed
	 */
	public function actionBuilder( array $variables = array() )
	{
		return $this->renderTemplate( 'reasons/_builder', $variables );
	}

}
