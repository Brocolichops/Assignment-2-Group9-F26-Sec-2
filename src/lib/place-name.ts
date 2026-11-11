import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const PLACE_CACHE_PREFIX = "trip-place:";

function getPlaceCacheKey(latitude: number, longitude: number): string {
  return `${PLACE_CACHE_PREFIX}${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

export async function getPlaceName(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const cacheKey = getPlaceCacheKey(latitude, longitude);
  let cachedName: string | null = null;
  try {
    cachedName = await AsyncStorage.getItem(cacheKey);
  } catch (error) {
    console.warn("Unable to read the cached trip place name:", error);
  }

  if (cachedName !== null) {
    return cachedName || null;
  }

  const [address] = await Location.reverseGeocodeAsync({
    latitude,
    longitude,
  });

  const locality = [
    address?.city,
    address?.district,
    address?.subregion,
    address?.region,
  ].find((part) => part?.trim())?.trim();
  const placeName = locality
    ? [locality, address?.region, address?.country]
        .filter((part, index, parts) => part && parts.indexOf(part) === index)
        .join(", ")
    : null;

  try {
    await AsyncStorage.setItem(cacheKey, placeName ?? "");
  } catch (error) {
    console.warn("Unable to cache the resolved trip place name:", error);
  }

  return placeName;
}
