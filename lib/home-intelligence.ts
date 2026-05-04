import { ACADEMIC_EVENTS, SUBJECT_THEMES, daysUntil, getRisk } from "@/lib/academic-calendar-data"

export function getUpcomingEvents(limit = 6) {
  return ACADEMIC_EVENTS
    .filter(e => daysUntil(e.date) >= 0)
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, limit)
}

export function getRiskSummary() {
  const upcoming = getUpcomingEvents(20)

  return upcoming.reduce((acc, e) => {
    const risk = getRisk(e)
    acc[risk] = (acc[risk] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export function getMostUrgentEvent() {
  return getUpcomingEvents(1)[0] || null
}

export function getSubjectRisk() {
  const upcoming = getUpcomingEvents(30)

  return Object.keys(SUBJECT_THEMES).map(code => {
    const events = upcoming.filter(e => e.subjectCode === code)
    const totalWeight = events.reduce((a, e) => a + e.weight, 0)
    const urgent = events.filter(e => ["alto", "urgente"].includes(getRisk(e))).length

    return {
      code,
      totalWeight,
      urgent,
      next: events[0] || null,
    }
  })
}

export function generateTodayPlan() {
  const now = new Date()
  const hour = now.getHours()
  const upcoming = getUpcomingEvents(5)

  const slots =
    hour < 12
      ? [
          ["Hoy 15:00 - 16:00", "Bloque fuerte"],
          ["Hoy 18:30 - 19:10", "Repaso corto"],
          ["Hoy 21:00 - 21:25", "Cierre liviano"],
        ]
      : hour < 18
        ? [
            ["Hoy 18:30 - 19:20", "Bloque fuerte"],
            ["Hoy 21:00 - 21:30", "Repaso corto"],
          ]
        : [
            ["Hoy 21:00 - 21:35", "Repaso liviano"],
            ["Mañana 09:30 - 10:20", "Bloque fuerte"],
          ]

  return slots.map((slot, i) => {
    const ev = upcoming[i % Math.max(1, upcoming.length)]
    const theme = ev ? SUBJECT_THEMES[ev.subjectCode] : SUBJECT_THEMES.MAT1000

    return {
      time: slot[0],
      label: slot[1],
      subjectCode: ev?.subjectCode || "MAT1000",
      title: ev ? `${theme.name}: ${ev.title}` : "Repaso general",
      detail: ev ? `${ev.unit} · ${ev.weight}% · ${daysUntil(ev.date)} días` : "Sesión breve para mantener ritmo.",
      href:
        ev?.subjectCode === "MAT1000" && ev.practiceEvaluation
          ? `/practica?subject=MAT1000&evaluation=${ev.practiceEvaluation}&mode=practica`
          : "/calendario",
    }
  })
}
