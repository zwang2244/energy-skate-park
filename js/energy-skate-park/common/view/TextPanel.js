// Copyright 2018-2020, University of Colorado Boulder

/**
 * Much of the text in this sim is surrounded by a transparent white panel to assist with visibility. This type
 * handles that for you.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../../sun/js/Panel.js';
import energySkatePark from '../../../energySkatePark.js';
import EnergySkateParkColorScheme from './EnergySkateParkColorScheme.js';

class TextPanel extends Panel {

  /**
   * @param {string} textContent - text to fill the panel
   * @param {Object} [options]
   */
  constructor( textContent, options ) {

    options = merge( {

      // Text options
      font: new PhetFont( 12 ),
      textMaxWidth: 150,

      // panel options
      fill: EnergySkateParkColorScheme.transparentPanelFill,
      cornerRadius: 0,
      lineWidth: 0,
      xMargin: 2,
      yMargin: 0,
      resize: false // assumes the text content is static
    }, options );

    const text = new Text( textContent, {
      font: options.font,
      maxWidth: options.textMaxWidth
    } );

    super( text, options );
  }
}

energySkatePark.register( 'TextPanel', TextPanel );
export default TextPanel;