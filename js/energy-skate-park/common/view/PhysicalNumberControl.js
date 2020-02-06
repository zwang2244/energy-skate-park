// Copyright 2019-2020, University of Colorado Boulder

/**
 * A NumberControl that controls a physical value of the model in Energy Skate Park.
 *
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const Constants = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/Constants' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );

  class PhysicalNumberControl extends NumberControl {

    /**
     * @param {string} titleString
     * @param {NumberProperty} property
     * @param {Range} valueRange
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( titleString, property, valueRange, tandem, options ) {
      options = options || {};
      assert && assert( options.layoutFunction === undefined, 'PhysicalNumberControl sets layoutFunction' );
      assert && assert( options.tandem === undefined, 'PhysicalNumberControl shouldnt set tandem in options' );
      assert && assert( options.arrowButtonOptions === undefined, 'PhysicalNumberControl sets arrowButtonOptions' );
      assert && assert( options.titleFont === undefined, 'PhysicalNumberControl sets title font' );

      if ( options.numberDisplayOptions ) {
        assert && assert( options.numberDisplayOptions.font === undefined, 'PhysicalNumberControl sets font' );
        assert && assert( options.numberDisplayOptions.xMargin === undefined, 'PhysicalNumberControl sets xMargin' );
        assert && assert( options.numberDisplayOptions.yMargin === undefined, 'PhysicalNumberControl sets yMargin' );
      }

      if ( options.sliderOptions ) {
        assert && assert( options.sliderOptions.constrainValue === undefined, 'PhysicalNumberControl sets constrainValue on slider' );
      }

      // slider options are passed directly to the Slider in NumberControl
      options = merge( {

        // decimal places for the ticks and (by default) the NumberControl's NumberDisplay
        decimalPlaces: 0,

        // {boolean} - if true, the tweaker buttons and number display will be hidden (but rest of NumberControl title
        // and layout will be preserved)
        sliderOnly: false,

        // {*|null} - passed to the Slider of NumberControl, extended below
        sliderOptions: null,

        // {*|null} - passed to the NumberDisplay of NumberControl, extended below
        numberDisplayOptions: null
      }, options );

      options.sliderOptions = merge( {
        majorTicks: [
          {
            value: valueRange.min,
            label: new Text( Utils.toFixed( valueRange.min, options.decimalPlaces ), Constants.CONTROL_TICK_LABEL_OPTIONS )
          },
          {
            value: valueRange.max,
            label: new Text( Utils.toFixed( valueRange.max, options.decimalPlaces ), Constants.CONTROL_TICK_LABEL_OPTIONS )
          }
        ]
      }, Constants.SLIDER_OPTIONS, options.sliderOptions );

      if ( options.sliderOnly ) {

        // if we are not including tweaker buttons, don't constrain slider value to tweaker deltas
        options.sliderOptions.constrainValue = _.identity;
      }

      options.numberDisplayOptions = merge( {
        decimalPlaces: options.decimalPlaces
      }, options.numberDisplayOptions );

      // look and feel for all PhysicalNumberControls (not set in normal options extend calls because they cannot be
      // changed with options!)
      merge( options, {
        arrowButtonOptions: {
          scale: 0.5
        },

        /**
         * Custom layout for the NumberControl - if the slider is the only form of input for the control the tweaker
         * and number display are hidden. But we still have the same layout for the title so that this matches other
         * NumberControls used in energy-skate-park.
         *
         * @param {Node} titleNode
         * @param {NumberDisplay} numberDisplay
         * @param {Slider} slider
         * @param {ArrowButton} leftArrowButton
         * @param {ArrowButton} rightArrowButton
         * @returns {Node}
         */
        layoutFunction: ( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton ) => {

          // default layout, once done we will hide extra components if this is only meant to display the slider
          const defaultLayoutFunction = NumberControl.createLayoutFunction4( {

            // arrow buttons a bit tighter than default to provide more room for content in screens
            arrowButtonSpacing: 2,

            // can be multiple physical controls in a panel, need to make some extra space
            verticalSpacing: 2
          } );
          const children = defaultLayoutFunction( titleNode, numberDisplay, slider, leftArrowButton, rightArrowButton );

          if ( options.sliderOnly ) {
            leftArrowButton.visible = false;
            rightArrowButton.visible = false;
            numberDisplay.visible = false;
          }

          return children;
        },
        sliderOptions: options.sliderOptions,
        numberDisplayOptions: merge( options.numberDisplayOptions, {
          xMargin: 2,
          yMargin: 2,
          font: new PhetFont( 10 ),
          numberMaxWidth: 50
        } ),
        titleNodeOptions: {
          font: Constants.CONTROL_TITLE_FONT,
          maxWidth: 50
        },

        // phet-io
        tandem: tandem
      } );

      super( titleString, property, valueRange, options );
    }
  }

  return energySkatePark.register( 'PhysicalNumberControl', PhysicalNumberControl );
} );
