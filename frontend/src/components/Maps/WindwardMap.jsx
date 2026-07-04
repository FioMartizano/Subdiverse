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

        {/* HOA Office Marker */}
        <MapMarker
          longitude={120.96552713718836}
          latitude={14.329377373207663}
        >
          <MarkerContent>
            <div className="text-2xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform">
              🏠
            </div>
          </MarkerContent>

          <MarkerPopup>
            <div className="space-y-1">
              <h3 className="font-semibold">
                Windward Hills Clubhouse
              </h3>
              <p className="text-sm text-muted-foreground">
                Burol I, Dasmariñas, Cavite
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>

        {/* Court */}
        <MapMarker
          longitude={120.96522952744914}
          latitude={14.32980522565868}
        >
          <MarkerContent>
            <div className="text-2xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform">
              🏀
            </div>
          </MarkerContent>

          <MarkerPopup>
            <div className="space-y-1">
              <h3 className="font-semibold">
                Basketball Court
              </h3>
              <p className="text-sm text-muted-foreground">
                Burol I, Dasmariñas, Cavite
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>

        {/* Pope Saint Paul Parish */}
        <MapMarker
          longitude={120.96406642416918}
          latitude={14.327652400341815}
        >
          <MarkerContent>
            <div className="text-2xl drop-shadow-md cursor-pointer hover:scale-110 transition-transform">
              ⛪
            </div>
          </MarkerContent>

          <MarkerPopup>
            <div className="space-y-1">
              <h3 className="font-semibold">
                Pope Saint Paul VI Parish Church
              </h3>
              <p className="text-sm text-muted-foreground">
                Burol I, Dasmariñas, Cavite
              </p>
            </div>
          </MarkerPopup>
        </MapMarker>
      </Map>
    </div>
  );
}