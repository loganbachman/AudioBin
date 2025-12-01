import express from 'express';
import zmq from 'zeromq';

const router = express.Router();

const DATA_SAVER_ADDRESS = process.env.DATA_SAVER_ADDRESS || 'tcp://localhost:5556';

async function sendDataSaverRequest(payload) {
  const sock = new zmq.Request();

  try {
    sock.connect(DATA_SAVER_ADDRESS);

    await sock.send(JSON.stringify(payload));

    const [response] = await sock.receive();
    const result = response.toString();

    sock.close();
    return result;
  } catch (error) {
    console.error('Data Saver communication error:', error);
    sock.close();
    throw error;
  }
}

// POST /favorites - Add album to favorites
router.post('/', async (req, res) => {
  try {
    const { userId, spotifyId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    if (!spotifyId) {
      return res.status(400).json({
        success: false,
        error: 'spotifyId is required'
      });
    }

    // Get current favorites
    const getAllResponse = await sendDataSaverRequest({ action: 'get_all' });
    let allData = JSON.parse(getAllResponse);

    // Find this user's favorites (convert userId to number for comparison)
    let userFavorites = allData.find(item => item.userId === parseInt(userId) && item.type === 'favorites');

    if (!userFavorites) {
      // Create new favorites entry for this user
      userFavorites = {
        userId: userId,
        type: 'favorites',
        spotifyIds: [spotifyId]
      };
      await sendDataSaverRequest({
        action: 'save',
        data: userFavorites
      });
    } else {
      // Check if already favorited
      if (userFavorites.spotifyIds.includes(spotifyId)) {
        return res.status(200).json({
          success: true,
          message: 'Already in favorites'
        });
      }

      // Add to favorites - need to delete old and save new
      const userIndex = allData.findIndex(item => item.userId === parseInt(userId) && item.type === 'favorites');
      await sendDataSaverRequest({
        action: 'delete',
        index: userIndex
      });

      userFavorites.spotifyIds.push(spotifyId);
      await sendDataSaverRequest({
        action: 'save',
        data: userFavorites
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /favorites/:spotifyId - Remove album from favorites
router.delete('/:spotifyId', async (req, res) => {
  try {
    const { userId } = req.query;
    const { spotifyId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Get current favorites
    const getAllResponse = await sendDataSaverRequest({ action: 'get_all' });
    let allData = JSON.parse(getAllResponse);

    // Find this user's favorites (convert userId to number for comparison)
    const userIndex = allData.findIndex(item => item.userId === parseInt(userId) && item.type === 'favorites');

    if (userIndex === -1) {
      return res.status(200).json({
        success: true,
        message: 'Not in favorites'
      });
    }

    const userFavorites = allData[userIndex];

    // Remove the spotifyId
    const spotifyIndex = userFavorites.spotifyIds.indexOf(spotifyId);
    if (spotifyIndex === -1) {
      return res.status(200).json({
        success: true,
        message: 'Not in favorites'
      });
    }

    // Delete old entry
    await sendDataSaverRequest({
      action: 'delete',
      index: userIndex
    });

    // Remove the album and save back if there are still favorites
    userFavorites.spotifyIds.splice(spotifyIndex, 1);

    if (userFavorites.spotifyIds.length > 0) {
      await sendDataSaverRequest({
        action: 'save',
        data: userFavorites
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /favorites - Get all favorites for a user
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Get all data from microservice
    const getAllResponse = await sendDataSaverRequest({ action: 'get_all' });
    let allData = JSON.parse(getAllResponse);

    // Find this user's favorites (convert userId to number for comparison)
    const userFavorites = allData.find(item => item.userId === parseInt(userId) && item.type === 'favorites');

    if (!userFavorites) {
      return res.status(200).json({
        success: true,
        favorites: []
      });
    }

    return res.status(200).json({
      success: true,
      favorites: userFavorites.spotifyIds || []
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
