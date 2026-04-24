import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Frete Guru Delivery"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#123D32",
          color: "#FAF7F2",
          fontFamily: "Arial, sans-serif",
          padding: 72,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "3px solid rgba(214, 228, 223, 0.28)",
            borderRadius: 42,
            padding: 58,
            background: "rgba(250, 247, 242, 0.06)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                color: "#D6E4DF",
                fontSize: 36,
                letterSpacing: 6,
              }}
            >
              DELIVERY
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 108,
                fontWeight: 700,
                lineHeight: 0.92,
              }}
            >
              Frete Guru
            </div>
            <div
              style={{
                maxWidth: 650,
                color: "#D6E4DF",
                fontSize: 38,
                lineHeight: 1.25,
              }}
            >
              Calculadora de frete e identificador de areas de cobertura
            </div>
          </div>

          <div
            style={{
              width: 278,
              height: 278,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 58,
              background: "#C8973A",
              boxShadow: "0 32px 80px rgba(0, 0, 0, 0.28)",
            }}
          >
            <svg width="184" height="168" viewBox="0 0 120 104" fill="none">
              <g stroke="#123D32" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="28" cy="78" r="18" />
                <circle cx="88" cy="78" r="18" />
                <path d="M39 78h22L44 48h22l22 30" />
                <path d="M44 48 28 78" />
                <path d="M64 48h18" />
                <path d="M70 30h18" />
                <path d="M80 30 68 48" />
              </g>
              <circle cx="96" cy="17" r="6" fill="#123D32" />
            </svg>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
