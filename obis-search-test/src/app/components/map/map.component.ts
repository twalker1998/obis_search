import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() acode: string;

  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  constructor() { }

  async initializeMap() {
    try {
      const [Map, MapView, GroupLayer, FeatureLayer, MapImageLayer, Home, Search, BasemapGallery, LayerList,
            Expand, SimpleRenderer, Extent, SpatialReference, Query, QueryTask, Graphic, Fullscreen] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/GroupLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/MapImageLayer',
        'esri/widgets/Home',
        'esri/widgets/Search',
        'esri/widgets/BasemapGallery',
        'esri/widgets/LayerList',
        'esri/widgets/Expand',
        'esri/renderers/SimpleRenderer',
        'esri/geometry/Extent',
        'esri/geometry/SpatialReference',
        'esri/tasks/QueryTask',
        'esri/Graphic',
        'esri/widgets/Fullscreen'
      ]);

      // Map extent: Need this since no basemap; otherwise extent is pretty wonky
      var bounds = new Extent({
        "xmin": -103.5,
        "ymin": 33.0,
        "xmax": -93.5,
        "ymax": 37.5,
        "spatialReference": { "wkid": 4326 } // This is for the extent only; need to set map spatial reference in view.
      });

      // var speciesquery = "acode='" + this.acode + "'";
      var speciesquery = "sname='Grus americana'";

      // Oklahoma Counties Layer
      var okcounties = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ArcGISServer_Counties/FeatureServer",
        title: "Oklahoma Counties"
      });

      var cotemplate = {
        // autocasts as new PopupTemplate()
        title: "<em>{sname}</em> ({vernacularname})",
        content: "ONHI has {count} occurrence record(s) for <em>{sname}</em> ({vernacularname}) in {county} County"
      };

      // County Occurrences Layer
      var coquery = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OBIS_County_Occurrences_Poly/MapServer/0/",
        definitionExpression: speciesquery,
        title: "County Occurrences",
        outFields: ["*"],
        popupTemplate: cotemplate
      });

      // Ecological Systems
      var okecos = new MapImageLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/EcologicalSystems/OKECOS/MapServer",
        title: "Ecological Systems",
        visible: false
      });

      var ecoivtemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Level IV Ecoregion</strong>: {us_l4name}",
        content: "Level III Ecoregion: {us_l3name}<br> Level II Ecoregion: {na_l2name}<br> Level I Ecoregion: {na_l1name}"
      };

      // Ecoregions
      var ecoiv = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ok_eco_l4/FeatureServer",
        title: "Level IV Ecoregions of Oklahoma",
        popupTemplate: ecoivtemplate,
        visible: false
      });

      var okpadivtemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>{unit_nm}</strong>",
        content: "Protected Area Type: {loc_ds}<br> Protected Area Manager: {loc_own}"
      };

      // Protected Areas
      var okpad = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/PAD_OK/FeatureServer",
        title: "Protected Areas of Oklahoma",
        popupTemplate: okpadivtemplate,
        visible: false
      });

      var dftemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Game Types of Oklahoma</strong>",
        content: "{gametype}"
      };

      // Duck and Fletcher
      var df = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/Duck_and_Fletcher/FeatureServer",
        title: "Duck and Fletcher: Game Types",
        popupTemplate: dftemplate,
        visible: false
      });

      var geotemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Geomorphic Province</strong>",
        content: "{province}"
      };

      // Geomorphic Provinces
      var geo = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/geomorphic/FeatureServer",
        title: "Geomorphic Provinces",
        popupTemplate: geotemplate,
        visible: false
      });

      var swaptemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Comprehensive Wildlife Conservation Strategy Region</strong>",
        content: "{name}"
      };

      // Comprehensive Wildlife Conservation Strategy Regions
      var swap = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OKWCSR/FeatureServer",
        title: "Comprehensive Wildlife Conservation Strategy Regions",
        popupTemplate: swaptemplate,
        visible: false
      });

      var hextemplate = {
        // autocasts as new PopupTemplate()
        title: "<em>{sname}</em> ({vernacularname})",
        content: "ONHI has {count} occurrence record(s) for <em>{sname}</em> ({vernacularname}) in this hexagon"
      };

      // Hex Occurrences Layer
      var hexquery = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OBIS_5km_Occurrences/MapServer/0/",
        definitionExpression: speciesquery,
        title: "Georeferenced Occurrences",
        outFields: ["*"],
        popupTemplate: hextemplate
      });

      // Create GroupLayer for occurrences
      var occurrencesGroupLayer = new GroupLayer({
        title: "Occurrences",
        visible: true,
        // visibilityMode: "exclusive",
        layers: [coquery, hexquery],
        opacity: 0.75
      });

      // Township/Range
      var townships = new FeatureLayer({
        url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/0",
        outFields: ["*"],
        title: "Township/Range"
        // popupTemplate: template
      });

      // Sections
      var sections = new FeatureLayer({
        url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/1",
        outFields: ["*"],
        title: "Section"
        // popupTemplate: template
      });

      // Create GroupLayer for PLSS data
      var PLSS = new GroupLayer({
        title: "PLSS Data",
        visible: false,
        visibilityMode: "independent",
        layers: [townships, sections]
      });

      var map = new Map({
        // basemap: "satellite",
        layers: [PLSS, okecos, geo, swap, ecoiv, df, okpad, okcounties, occurrencesGroupLayer]
      });

      var view = new MapView({
        container: "viewDiv-map",
        map: map,
        extend: bounds,
        spatialReference: 3857 // spatial reference of map; different from the extent
      });

      // Home button
      var homeBtn = new Home({
        view: view
      });

      // Add the home button to the top left corner of the view
      view.ui.add(homeBtn, "top-left");

      // Create a search widget
      var searchWidget = new Search({
        view: view,
        sources: [{
          layer: new FeatureLayer({
            url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/0",
            popupTemplate: {
              title: "{label}",
              overwriteActions: true
            }
          }),

          searchFields: ["label"],
          displayField: "label",
          exactMatch: false,
          outFields: ["label"],
          name: "Township/Range",
          placeholder: "example: 12N 10W",
        },
      
        {
          layer: new FeatureLayer({
            url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/1",
            popupTemplate: {
              title: "{STR_label}",
              overwriteActions: true
            }
          }),

          searchFields: ["STR_label"],
          displayField: "STR_label",
          exactMatch: false,
          outFields: ["STR_label"],
          name: "Section Township/Range",
          placeholder: "example: 15 12N 10W"
        },

        {
          layer: new FeatureLayer({
            url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ArcGISServer_Counties/FeatureServer/0",
            popupTemplate: {
              title: "{name} County",
              overwriteActions: true
            }
          }),

          searchFields: ["name"],
          displayField: "name",
          exactMatch: false,
          outFields: ["name"],
          name: "Counties",
          placeholder: "example: Adair",
        }]
      });

      // Add the search widget to the top right corner of the view
      view.ui.add(searchWidget, {
        position: "top-right"
      });

      // Create a BasemapGallery widget instance and set its container to a div element
      var basemapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("div")
      });

      var bgExpand = new Expand({
        view: view,
        expandTooltip: "Select basemap",
        content: basemapGallery
      });

      view.ui.add(bgExpand, "top-left");

      // Add a legend instance to the panel of a ListItem in a LayerList instance
      const layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function(event) {
          const item = event.item;
          if(item.layer.type != "group") {
            item.panel = {
              content: "legend",
              open: false
            };
          }
        }
      });

      view.ui.add(layerList, "bottom-left");

      // var fullscreen = new Fullscreen({
      //   view: view
      // });

      // view.ui.add(fullscreen, "top-right");

      return new MapView(view);
    } catch(error) {
      console.log('EsriLoader: ', error);
    }
  }

  async initializeMapNew() {
    try {
      const [Map, MapView, GroupLayer, FeatureLayer, MapImageLayer, Home, Search, BasemapGallery, LayerList, Expand, Extent, Fullscreen] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        'esri/layers/GroupLayer',
        'esri/layers/FeatureLayer',
        'esri/layers/MapImageLayer',
        'esri/widgets/Home',
        'esri/widgets/Search',
        'esri/widgets/BasemapGallery',
        'esri/widgets/LayerList',
        'esri/widgets/Expand',
        'esri/renderers/SimpleRenderer',
        'esri/geometry/Extent',
        'esri/geometry/SpatialReference',
        'esri/tasks/QueryTask',
        'esri/Graphic',
        'esri/widgets/Fullscreen'
      ]);

      //map extent: Need this since no basemap; otherwise extent is pretty wonky
      var bounds = new Extent({
        "xmin":-103.5,
        "ymin":33.0,
        "xmax":-93.5,
        "ymax":37.5,
        "spatialReference":{"wkid":4326} //this is for the extent only; need to set map spatial reference in view.
      });

      var speciesquery = "sname='Grus americana'"
      
      // Oklahoma Counties Layer
      var okcounties = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ArcGISServer_Counties/FeatureServer",
        title: "Oklahoma Counties"
      });

      var cotemplate = {
        // autocasts as new PopupTemplate()
        title: "<em>{sname}</em> ({vernacularname})",
        content: "ONHI has {count} occurrence record(s) for <em>{sname}</em> ({vernacularname}) in {county} County"
      };
      
      // County Occurrences Layer
      var coquery = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OBIS_County_Occurrences_Poly/MapServer/0/",
        definitionExpression: speciesquery,
        title: "County Occurrences",
        outFields: ["*"],
        popupTemplate: cotemplate
      });

      // Ecological Systems
      var okecos = new MapImageLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/EcologicalSystems/OKECOS/MapServer",
          title: "Ecological Systems",
          visible: false            
      });

      var ecoivtemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Level IV Ecoregion</strong>: {us_l4name}",
        content: "Level III Ecoregion: {us_l3name}<br> Level II Ecoregion: {na_l2name}<br> Level I Ecoregion: {na_l1name}"
      };
      
      // Ecoregions
      var ecoiv = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ok_eco_l4/FeatureServer",
        title: "Level IV Ecoregions of Oklahoma",
        popupTemplate: ecoivtemplate, 
        visible: false            
      });
      
      var okpadivtemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>{unit_nm}</strong>",
        content: "Protected Area Type: {loc_ds}<br> Protected Area Manager: {loc_own}"
      };
      
      // Protected Areas
      var okpad = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/PAD_OK/FeatureServer",
        title: "Protected Areas of Oklahoma",
        popupTemplate: okpadivtemplate, 
        visible: false            
      });

      var dftemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Game Types of Oklahoma</strong>",
        content: "{gametype}"
      };
      
      // Duck and Fletcher
      var df = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/Duck_and_Fletcher/FeatureServer",
        title: "Duck and Fletcher: Game Types",
        popupTemplate: dftemplate, 
        visible: false            
      });
      
      var geotemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Geomorphic Province</strong>",
        content: "{province}"
      };
      
      // Geomorphic Provinces
      var geo = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/geomorphic/FeatureServer",
        title: "Geomorphic Provinces",
        popupTemplate: geotemplate, 
        visible: false            
      });

      var swaptemplate = {
        // autocasts as new PopupTemplate()
        title: "<strong>Comprehensive Wildlife Conservation Strategy Region</strong>",
        content: "{name}"
      };
      
      // Comprehensive Wildlife Conservation Strategy Regions
      var swap = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OKWCSR/FeatureServer",
        title: "Comprehensive Wildlife Conservation Strategy Regions",
        popupTemplate: swaptemplate, 
        visible: false            
      });
      
      var hextemplate = {
        // autocasts as new PopupTemplate()
        title: "<em>{sname}</em> ({vernacularname})",
        content: "ONHI has {count} occurrence record(s) for <em>{sname}</em> ({vernacularname}) in this hexagon"
      };

      // Hex Occurrences Layer
      var hexquery = new FeatureLayer({
        url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OBIS_5km_Occurrences/MapServer/0/",
        definitionExpression: speciesquery,
        title: "Georeferenced Occurrences",
        outFields: ["*"],
        popupTemplate: hextemplate
      });
      
      // Create GroupLayer for occurrences
      var occurrencesGroupLayer = new GroupLayer({
        title: "Occurrences",
        visible: true,
        //visibilityMode: "exclusive",
        layers: [coquery, hexquery],
        opacity: 0.75
      });

      // Township/Range
      var townships = new FeatureLayer({
        url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/0",
        outFields: ["*"],
        title: "Township/Range"
        //popupTemplate: template
      });
  
      // Sections
      var sections = new FeatureLayer({
        url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/1",
        outFields: ["*"],
        title: "Section"
        //popupTemplate: template
      });
        
      // Create GroupLayer for PLSS data
      var PLSS = new GroupLayer({
        title: "PLSS Data",
        visible: false,
        visibilityMode: "independent",
        layers: [townships, sections]
      });

      var map = new Map({
        //basemap: "satellite",
        layers: [PLSS, okecos, geo, swap, ecoiv, df, okpad, okcounties, occurrencesGroupLayer]
      });

      var view = new MapView({
        container: "viewDiv-map",
        map: map,
        extent: bounds,
        spatialReference: 3857 //spatial reference of map; different from the extent
      });

      //Home button
      var homeBtn = new Home({
        view: view
      });

      // Add the home button to the top left corner of the view
      view.ui.add(homeBtn, "top-left");

      // create a search widget
      var searchWidget = new Search({
        view: view,
        sources: [{
          layer: new FeatureLayer({ //Notice the property is called layer Not featureLayer new to 4.11
            url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/0",
            popupTemplate: { // autocasts as new PopupTemplate()
              title: "{label}",
              overwriteActions: true
            }
          }), 	
  
          searchFields: ["label"],
          displayField: "label",
          exactMatch: false,
          outFields: ["label"],
          name: "Township/Range",
          placeholder: "example: 12N 10W"
        }, 
          
        {
          layer: new FeatureLayer({ //Notice the property is called layer Not featureLayer new to 4.11
          url: "https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/1",
            popupTemplate: { // autocasts as new PopupTemplate()
              title: "{STR_label}",
              overwriteActions: true
            }
          }), 	
  
          searchFields: ["STR_label"],
          displayField: "STR_label",
          exactMatch: false,
          outFields: ["STR_label"],
          name: "Section Township/Range",
          placeholder: "example: 15 12N 10W",
        },
        
        {
          layer: new FeatureLayer({ //Notice the property is called layer Not featureLayer new to 4.11
          url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ArcGISServer_Counties/FeatureServer/0",
          popupTemplate: { // autocasts as new PopupTemplate()
            title: "{name} County",
            overwriteActions: true
          }
        }),
          
          searchFields: ["name"],
          displayField: "name",
          exactMatch: false,
          outFields: ["name"],
          name: "Counties",
          placeholder: "example: Adair",
        }]
      });

      // Add the search widget to the top right corner of the view
      view.ui.add(searchWidget, {
        position: "top-right"
      });

      // Create a BasemapGallery widget instance and set
      // its container to a div element
      var basemapGallery = new BasemapGallery({
        view: view,
        container: document.createElement("div")
      });
  
      // Create an Expand instance for basemap gallery
      var bgExpand = new Expand({
        view: view,
        expandTooltip: "Select basemap",
        content: basemapGallery
      });
  
      // Add the expand instance to the ui
      view.ui.add(bgExpand, "top-left");

      // Add a legend instance to the panel of a
      // ListItem in a LayerList instance
      const layerList = new LayerList({
        view: view,
        listItemCreatedFunction: function(event) {
          const item = event.item;
          if (item.layer.type != "group") { // don't show legend twice
            item.panel = {
              content: "legend",
              open: false
            };
          }
        }
      });

      view.ui.add(layerList, "bottom-left");
          
      // var fullscreen = new Fullscreen({
      //   view: view
      // });

      // view.ui.add(fullscreen, "top-right");

      return new MapView(view);
    } catch(error) {
      console.log('EsriLoader: ', error);
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMapNew();
  }
}
