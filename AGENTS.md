# Salvando College UC - Codex instructions

## Architecture rules
- CRSH is only for environmental sensors, Sensor 71, semáforo, dashboards and institutional presentation.
- IPRE2 is only for capsules, classroom sessions, ranking and camera/manual hand-count.
- Pre Cálculo MAT1000 stays in /precalculo-full.
- Psychology stays only in /practica/psicologia.
- Do not mix modules.

## Safety
- Do not expose access codes in UI.
- Do not modify .env.local.
- Do not commit or push.
- Run npm run build before finishing.
- Do not invent Psychology content.
- If Psychology source material is missing, mark it as "falta fuente" or "requires confirmation".

## Quality
- Fix sidebar contrast only with scoped [data-app-sidebar] CSS.
- Use subject-specific backgrounds:
  - Pre Cálculo: math symbols, graphs, formulas, coordinate grid.
  - Psychology: brain, neurons, cognition, memory nodes.
  - CRSH: air particles, sensors, semáforo.
  - IPRE2: classroom, capsule, projection.
