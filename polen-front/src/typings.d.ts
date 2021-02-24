/* SystemJS module definition */
import * as L from 'leaflet';
declare var module: NodeModule;

declare module 'leaflet' {
  namespace control {
    function coordinates(options?: any): any;
    function browserPrint(options?: any): any;
  }
}

interface NodeModule {
  id: string;
}
