import { toaster } from "@components/ui/toaster";
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



export const fetchCoords = async (options) => {
  try {
    const watchId = await new Promise((resolve, reject) => {
      const successCallback = (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Coordinates fetched successfully", { latitude, longitude });
        localStorage.setItem('userCoordinates', JSON.stringify({ latitude, longitude }));
        resolve(position);
      };

      const errorCallback = (error) => {
        console.log("Error occurred while fetching user location", error);
        reject(error);
      };

      // Start watching position with provided options
      // const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
      const id = navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);

      // Resolve the promise with the watchId
      resolve(id);
    });

    // Return a cleanup function to clear the watcher when component unmounts
    return () => navigator.geolocation.clearWatch(watchId);
  } catch (error) {
    console.log("Failed to fetch user location", error);
  }
};



