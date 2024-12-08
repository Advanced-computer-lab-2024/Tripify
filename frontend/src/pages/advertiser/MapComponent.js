import React from 'react';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const MapComponent = React.memo(({ onMapClick, marker, googleMapsApiKey }) => {
  if (!googleMapsApiKey) {
    return <div>Google Maps API key is required</div>;
  }

  return (
    <LoadScript 
      googleMapsApiKey={googleMapsApiKey}
      loadingElement={<div>Loading...</div>}
    >
      <GoogleMap
        mapContainerStyle={{ height: "400px", width: "100%" }}
        center={{ lat: 30.0444, lng: 31.2357 }}
        zoom={10}
        onClick={onMapClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </LoadScript>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;