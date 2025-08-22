"use client";
import { CONFIG } from "@/config/constanst";
import { useStore } from "@/stores";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const containerStyle = {
  width: "100%",
  height: "250px",
};

const ubicacionPorDefecto = {
  lat: -34.9205, // La Plata
  lng: -57.9536,
};

export default function StoreMap({
  form,
  hideMap = false,
  placeholder = "Dirección sucursal...",
  store = null,
  user = null,
}: {
  form: any;
  placeholder?: string;
  hideMap?: boolean;
  store?: any;
  user?: any;
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [center, setCenter] = useState(ubicacionPorDefecto);
  const [marker, setMarker] = useState(ubicacionPorDefecto);
  const update = useStore((s) => s.update);
  const creating = useStore((s) => s.creating);
  const address = useStore((s) => s[form].address);
  const lat = useStore((s) => s[form].lat);
  const lng = useStore((s) => s[form].lng);
  const autocompleteRef = useRef(null);

  // 📍 Detectar ubicación del usuario al montar componente
  useEffect(() => {
    if (navigator.geolocation && (creating || (!lat && !lng))) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const ubicacionUsuario = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setCenter(ubicacionUsuario);
          setMarker(ubicacionUsuario);
        },
        () => {
          // Si falla el permiso, usar ubicación por defecto
          setCenter(ubicacionPorDefecto);
          setMarker(ubicacionPorDefecto);
        }
      );
    } else {
      setCenter({ lat, lng });
      setMarker({ lat, lng });
    }
  }, []);

  const reverseGeocodeLatLng = async (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0]);
        } else {
          reject(status);
        }
      });
    });
  };

  const getComp = (place, type) =>
    place.address_components.find((c) => c.types.includes(type))?.long_name ||
    "";

  const getShort = (place, type) =>
    place.address_components.find((c) => c.types.includes(type))?.short_name ||
    "";

  const getShortAddress = (place) => {
    const calle = getComp(place, "route");
    const altura = getComp(place, "street_number");
    return `${calle} ${altura}`.trim();
  };
  const updatePlaceInfo = (place) => {
    const city =
      getComp(place, "locality") ||
      getComp(place, "administrative_area_level_2") ||
      getComp(place, "neighborhood") ||
      getComp(place, "administrative_area_level_2") ||
      ""; // fallback para ciudades chicas

    const province =
      getComp(place, "administrative_area_level_1") ||
      getComp(place, "administrative_area_level_2") ||
      "";
    const country = getComp(place, "country");
    const country_code = getShort(place, "country");

    const address = getShortAddress(place);

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
    update(form, {
      address: address,
      city: city,
      province: province,
      country_name: country,
      country_code: country_code,
      lat: location.lat,
      lng: location.lng,
    });
    return location;
  };
  const onPlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry || !place?.address_components) return;

    const location = updatePlaceInfo(place);
    setCenter(location);
    setMarker(location);
  };

  const moverMarker = async (e) => {
    const nuevaUbicacion = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };

    setMarker(nuevaUbicacion);
    setCenter(nuevaUbicacion);

    // Si no hay dirección cargada, hacemos reverse geocoding

    try {
      const place: any = await reverseGeocodeLatLng(
        nuevaUbicacion.lat,
        nuevaUbicacion.lng
      );
      updatePlaceInfo(place);
    } catch (err) {
      console.error("Error obteniendo dirección:", err);
      update(form, nuevaUbicacion); // Solo guarda coords si falla
    }
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div>
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={onPlaceSelected}
        options={{
          componentRestrictions: {
            country: store?.country_code || user?.geo?.country || "AR",
          },
        }}
        className="z-[9999]"
      >
        <div className="relative">
          <Image
            src={`${CONFIG.blob_url}/map-1RFxiVx7smoDeYChcZWimSUPPigzNN.png`}
            className={`w-4 h-4 mx-0.5 absolute top-2.5 left-2 ${!lat || !lng || !address || address?.length < 4 ? "grayscale" : ""}`}
            width={16}
            height={16}
            alt="Image"
          />
          <input
            type="text"
            onFocus={() => update(form, { avoid_close: true })}
            onBlur={() => update(form, { avoid_close: false })}
            placeholder={placeholder}
            value={address}
            onChange={(e) => update(form, { address: e.target.value })}
            className="pl-8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border px-3 py-2 rounded-md w-full mb-2 placeholder:text-zinc-400 placeholder:font-light text-sm"
          />
        </div>
      </Autocomplete>

      {!hideMap && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          options={{
            streetViewControl: false, // 🔴 Oculta el "tipito amarillo"
            mapTypeControl: false, // Opcional: oculta el selector de mapa (satélite, etc.)
            fullscreenControl: false, // Opcional: oculta botón de pantalla completa
          }}
          onClick={moverMarker}
        >
          <Marker position={marker} draggable={true} onDragEnd={moverMarker} />
        </GoogleMap>
      )}
    </div>
  );
}
