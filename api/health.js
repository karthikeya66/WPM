// Health check endpoint for Render
export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'catalyst-neo-core'
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}