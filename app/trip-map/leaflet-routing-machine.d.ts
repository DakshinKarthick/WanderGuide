import * as L from 'leaflet';

declare module 'leaflet' {
    namespace Routing {
        interface ControlOptions {
            waypoints: L.LatLng[];
            routeWhileDragging?: boolean;
            lineOptions?: any;
            show?: boolean;
            addWaypoints?: boolean;
            draggableWaypoints?: boolean;
            fitSelectedRoutes?: boolean;
            showAlternatives?: boolean;
        }

        interface Control extends L.Control {
            on(event: string, fn: (e: any) => void): this;
        }

        function control(options: ControlOptions): Control;
    }
}
