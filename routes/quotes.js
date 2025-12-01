import express from 'express';
import zmq from 'zeromq';

const router = express.Router();

const QUOTES_SERVICE_ADDRESS = process.env.QUOTES_SERVICE_ADDRESS || 'tcp://localhost:5555';

async function getQuotesFromService(quantity, category) {
  const sock = new zmq.Request();

  try {
    sock.connect(QUOTES_SERVICE_ADDRESS);

    // Send request: "{quantity} {category}"
    const message = category ? `${quantity} ${category}` : `${quantity}`;
    await sock.send(message);

    // Receive multipart response
    const response = await sock.receive();
    const quotes = [];

    for (const frame of response) {
      quotes.push(frame.toString('utf-8'));
    }

    sock.close();
    return quotes;
  } catch (error) {
    console.error('Quotes service communication error:', error);
    sock.close();
    throw error;
  }
}

// GET /quotes - Get random quotes
// Query params: quantity (default 1), category (default random)
router.get('/', async (req, res) => {
  try {
    const quantity = req.query.quantity || '1';
    const category = req.query.category || '';

    const quotes = await getQuotesFromService(quantity, category);

    return res.status(200).json({
      success: true,
      quotes: quotes
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch quotes'
    });
  }
});

export default router;
