import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
          borderRadius: '112px',
        }}
      >
        <div
          style={{
            fontSize: '260px',
            fontWeight: 800,
            color: '#FFFFFF',
            fontFamily: 'sans-serif',
            letterSpacing: '-12px',
            marginLeft: '-10px',
          }}
        >
          C
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
