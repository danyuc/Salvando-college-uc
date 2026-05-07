'use client'

export default function CompositionAnimator() {
  return (
    <div className="wrap">
      <div className="box">
        <span>Función externa</span>
        <code>f(x)=x²+1</code>
      </div>

      <div className="arrow">↓</div>

      <div className="box">
        <span>Sustituimos x por g(x)</span>
        <code>f(g(x))=(g(x))²+1</code>
      </div>

      <div className="arrow">↓</div>

      <div className="box final">
        <span>Resultado</span>
        <code>((x-3)/x)²+1</code>
      </div>

      <style jsx>{`
        .wrap{
          padding:20px;
          border-radius:24px;
          background:linear-gradient(135deg,#111827,#1e3a8a);
          border:1px solid rgba(255,255,255,.08);
        }

        .box{
          padding:18px;
          border-radius:18px;
          background:rgba(255,255,255,.06);
          margin-bottom:12px;
          animation:show .45s ease;
        }

        span{
          display:block;
          color:#93c5fd;
          font-weight:900;
          margin-bottom:8px;
          text-transform:uppercase;
          font-size:12px;
        }

        code{
          color:white;
          font-size:28px;
          font-weight:900;
        }

        .arrow{
          text-align:center;
          color:#38bdf8;
          font-size:34px;
          font-weight:900;
        }

        .final{
          border:1px solid rgba(56,189,248,.35);
        }

        @keyframes show{
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:none}
        }
      `}</style>
    </div>
  )
}
