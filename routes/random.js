import express from 'express';
import zmq from 'zeromq';

const router = express.Router();

const RANDOM_SERVICE_ADDRESS = process.env.RANDOM_SERVICE_ADDRESS || 'tcp://localhost:5558';

async function getRandomNumber() {
  const sock = new zmq.Request();

  try {
    sock.connect(RANDOM_SERVICE_ADDRESS);

    // Send request, microservice expects "generate" command
    await sock.send('generate');

    // Receive response
    const [response] = await sock.receive();
    const randomNum = parseInt(response.toString());

    sock.close();
    return randomNum;
  } catch (error) {
    console.error('Random service communication error:', error);
    sock.close();
    throw error;
  }
}

// GET a random number from microservice
router.get('/', async (req, res) => {
  try {
    const randomNumber = await getRandomNumber();

    return res.status(200).json({
      success: true,
      number: randomNumber
    });
  } catch (error) {
    console.error('Get random number error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch random number'
    });
  }
});

export default router;
