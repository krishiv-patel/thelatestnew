const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'No token provided' });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const data = response.data;

    if (data.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Turnstile verification failed',
        errorCodes: data['error-codes'],
      });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}; 