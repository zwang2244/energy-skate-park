// Copyright 2013-2018, University of Colorado Boulder

/**
 * Scenery node that shows static background for the bar graph, including the title, axes, labels and clear thermal
 * button. This was split into separate layers in order to keep the animation fast (while still looking crisp) on iPad.
 *
 * The layout handled in this file is very specific to the buttons in this background. Arrows that represent the
 * extension of the bar graphs, and maximum heights of the bar graphs are dependent on the positioning of the zoom
 * buttons below the graph.
 *
 * TODO: We get a lot of information from the bar graph by index, but it seems a bit fragile. Perhaps we should collect
 * information into a type or some other way to handle?
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var ClearThermalButton = require( 'SCENERY_PHET/ClearThermalButton' );
  var ColorConstants = require( 'SUN/ColorConstants' );
  var Constants = require( 'ENERGY_SKATE_PARK/energy-skate-park/common/Constants' );
  var energySkatePark = require( 'ENERGY_SKATE_PARK/energySkatePark' );
  var EnergySkateParkColorScheme = require( 'ENERGY_SKATE_PARK/energy-skate-park/view/EnergySkateParkColorScheme' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  // constants - height of the arrow that extends a bar if it goes outside of the graph axis
  var ARROW_HEIGHT = 15;

  // amount of vertical spacing between x axis and zoom buttons, to give room for negative bars
  var ZOOM_BUTTON_VERTICAL_SPACING = 130;

  // spacing between the thermal button and the label
  var THERMAL_BUTTON_SPACING = 5;

  // maps index from of bar to its color
  var COLOR_INDEX_MAP = {
    0: EnergySkateParkColorScheme.kineticEnergy,
    1: EnergySkateParkColorScheme.potentialEnergy,
    2: EnergySkateParkColorScheme.thermalEnergy,
    3: EnergySkateParkColorScheme.totalEnergy
  };

  // strings
  var energyEnergyString = require( 'string!ENERGY_SKATE_PARK/energy.energy' );
  var energyKineticString = require( 'string!ENERGY_SKATE_PARK/energy.kinetic' );
  var energyPotentialString = require( 'string!ENERGY_SKATE_PARK/energy.potential' );
  var energyThermalString = require( 'string!ENERGY_SKATE_PARK/energy.thermal' );
  var energyTotalString = require( 'string!ENERGY_SKATE_PARK/energy.total' );

  /**
   * Constructor for the BarGraph
   * @param {Skater} skater the model's skater model
   * @param {Property<Boolean>} barGraphVisibleProperty property that indicates whether the bar graph is visible
   * @param {NumberProperty} graphScaleProperty
   * @param {Function} clearThermal function to be called when the user presses the clear thermal button.
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function BarGraphBackground( skater, barGraphVisibleProperty, graphScaleProperty, clearThermal, tandem, options ) {

    var self = this;

    options = _.extend( {

      // include buttons that increase/decrease the scale of the graph?
      includeZoomButtons: true  
    }, options );

    // @private {boolean}
    this.includeZoomButtons= options.includeZoomButtons;

    // Free layout parameters
    var contentWidth = 110;
    var contentHeight = 280;
    var insetX = 2;
    this.insetY = 25; // @private

    var numBars = 4;
    var spaceBetweenBars = 10;
    var spaceBetweenAxisAndBar = 10;
    var spaceBetweenRightSideAndBar = 5;
    this.barWidth = (contentWidth - insetX * 2 - (numBars - 1) * spaceBetweenBars - spaceBetweenAxisAndBar - spaceBetweenRightSideAndBar) / numBars;

    this.originY = contentHeight - this.insetY;

    // The x-coordinate of a bar chart bar
    this.getBarX = function( barIndex ) { return insetX + spaceBetweenAxisAndBar + self.barWidth * barIndex + spaceBetweenBars * barIndex; };

    // @private - buttons shifted to the left so they are out of the way of bars for negative energy
    this.zoomOutButton = new ZoomButton( {
      in: false,
      scale: 0.3,
      baseColor: ColorConstants.LIGHT_BLUE,
      leftTop: new Vector2( -10, this.originY + ZOOM_BUTTON_VERTICAL_SPACING ),
      listener: function() {
        graphScaleProperty.set( Math.max( graphScaleProperty.get() - Constants.ZOOM_FACTOR_DELTA, Constants.MIN_ZOOM_FACTOR ) );
      }
    } );
    this.zoomInButton = new ZoomButton( {
      in: true,
      leftCenter: this.zoomOutButton.rightCenter.plusXY( 5, 0 ),
      scale: 0.3,
      baseColor: ColorConstants.LIGHT_BLUE,
      listener: function() {
        graphScaleProperty.set( Math.min( graphScaleProperty.get() + Constants.ZOOM_FACTOR_DELTA, Constants.MAX_ZOOM_FACTOR ) );
      }
    } );

    // Create a label that appears under one of the bars
    var createLabel = function( index, title, tandemName ) {
      var text = new Text( title, {
        tandem: tandem.createTandem( tandemName ),
        fill: COLOR_INDEX_MAP[ index ],
        font: new PhetFont( 12 ),
        pickable: false,

        // i18n, chosen so that label allows space for arrows and thermal energy button
        maxWidth: ZOOM_BUTTON_VERTICAL_SPACING - ARROW_HEIGHT - 2 * THERMAL_BUTTON_SPACING
      } );
      text.rotate( -Math.PI / 2 );
      text.centerX = self.getBarX( index ) + self.barWidth / 2;
      text.top = self.originY + 4;

      return text;
    };

    // @private {Node}
    this.kineticLabel = createLabel( 0, energyKineticString, 'kineticEnergyLabel' );
    this.potentialLabel = createLabel( 1, energyPotentialString, 'potentialEnergyLabel' );
    this.thermalLabel = createLabel( 2, energyThermalString, 'thermalEnergyLabel' );
    this.totalLabel = createLabel( 3, energyTotalString, 'totalEnergyLabel' );

    var clearThermalButton = new ClearThermalButton( {
      tandem: tandem.createTandem( 'clearThermalButton' ),
      listener: clearThermal,
      centerX: this.thermalLabel.centerX,
      y: this.thermalLabel.bottom + THERMAL_BUTTON_SPACING,
      scale: 0.7
    } );
    skater.allowClearingThermalEnergyProperty.link( function( allowClearingThermalEnergy ) {
      clearThermalButton.enabled = allowClearingThermalEnergy;
    } );

    // @public (to update visibility in background) - Arrows that will appear when a particular bar gets too high or
    // low. Only potential and total energy support negative values
    this.kineticEnergyUpArrow = this.createArrowNode( 0, true );
    this.potentialEnergyUpArrow = this.createArrowNode( 1, true );
    this.potentialEnergyDownArrow = this.createArrowNode( 1, false );
    this.thermalEnergyUpArrow = this.createArrowNode( 2, true );
    this.totalEnergyUpArrow = this.createArrowNode( 3, true );
    this.totalEnergyDownArrow = this.createArrowNode( 3, false );

    // @private - map index to arrow node
    this.upArrowNodeMap = {
      0: this.kineticEnergyUpArrow,
      1: this.potentialEnergyUpArrow,
      2: this.thermalEnergyUpArrow,
      3: this.totalEnergyUpArrow
    };

    // @private - map index to down arrow node, only potential and total will have negative energies
    this.downArrowNodeMap = {
      1: this.potentialEnergyDownArrow,
      3: this.totalEnergyDownArrow
    };

    // @public - maps the label, made public for layout with the other layers of the bar graph
    this.labelMap = {
      0: this.kineticLabel,
      1: this.potentialLabel,
      2: this.thermalLabel,
      3: this.totalLabel
    };

    var titleNode = new Text( energyEnergyString, {
      tandem: tandem.createTandem( 'titleNode' ),
      x: 5,
      top: 0,
      font: new PhetFont( 14 ),
      pickable: false,
      maxWidth: 93 // selected by choosing the length of English string in ?stringTest=double
    } );

    var contentChildren = [
      new ArrowNode( insetX, this.originY, insetX, this.insetY, {
        pickable: false,
        tandem: tandem.createTandem( 'arrowNode' )
      } ),
      titleNode,
      new Line( insetX, this.originY, contentWidth - insetX, this.originY, {
        lineWidth: 1,
        stroke: 'gray',
        pickable: false
      } ),
      this.kineticLabel,
      this.potentialLabel,
      this.thermalLabel,
      this.totalLabel,
      clearThermalButton,
      this.kineticEnergyUpArrow,
      this.potentialEnergyUpArrow,
      this.potentialEnergyDownArrow,
      this.thermalEnergyUpArrow,
      this.totalEnergyUpArrow,
      this.totalEnergyDownArrow
    ];

    if ( options.includeZoomButtons ) {
      contentChildren.push( this.zoomInButton, this.zoomOutButton );
    }

    var contentNode = new Rectangle( 0, 0, contentWidth, contentHeight, {
      children: contentChildren
    } );

    // Center the bar chart title, see #62
    titleNode.centerX = contentNode.centerX;

    // less padding if zoom buttons are included since they extend to the left of the rest of the content
    var xMargin = this.includeZoomButtons ? 5 : 10;

    Panel.call( this, contentNode, {
      x: 10,
      y: 10,
      xMargin: xMargin,
      yMargin: 5,
      fill: 'white',
      stroke: 'gray',
      lineWidth: 1,
      resize: false,

      // fixes a bug where adding strokes to the bars in the graph cause the webgl rectangles to jiggle as values
      // change, see https://github.com/phetsims/energy-skate-park/issues/39, but also for general performance
      preventFit: true,

      tandem: tandem
    } );

    if ( this.includeZoomButtons ) {
      graphScaleProperty.link( function( scale ) {
        self.zoomInButton.enabled = scale < Constants.MAX_ZOOM_FACTOR;
        self.zoomOutButton.enabled = scale > Constants.MIN_ZOOM_FACTOR;
      } );
    }

    // When the bar graph is shown, update the bars (because they do not get updated when invisible for performance reasons)
    barGraphVisibleProperty.linkAttribute( this, 'visible' );
  }

  energySkatePark.register( 'BarGraphBackground', BarGraphBackground );

  inherit( Panel, BarGraphBackground, {

    /**
     * Get the up arrow node for a particular bar by index.
     * @param  {number} index
     * @return {ArrowNode}
     */
    getUpArrowNode: function( index ) {
      return this.upArrowNodeMap[ index ];
    },

    /**
     * Get the down arrow node for this graph, by index. Only potential and total energies support negative values,
     * so arrow nodes don't exist for thermal and kinetic.
     * @param  {number} index
     * @return      
     */
    getDownArrowNode: function( index ) {
      var arrowNode = this.downArrowNodeMap[ index ];
      assert && assert( arrowNode, 'down arrow node does not exist for index ' + index );
      return arrowNode;
    },

    /**
     * Returns the maximum height of a bar for this graph, so the foreground can scale the bars correctly, and keep
     * them within the graph. Padding is added so that when too large, an arrow can fit in that indicates the graph
     * will extend beyond what is shown by the bar.
     *
     * Depends on value and index, because max depends on whether value is positive or negative, and if negative,
     * the height is limited by the zoom buttons for total energy.
     * @public
     *
     * @param {number} index
     * @param {boolean} heightPositive - true if the height will extend above the x axis
     * @return {number}
     */
    getMaximumBarHeight: function( index, heightPositive ) {
      if ( !heightPositive ) {
        var arrowSpace = ARROW_HEIGHT + 2;
        var bottomY = this.zoomInButton.top;
        return bottomY - arrowSpace - this.originY;
      }
      else {
        return this.originY - this.insetY - ARROW_HEIGHT - 2;
      }
    },

    /**
     * Return the height of the label, referenced by index. For negative energies, we need to adjust alpha for a section
     * of the bar rectangle of this height. Includes some extra padding for visibility.
     *
     * @public
     * @return {number}
     */
    getLabelHeight: function( index ) {
      assert && assert( this.labelMap[ index ], 'index out of range for label map' );
      return this.labelMap[ index ].height + 8; // extra padding for better visibility
    },

    /**
     * Creates an arrow node that will be made visible when the bar graph is large enough to show that the value
     * extends beyond the height of the graph.
     * @private
     * 
     * @param {number} index - used to determine which physical value this arrow will represent.
     * @return {Node}
     */
    createArrowNode: function( index, forPositive ) {
      var node = new ArrowNode( 0, 0, 0, -ARROW_HEIGHT, {
        fill: COLOR_INDEX_MAP[ index ],
        headWidth: 15,
        headHeight: 8,
        tailWidth: 8
      } );

      // handle positioning, depending on whether the arrow will represent more positive or more negative value
      var centerX = this.getBarX( index ) + this.barWidth / 2;
      if ( forPositive ) {
        node.centerBottom = new Vector2( centerX, this.insetY + ARROW_HEIGHT );
      }
      else {
        node.rotation = Math.PI;

        // if negative, position of arrow will depend on physical value because total energy bar can only extend to the
        // top zoom buttons - others can extend to bottom of zoom buttons
        var bottomY = this.zoomInButton.top;
        node.centerBottom = new Vector2( centerX, bottomY );
      }

      return node;
    }
  } );

  return BarGraphBackground;
} );