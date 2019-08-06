// Copyright 2019, University of Colorado Boulder

/**
 * The energy plot in the Graphs screen of energy skate park. Plots Energy against time OR energy against position
 * depending on the selected independent variable. Uses XYCursorPlot because the cursor can be dragged to
 * control playback and restore previous the model to a previous point in time.
 * @author Jesse Greenberg
 */

define( require => {
  'use strict';

  // modules
  const Emitter = require( 'AXON/Emitter' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const EnergySkateParkColorScheme = require( 'ENERGY_SKATE_PARK/energy-skate-park/view/EnergySkateParkColorScheme' );
  const GraphsModel = require( 'ENERGY_SKATE_PARK/energy-skate-park/graphs/model/GraphsModel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const PointStyle = require( 'GRIDDLE/PointStyle' );
  const Range = require( 'DOT/Range' );
  const XYCursorPlot = require( 'GRIDDLE/XYCursorPlot' );
  const XYDataSeries = require( 'GRIDDLE/XYDataSeries' );

  // constants
  // determines a range for the energy plot as a function of the scale
  const Y_OFFSET = 500;
  const Y_SLOPE = 500;

  // when the plot range is larger than this the threshold a larger step is used for vertical grid lines on the plot
  const LARGE_RANGE_THRESHOLD = 5000;
  const LARGE_STEP = 1000;
  const SMALL_STEP = 500;

  class EnergyPlot extends XYCursorPlot {

    /**
     * @param {GraphsModel} model
     * @param {number} graphWidth
     * @param {number} graphHeight
     * @param {Tandem} tandem
     */
    constructor( model, graphWidth, graphHeight, tandem ) {

      const dragEndedEmitter = new Emitter();
      const dragStartedEmitter = new Emitter();

      // whether or not the sim was paused when dragging started
      let pausedOnDragStart = false;

      const plotRange = calculateRange( model.lineGraphScaleProperty.get() );

      super( {

        // dimensions of the graph
        width: graphWidth,
        height: graphHeight,

        // plot domain, range, and grid increments
        maxX: 20, // TODO: ?
        minY: plotRange.min,
        maxY: plotRange.max,
        stepY: SMALL_STEP, // TODO: ?

        // no arrows along x and y
        showAxis: false,

        // for the grid lines
        lineDash: [ 4, 4 ],
        showVerticalIntermediateLines: false,
        showHorizontalIntermediateLines: false,
        tickLabelFont: new PhetFont( 10 ),

        // for the cursor that shows current time
        cursorOptions: {
          startDrag: ( event, listener ) => {
            pausedOnDragStart = model.pausedProperty.get();

            if ( !pausedOnDragStart ) {
              model.pausedProperty.set( true );
            }

            dragStartedEmitter.emit();
          },
          drag: ( event, listener ) => {

            // when we drag the cursor, get the skater sample at the closest cursor time and set skater to skaterState
            const closestSample = model.getClosestSkaterSample( this.getCursorValue() );
            closestSample.skaterStatesetToSkater( model.skater );
            model.skater.updatedEmitter.emit();
          },
          endDrag: ( event, listener ) => {

            if ( !pausedOnDragStart ) {
              model.pausedProperty.set( false );
            }

            dragEndedEmitter.emit();
          }
        }
      } );

      // @private {XYDataSeries}
      this.kineticEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.kineticEnergy } );
      this.potentialEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.potentialEnergy } );
      this.thermalEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.thermalEnergy } );
      this.totalEnergyDataSeries = new XYDataSeries( { color: EnergySkateParkColorScheme.totalEnergy } );

      // second parameter allows data to be scaled correctly so it is in the correct spot relative to plot range
      this.addSeries( this.thermalEnergyDataSeries, true );
      this.addSeries( this.potentialEnergyDataSeries, true );
      this.addSeries( this.kineticEnergyDataSeries, true );
      this.addSeries( this.totalEnergyDataSeries, true );

      // when cursor drag finishes, clear all data that has time greater than cursor time and set model time
      // to the selected cursor time - this method assumes that all data is in chronological order
      dragEndedEmitter.addListener( () => {
        const timeOnEnd = this.getCursorValue();
        model.runningTimeProperty.set( timeOnEnd );

        for ( let i = 0; i < this.dataSeriesList.length; i++ ) {
          const dataSeries = this.dataSeriesList[ i ];
          const timeData = dataSeries.getXPoints();
          for ( let j = 0; j < dataSeries.getLength(); j++ ) {
            if ( timeData[ j ] >= timeOnEnd ) {
              const startIndex = j;
              const endIndex = dataSeries.getLength();

              dataSeries.removePoints( startIndex, endIndex );
              break;
            }
          }
        }
      } );

      // calculate new range of plot when zooming in or out
      model.lineGraphScaleProperty.link( ( scale ) => {
        const newRange = calculateRange( scale );
        const newMaxY = newRange.max;
        const newMinY = newRange.min;
        const newStepY = ( newMaxY - newMinY ) >= LARGE_RANGE_THRESHOLD ? LARGE_STEP : SMALL_STEP;

        this.setMinY( newMinY );
        this.setMaxY( newMaxY );
        this.setStepY( newStepY );
      } );

      model.kineticEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.kineticEnergyDataSeries.uniqueId ], 'visible' );
      model.potentialEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.potentialEnergyDataSeries.uniqueId ], 'visible' );
      model.thermalEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.thermalEnergyDataSeries.uniqueId ], 'visible' );
      model.totalEnergyDataVisibleProperty.linkAttribute( this.seriesViewMap[ this.totalEnergyDataSeries.uniqueId ], 'visible' );

      // add data points when a SkaterSample is added to the model
      model.skaterSamples.addItemAddedListener( addedSample => {
        const plotTime = model.independentVariableProperty.get() === GraphsModel.IndependentVariable.TIME;
        const independentVariable = plotTime ? addedSample.time : addedSample.position.x + 5;

        // keep a reference to the pointStyle so that it can be modified later
        const pointStyle = new PointStyle();

        this.kineticEnergyDataSeries.addPoint( independentVariable, addedSample.kineticEnergy, pointStyle );
        this.potentialEnergyDataSeries.addPoint( independentVariable, addedSample.potentialEnergy, pointStyle );
        this.thermalEnergyDataSeries.addPoint( independentVariable, addedSample.thermalEnergy, pointStyle );
        this.totalEnergyDataSeries.addPoint( independentVariable, addedSample.totalEnergy, pointStyle );

        // add a listener that updates opacity with the SkaterSample Property, dispose it on removal
        const opacityListener = opacity => {
          for ( let i = 0; i < this.dataSeriesList.length; i++ ) {
            pointStyle.opacity = opacity;
            this.seriesViewMap[ this.dataSeriesList[ i ].uniqueId ].redraw();
          }
        };
        addedSample.opacityProperty.link( opacityListener );

        const removalListener = removedSample => {
          if ( removedSample === addedSample ) {
            addedSample.opacityProperty.unlink( opacityListener );

            for ( let i = 0; i < this.dataSeriesList.length; i++ ) {

              // TODO: Get the index of the position removed sample rather than assume they will be removed from oldest
              // to newest?
              this.dataSeriesList[ i ].removePoint( 0 );
            }
            model.skaterSamples.removeItemRemovedListener( removalListener );
          }
        };
        model.skaterSamples.addItemRemovedListener( removalListener );

        this.setCursorValue( independentVariable );
      } );
    }

    /**
     * Clear all energy data for the data series associated with this plot.
     * @public
     */
    clearEnergyDataSeries() {
      this.kineticEnergyDataSeries.clear();
      this.potentialEnergyDataSeries.clear();
      this.thermalEnergyDataSeries.clear();
      this.totalEnergyDataSeries.clear();

      this.setCursorValue( 0 );
    }
  }

  //--------------------------------------------------------------------------
  // helper functions
  //-------------------------------------------------------------------------
  /**
   * Calculates the range of the plot as a function of scale
   * @param {number} scale
   * @returns {Range}
   */
  const calculateRange = scale => {
    const max = Y_OFFSET + scale * Y_SLOPE;
    return new Range( -max, max );
  };

  return energySkatePark.register( 'EnergyPlot', EnergyPlot );
} );
