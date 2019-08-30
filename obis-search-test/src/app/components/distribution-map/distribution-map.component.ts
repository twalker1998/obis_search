import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import esri = __esri;

@Component({
  selector: 'app-distribution-map',
  templateUrl: './distribution-map.component.html',
  styleUrls: ['./distribution-map.component.css']
})
export class DistributionMapComponent implements OnInit {
  @Input() acode: string;

  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  constructor() { }

  async initializeMap() {
    try {
      // Load the modules for the ArcGIS API for JavaScript
      const [Map, MapView, FeatureLayer, Home, Legend, Expand, Extent, Fullscreen] = await loadModules([
        'esri/Map',
        'esri/views/MapView',
        "esri/layers/FeatureLayer",
        "esri/widgets/Home",
        "esri/widgets/Legend",
        "esri/widgets/Expand",
        "esri/geometry/Extent",
        "esri/widgets/Fullscreen"
      ]);

      //map extent: Need this since no basemap; otherwise extent is pretty wonky
      var bounds = new Extent({
        "xmin": -103.5,
        "ymin": 33.0,
        "xmax": -93.5,
        "ymax": 37.5,
        "spatialReference": { "wkid": 4326 } //this is for the extent only; need to set map spatial reference in view.
      });

      var speciesquery = "acode='" + this.acode + "'";

      // Oklahoma Counties Layer
      var okcounties = new FeatureLayer({
          url: "https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ArcGISServer_Counties/MapServer"

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
          popupTemplate: cotemplate,
          opacity: 0.75
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

      var map = new Map({
          //basemap: "satellite",
          layers: [coquery, okcounties, hexquery]
      });

      var view = new MapView({
          container: "viewDiv",
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

      const legend = new Expand({
          content: new Legend({
              view: view,
              style: "classic",
              layerInfos: [{
                  layer: hexquery
              },
              {
                  layer: coquery
              }
              ]
          }),
          view: view,
          expandTooltip: "Legend",
          expanded: false
      });

      view.ui.add(legend, "bottom-left");

      var fullscreen = new Fullscreen({
          view: view
      });

      view.ui.add(fullscreen, "top-right");

      return new MapView(view);
    } catch (error) {
      console.log('EsriLoader: ', error);
    }
  }

  ngOnInit() {
    // Initialize MapView and return an instance of MapView
    this.initializeMap();
  }
}
