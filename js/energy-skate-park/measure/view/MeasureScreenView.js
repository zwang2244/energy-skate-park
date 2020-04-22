// Copyright 2018-2020, University of Colorado Boulder

/**
 * The ScreenView for the "Measure" Screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Node from '../../../../../scenery/js/nodes/Node.js';
import energySkatePark from '../../../energySkatePark.js';
import EnergySkateParkTrackSetScreenView from '../../common/view/EnergySkateParkTrackSetScreenView.js';
import InspectedSampleHaloNode from './InspectedSampleHaloNode.js';
import SkaterPathSensorNode from './SkaterPathSensorNode.js';
import SkaterSamplesCanvasNode from './SkaterSamplesCanvasNode.js';

class MeasureScreenView extends EnergySkateParkTrackSetScreenView {

  /**
   * @param {MeasureModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    // parent layer for ComboBox, would use this but it is not available until after super
    const comboBoxParent = new Node();

    super( model, tandem, {
      showBarGraph: false,
      showSkaterPath: true,
      controlPanelOptions: {
        visibilityControlsOptions: {
          showSkaterPathCheckbox: true,
          showStickToTrackCheckbox: true
        },
        gravityControlsOptions: {
          includeGravityComboBox: true
        }
      }
    } );

    this.addChild( comboBoxParent );

    // @private - for layout
    this.pathSensor = new SkaterPathSensorNode( model.skaterSamples, model.sensorProbePositionProperty, model.sensorBodyPositionProperty, model.availableModelBoundsProperty, this.modelViewTransform, this.controlPanel, {
      tandem: tandem.createTandem( 'pathSensor' )
    } );

    const inspectedSampleHaloNode = new InspectedSampleHaloNode( model.skaterSamples, this.modelViewTransform );
    this.topLayer.addChild( inspectedSampleHaloNode );

    // @private - so it can be repainted in step
    this.skaterSamplesNode = new SkaterSamplesCanvasNode( model, this.modelViewTransform );
    this.topLayer.addChild( this.skaterSamplesNode );

    this.topLayer.addChild( this.pathSensor );
  }

  /**
   * @public
   * @param {number} dt - in seconds
   */
  step( dt ) {
    this.skaterSamplesNode.step( dt );
  }

  /**
   * Custom floating layout for this screen, dependent on available view bounds.
   * @public
   *
   * @param {number} width
   * @param {number} height
   * @override
   */
  layout( width, height ) {
    super.layout( width, height );

    // in the measure screen the legend is in the top left of the screen
    this.pieChartLegend.mutate( { top: this.controlPanel.top, left: this.fixedLeft } );

    // position the body relative to the pie chart legend, this sets the origin of the body (top left)
    this.model.sensorBodyPositionProperty.set( this.modelViewTransform.viewToModelXY( this.fixedLeft, this.pieChartLegend.bottom + 10 ) );
  }
}

energySkatePark.register( 'MeasureScreenView', MeasureScreenView );
export default MeasureScreenView;