import express from 'express';
import zmq from 'zeromq';

const router = express.Router();

// ZeroMQ socket configuration
const ZEROMQ_ADDRESS = process.env.ZEROMQ_ADDRESS || 'tcp://localhost:5555';

// Helper function to communicate with ZeroMQ service
async function sendZmqRequest(action, payload) {
  const sock = new zmq.Request();

  try {
    sock.connect(ZEROMQ_ADDRESS);
    console.log(`Connected to ZeroMQ service at ${ZEROMQ_ADDRESS}`);

    // Send multipart message: [action, JSON payload]
    await sock.send([action, JSON.stringify(payload)]);

    // Receive response
    const [response] = await sock.receive();
    const result = JSON.parse(response.toString());

    sock.close();
    return result;
  } catch (error) {
    console.error('ZeroMQ communication error:', error);
    sock.close();
    throw error;
  }
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Send register request to ZeroMQ service
    const result = await sendZmqRequest('register', { username, password });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Send login request to ZeroMQ service
    const result = await sendZmqRequest('login', { username, password });

    if (result.success) {
      // Optionally set session/cookie here
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
});

export default router;