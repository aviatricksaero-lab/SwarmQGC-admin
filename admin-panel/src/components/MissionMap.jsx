import React from 'react';
import { GoogleMap, useJsApiLoader, Polyline, Marker } from '@react-google-maps/api';
import { Box, CircularProgress, Typography } from '@mui/material';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
      disableDefaultUI: false,
      zoomControl: true,
}

const MissionMap = ({ geometry }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const path = React.useMemo(() => {
    if (!geometry?.coordinates) return [];
    // Convert [lon, lat] to {lat, lng}
    return geometry.coordinates.map(coord => ({
      lat: coord[1],
      lng: coord[0]
    }));
  }, [geometry]);

  const center = React.useMemo(() => {
    if (path.length === 0) return { lat: 0, lng: 0 };
    // Simple average center
    const sum = path.reduce((acc, curr) => ({
      lat: acc.lat + curr.lat,
      lng: acc.lng + curr.lng
    }), { lat: 0, lng: 0 });
    return {
      lat: sum.lat / path.length,
      lng: sum.lng / path.length
    };
  }, [path]);

  if (!isLoaded) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress color="secondary" /></Box>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={mapOptions}
    >
      {path.length > 0 && (
        <>
            <Polyline
                path={path}
                options={{
                    strokeColor: "#8B5CF6",
                    strokeOpacity: 1.0,
                    strokeWeight: 3,
                }}
            />
            {/* Start Marker */}
            <Marker 
                position={path[0]} 
                label={{ text: "S", color: "white" }}
                title="Start Point"
            />
            {/* End Marker */}
            <Marker 
                position={path[path.length - 1]} 
                label={{ text: "E", color: "white" }}
                title="End Point"
            />
        </>
      )}
    </GoogleMap>
  );
};

export default React.memo(MissionMap);
