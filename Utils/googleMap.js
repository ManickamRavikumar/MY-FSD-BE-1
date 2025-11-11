import axios from "axios";
import { googleConfig } from "../Config/googleConfig.js";

export const getAddressFromCoords = async (lat, lon) => {
  try {
    const apiKey = googleConfig.apiKey;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;
    const { data } = await axios.get(url);

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      return "Unknown location";
    }
  } catch (error) {
    console.error("Google Maps API error:", error.message);
    return "Address not found";
  }
};
