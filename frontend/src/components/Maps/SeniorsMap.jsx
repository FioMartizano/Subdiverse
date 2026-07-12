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

        {/* Seniors Office */}
        <MapMarker
          longitude={120.96522348471493}
          latitude={14.329396027952969}
        >
          <MarkerContent>
            <div className="text-2xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform">
              🏠
            </div>
          </MarkerContent>

          <MarkerPopup>
            <div className="space-y-1">
              <h3 className="font-semibold">
                Senior Citizen's Office
              </h3>
              <p className="text-sm text-muted-foreground">
                WWHS, Burol 1, Main Ave, 8XH8+Q35, Dasmariñas, 4114 Cavite
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>
      </Map>
    </div>
  );
}