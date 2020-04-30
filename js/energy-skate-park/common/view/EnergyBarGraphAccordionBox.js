// Copyright 2019-2020, University of Colorado Boulder

/**
 * An AccordionBox that contains the energy bar graph used in this sim.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import merge from '../../../../../phet-core/js/merge.js';
import AccordionBox from '../../../../../sun/js/AccordionBox.js';
import energySkatePark from '../../../energySkatePark.js';
import Constants from '../Constants.js';
import EnergyBarGraph from './EnergyBarGraph.js';

class EnergyBarGraphAccordionBox extends AccordionBox {

  /**
   * @param {Skater}
   * @param {NumberProperty} - controls scale of bar graphs
   * @param {BooleanProperty} - controls visibility of bar graphs
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( skater, barGraphScaleProperty, barGraphVisibleProperty, tandem, options ) {

    const defaultMargin = 5;
    options = merge( {

      titleNode: EnergyBarGraph.createLabel(),

      contentXMargin: defaultMargin,
      contentYMargin: defaultMargin,
      buttonXMargin: defaultMargin,
      buttonYMargin: defaultMargin,

      // use this model Property because the graph only updates when it is visible
      expandedProperty: barGraphVisibleProperty,

      // {null|*} options for the bar graph itself, passed on to EnergyBarGraph
      barGraphOptions: null,

      tandem: tandem
    }, Constants.GRAPH_PANEL_OPTONS, options );

    const energyBarGraph = new EnergyBarGraph( skater, barGraphScaleProperty, barGraphVisibleProperty, tandem.createTandem( 'energyBarGraph' ), options.barGraphOptions );

    super( energyBarGraph, options );

    // create an icon that represents the content, it is invisible when expanded
    const graphIcon = EnergyBarGraph.createBarGraphIcon( tandem.createTandem( 'barGraphIcon' ), { scale: 0.8 } );
    this.addChild( graphIcon );
    graphIcon.right = graphIcon.globalToParentPoint( energyBarGraph.parentToGlobalPoint( energyBarGraph.rightCenter ) ).x;
    graphIcon.top = options.buttonYMargin;

    barGraphVisibleProperty.link( visible => {
      graphIcon.visible = !visible;
    } );
  }
}

energySkatePark.register( 'EnergyBarGraphAccordionBox', EnergyBarGraphAccordionBox );
export default EnergyBarGraphAccordionBox;