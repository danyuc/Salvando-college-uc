'use client'

type Player = {
  id: string
  nickname: string
  score: number
}

export default function KahootWheel({
  players,
  selected,
  spinning,
}: {
  players: Player[]
  selected: Player | null
  spinning: boolean
}) {
  const names = players.length ? players : [{ id: "empty", nickname: "?", score: 0 }]

  return (
    <div className="wheelWrap">
      <div className="pointer">▼</div>

      <div className={`wheel ${spinning ? "spin" : ""}`}>
        {names.map((p, i) => (
          <div
            key={p.id}
            className="sliceLabel"
            style={{
              transform: `rotate(${(360 / names.length) * i}deg) translateY(-128px)`,
            }}
          >
            {p.nickname}
          </div>
        ))}

        <div className="center">
          <span>{selected?.nickname || "?"}</span>
          <small>{selected ? "responde" : "esperando"}</small>
        </div>
      </div>

      <style jsx>{`
        .wheelWrap {
          position: relative;
          width: min(360px, 78vw);
          height: min(360px, 78vw);
          margin: 20px auto;
          display: grid;
          place-items: center;
        }

        .pointer {
          position: absolute;
          top: -18px;
          z-index: 5;
          font-size: 34px;
          color: #fde68a;
          filter: drop-shadow(0 8px 18px rgba(0,0,0,.55));
        }

        .wheel {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at center, #020617 0 26%, transparent 27%),
            conic-gradient(
              #2563eb 0deg 45deg,
              #7c3aed 45deg 90deg,
              #06b6d4 90deg 135deg,
              #22c55e 135deg 180deg,
              #facc15 180deg 225deg,
              #fb7185 225deg 270deg,
              #38bdf8 270deg 315deg,
              #a855f7 315deg 360deg
            );
          border: 14px solid rgba(255,255,255,.14);
          box-shadow:
            0 0 100px rgba(37,99,235,.38),
            inset 0 0 70px rgba(255,255,255,.14);
          overflow: hidden;
        }

        .spin {
          animation: spin 0.38s linear infinite;
        }

        .sliceLabel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: 0 0;
          color: white;
          font-size: 13px;
          font-weight: 950;
          text-shadow: 0 2px 8px rgba(0,0,0,.75);
          max-width: 88px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .center {
          position: relative;
          z-index: 4;
          width: 132px;
          height: 132px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          background: rgba(2,6,23,.96);
          border: 8px solid rgba(255,255,255,.15);
          box-shadow: 0 18px 60px rgba(0,0,0,.38);
          padding: 12px;
        }

        .center span {
          display: block;
          font-size: 24px;
          font-weight: 950;
          color: white;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .center small {
          color: #67e8f9;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-size: 10px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
