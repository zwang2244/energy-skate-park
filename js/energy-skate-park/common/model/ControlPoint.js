// Copyright 2013-2020, University of Colorado Boulder

/**
 * Data structure for a control point, which allows the user to change the track shape in the 'playground' screen.
 *
 * @author Sam Reid
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const ControlPointIO = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/model/ControlPointIO' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DerivedPropertyIO = require( 'AXON/DerivedPropertyIO' );
  const energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  const merge = require( 'PHET_CORE/merge' );
  const NullableIO = require( 'TANDEM/types/NullableIO' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const required = require( 'PHET_CORE/required' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2IO = require( 'DOT/Vector2IO' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  class ControlPoint extends PhetioObject {

    // TODO: Should the "required" options parameter be changed to "config"?
    /**
     * @param x
     * @param y
     * @param {Object} config
     * @constructor
     */
    constructor( x, y, config ) {
      config = merge( {

        // {boolean} - can this control point specifically be dragged? In order to be draggable, the track itself must
        // be "configurable" and this must be true.
        draggable: true,

        // {Bounds2|null} - if specified, the ControlPoint will also be constrained to these bounds during dragging, or
        // when the track is bumped above ground, in model coordinates
        limitBounds: null,

        tandem: required( Tandem.REQUIRED ),
        phetioType: ControlPointIO,
        phetioState: PhetioObject.DEFAULT_OPTIONS.phetioState
      }, config );
      const tandem = config.tandem;

      super( config );

      // @public (read-only) {Bounds2|null} - see option for information
      this.limitBounds = config.limitBounds;

      // @public (read-only) {boolean} - see config for information
      this.draggable = config.draggable;

      // @public (phet-io)
      this.controlPointTandem = tandem;

      // @public - where it would be if it hadn't snapped to another point during dragging
      this.sourcePositionProperty = new Vector2Property( new Vector2( x, y ), {
        tandem: tandem.createTandem( 'sourcePositionProperty' ),
        phetioState: config.phetioState // in state only if parent is
      } );

      // @public {ControlPoint} - Another ControlPoint that this ControlPoint is going to 'snap' to if released.
      this.snapTargetProperty = new Property( null, {
        tandem: tandem.createTandem( 'snapTargetProperty' ),
        phetioType: PropertyIO( NullableIO( ControlPointIO ) ),
        phetioState: config.phetioState // in state only if parent is
      } );

      // Where it is shown on the screen.  Same as sourcePosition (if not snapped) or snapTarget.position (if snapped).
      // Snapping means temporarily connecting to an adjacent open point before the tracks are joined, to indicate that a
      // connection is possible
      // @public {Vector2}
      this.positionProperty = new DerivedProperty( [ this.sourcePositionProperty, this.snapTargetProperty ],
        ( sourcePosition, snapTarget ) => {
          return snapTarget ? snapTarget.positionProperty.value : sourcePosition;
        }, {
          tandem: tandem.createTandem( 'positionProperty' ),
          phetioType: DerivedPropertyIO( Vector2IO ),
          phetioState: config.phetioState
        } );

      // @public {BooleanProperty} - whether the control point is currently being dragged
      this.draggingProperty = new BooleanProperty( false, {
        tandem: tandem.createTandem( 'draggingProperty' )
      } );

      // @private
      this.disposeControlPoint = () => {
        this.positionProperty.dispose();
        this.sourcePositionProperty.dispose();
        this.snapTargetProperty.dispose();
        this.draggingProperty.dispose();
      };
    }

    /**
     * @public
     */
    dispose() {
      this.disposeControlPoint();
      super.dispose();
    }

    /**
     * Reset to initial state.
     * @public
     */
    reset() {
      this.sourcePositionProperty.reset();
      this.snapTargetProperty.reset();
      this.draggingProperty.reset();
    }

    /**
     * Create a new control point, identical to this one.
     * @param {Tandem} tandem
     * @returns {ControlPoint}
     */
    copy( tandem ) {
      return new ControlPoint( this.positionProperty.value.x, this.positionProperty.value.y, {
        tandem: tandem
      } );
    }

  }

  return energySkatePark.register( 'ControlPoint', ControlPoint );
} );