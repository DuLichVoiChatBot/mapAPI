import { Client, TravelMode } from "@googlemaps/google-maps-services-js";
import dotenv from 'dotenv';

dotenv.config();

interface Location {
  latitude: number;
  longitude: number;
}

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  location: { lat: number; lng: number } | undefined;
  googleMapsLink: string;
}

interface PlaceDetails extends PlaceResult {
  phone?: string;
  website?: string;
  openingHours?: string[];
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
  }>;
  photos?: string[];
}

const API_KEY = process.env.GOOGLE_API || '';
const client = new Client({});

export async function searchPlacesInDaNang(keyword: string) {
  console.log(API_KEY);
  try {
    const response = await client.textSearch({
      params: {
        query: `${keyword} in Da Nang`,
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK' && response.data.results) {
      return response.data.results.map(place => ({
        placeId: place.place_id ?? '',
        name: place.name ?? '',
        address: place.formatted_address,
        rating: place.rating ?? 0,
        location: place.geometry?.location,
        googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id ?? ''}`,
      }));
    } else {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

export async function getPlaceDetails(placeId: string) {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK' && response.data.result) {
      const place = response.data.result;
      return {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        rating: place.rating,
        location: place.geometry?.location,
        phone: place.formatted_phone_number,
        website: place.website,
        openingHours: place.opening_hours?.weekday_text,
        reviews: place.reviews?.map(review => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
        })),
        photos: place.photos?.map(photo => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${API_KEY}`),
        googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      };
    } else {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
}
/**
 * Hàm helper để lấy chỉ đường từ điểm bắt đầu đến điểm kết thúc
 * @param {Object} start - Điểm bắt đầu {latitude, longitude}
 * @param {Object} end - Điểm kết thúc {latitude, longitude}
 * @returns {Promise<Object>} Thông tin về tuyến đường
 */
export async function getDirections(start: Location, end: Location): Promise<object> {
  try {
    const response = await client.directions({
      params: {
        origin: `${start.latitude},${start.longitude}`,
        destination: `${end.latitude},${end.longitude}`,
        mode: TravelMode.driving,
        key: API_KEY,
      }
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];

      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        steps: leg.steps.map(step => ({
          distance: step.distance.text,
          duration: step.duration.text,
          instructions: step.html_instructions,
          polyline: step.polyline.points
        })),
        overviewPolyline: route.overview_polyline.points
      };
    } else {
      throw new Error('No routes found or invalid response');
    }
  } catch (error) {
    console.error('Error getting directions:', error);
    throw error;
  }
}

export async function getNearbyTouristPlaces(location: Location, radius = 5000) {
  try {
    const response = await client.placesNearby({
      params: {
        location: `${location.latitude},${location.longitude}`,
        radius: radius,
        type: 'restaurant,cafe,bar,hotel',
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK' && response.data.results) {
      return response.data.results.slice(0, 5).map(place => ({
        placeId: place.place_id,
        name: place.name,
        address: place.vicinity,
        rating: place.rating || 0,
        location: place.geometry?.location,
        googleMapsLink: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      }));
    } else {
      throw new Error(`Google Places API error: ${response.data.status}`);
    }
  } catch (error) {
    console.error('Error getting nearby tourist places:', error);
    throw error;
  }
}

export async function getNearByKeyWord(keyword: string, radius = 5000) {
  try {
    const res = await searchPlacesInDaNang(keyword);

    if (res.length === 0) {
      return [];
    }

    const place = res[0];
    const location = {
      latitude: place.location?.lat || 0,
      longitude: place.location?.lng || 0,
    }
    const responseNear = await getNearbyTouristPlaces(location, radius);

    return {place, near: responseNear};
  } catch (error) {
    console.error('Error getting nearby places:', error);
    throw error;
  }
}