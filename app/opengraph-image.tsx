import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Dad Aura - Track dad performance through emoji-powered aura points';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 120,
            marginBottom: 20,
          }}
        >
          🔥
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 16,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          Dad Aura
        </div>
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Track dad performance through emoji-powered aura points
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

