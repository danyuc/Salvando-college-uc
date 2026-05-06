'use client'

export default function AtmosphereGlow() {
  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-red-500/10 pointer-events-none z-[1]" />

      <div
        className="fixed top-0 left-0 w-full h-72 blur-3xl opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255,120,120,.5), transparent 70%)',
        }}
      />
    </>
  )
}
