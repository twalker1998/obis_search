import { Component, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';

import { MapService } from '../../core/map.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent {
  @Output() mapLoadedEvent = new EventEmitter<boolean>();

  isResultLoaded: boolean;

  constructor(private mapService: MapService) {
    this.mapService.acode.subscribe(acode => {
      if (acode === 'search') {
        this.isResultLoaded = false;
      } else {
        this.isResultLoaded = true;
        this.initializeMap(acode);
      }
    });
  }

  public async initializeMap(acode: string) {
    try {
      const [
        Map,
        MapView,
        GroupLayer,
        FeatureLayer,
        MapImageLayer,
        Home,
        Search,
        BasemapGallery,
        LayerList,
        Expand,
        SimpleRenderer,
        Extent,
        SpatialReference,
        Query,
        QueryTask,
        Graphic,
        Fullscreen
      ] = await loadModules([
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
        'esri/tasks/support/Query',
        'esri/tasks/QueryTask',
        'esri/Graphic',
        'esri/widgets/Fullscreen'
      ]);

      // map extent: Need this since no basemap; otherwise extent is pretty wonky
      const bounds = new Extent({
        xmin: -103.5,
        ymin: 33.0,
        xmax: -93.5,
        ymax: 37.5,
        spatialReference: {wkid: 4326} // this is for the extent only; need to set map spatial reference in view.
      });

      const speciesquery = 'acode=\'' + acode + '\'';

      // Oklahoma Counties Layer
      const okcounties = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ArcGISServer_Counties/FeatureServer',
        title: 'Oklahoma Counties',
      });

      const cotemplate = {
        // autocasts as new PopupTemplate()
        title: '<em>{sname}</em> ({vernacularname})',
        content: 'ONHI has {count} occurrence record(s) for <em>{sname}</em> ({vernacularname}) in {county} County'
      };

      // County Occurrences Layer
      const coquery = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OBIS_County_Occurrences_Poly/MapServer/0/',
        definitionExpression: speciesquery,
        title: 'County Occurrences',
        outFields: ['*'],
        popupTemplate: cotemplate
      });

      // Ecological Systems
      const okecos = new MapImageLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/EcologicalSystems/OKECOS/MapServer',
        title: 'Ecological Systems',
        visible: false
      });

      const ecoivtemplate = {
        // autocasts as new PopupTemplate()
        title: '<strong>Level IV Ecoregion</strong>: {us_l4name}',
        content: 'Level III Ecoregion: {us_l3name}<br> Level II Ecoregion: {na_l2name}<br> Level I Ecoregion: {na_l1name}'
      };

      // Ecoregions
      const ecoiv = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ok_eco_l4/FeatureServer',
        title: 'Level IV Ecoregions of Oklahoma',
        popupTemplate: ecoivtemplate,
        visible: false
      });

      const okpadivtemplate = {
        // autocasts as new PopupTemplate()
        title: '<strong>{unit_nm}</strong>',
        content: 'Protected Area Type: {loc_ds}<br> Protected Area Manager: {loc_own}'
      };

      // Protected Areas
      const okpad = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/PAD_OK/FeatureServer',
        title: 'Protected Areas of Oklahoma',
        popupTemplate: okpadivtemplate,
        visible: false
      });

      const dftemplate = {
        // autocasts as new PopupTemplate()
        title: '<strong>Game Types of Oklahoma</strong>',
        content: '{gametype}'
      };

      // Duck and Fletcher
      const df = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/Duck_and_Fletcher/FeatureServer',
        title: 'Duck and Fletcher: Game Types',
        popupTemplate: dftemplate,
        visible: false
      });

      const geotemplate = {
        // autocasts as new PopupTemplate()
        title: '<strong>Geomorphic Province</strong>',
        content: '{province}'
      };

      // Geomorphic Provinces
      const geo = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/geomorphic/FeatureServer',
        title: 'Geomorphic Provinces',
        popupTemplate: geotemplate,
        visible: false
      });

      const swaptemplate = {
        // autocasts as new PopupTemplate()
        title: '<strong>Comprehensive Wildlife Conservation Strategy Region</strong>',
        content: '{name}'
      };

      // Comprehensive Wildlife Conservation Strategy Regions
      const swap = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OKWCSR/FeatureServer',
        title: 'Comprehensive Wildlife Conservation Strategy Regions',
        popupTemplate: swaptemplate,
        visible: false
      });

      const hextemplate = {
        // autocasts as new PopupTemplate()
        title: '<em>{sname}</em> ({vernacularname})',
        content: 'ONHI has {count} occurrence record(s) for <em>{sname}</em> ({vernacularname}) in this hexagon'
      };

      // Hex Occurrences Layer
      const hexquery = new FeatureLayer({
        url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/OBIS_5km_Occurrences/MapServer/0/',
        definitionExpression: speciesquery,
        title: 'Georeferenced Occurrences',
        outFields: ['*'],
        popupTemplate: hextemplate
      });

      // Create GroupLayer for occurrences
      const occurrencesGroupLayer = new GroupLayer({
        title: 'Occurrences',
        visible: true,
        // visibilityMode: "exclusive",
        layers: [coquery, hexquery],
        opacity: 0.75
      });

      // Township/Range
      const townships = new FeatureLayer({
        url: 'https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/0',
        outFields: ['*'],
        title: 'Township/Range'
        // popupTemplate: template
      });

      // Sections
      const sections = new FeatureLayer({
        url: 'https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/1',
        outFields: ['*'],
        title: 'Section'
        // popupTemplate: template
      });

      // Create GroupLayer for PLSS data
      const PLSS = new GroupLayer({
        title: 'PLSS Data',
        visible: false,
        visibilityMode: 'independent',
        layers: [townships, sections]
      });

      const map = new Map({
        // basemap: "satellite",
        layers: [PLSS, okecos, geo, swap, ecoiv, df, okpad, okcounties, occurrencesGroupLayer]
      });

      const view = new MapView({
        container: 'viewDiv-map',
        map,
        extent: bounds,
        spatialReference: 3857 // spatial reference of map; different from the extent
      });

      // Home button
      const homeBtn = new Home({
        view
      });

      // Add the home button to the top left corner of the view
      view.ui.add(homeBtn, 'top-left');

      // create a search widget
      const searchWidget = new Search({
        view,
        sources: [{
          layer: new FeatureLayer({ // Notice the property is called layer Not featureLayer new to 4.11
            url: 'https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/0',
            popupTemplate: { // autocasts as new PopupTemplate()
              title: '{label}',
              overwriteActions: true
            }
          }),

          searchFields: ['label'],
          displayField: 'label',
          exactMatch: false,
          outFields: ['label'],
          name: 'Township/Range',
          placeholder: 'example: 12N 10W',
        },

        {
          layer: new FeatureLayer({ // Notice the property is called layer Not featureLayer new to 4.11
            url: 'https://services.arcgis.com/3xOwF6p0r7IHIjfn/arcgis/rest/services/PLSS/FeatureServer/1',
            popupTemplate: { // autocasts as new PopupTemplate()
              title: '{STR_label}',
              overwriteActions: true
            }
          }),

          searchFields: ['STR_label'],
          displayField: 'STR_label',
          exactMatch: false,
          outFields: ['STR_label'],
          name: 'Section Township/Range',
          placeholder: 'example: 15 12N 10W',
        },

        {
          layer: new FeatureLayer({ // Notice the property is called layer Not featureLayer new to 4.11
            url: 'https://obsgis.csa.ou.edu:6443/arcgis/rest/services/ONHI/ArcGISServer_Counties/FeatureServer/0',
            popupTemplate: { // autocasts as new PopupTemplate()
              title: '{name} County',
              overwriteActions: true
            }
          }),

          searchFields: ['name'],
          displayField: 'name',
          exactMatch: false,
          outFields: ['name'],
          name: 'Counties',
          placeholder: 'example: Adair',
        }]
      });

      // Add the search widget to the top right corner of the view
      view.ui.add(searchWidget, {
        position: 'top-right'
      });

      // Create a BasemapGallery widget instance and set
      // its container to a div element
      const basemapGallery = new BasemapGallery({
        view,
        container: document.createElement('div')
      });

      // Create an Expand instance for basemap gallery
      const bgExpand = new Expand({
        view,
        expandTooltip: 'Select basemap',
        content: basemapGallery
      });

      // Add the expand instance to the ui
      view.ui.add(bgExpand, 'top-left');

      // Add a legend instance to the panel of a
      // ListItem in a LayerList instance
      const layerList = new LayerList({
        view,
        listItemCreatedFunction(event) {
          const item = event.item;
          if (item.layer.type !== 'group') { // don't show legend twice
            item.panel = {
              content: 'legend',
              open: false
            };
          }
        }
      });

      // Create an Expand instance for legend gallery
      const lgExpand = new Expand({
        view,
        expandTooltip: 'Expand Layer List',
        content: layerList
      });

      // Add the expand instance to the ui
      view.ui.add(lgExpand, 'top-left');

      const fullscreen = new Fullscreen({
        view
      });

      view.ui.add(fullscreen, 'top-right');

      return new MapView(view);
    } catch (error) {
      console.log('EsriLoader: ', error);
    }
  }
}
