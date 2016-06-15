/* Copyright (c) 2006-2013 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Handler/Drag.js
 * @requires OpenLayers/Handler/Keyboard.js
 */

/**
 * Class: OpenLayers.Control.ModifyFeature
 * Control to modify features.  When activated, a click renders the vertices
 *     of a feature - these vertices can then be dragged.  By default, the
 *     delete key will delete the vertex under the mouse.  New features are
 *     added by dragging "virtual vertices" between vertices.  Create a new
 *     control with the <OpenLayers.Control.ModifyFeature> constructor.
 *
 * Inherits From:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.ModifyFeature = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: documentDrag
     * {Boolean} If set to true, dragging vertices will continue even if the
     *     mouse cursor leaves the map viewport. Default is false.
     */
    documentDrag: false,

    /**
     * APIProperty: geometryTypes
     * {Array(String)} To restrict modification to a limited set of geometry
     *     types, send a list of strings corresponding to the geometry class
     *     names.
     */
    geometryTypes: null,

    /**
     * APIProperty: clickout
     * {Boolean} Unselect features when clicking outside any feature.
     *     Default is true.
     */
    clickout: true,

    /**
     * APIProperty: toggle
     * {Boolean} Unselect a selected feature on click.
     *      Default is true.
     */
    toggle: true,

    /**
     * APIProperty: standalone
     * {Boolean} Set to true to create a control without SelectFeature
     *     capabilities. Default is false.  If standalone is true, to modify
     *     a feature, call the <selectFeature> method with the target feature.
     *     Note that you must call the <unselectFeature> method to finish
     *     feature modification in standalone mode (before starting to modify
     *     another feature).
     */
    standalone: false,

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>}
     */
    layer: null,

    /**
     * Property: feature
     * {<OpenLayers.Feature.Vector>} Feature currently available for modification.
     */
    feature: null,

    /**
     * Property: vertex
     * {<OpenLayers.Feature.Vector>} Vertex currently being modified.
     */
    vertex: null,

    /**
     * Property: vertices
     * {Array(<OpenLayers.Feature.Vector>)} Verticies currently available
     *     for dragging.
     */
    vertices: null,

    /**
     * Property: virtualVertices
     * {Array(<OpenLayers.Feature.Vector>)} Virtual vertices in the middle
     *     of each edge.
     */
    virtualVertices: null,

    /**
     * Property: handlers
     * {Object}
     */
    handlers: null,

    /**
     * APIProperty: deleteCodes
     * {Array(Integer)} Keycodes for deleting verticies.  Set to null to disable
     *     vertex deltion by keypress.  If non-null, keypresses with codes
     *     in this array will delete vertices under the mouse. Default
     *     is 46 and 68, the 'delete' and lowercase 'd' keys.
     */
    deleteCodes: null,

    /**
     * APIProperty: virtualStyle
     * {Object} A symbolizer to be used for virtual vertices.
     */
    virtualStyle: null,

    /**
     * APIProperty: vertexRenderIntent
     * {String} The renderIntent to use for vertices. If no <virtualStyle> is
     * provided, this renderIntent will also be used for virtual vertices, with
     * a fillOpacity and strokeOpacity of 0.3. Default is null, which means
     * that the layer's default style will be used for vertices.
     */
    vertexRenderIntent: null,

    /**
     * APIProperty: mode
     * {Integer} Bitfields specifying the modification mode. Defaults to
     *      OpenLayers.Control.ModifyFeature.RESHAPE. To set the mode to a
     *      combination of options, use the | operator. For example, to allow
     *      the control to both resize and rotate features, use the following
     *      syntax
     * (code)
     * control.mode = OpenLayers.Control.ModifyFeature.RESIZE |
     *                OpenLayers.Control.ModifyFeature.ROTATE;
     *  (end)
     */
    mode: null,

    /**
     * APIProperty: createVertices
     * {Boolean} Create new vertices by dragging the virtual vertices
     *     in the middle of each edge. Default is true.
     */
    createVertices: true,

    /**
     * Property: modified
     * {Boolean} The currently selected feature has been modified.
     */
    modified: false,

    /**
     * Property: radiusHandle
     * {<OpenLayers.Feature.Vector>} A handle for rotating/resizing a feature.
     */
    radiusHandle: null,

    /**
     * Property: dragHandle
     * {<OpenLayers.Feature.Vector>} A handle for dragging a feature.
     */
    dragHandle: null,

    /**
     * APIProperty: onModificationStart 
     * {Function} *Deprecated*.  Register for "beforefeaturemodified" instead.
     *     The "beforefeaturemodified" event is triggered on the layer before
     *     any modification begins.
     *
     * Optional function to be called when a feature is selected
     *     to be modified. The function should expect to be called with a
     *     feature.  This could be used for example to allow to lock the
     *     feature on server-side.
     */
    onModificationStart: function() {},

    /**
     * APIProperty: onModification
     * {Function} *Deprecated*.  Register for "featuremodified" instead.
     *     The "featuremodified" event is triggered on the layer with each
     *     feature modification.
     *
     * Optional function to be called when a feature has been
     *     modified.  The function should expect to be called with a feature.
     */
    onModification: function() {},

    /**
     * APIProperty: onModificationEnd
     * {Function} *Deprecated*.  Register for "afterfeaturemodified" instead.
     *     The "afterfeaturemodified" event is triggered on the layer after
     *     a feature has been modified.
     *
     * Optional function to be called when a feature is finished 
     *     being modified.  The function should expect to be called with a
     *     feature.
     */
    onModificationEnd: function() {},

    /**
     * Constructor: OpenLayers.Control.ModifyFeature
     * Create a new modify feature control.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Layer that contains features that
     *     will be modified.
     * options - {Object} Optional object whose properties will be set on the
     *     control.
     */
    initialize: function(layer, options) {
        options = options || {};
        this.layer = layer;
        this.vertices = [];
        this.virtualVertices = [];
        this.virtualStyle = OpenLayers.Util.extend({},
            this.layer.style ||
            this.layer.styleMap.createSymbolizer(null, options.vertexRenderIntent)
        );
        this.virtualStyle.fillOpacity = 0.3;
        this.virtualStyle.strokeOpacity = 0.3;
        this.deleteCodes = [46, 68];
        this.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        if(!(OpenLayers.Util.isArray(this.deleteCodes))) {
            this.deleteCodes = [this.deleteCodes];
        }
        
        // configure the drag handler
        var dragCallbacks = {
            down: function(pixel) {
                this.vertex = null;
                var feature = this.layer.getFeatureFromEvent(
                        this.handlers.drag.evt);
                if (feature) {
                    this.dragStart(feature);
                } else if (this.clickout) {
                    this._unselect = this.feature;
                }
            },
            move: function(pixel) {
                delete this._unselect;
                if (this.vertex) {
                    this.dragVertex(this.vertex, pixel);
                }
            },
            up: function() {
                this.handlers.drag.stopDown = false;
                if (this._unselect) {
                    this.unselectFeature(this._unselect);
                    delete this._unselect;
                }
            },
            done: function(pixel) {
                if (this.vertex) {
                    this.dragComplete(this.vertex);
                }
            }
        };
        var dragOptions = {
            documentDrag: this.documentDrag,
            stopDown: false
        };

        // configure the keyboard handler
        var keyboardOptions = {
            keydown: this.handleKeypress
        };
        this.handlers = {
            keyboard: new OpenLayers.Handler.Keyboard(this, keyboardOptions),
            drag: new OpenLayers.Handler.Drag(this, dragCallbacks, dragOptions)
        };
    },

    /**
     * APIMethod: destroy
     * Take care of things that are not handled in superclass.
     */
    destroy: function() {
        if (this.map) {
            this.map.events.un({
                "removelayer": this.handleMapEvents,
                "changelayer": this.handleMapEvents,
                scope: this
            });
        }
        this.layer = null;
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },

    /**
     * APIMethod: activate
     * Activate the control.
     * 
     * Returns:
     * {Boolean} Successfully activated the control.
     */
    activate: function() {
        this.moveLayerToTop();
        this.map.events.on({
            "removelayer": this.handleMapEvents,
            "changelayer": this.handleMapEvents,
            scope: this
        });
        return (this.handlers.keyboard.activate() &&
                this.handlers.drag.activate() &&
                OpenLayers.Control.prototype.activate.apply(this, arguments));
    },

    /**
     * APIMethod: deactivate
     * Deactivate the control.
     *
     * Returns: 
     * {Boolean} Successfully deactivated the control.
     */
    deactivate: function() {
        var deactivated = false;
        // the return from the controls is unimportant in this case
        if(OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.moveLayerBack();
            this.map.events.un({
                "removelayer": this.handleMapEvents,
                "changelayer": this.handleMapEvents,
                scope: this
            });
            this.layer.removeFeatures(this.vertices, {silent: true});
            this.layer.removeFeatures(this.virtualVertices, {silent: true});
            this.vertices = [];
            this.handlers.drag.deactivate();
            this.handlers.keyboard.deactivate();
            var feature = this.feature;
            if (feature && feature.geometry && feature.layer) {
                this.unselectFeature(feature);
            }
            deactivated = true;
        }
        return deactivated;
    },

    /**
     * Method: beforeSelectFeature
     * Called before a feature is selected.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The feature about to be selected.
     */
    beforeSelectFeature: function(feature) {
        return this.layer.events.triggerEvent(
            "beforefeaturemodified", {feature: feature}
        );
    },

    /**
     * APIMethod: selectFeature
     * Select a feature for modification in standalone mode. In non-standalone
     * mode, this method is called when a feature is selected by clicking.
     * Register a listener to the beforefeaturemodified event and return false
     * to prevent feature modification.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} the selected feature.
     */
    selectFeature: function(feature) {
        if (this.feature === feature ||
           (this.geometryTypes && OpenLayers.Util.indexOf(this.geometryTypes,
           feature.geometry.CLASS_NAME) == -1)) {
            return;
        }
        if (this.beforeSelectFeature(feature) !== false) {
            if (this.feature) {
                this.unselectFeature(this.feature);
            }
            this.feature = feature;
            this.layer.selectedFeatures.push(feature);
            this.layer.drawFeature(feature, 'select');
            this.modified = false;
            this.resetVertices();
            this.onModificationStart(this.feature);
        }
        // keep track of geometry modifications
        var modified = feature.modified;
        if (feature.geometry && !(modified && modified.geometry)) {
            this._originalGeometry = feature.geometry.clone();
        }
    },

    /**
     * APIMethod: unselectFeature
     * Called when the select feature control unselects a feature.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The unselected feature.
     */
    unselectFeature: function(feature) {
        this.layer.removeFeatures(this.vertices, {silent: true});
        this.vertices = [];
        this.layer.destroyFeatures(this.virtualVertices, {silent: true});
        this.virtualVertices = [];
        if(this.dragHandle) {
            this.layer.destroyFeatures([this.dragHandle], {silent: true});
            delete this.dragHandle;
        }
        if(this.radiusHandle) {
            this.layer.destroyFeatures([this.radiusHandle], {silent: true});
            delete this.radiusHandle;
        }
        this.layer.drawFeature(this.feature, 'default');
        this.feature = null;
        OpenLayers.Util.removeItem(this.layer.selectedFeatures, feature);
        this.onModificationEnd(feature);
        this.layer.events.triggerEvent("afterfeaturemodified", {
            feature: feature,
            modified: this.modified
        });
        this.modified = false;
    },
    
    
    /**
     * Method: dragStart
     * Called by the drag handler before a feature is dragged.  This method is
     *     used to differentiate between points and vertices
     *     of higher order geometries.
     *
     * Parameters:
     * feature - {<OpenLayers.Feature.Vector>} The point or vertex about to be
     *     dragged.
     */
    dragStart: function(feature) {
        var isPoint = feature.geometry.CLASS_NAME ==
                'OpenLayers.Geometry.Point';
        if (!this.standalone &&
                ((!feature._sketch && isPoint) || !feature._sketch)) {
            if (this.toggle && this.feature === feature) {
                // mark feature for unselection
                this._unselect = feature;
            }
            this.selectFeature(feature);
        }
        if (feature._sketch || isPoint) {
            // feature is a drag or virtual handle or point
            this.vertex = feature;
            this.handlers.drag.stopDown = true;
        }
    },

    /**
     * Method: dragVertex
     * Called by the drag handler with each drag move of a vertex.
     *
     * Parameters:
     * vertex - {<OpenLayers.Feature.Vector>} The vertex being dragged.
     * pixel - {<OpenLayers.Pixel>} Pixel location of the mouse event.
     */
    dragVertex: function(vertex, pixel) {
        var pos = this.map.getLonLatFromViewPortPx(pixel);
        var geom = vertex.geometry;
        geom.move(pos.lon - geom.x, pos.lat - geom.y);
        this.modified = true;
        /**
         * Five cases:
         * 1) dragging a simple point
         * 2) dragging a virtual vertex
         * 3) dragging a drag handle
         * 4) dragging a real vertex
         * 5) dragging a radius handle
         */
        if(this.feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            // dragging a simple point
            this.layer.events.triggerEvent("vertexmodified", {
                vertex: vertex.geometry,
                feature: this.feature,
                pixel: pixel
            });
        } else {
            if(vertex._index) {
                // dragging a virtual vertex
                vertex.geometry.parent.addComponent(vertex.geometry,
                                                    vertex._index);
                // move from virtual to real vertex
                delete vertex._index;
                OpenLayers.Util.removeItem(this.virtualVertices, vertex);
                this.vertices.push(vertex);
            } else if(vertex == this.dragHandle) {
                // dragging a drag handle
                this.layer.removeFeatures(this.vertices, {silent: true});
                this.vertices = [];
                if(this.radiusHandle) {
                    this.layer.destroyFeatures([this.radiusHandle], {silent: true});
                    this.radiusHandle = null;
                }
            } else if(vertex !== this.radiusHandle) {
                // dragging a real vertex
                this.layer.events.triggerEvent("vertexmodified", {
                    vertex: vertex.geometry,
                    feature: this.feature,
                    pixel: pixel
                });
            }
            // dragging a radius handle - no special treatment
            if(this.virtualVertices.length > 0) {
                this.layer.destroyFeatures(this.virtualVertices, {silent: true});
                this.virtualVertices = [];
            }
            this.layer.drawFeature(this.feature, this.standalone ? undefined :
                                            'select');
        }
        // keep the vertex on top so it gets the mouseout after dragging
        // this should be removed in favor of an option to draw under or
        // maintain node z-index
        this.layer.drawFeature(vertex);
    },
    
    /**
     * Method: dragComplete
     * Called by the drag handler when the feature dragging is complete.
     *
     * Parameters:
     * vertex - {<OpenLayers.Feature.Vector>} The vertex being dragged.
     */
    dragComplete: function(vertex) {
        this.resetVertices();
        this.setFeatureState();
        this.onModification(this.feature);
        this.layer.events.triggerEvent("featuremodified", 
                                       {feature: this.feature});
    },
    
    /**
     * Method: setFeatureState
     * Called when the feature is modified.  If the current state is not
     *     INSERT or DELETE, the state is set to UPDATE.
     */
    setFeatureState: function() {
        if(this.feature.state != OpenLayers.State.INSERT &&
           this.feature.state != OpenLayers.State.DELETE) {
            this.feature.state = OpenLayers.State.UPDATE;
            if (this.modified && this._originalGeometry) {
                var feature = this.feature;
                feature.modified = OpenLayers.Util.extend(feature.modified, {
                    geometry: this._originalGeometry
                });
                delete this._originalGeometry;
            }
        }
    },
    
    /**
     * Method: resetVertices
     */
    resetVertices: function() {
        if(this.vertices.length > 0) {
            this.layer.removeFeatures(this.vertices, {silent: true});
            this.vertices = [];
        }
        if(this.virtualVertices.length > 0) {
            this.layer.removeFeatures(this.virtualVertices, {silent: true});
            this.virtualVertices = [];
        }
        if(this.dragHandle) {
            this.layer.destroyFeatures([this.dragHandle], {silent: true});
            this.dragHandle = null;
        }
        if(this.radiusHandle) {
            this.layer.destroyFeatures([this.radiusHandle], {silent: true});
            this.radiusHandle = null;
        }
        if(this.feature &&
           this.feature.geometry.CLASS_NAME != "OpenLayers.Geometry.Point") {
            if((this.mode & OpenLayers.Control.ModifyFeature.DRAG)) {
                this.collectDragHandle();
            }
            if((this.mode & (OpenLayers.Control.ModifyFeature.ROTATE |
                             OpenLayers.Control.ModifyFeature.RESIZE))) {
                this.collectRadiusHandle();
            }
            if(this.mode & OpenLayers.Control.ModifyFeature.RESHAPE){
                // Don't collect vertices when we're resizing
                if (!(this.mode & OpenLayers.Control.ModifyFeature.RESIZE)){
                    this.collectVertices();
                }
            }
        }
    },
    
    /**
     * Method: handleKeypress
     * Called by the feature handler on keypress.  This is used to delete
     *     vertices. If the <deleteCode> property is set, vertices will
     *     be deleted when a feature is selected for modification and
     *     the mouse is over a vertex.
     *
     * Parameters:
     * evt - {Event} Keypress event.
     */
    handleKeypress: function(evt) {
        var code = evt.keyCode;
        
        // check for delete key
        if(this.feature &&
           OpenLayers.Util.indexOf(this.deleteCodes, code) != -1) {
            var vertex = this.layer.getFeatureFromEvent(this.handlers.drag.evt);
            if (vertex &&
                    OpenLayers.Util.indexOf(this.vertices, vertex) != -1 &&
                    !this.handlers.drag.dragging && vertex.geometry.parent) {
                // remove the vertex
                vertex.geometry.parent.removeComponent(vertex.geometry);
                this.layer.events.triggerEvent("vertexremoved", {
                    vertex: vertex.geometry,
                    feature: this.feature,
                    pixel: evt.xy
                });
                this.layer.drawFeature(this.feature, this.standalone ?
                                       undefined : 'select');
                this.modified = true;
                this.resetVertices();
                this.setFeatureState();
                this.onModification(this.feature);
                this.layer.events.triggerEvent("featuremodified", 
                                               {feature: this.feature});
            }
        }
    },

    /**
     * Method: collectVertices
     * Collect the vertices from the modifiable feature's geometry and push
     *     them on to the control's vertices array.
     */
    collectVertices: function() {
        this.vertices = [];
        this.virtualVertices = [];        
        var control = this;
        function collectComponentVertices(geometry) {
            var i, vertex, component, len;
            if(geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
                vertex = new OpenLayers.Feature.Vector(geometry);
                vertex._sketch = true;
                vertex.renderIntent = control.vertexRenderIntent;
                control.vertices.push(vertex);
            } else {
                var numVert = geometry.components.length;
                if(geometry.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
                    numVert -= 1;
                }
                for(i=0; i<numVert; ++i) {
                    component = geometry.components[i];
                    if(component.CLASS_NAME == "OpenLayers.Geometry.Point") {
                        vertex = new OpenLayers.Feature.Vector(component);
                        vertex._sketch = true;
                        vertex.renderIntent = control.vertexRenderIntent;
                        control.vertices.push(vertex);
                    } else {
                        collectComponentVertices(component);
                    }
                }
                
                // add virtual vertices in the middle of each edge
                if (control.createVertices && geometry.CLASS_NAME != "OpenLayers.Geometry.MultiPoint") {
                    for(i=0, len=geometry.components.length; i<len-1; ++i) {
                        var prevVertex = geometry.components[i];
                        var nextVertex = ge)>8Ÿ5GQråğğTë ¬Âd1ty•¹(yLúDn>Ô¦ılû¡UµZÊºúâº­åé£†Bó¿.ÉœıqetmÍ¯ÍŞGøBu.H¢BÁƒ™/éÎ¸pz¹€®İL<Êòd%ºx7x°
¾î§øíL›q?T•#Ï¶-çÁá+k€¯éa¡ü¹P8gi ¤ya`%›¾9oEŸ¼†4Ö—Aƒ*à“˜àø^ó¾æ¿2¢‡ä9üSZãèÊcº%ùŸQ3œì´§Q"'„‘#¼ÈY*(iWëÑ1 ¥S`×‹¾ôw˜§Ær"–¤ôó€ÁÎdññwñW\".k‚3øm–FI–ïd5)ÇGGÏÁwî¦eoÍ\ùM5 œe;Û’=âdÏ\nJ‡ˆ{iÓ9¢Ew}Óz%Â"2ÜQÿu{ûz¾Ş=múÎå½Z4ó…½â>R~xkİWÀ€^\®MÈÕUcş¸ÌàÚÓ}Â=p&£@‘™äKƒ@u{]-øËµ+Æó_ä#›¼§òÁ_:}£ÀRPë‹9b9AKŞ(pòÏÕ¹ïğ"SÊŸ.Î“òo«ßò£Şa–ÈéésBò3´{cOûé?1‡†i2ÿI0U÷·vÇèŞ­«¥"kã9´B)>.:„_1›+Já4}wYCtZó$[ÙÚü{¨Á°H±ácã<l|
(S=u}~Š!ˆ„ƒ–ÜòÍ«ë‘×L¦mJëÏ&“G©W=íÜüò
ùöü ×
å~)ÎÁE†Ú^S
)F7”S7:æ6NÛ¼„«àéW£ø"afµ28æšNÕÙı1€8@È$	ïyÁZ{N`®[]*_uşw@ èó Äózk"ğIrÌ`+[®=,³±fÍ+;e$€©%ò]II½T¬£½ÁOòğ)š0™qE6á:uÃUx¹*6—í<›ÊH›«œÅšw{µ¹Ô`IæÛaoÔ«Å2ÉMQ˜+P&¼=|»ä¼AĞÒ­^—bWª‚/ûôu]cÛ°€Ş’WäÓ„éz$ş	ˆ{“E-YT¨¯mÑ71D:B¾\5fn[Ê5ø3=¦R`QêJ‡-¢Æ¦Ìz)m··hçE2UÖšCÄ‚?‘‹à$0²·@:ì¿Xóï<²rİÜˆÛ 8ë›Ïi'3vİ ğzÛ‰V\~Ò­5#sÑq8œèÓ‰Ì±íT}r™øŸş
)2F!ó}Ôäƒ=8İ£6ŞF‹´ß„L¸ÒÉ[DÊCSÊ‘uÖø&®nÒ9ZíÆŞ &;™ Ìş®[€™ôï7İSÑ	µy®²\±;ú·éî°µù¥fšnümÓ¯O€Olòõ“w_’~A	¿Ëí9Â€àÁ[ô HœóÃÉŒ¿MEœ[¿/w²°:i?„ãgğñ?šH¹eÎŠ’gµ°Ğ+¬…8Ùò5ÒEW‡jo¼ätŠNÕÓ·Øvá^ƒ\³“*‘â©n­tTâZgÚ»ÊšÁŒ!?×ı­/.zÛÛ%	ásL‡=FÛJ€E‹r‡ÑÎIj;’0óÄi¹‰I®•²=¤üì}•k]æ~#ÛÇ‰¦ÃBÈ2¦‰*|ó#Í``ü°Ø	ÒÉêˆtçpŒğ•:Å ŠÅ~„¹ù¼îòôø:„Š,ô´ä\ß‰®¿,+|#½ úÑ@µŸŞñMTI¸ìU¢<ÕÚÛ©K*\âzÑuÙêWÅ•ÁoC	dôLµb0œ**úuõû±·+@C kù¢İ›ø/|êÉnˆ†óšjM‚í<,ÓYÒ¥F{$üa]uŒD¼´s_¯X]Š²™—¥$ä]ÙâOÂ ;Ï\<Q«ˆ/@óÂUƒÑ.Õ\Ñ‡¶ó ú—Ò]LgË&‚3E/câv1w‘‰zš“(÷é-·†ÍrÓ†¹ø’É°Èma$ax2xäI˜P÷‹Zã!Z¬äÜ3â¹[,æêq“–îà+Ñ¸¥MI˜ºF³Œhk	€qèRXUv8B˜•áâİDçnm²úXr^õX¹`0>Ä¹jƒb7gÏ°ÄJö÷â–È"ïèèB)Z€ˆ“¯â¢w,õĞ9Nƒ‘««^@ğZ	î´ÿQmiêØH+ÈŞhMWÓ+R`æ—^ÁĞ®½ºfù"s¥ª°siÙôö‰ÊÃ*ÜQõ‡ÿÒéñ©¯=eƒÙÀÓ0å7	ö¿MVÚìãıonhv1Ô–5HÍÑ!:óo6‡íê4b–{À "lçPé÷ZÃoõäóMÙN,¨wå™]“âü±³p¤›ü­iR…ª?[QäŒ
R8³6w%?…€°ïcXŞÊÒªWó›Rç¼7$(xû+äí‡•=G°1åÄ“ vb<ë4	s°Á†ì¡\X7ª×ÃÕi+Jâdã.hâ•áš‰ç–}Ñuswğ<'G¯s2ù#ÜÔtâJ÷û 
Gÿ +¬Ô=é×Æ:+³™Ím6å¢¿VÂ÷ÊZVøÆÊLÍÈFĞÆqR)ÉÎRÕP«×o_¼º†$øÑ›n_ÔD
ùû~¥™Ò9i²'– ²ºİãM¯JÖOaPÄØ*ÿå˜?Æá0>yÃ.ÛsJáõ«!ƒQ€Z3®åw‰MW@7SÌAÅBÓ„¢pÏgÅX‚À8†7é0¥rÄÉd¾à¹™KÇÚ „ 9†‚{^»Éo'¾ÔĞíÄÉDÔc&ÎÜ~jwTxKZÓà¿€¯±Én<îå.UÉ3ˆ-@¦+ŒvBÁß4_[ëªášKãæ^pVÄŸÈ¨2î‚èıç÷©_FuNéW…¡hD/rÅã3›ûÂ×1nu,>³Ù"+Yˆ-3¼<RV´CgCı‰8‡-Ç,Îş›s¬ö…°‘'½zˆé‡'¹aiÈ•ÉqrmÎuÂÏEÇ=ûÏ3€¼ğÛuoÊ|Í×|un{¡v„µ‚ù‰İœÃHfâÑõ’À®jğ{·îø/;:ÁÅÇ:cØ‘Ãˆ§Ã™5ùğañ­Å­
°b|(ò³`Ÿgä¾-aUÿï4ª*À4g‘Ìû†ÁJv2oß®MÒÂ×¿İ€àÌ1@@ÂÉŸìÿ¬yø½µ6zC>_Iİ£Ç;£aÛÚV2Ö¶‡=ÆÄ9B#Ã}ÍŸo·hîcI¹Ğ­ÓåX˜ìŸõ†Ò%…—¸øƒ®€ìnzS±jsŸ0¨Õ ¹¨€@¶Ş¿i™¨‹G}ıÒvpo»«Y†JÓ®Ö‰h½šËk‹SAßÙÅ^ãAYH‹{hhßShdöd»wq-`kãgúf‚_Tz'Ñ”DUÛì«–òEè8”èÀ„:ú"XpçÈá`.»UA†ÊØœÑ³èÅ¾	\®*áÉºÍà7Tdúàò@¹Ûål:D"×ä5Ùÿ<œ°ùpÁ+¶Øx|Ã¿¬ÊMOLPÎ•a€¢H2iƒ$.iÓZ0óÜdğ7sUWÍµÍ¶É}õa°@qñÍãÏP8^O [is;™bk ´-tAÂô“ p¬õDla‘ã¹pÙp:NcK5’aGò½øê×ŠÕâÛÆà·Ø×æ'ÜŒ‚ì’hU”ıeşºR}ïÎ¦ú#·çz£G‹«}§uêÆ‚YóÈ€dé´®J¯«‚ş@}Ÿë?8“J¨<àzö—ı‹DËYK„‚Ué÷P$ï‡¦äçƒØ«¨v±·Æ¼ûTÀ³EÕ7Ì|ñ{T€EÙUPaÌQ …,OL_€á><©¸]}6z[ˆ_ÜD¢…ÿ~­l?ÛoÌn_Ã yµœz¼Â Êpw(€¢ÙZâ©ûó;6'•õTˆ£~Ru`X–-±…ºŒŸçÔ“¯5‰%Å§Reµ$)€nªüâ[¡ŞK‚“}¸…à<ê_rZ-Š€JÕŒ;õ4áq¹O?I>k·ÿ|¸”‡|? VÏI™}jßÇ«Ş™Ø´êŒCJl
å¡3Í’@·İIO!«çÏjøG^Ç“ğ²y2´—ïÑä ÑğÎĞJº0\åŒ:Z¢/³E¶ä¥Å§ih­„/òÁğÈÈ/}U0H+Ğ—‘fšDY§ìÍ'Å¿ÄÛ=ÆS't7Ş”ã´ÈÜ%×¦7­(ä2=ËAİmUıPöµ 1(ÜNE<«²AÅgRfÀ¶ZÜUY¿Ü9È§Qg†­ØŠnx¦ÅÌ8gtéÆêï	Y§4†ç-Š1¼‹0ù´HE8ô‹kè¹@ºÑååU.aªGïĞ{´qÖ‚äùªY<nGe#7#c„¹ƒ¯Ú‰€âUØú¸õf2€Æ¯:‘'™¬œ¿ÉNá°Ã–v]Ód´9ë]¤à¦†é¹¤ú‘¯ˆ<5˜†Ç€ÿ½>~%¥:ÍŠÊÍµÆ´21ä¯èE÷zn‡ğ™úŞtİg²}"´ZªÄ?mµÚE9…ŠdŸ&·×0I@«¶xÓ"ù¯ºgŒáÛçÔuY¡ù^ƒEİ0›Œ!k«ùq}¹³—tAj
çß}7*}$mµ!x"nİ*½ê‚‰LÛûH€…U*RÌ…´÷†ZËèÁïK2I- ÿÒH:¢MÍn)O‡Úş™ñ²¨Ä}Q;@)úJ¥>€ù‚¥£­Û0şn(ß`x©/¸4ğD98“ˆ5„1Û@mÅ‰q:ÇèäÃ6ù4•V›•á (c"É0Õ«WdtRP	€˜¯ĞÉ…ÊšeIn¨˜5 Ri¦>½,Ù´¯eÔRbÒ¼ºÓ*©Èhé ã›(ş}­ š¶ï™K{Ï±')FûL|ò‰#·o©ĞˆÜ: 5ÿ3Õq¨1<>Ğz‰I¥óÇñĞšvçè†âùuºüÂ<]ÆÁÎ<- /—Ç4!3A
‹M«'/ÏÍŒ¤KPdiÃCÁÄÒÕ‹‡×R(I•‹ÂüSïj›¡e_äLöıKûÎìp»Fzç&ÙÀ ZÂiÉ\4[tÏ¸›É½}“CªyccË„ûbBeå´Ğá\¤íœ$ xQëãòÀƒs‘¨Mİc ‰Ñ•Ö%[ÖAsĞ€¨	º³©u‰H®£™ç‰?+Ú4^ZŠoİ M 5…Z %æİægùä»¨Ù}6r³×†ëBŞlUµ;kéx)ÅP©BVÙ¹¿ö q#’mÚ\!C¥…×ÓÏ?Q[(/Ê[©Éú·s)0&¿ŞŠY6ÒËÅîı>Qè?@QSÉ+º‹«Qÿ	”¿éã”ÂŠq:\7‹ÍÂ¡P´9½¸+²ò¶tR\U3—W'a;âO×ôt£î í&CB C<…€½æĞ¹}Jİ•ÜÁPÓõª‰øÔ‡#ew÷Fts5|+	£:ë²…atuOª%‰_N÷ Æ¡b~ZDsæÔ“lqèHö6x¼R¸OIGp´ëç8|Z ;Q¼Æëiƒ…§KÚErŸp¯ö¾%z:ƒzô5¬‚G¢!¸HÀ@kèÑM¾Çpü“vTÉXt[ÀSnUt'û"”÷‚~È’“öFi‚µwÁz’ 'ĞìüúİTY¿/!ğ¬ñ}×.`Áh8'›ÓÚF›AÙ“|+yúB‘!ÜeòLú^ÔuÔ=¿ıÎXûÙqÃ'y¯Ö‡å®æ cè¦áæŸŸÁèD»ø
ÙIVû*íê§bÄûæLóØzú¹¦îU«ó¤ˆîk¼¯yG,é>€$_üé×÷¶á‡_g³YÑÛï^pÀ·9Ö,¶7ör_lk¥A"§İ<}å3QIUÜŸH§ô‰bû¬¸p±)[ëóö.úğ†»ˆ˜ğÚ‘¸Î%CÀ›”(Šş!0Ç.eëÕJsÙ¢ò{lÌqg’ĞP€\Æãîc)Êî¸ÄU-¾‡˜Î@š}¯YŸ×p—*šï‡ŠGÇµ÷OrÛ)ªC×Õ…õ™ÍÓZú‘R5æ=™¾Q©¢»-ı–¦™i¤Ş(/msö®ú)3õôrü@û«G¡bÆe{ÉN,5­Ï%M3úk2~%p'³SetR´óß‘éÂRÆ°“A¢ìRíQ·&+Åí{Ç…M3Œ8=À]ì‹;7å8Ïª‡!{3ªøµõÔÍü%¤Q¼ïŒºK¿h›O5k¼—’ä4²„S…c^‚7È»äßõİCåXvŠ;k+vY ÷*¬§gµ“ì3 É:‚›¥ ü0+`«ß(y¬í·äÿÁª«hä<ÂQîÆ>`,ƒ?ù€É8—±½Új¹h‰7¯}µ'¾lÎwô°ÎKA®úÎOm™ ·W;Í¼ëÚa:¬dm^q«ávW4²‡Öå`O&:!Ø¦ñ‹¥t·?Çç,áÇ˜]iƒ]@g&¥ß(¶]¢Ús7vt‘Í36!ç©ï.à±h¸¹ÚqÊ­Dsk‘¸ú3Ÿ,Pó3ôÎmµ{ü-/î×Ae 9äs8áòO¸æª/…F¬YÁ”õØ—s ²óC ·¿]Zá\ÁäÍÉ-âåúBN<xêo]ÜsğjR?TŠ*‡>¸©Â¬/#|î—j¢¤9peNÁEÄ%ŒA£°M¸;`Å	sÑG÷¹Úø-üŠäE0…jóş“šİÉµ¥)À/=›ŸÜç#¯ßÓeß|\jEö	ºÂGÁÇ^¢^öÒø„¦«HĞpkuöT˜¾:úŒ9fê¨‚õXŠ:Gr>|Ì‹Xã;º“°˜.„fò'ÉPÈ1TÔ§MzÕu¼a89\…4\6Ü§OàEK÷‰ò3Q-µ×V÷ÜEÉşšÿÿ€Ôb‘,ßï_øçÒşŞ»±‚Ú·dËjà($^—’²v®OM4û„¿$û§åƒ:±Ã§GQOr–>R-ã
$éPŞ{‘ûÒc,õîõÊÙ·WìÉ·š1¬Äu%bƒæÍëŠ‹I©M¬İÊÖ¯á‡±NgÄÇ]ZX«9‰gb­”›Ö:ß0!÷uËp…|xÅß?ø¯1¬òTÎ@ôL9/Ã×
§òôµFlãĞÂ5:,š¢ñ|(º¾Ï½h¥¢b­VuÕVÄÅbj©(ÂgÄ’KäóxåÀjÃ¤GoÅEïğ//zé3'Ë<÷"¸¨ªK`óÚG	eˆcÿpŞ¼Ë–2Àæ?ç©’^á;=şä]Kô…ˆü×eÇ¦±¯ Ãß«8 ‹´÷£ş 6õÿ¯BÖ#‰‘ö¸	ÚÙ°ÏÛØÈâeˆU;ÄĞÇ)-šO'øF2>2ıeq3ÒªÕUí§ùİË¨¶4”m³ÄöLÛ˜ÚbFA/rÇ>¢Ã¯AE¦ab~}Õni=„|·æ	˜Ÿ~A ¶¡©A l<A¤ız¼@ :¤'Y†òˆ­ÈÛ›/„.™º•‚ĞšŞÎ¥›J|çp\ƒÀ{/YaŒûHÌ‚û»P«{GíÿK^Död;ÎF0åf }îÇü÷şv!ÛœÏÏâaÚï¹1Ó¡aŠ 3IÚ X7\h€X]–Á…wPĞÌÓ@ÛHØÜ,dmÑåkª•OÈG»éVšÙ>çhÿ¾ÆÜ|·ŠIj®Ñ¾´eƒ}töF<¨ ó|†İ·‹}XÆ5{‚âhQ
§‚o¯PG¥”ŸD–æ‹éİkBÔhZ¹)d|v °¿\™ŒU/<×·¶BìıÔîüÇ%!"öÖê"EÌ‹g«x!CºCîáq®\ ¸ÑNÄ¬«›İU@òæãÜº£9ZMNÊ‘Mwâô5³©°úâlZG¬‡´CàRù±_7à"ÃŞåĞ]!“æâDN[,ÿq‚£ßß®à9Ë”³­ˆY‰à( ·œÙ¶<z‰H¯Èè‚zT‡ú¹†]±EÜ[àmqNĞyÓMW/“êCûÂ	³°°T¾ÿûcí1Ä7èX0¡´¼İd°Ï}öïˆ4JØ"-«õ¸VÑ`ê¬îy£wiA"—(6ºB_)í@ëYeòh‘6(ÄAqMY±NL
‹¡áÅ…¿3Sy¨w\ğtLÚó¡^Š‰* øÅ2¶ò;¢åùˆ|çÊDˆ^)¹š£­c}Ú¤ˆ`3Ë"‹µxŒÆ8d´SJ@Oä“
ÿî}CPsËñ—Î)vÛUÂ