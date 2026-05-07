'use client'

export default function DomainAnimator({ question }: any) {
  return (
    <div className="mathCard">
      <div className="step">
        <span>Paso 1</span>
        <h3>El interior de una raíz par debe ser ≥ 0</h3>
        <code>5 - |8-x| ≥ 0</code>
      </div>

      <div className="step">
        <span>Paso 2</span>
        <h3>Aislamos el valor absoluto</h3>
        <code>|8-x| ≤ 5</code>
      </div>

      <div className="step">
        <span>Paso 3</span>
        <h3>Transformamos en doble desigualdad</h3>
        <code>-5 ≤ 8-x ≤ 5</code>
      </div>

      <div className="step">
        <span>Paso 4</span>
        <h3>Despejamos x</h3>
        <code>3 ≤ x ≤ 13</code>
      </div>

      <div className="interval">
        <div className="line"></div>
        <div className="segment"></div>
        <div className="dot left"></div>
        <div className="dot right"></div>
        <label className="l1">3</label>
        <label className="l2">13</label>
      </div>

      <style jsx>{`
        .mathCard{
          padding:20px;
          border-radius:24px;
          background:linear-gradient(135deg,#0f172a,#172554);
          border:1px solid rgba(255,255,255,.08);
        }

        .step{
          margin-bottom:18px;
          animation:fade .5s ease;
        }

        span{
          color:#93c5fd;
          font-weight:900;
          text-transform:uppercase;
          font-size:12px;
        }

        h3{
          color:white;
          margin:6px 0;
        }

        code{
          display:block;
          padding:14px;
          border-radius:14px;
          background:rgba(255,255,255,.06);
          color:#f8fafc;
          font-size:22px;
          font-weight:900;
        }

        .interval{
          position:relative;
          height:70px;
          margin-top:20px;
        }

        .line{
          position:absolute;
          top:32px;
          left:20px;
          right:20px;
          height:4px;
          background:#64748b;
        }

        .segment{
          position:absolute;
          top:32px;
          left:90px;
          right:90px;
          height:4px;
          background:#38bdf8;
        }

        .dot{
          width:16px;
          height:16px;
          border-radius:50%;
          background:#38bdf8;
          position:absolute;
          top:26px;
        }

        .left{ left:82px; }
        .right{ right:82px; }

        label{
          position:absolute;
          color:white;
          font-weight:800;
          top:45px;
        }

        .l1{ left:78px; }
        .l2{ right:74px; }

        @keyframes fade{
          from{opacity:0;transform:translateY(10px)}
          to{opacity:1;transform:none}
        }
      `}</style>
    </div>
  )
}
