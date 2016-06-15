/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/* 
 * @requires OpenLayers/BaseTypes.js
 * @requires OpenLayers/Lang/en.js
 * @requires OpenLayers/Console.js
 */
 
/*
 * TODO: In 3.0, we will stop supporting build profiles that include
 * OpenLayers.js. This means we will not need the singleFile and scriptFile
 * variables, because we don't have to handle the singleFile case any more.
 */

(function() {
    /**
     * Before creating the OpenLayers namespace, check to see if
     * OpenLayers.singleFile is true.  This occurs if the
     * OpenLayers/SingleFile.js script is included before this one - as is the
     * case with old single file build profiles that included both
     * OpenLayers.js and OpenLayers/SingleFile.js.
     */
    var singleFile = (typeof OpenLayers == "object" && OpenLayers.singleFile);
    
    /**
     * Relative path of this script.
     */
    var scriptName = (!singleFile) ? "lib/OpenLayers.js" : "OpenLayers.js";

    /*
     * If window.OpenLayers isn't set when this script (OpenLayers.js) is
     * evaluated (and if singleFile is false) then this script will load
     * *all* OpenLayers scripts. If window.OpenLayers is set to an array
     * then this script will attempt to load scripts for each string of
     * the array, using the string as the src of the script.
     *
     * Example:
     * (code)
     *     <script type="text/javascript">
     *         window.OpenLayers = [
     *             "OpenLayers/Util.js",
     *             "OpenLayers/BaseTypes.js"
     *         ];
     *     </script>
     *     <script type="text/javascript" src="../lib/OpenLayers.js"></script>
     * (end)
     * In this example OpenLayers.js will load Util.js and BaseTypes.js only.
     */
    var jsFiles = window.OpenLayers;

    /**
     * Namespace: OpenLayers
     * The OpenLayers object provides a namespace for all things OpenLayers
     */
    window.OpenLayers = {
        /**
         * Method: _getScriptLocation
         * Return the path to this script. This is also implemented in
         * OpenLayers/SingleFile.js
         *
         * Returns:
         * {String} Path to this script
         */
        _getScriptLocation: (function() {
            var r = new RegExp("(^|(.*?\\/))(" + scriptName + ")(\\?|$)"),
                s = document.getElementsByTagName('script'),
                src, m, l = "";
            for(var i=0, len=s.length; i<len; i++) {
                src = s[i].getAttribute('src');
                if(src) {
                    m = src.match(r);
                    if(m) {
                        l = m[1];
                        break;
                    }
                }
            }
            return (function() { return l; });
        })(),
        
        /**
         * APIProperty: ImgPath
         * {String} Set this to the path where control images are stored, a path  
         * given here must end with a slash. If set to '' (which is the default) 
         * OpenLayers will use its script location + "img/".
         * 
         * You will need to set this property when you have a singlefile build of 
         * OpenLayers that either is not named "OpenLayers.js" or if you move
         * the file in a way such that the image directory cannot be derived from 
         * the script location.
         * 
         * If your custom OpenLayers build is named "my-custom-ol.js" and the images
         * of OpenLayers are in a folder "/resources/external/images/ol" a correct
         * way of including OpenLayers in your HTML would be:
         * 
         * (code)
         *   <script src="/path/to/my-custom-ol.js" type="text/javascript"></script>
         *   <script type="text/javascript">
         *      // tell OpenLayers where the control images are
         *      // remember the trailing slash
         *      OpenLayers.ImgPath = "/resources/external/images/ol/";
         *   </script>
         * (end code)
         * 
         * Please remember that when your OpenLayers script is not named 
         * "OpenLayers.js" you will have to make sure that the default theme is 
         * loaded into the page by including an appropriate <link>-tag, 
         * e.g.:
         * 
         * (code)
         *   <link rel="stylesheet" href="/path/to/default/style.css"  type="text/css">
         * (end code)
         */
        ImgPath : '/img/'
    };

    /**
     * OpenLayers.singleFile is a flag indicating this file is being included
     * in a Single File Library build of the OpenLayers Library.
     * 
     * When we are *not* part of a SFL build we dynamically include the
     * OpenLayers library code.
     * 
     * When we *are* part of a SFL build we do not dynamically include the 
     * OpenLayers library code as it will be appended at the end of this file.
     */
    if(!singleFile) {
        if (!jsFiles) {
            jsFiles = [
                "/js/OpenLayers/OpenLayers/BaseTypes/Class.js",
                "/js/OpenLayers/OpenLayers/Util.js",
                "/js/OpenLayers/OpenLayers/Util/vendorPrefix.js",
                "/js/OpenLayers/OpenLayers/Animation.js",
                "/js/OpenLayers/OpenLayers/BaseTypes.js",
                "/js/OpenLayers/OpenLayers/BaseTypes/Bounds.js",
                "/js/OpenLayers/OpenLayers/BaseTypes/Date.js",
                "/js/OpenLayers/OpenLayers/BaseTypes/Element.js",
                "/js/OpenLayers/OpenLayers/BaseTypes/LonLat.js",
                "/js/OpenLayers/OpenLayers/BaseTypes/Pixel.js",
                "/js/OpenLayers/OpenLayers/BaseTypes/Size.js",
                "/js/OpenLayers/OpenLayers/Console.js",
                "/js/OpenLayers/OpenLayers/Tween.js",
                "/js/OpenLayers/OpenLayers/Kinetic.js",
                "/js/OpenLayers/OpenLayers/Events.js",
                "/js/OpenLayers/OpenLayers/Events/buttonclick.js",
                "/js/OpenLayers/OpenLayers/Events/featureclick.js",
                "/js/OpenLayers/OpenLayers/Request.js",
                "/js/OpenLayers/OpenLayers/Request/XMLHttpRequest.js",
                "/js/OpenLayers/OpenLayers/Projection.js",
                "/js/OpenLayers/OpenLayers/Map.js",
                "/js/OpenLayers/OpenLayers/Layer.js",
                "/js/OpenLayers/OpenLayers/Icon.js",
                "/js/OpenLayers/OpenLayers/Marker.js",
                "/js/OpenLayers/OpenLayers/Marker/Box.js",
                "/js/OpenLayers/OpenLayers/Popup.js",
                "/js/OpenLayers/OpenLayers/Tile.js",
                "/js/OpenLayers/OpenLayers/Tile/Image.js",
                "/js/OpenLayers/OpenLayers/Tile/Image/IFrame.js",
                "/js/OpenLayers/OpenLayers/Tile/UTFGrid.js",
                "/js/OpenLayers/OpenLayers/Layer/Image.js",
                "/js/OpenLayers/OpenLayers/Layer/SphericalMercator.js",
                "/js/OpenLayers/OpenLayers/Layer/EventPane.js",
                "/js/OpenLayers/OpenLayers/Layer/FixedZoomLevels.js",
                "/js/OpenLayers/OpenLayers/Layer/Google.js",
                "/js/OpenLayers/OpenLayers/Layer/Google/v3.js",
                "/js/OpenLayers/OpenLayers/Layer/HTTPRequest.js",
                "/js/OpenLayers/OpenLayers/Layer/Grid.js",
                "/js/OpenLayers/OpenLayers/Layer/MapGuide.js",
                "/js/OpenLayers/OpenLayers/Layer/MapServer.js",
                "/js/OpenLayers/OpenLayers/Layer/KaMap.js",
                "/js/OpenLayers/OpenLayers/Layer/KaMapCache.js",
                "/js/OpenLayers/OpenLayers/Layer/Markers.js",
                "/js/OpenLayers/OpenLayers/Layer/Text.js",
                "/js/OpenLayers/OpenLayers/Layer/WorldWind.js",
                "/js/OpenLayers/OpenLayers/Layer/ArcGIS93Rest.js",
                "/js/OpenLayers/OpenLayers/Layer/WMS.js",
                "/js/OpenLayers/OpenLayers/Layer/WMTS.js",
                "/js/OpenLayers/OpenLayers/Layer/ArcIMS.js",
                "/js/OpenLayers/OpenLayers/Layer/GeoRSS.js",
                "/js/OpenLayers/OpenLayers/Layer/Boxes.js",
                "/js/OpenLayers/OpenLayers/Layer/XYZ.js",
                "/js/OpenLayers/OpenLayers/Layer/UTFGrid.js",
                "/js/OpenLayers/OpenLayers/Layer/OSM.js",
                "/js/OpenLayers/OpenLayers/Layer/Bing.js",
                "/js/OpenLayers/OpenLayers/Layer/TMS.js",
                "/js/OpenLayers/OpenLayers/Layer/TileCache.js",
                "/js/OpenLayers/OpenLayers/Layer/Zoomify.js",
                "/js/OpenLayers/OpenLayers/Layer/ArcGISCache.js",
                "/js/OpenLayers/OpenLayers/Popup/Anchored.js",
                "/js/OpenLayers/OpenLayers/Popup/Framed.js",
                "/js/OpenLayers/OpenLayers/Popup/FramedCloud.js",
                "/js/OpenLayers/OpenLayers/Feature.js",
                "/js/OpenLayers/OpenLayers/Feature/Vector.js",
                "/js/OpenLayers/OpenLayers/Handler.js",
                "/js/OpenLayers/OpenLayers/Handler/Click.js",
                "/js/OpenLayers/OpenLayers/Handler/Hover.js",
                "/js/OpenLayers/OpenLayers/Handler/Point.js",
                "/js/OpenLayers/OpenLayers/Handler/Path.js",
                "/js/OpenLayers/OpenLayers/Handler/Polygon.js",
                "/js/OpenLayers/OpenLayers/Handler/Feature.js",
                "/js/OpenLayers/OpenLayers/Handler/Drag.js",
                "/js/OpenLayers/OpenLayers/Handler/Pinch.js",
                "/js/OpenLayers/OpenLayers/Handler/RegularPolygon.js",
                "/js/OpenLayers/OpenLayers/Handler/Box.js",
                "/js/OpenLayers/OpenLayers/Handler/MouseWheel.js",
                "/js/OpenLayers/OpenLayers/Handler/Keyboard.js",
                "/js/OpenLayers/OpenLayers/Control.js",
                "/js/OpenLayers/OpenLayers/Control/Attribution.js",
                "/js/OpenLayers/OpenLayers/Control/Button.js",
                "/js/OpenLayers/OpenLayers/Control/CacheRead.js",
                "/js/OpenLayers/OpenLayers/Control/CacheWrite.js",
                "/js/OpenLayers/OpenLayers/Control/ZoomBox.js",
                "/js/OpenLayers/OpenLayers/Control/ZoomToMaxExtent.js",
                "/js/OpenLayers/OpenLayers/Control/DragPan.js",
                "/js/OpenLayers/OpenLayers/Control/Navigation.js",
                "/js/OpenLayers/OpenLayers/Control/PinchZoom.js",
                "/js/OpenLayers/OpenLayers/Control/TouchNavigation.js",
                "/js/OpenLayers/OpenLayers/Control/MousePosition.js",
                "/js/OpenLayers/OpenLayers/Control/OverviewMap.js",
                "/js/OpenLayers/OpenLayers/Control/KeyboardDefaults.js",
                "/js/OpenLayers/OpenLayers/Control/PanZoom.js",
                "/js/OpenLayers/OpenLayers/Control/PanZoomBar.js",
                "/js/OpenLayers/OpenLayers/Control/ArgParser.js",
                "/js/OpenLayers/OpenLayers/Control/Permalink.js",
                "/js/OpenLayers/OpenLayers/Control/Scale.js",
                "/js/OpenLayers/OpenLayers/Control/ScaleLine.js",
                "/js/OpenLayers/OpenLayers/Control/Snapping.js",
                "/js/OpenLayers/OpenLayers/Control/Split.js",
                "/js/OpenLayers/OpenLayers/Control/LayerSwitcher.js",
                "/js/OpenLayers/OpenLayers/Control/DrawFeature.js",
                "/js/OpenLayers/OpenLayers/Control/DragFeature.js",
                "/js/OpenLayers/OpenLayers/Control/ModifyFeature.js",
                "/js/OpenLayers/OpenLayers/Control/Panel.js",
                "/js/OpenLayers/OpenLayers/Control/SelectFeature.js",
                "/js/OpenLayers/OpenLayers/Control/NavigationHistory.js",
                "/js/OpenLayers/OpenLayers/Control/Measure.js",
                "/js/OpenLayers/OpenLayers/Control/WMSGetFeatureInfo.js",
                "/js/OpenLayers/OpenLayers/Control/WMTSGetFeatureInfo.js",
                "/js/OpenLayers/OpenLayers/Control/Graticule.js",
                "/js/OpenLayers/OpenLayers/Control/TransformFeature.js",
                "/js/OpenLayers/OpenLayers/Control/UTFGrid.js",
                "/js/OpenLayers/OpenLayers/Control/SLDSelect.js",
                "/js/OpenLayers/OpenLayers/Control/Zoom.js",
                "/js/OpenLayers/OpenLayers/Geometry.js",
                "/js/OpenLayers/OpenLayers/Geometry/Collection.js",
                "/js/OpenLayers/OpenLayers/Geometry/Point.js",
                "/js/OpenLayers/OpenLayers/Geometry/MultiPoint.js",
                "/js/OpenLayers/OpenLayers/Geometry/Curve.js",
                "/js/OpenLayers/OpenLayers/Geometry/LineString.js",
                "/js/OpenLayers/OpenLayers/Geometry/LinearRing.js",
                "/js/OpenLayers/OpenLayers/Geometry/Polygon.js",
                "/js/OpenLayers/OpenLayers/Geometry/MultiLineString.js",
                "/js/OpenLayers/OpenLayers/Geometry/MultiPolygon.js",
                "/js/OpenLayers/OpenLayers/Renderer.js",
                "/js/OpenLayers/OpenLayers/Renderer/Elements.js",
                "/js/OpenLayers/OpenLayers/Renderer/SVG.js",
                "/js/OpenLayers/OpenLayers/Renderer/Canvas.js",
                "/js/OpenLayers/OpenLayers/Renderer/VML.js",
                "/js/OpenLayers/OpenLayers/Layer/Vector.js",
                "/js/OpenLayers/OpenLayers/Layer/PointGrid.js",
                "/js/OpenLayers/OpenLayers/Layer/Vector/RootContainer.js",
                "/js/OpenLayers/OpenLayers/Strategy.js",
                "/js/OpenLayers/OpenLayers/Strategy/Filter.js",
                "/js/OpenLayers/OpenLayers/Strategy/Fixed.js",
                "/js/OpenLayers/OpenLayers/Strategy/Cluster.js",
                "/js/OpenLayers/OpenLayers/Strategy/Paging.js",
                "/js/OpenLayers/OpenLayers/Strategy/BBOX.js",
                "/js/OpenLayers/OpenLayers/Strategy/Save.js",
                "/js/OpenLayers/OpenLayers/Strategy/Refresh.js",
                "/js/OpenLayers/OpenLayers/Filter.js",
                "/js/OpenLayers/OpenLayers/Filter/FeatureId.js",
                "/js/OpenLayers/OpenLayers/Filter/Logical.js",
                "/js/OpenLayers/OpenLayers/Filter/Comparison.js",
                "/js/OpenLayers/OpenLayers/Filter/Spatial.js",
                "/js/OpenLayers/OpenLayers/Filter/Function.js",                
                "/js/OpenLayers/OpenLayers/Protocol.js",
                "/js/OpenLayers/OpenLayers/Protocol/HTTP.js",
                "/js/OpenLayers/OpenLayers/Protocol/WFS.js",
                "/js/OpenLayers/OpenLayers/Protocol/WFS/v1.js",
                "/js/OpenLayers/OpenLayers/Protocol/WFS/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Protocol/WFS/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Protocol/CSW.js", 
                "/js/OpenLayers/OpenLayers/Protocol/CSW/v2_0_2.js",
                "/js/OpenLayers/OpenLayers/Protocol/Script.js",
                "/js/OpenLayers/OpenLayers/Protocol/SOS.js",
                "/js/OpenLayers/OpenLayers/Protocol/SOS/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Layer/PointTrack.js",
                "/js/OpenLayers/OpenLayers/Style.js",
                "/js/OpenLayers/OpenLayers/Style2.js",
                "/js/OpenLayers/OpenLayers/StyleMap.js",
                "/js/OpenLayers/OpenLayers/Rule.js",
                "/js/OpenLayers/OpenLayers/Format.js",
                "/js/OpenLayers/OpenLayers/Format/QueryStringFilter.js",
                "/js/OpenLayers/OpenLayers/Format/XML.js",
                "/js/OpenLayers/OpenLayers/Format/XML/VersionedOGC.js",
                "/js/OpenLayers/OpenLayers/Format/Context.js",
                "/js/OpenLayers/OpenLayers/Format/ArcXML.js",
                "/js/OpenLayers/OpenLayers/Format/ArcXML/Features.js",
                "/js/OpenLayers/OpenLayers/Format/GML.js",
                "/js/OpenLayers/OpenLayers/Format/GML/Base.js",
                "/js/OpenLayers/OpenLayers/Format/GML/v2.js",
                "/js/OpenLayers/OpenLayers/Format/GML/v3.js",
                "/js/OpenLayers/OpenLayers/Format/Atom.js",
                "/js/OpenLayers/OpenLayers/Format/EncodedPolyline.js",
                "/js/OpenLayers/OpenLayers/Format/KML.js",
                "/js/OpenLayers/OpenLayers/Format/GeoRSS.js",
                "/js/OpenLayers/OpenLayers/Format/WFS.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon/v1.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/WCSCapabilities.js",
                "/js/OpenLayers/OpenLayers/Format/WCSCapabilities/v1.js",
                "/js/OpenLayers/OpenLayers/Format/WCSCapabilities/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/WCSCapabilities/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/WFSCapabilities.js",
                "/js/OpenLayers/OpenLayers/Format/WFSCapabilities/v1.js",
                "/js/OpenLayers/OpenLayers/Format/WFSCapabilities/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/WFSCapabilities/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/WFSDescribeFeatureType.js",
                "/js/OpenLayers/OpenLayers/Format/WMSDescribeLayer.js",
                "/js/OpenLayers/OpenLayers/Format/WMSDescribeLayer/v1_1.js",
                "/js/OpenLayers/OpenLayers/Format/WKT.js",
                "/js/OpenLayers/OpenLayers/Format/CQL.js",
                "/js/OpenLayers/OpenLayers/Format/OSM.js",
                "/js/OpenLayers/OpenLayers/Format/GPX.js",
                "/js/OpenLayers/OpenLayers/Format/Filter.js",
                "/js/OpenLayers/OpenLayers/Format/Filter/v1.js",
                "/js/OpenLayers/OpenLayers/Format/Filter/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/Filter/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/SLD.js",
                "/js/OpenLayers/OpenLayers/Format/SLD/v1.js",
                "/js/OpenLayers/OpenLayers/Format/SLD/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/SLD/v1_0_0_GeoServer.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon/v1.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/OWSCommon/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/CSWGetDomain.js",
                "/js/OpenLayers/OpenLayers/Format/CSWGetDomain/v2_0_2.js",
                "/js/OpenLayers/OpenLayers/Format/CSWGetRecords.js",
                "/js/OpenLayers/OpenLayers/Format/CSWGetRecords/v2_0_2.js",
                "/js/OpenLayers/OpenLayers/Format/WFST.js",
                "/js/OpenLayers/OpenLayers/Format/WFST/v1.js",
                "/js/OpenLayers/OpenLayers/Format/WFST/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/WFST/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/Text.js",
                "/js/OpenLayers/OpenLayers/Format/JSON.js",
                "/js/OpenLayers/OpenLayers/Format/GeoJSON.js",
                "/js/OpenLayers/OpenLayers/Format/WMC.js",
                "/js/OpenLayers/OpenLayers/Format/WMC/v1.js",
                "/js/OpenLayers/OpenLayers/Format/WMC/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/WMC/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/WCSGetCoverage.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities/v1.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities/v1_1.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities/v1_1_1.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities/v1_3.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities/v1_3_0.js",
                "/js/OpenLayers/OpenLayers/Format/WMSCapabilities/v1_1_1_WMSC.js",
                "/js/OpenLayers/OpenLayers/Format/WMSGetFeatureInfo.js",
                "/js/OpenLayers/OpenLayers/Format/SOSCapabilities.js",
                "/js/OpenLayers/OpenLayers/Format/SOSCapabilities/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/SOSGetFeatureOfInterest.js",
                "/js/OpenLayers/OpenLayers/Format/SOSGetObservation.js",
                "/js/OpenLayers/OpenLayers/Format/OWSContext.js",
                "/js/OpenLayers/OpenLayers/Format/OWSContext/v0_3_1.js",
                "/js/OpenLayers/OpenLayers/Format/WMTSCapabilities.js",
                "/js/OpenLayers/OpenLayers/Format/WMTSCapabilities/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/WPSCapabilities.js",
                "/js/OpenLayers/OpenLayers/Format/WPSCapabilities/v1_0_0.js",
                "/js/OpenLayers/OpenLayers/Format/WPSDescribeProcess.js",
                "/js/OpenLayers/OpenLayers/Format/WPSExecute.js",
                "/js/OpenLayers/OpenLayers/Format/XLS.js",
                "/js/OpenLayers/OpenLayers/Format/XLS/v1.js",
                "/js/OpenLayers/OpenLayers/Format/XLS/v1_1_0.js",
                "/js/OpenLayers/OpenLayers/Format/OGCExceptionReport.js",
                "/js/OpenLayers/OpenLayers/Control/GetFeature.js",
                "/js/OpenLayers/OpenLayers/Control/NavToolbar.js",
                "/js/OpenLayers/OpenLayers/Control/PanPanel.js",
                "/js/OpenLayers/OpenLayers/Control/Pan.js",
                "/js/OpenLayers/OpenLayers/Control/ZoomIn.js",
                "/js/OpenLayers/OpenLayers/Control/ZoomOut.js",
                "/js/OpenLayers/OpenLayers/Control/ZoomPanel.js",
                "/js/OpenLayers/OpenLayers/Control/EditingToolbar.js",
                "/js/OpenLayers/OpenLayers/Control/Geolocate.js",
                "/js/OpenLayers/OpenLayers/Symbolizer.js",
                "/js/OpenLayers/OpenLayers/Symbolizer/Point.js",
                "/js/OpenLayers/OpenLayers/Symbolizer/Line.js",
                "/js/OpenLayers/OpenLayers/Symbolizer/Polygon.js",
                "/js/OpenLayers/OpenLayers/Symbolizer/Text.js",
                "/js/OpenLayers/OpenLayers/Symbolizer/Raster.js",
                "/js/OpenLayers/OpenLayers/Lang.js",
                "/js/OpenLayers/OpenLayers/Lang/en.js",
                "/js/OpenLayers/OpenLayers/Spherical.js",
                "/js/OpenLayers/OpenLayers/TileManager.js",
                "/js/OpenLayers/OpenLayers/WPSClient.js",
                "/js/OpenLayers/OpenLayers/WPSProcess.js"
            ]; // etc.
        }

        // use "parser-inserted scripts" for guaranteed execution order
        // http://hsivonen.iki.fi/script-execution/
        var scriptTags = new Array(jsFiles.length);
        //var host = OpenLayers._getScriptLocation() + "lib/";
        var host = "";
        for (var i=0, len=jsFiles.length; i<len; i++) {
            scriptTags[i] = "<script src='" + host + jsFiles[i] +
                                   "'></script>"; 
        }
        if (scriptTags.length > 0) {
            document.write(scriptTags.join(""));
        }
    }
})();

/**
 * Constant: VERSION_NUMBER
 *
 * This constant identifies the version of OpenLayers.
 *
 * When asking questions or reporting issues, make sure to include the output of
 *     OpenLayers.VERSION_NUMBER in the question or issue-description.
 */
OpenLayers.VERSION_NUMBER="Release 2.13";
