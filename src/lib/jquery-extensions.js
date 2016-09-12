import jQuery from 'jquery';


/*!
 * jQuery.fn.hasAttr()
 *
 * Copyright 2011, Rick Waldron
 * Licensed under MIT license.
 *
 */
(function( jQuery ) {
  jQuery.fn.hasAttr = function( name ) {
      for ( var i = 0, l = this.length; i < l; i++ ) {
          if ( !!( this.attr( name ) !== undefined ) ) {
              return true;
          }
      }
      return false;
  };
})( jQuery );