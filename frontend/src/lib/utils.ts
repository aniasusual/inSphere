import { toaster } from "@components/ui/toaster";
import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


function requestLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("Location access granted:", position);
      sessionStorage.setItem("locationEnabled", "true");
    },
    (error) => {
      console.error("Error getting location:", error.message);
      sessionStorage.setItem("locationEnabled", "false");
    }
  );
}

export async function checkLocationPermission() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.permissions.query({ name: "geolocation" }).then((result) => {
    if (result.state === "granted") {
      sessionStorage.setItem("locationEnabled", "true");
      toaster.create({
        description: "Location enabled",
        type: "success",
      })
    } else if (result.state === "prompt") {
      requestLocation();
      console.log("Location permission due");

    } else if (result.state === "denied") {
      alert("Please enable location permissions in your browser settings.");
      sessionStorage.setItem("locationEnabled", "false");
      toaster.create({
        description: "Location denied",
        type: "error",
      })

    }
  });
}

const options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
};

const updateUserLocation = async (longitude: number, latitude: number) => {

  const config = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  };

  await axios.post(
    `${import.meta.env.VITE_API_BACKEND_URL}/api/v1/user/update-user-location`,
    {
      longitude,
      latitude
    },
    config
  );

}

export const fetchCoords = async (isAuthenticated: boolean): Promise<(() => void) | undefined> => {

  try {

    if (sessionStorage.getItem("locationEnabled") !== "true") {
      toaster.create({
        title: `Please give location permission from browser`,
        description: `Location permission denied from browser`,
        type: "warning",
      })
      return undefined;
    }

    const watchId = await new Promise<number>((resolve, reject) => {
      const successCallback = (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        localStorage.setItem(
          "userCoordinates",
          JSON.stringify({ latitude, longitude })
        );
        if (isAuthenticated) {
          console.log("lode ka: ", isAuthenticated);
        }
        updateUserLocation(longitude, latitude);


        // toaster.create({
        //   title: `Location tracking successfully started`,
        //   description: `Location updated: (${latitude}, ${longitude})`,
        //   type: "success",
        // })

        resolve(position.timestamp);
      };

      const errorCallback = (error: GeolocationPositionError) => {
        console.error("Error occurred while fetching user location", error);
        reject(error);
      };

      // Start watching the user's position
      const id = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        options
      );
      resolve(id); // Resolve with the watchId
    });

    // Return a cleanup function to clear the watcher
    return () => navigator.geolocation.clearWatch(watchId);
  } catch (error) {
    console.error("Failed to fetch user location", error);
    return undefined; // Return undefined in case of an error
  }
};



