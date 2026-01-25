export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json({ 
            error: 'URL parameter is required',
            usage: '/api/proxy?url=https://example.com/api'
        });
    }

    try {
        console.log('Proxying request to:', url);
        
        // Headers yang meniru browser dari Asia/Indonesia
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Origin': 'https://dramabos.asia',
            'Referer': 'https://dramabos.asia/',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Connection': 'keep-alive',
            // Tambahan header untuk bypass geo-block
            'X-Forwarded-For': '103.28.36.6', // IP Indonesia
            'X-Real-IP': '103.28.36.6',
            'CF-Connecting-IP': '103.28.36.6'
        };

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            timeout: 15000
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            console.log('Response not OK:', response.status, response.statusText);
            const errorText = await response.text();
            console.log('Error response:', errorText);
            
            return res.status(response.status).json({ 
                error: `HTTP ${response.status}: ${response.statusText}`,
                details: errorText
            });
        }
        
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Success response:', data);
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(data);
        } else {
            const text = await response.text();
            res.setHeader('Content-Type', 'text/plain');
            res.status(200).send(text);
        }
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Proxy request failed',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
