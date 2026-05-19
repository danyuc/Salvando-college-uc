"use client"

export default function AnimatedAirParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={index}
          className="air-particle"
          style={{
            left: `${(index * 17) % 100}%`,
            top: `${(index * 29) % 100}%`,
            animationDelay: `${index * 0.25}s`,
            transform: `scale(${0.55 + (index % 5) * 0.18})`,
          }}
        />
      ))}

      <style jsx>{`
        .air-particle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(125, 211, 252, .34);
          box-shadow: 0 0 28px rgba(45, 212, 191, .34);
          animation: float-air 9s ease-in-out infinite alternate;
        }

        @keyframes float-air {
          from {
            opacity: .22;
            translate: -16px 8px;
          }
          to {
            opacity: .72;
            translate: 22px -28px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .air-particle {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
