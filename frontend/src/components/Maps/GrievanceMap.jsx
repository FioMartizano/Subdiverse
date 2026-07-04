import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MapControls,
} from "@/components/ui/map";

export default function WindwardMap() {
  return (
    <div className="h-[450px] w-full overflow-hidden rounded-xl border">
      <Map
        theme="light"
        center={[120.96514816498826, 14.330065756782759]}
        zoom={16}
      >
        <MapControls showZoom showLocate showFullscreen />

        {/* Grievance Office */}
        <MapMarker
          longitude={120.96553744340476}
          latitude={14.329403409882044}
        >
          <MarkerContent>
            <div className="text-2xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform">
              🏠
            </div>
          </MarkerContent>

          <MarkerPopup>
            <div className="space-y-1">
              <h3 className="font-semibold">
                Grievance Office
              </h3>
              <p className="text-sm text-muted-foreground">
                WWHS, Burol 1, Lot 12 Ph E, 56 Main Ave, Dasmariñas, 4114 Cavite
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>
      </Map>
    </div>
  );
}