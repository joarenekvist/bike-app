//This needs a separate store because its not compatible with vuex. Absolutely no clue why.
//Consider this an extension of the model, but just for polylines.
/* global google */

export const polyline_store = {
    lines: [],
    markers: [],

    clearLines(){
        if (this.lines.length > 0) {
            this.lines.forEach(polyline => {
                polyline.setMap(null);
                polyline.setVisible(false); // This removes the polyline from the map permanently
                polyline = null;
            });
            this.lines = [];
        }
        if (this.markers.length > 0) {
            this.markers.forEach(marker => {
                marker.setMap(null);
                marker.setVisible(false); // This removes the marker from the map permanently
                marker = null;
            });
            this.markers = [];
        }
    },
    addRouteLine(coords, state){
        console.log("Attempting to add new polyline with start and end markers");
        this.clearLines();
        try{
            //add the polyline
            const newPolyline = new google.maps.Polyline({
                path: coords,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: state.map,
                
            });
            newPolyline.addListener("click", () => {
              console.log(`Polyline clicked: ${newPolyline}`);
              console.log(`Coordinates: ${coords}`);
            });
            //add the start and end markers
            //start marker
            const startMarker = new google.maps.Marker({
                position: coords[0],
                map: state.map,
            });
            //end marker
            const endMarker = new google.maps.Marker({
                position: coords[coords.length - 1],
                map: state.map,
            });
            this.markers = [...this.markers, startMarker, endMarker];
            this.lines = [...this.lines, newPolyline];

        }catch(error){
            console.log("failed to create polyline");
            console.log(error);
        }
        
    },
}