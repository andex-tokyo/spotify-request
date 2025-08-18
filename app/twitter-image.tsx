import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Music Request System'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="35" stroke="#9333ea" strokeWidth="3" />
            <path
              d="M 35 45 Q 50 35, 65 45"
              stroke="#9333ea"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 35 55 Q 50 45, 65 55"
              stroke="#9333ea"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 35 65 Q 50 55, 65 65"
              stroke="#9333ea"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="8" fill="#9333ea" />
          </svg>
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Music Request System
        </div>
        <div
          style={{
            fontSize: 30,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
          }}
        >
          Private Event Application
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}