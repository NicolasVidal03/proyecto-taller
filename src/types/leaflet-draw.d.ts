
import * as L from 'leaflet';

declare module 'leaflet' {
  namespace Control {
    class Draw extends L.Control {
      constructor(options?: DrawConstructorOptions);
    }

    interface DrawConstructorOptions {
      position?: L.ControlPosition;
      draw?: DrawOptions;
      edit?: EditOptions;
    }

    interface DrawOptions {
      polyline?: PolylineOptions | false;
      polygon?: PolygonOptions | false;
      rectangle?: RectangleOptions | false;
      circle?: CircleOptions | false;
      circlemarker?: CircleMarkerOptions | false;
      marker?: MarkerOptions | false;
    }

    interface EditOptions {
      featureGroup: L.FeatureGroup;
      remove?: boolean;
      edit?: EditHandlerOptions | false;
    }

    interface EditHandlerOptions {
      selectedPathOptions?: L.PathOptions;
    }

    interface PolylineOptions {
      allowIntersection?: boolean;
      drawError?: DrawErrorOptions;
      guidelineDistance?: number;
      shapeOptions?: L.PolylineOptions;
      metric?: boolean;
      feet?: boolean;
      nautic?: boolean;
      showLength?: boolean;
      repeatMode?: boolean;
    }

    interface PolygonOptions extends PolylineOptions {
      showArea?: boolean;
    }

    interface RectangleOptions {
      shapeOptions?: L.PathOptions;
      repeatMode?: boolean;
      showArea?: boolean;
      metric?: boolean | string[];
    }

    interface CircleOptions {
      shapeOptions?: L.PathOptions;
      repeatMode?: boolean;
      showRadius?: boolean;
      metric?: boolean;
      feet?: boolean;
      nautic?: boolean;
    }

    interface CircleMarkerOptions {
      stroke?: boolean;
      color?: string;
      weight?: number;
      opacity?: number;
      fill?: boolean;
      fillColor?: string;
      fillOpacity?: number;
      clickable?: boolean;
      repeatMode?: boolean;
    }

    interface MarkerOptions {
      icon?: L.Icon | L.DivIcon;
      zIndexOffset?: number;
      repeatMode?: boolean;
    }

    interface DrawErrorOptions {
      color?: string;
      timeout?: number;
      message?: string;
    }
  }

  namespace Draw {
    namespace Event {
      const CREATED: string;
      const EDITED: string;
      const DELETED: string;
      const DRAWSTART: string;
      const DRAWSTOP: string;
      const DRAWVERTEX: string;
      const EDITSTART: string;
      const EDITMOVE: string;
      const EDITRESIZE: string;
      const EDITVERTEX: string;
      const EDITSTOP: string;
      const DELETESTART: string;
      const DELETESTOP: string;
      const TOOLBARCLOSED: string;
      const MARKERCONTEXT: string;
    }
  }

  namespace DrawEvents {
    interface Created extends L.LeafletEvent {
      layer: L.Layer;
      layerType: string;
    }

    interface Edited extends L.LeafletEvent {
      layers: L.LayerGroup;
    }

    interface Deleted extends L.LeafletEvent {
      layers: L.LayerGroup;
    }

    interface DrawStart extends L.LeafletEvent {
      layerType: string;
    }

    interface DrawStop extends L.LeafletEvent {
      layerType: string;
    }

    interface DrawVertex extends L.LeafletEvent {
      layers: L.LayerGroup;
    }

    interface EditStart extends L.LeafletEvent {
      handler: string;
    }

    interface EditStop extends L.LeafletEvent {
      handler: string;
    }

    interface DeleteStart extends L.LeafletEvent {
      handler: string;
    }

    interface DeleteStop extends L.LeafletEvent {
      handler: string;
    }
  }
}

export {};
