// Copyright 2017-2018, University of Colorado Boulder

/**
 * The skater stores a reference to the track it is on, or null if in the air or ground.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  var ObjectIO = require( 'TANDEM/types/ObjectIO' );
  var phetioInherit = require( 'TANDEM/phetioInherit' );
  var Track = require( 'ENERGY_SKATE_PARK/model/Track' );

  // ifphetio
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var phetioEngine = require( 'ifphetio!PHET_IO/phetioEngine' );

  /**
   * @param {Track} track
   * @param {string} phetioID
   * @constructor
   */
  function TrackReferenceIO( track, phetioID ) {
    assert && assertInstanceOf( track, Track );
    ObjectIO.call( this, track, phetioID );
  }

  phetioInherit( ObjectIO, 'TrackReferenceIO', TrackReferenceIO, {}, {
    toStateObject: function( track ) {
      assert && assertInstanceOf( track, Track );
      return track ? track.trackTandem.phetioID : null;
    },
    fromStateObject: function( stateObject ) {
      if ( stateObject === null ) {
        return null;
      }
      if ( phetioEngine.hasInstance( stateObject ) ) {
        return phetioEngine.getInstance( stateObject );
      }
      else {
        throw new Error( 'fromStateObject failed' );
      }
    }
  } );

  energySkatePark.register( 'TrackReferenceIO', TrackReferenceIO );

  return TrackReferenceIO;
} );