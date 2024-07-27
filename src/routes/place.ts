import express from "express";
import { getDirections, getNearByKeyWord, getPlaceDetails, searchPlacesInDaNang } from "../helper/place";

const router = express.Router();

router.get("/search", async (req, res) => {
  const keyword = req.query.keyword as string;
  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const places = await searchPlacesInDaNang(keyword);
    res.json(places);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/details/:placeId", async (req, res) => {
  const placeId = req.params.placeId;

  try {
    const placeDetails = await getPlaceDetails(placeId);
    res.json(placeDetails);
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/directions', async (req, res) => {
  try {
    const start = {
      latitude: parseFloat(req.query.startLat as string),
      longitude: parseFloat(req.query.startLng as string)
    };
    const end = {
      latitude: parseFloat(req.query.endLat as string),
      longitude: parseFloat(req.query.endLng as string)
    };

    const directions = await getDirections(start, end);
    res.json(directions);
    
  } catch (error) {
    console.error('Error in directions route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get("/near", async (req, res) => {
  const keyword = req.query.keyword as string;
  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const places = await getNearByKeyWord(keyword);
    res.json(places);
  } catch (error) {
    console.error('Error searching places:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;