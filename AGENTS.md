# Project Configuration: AI Agent

Este archivo define las reglas y comportamientos para el desarrollo en este proyecto. Aplica a cualquier agente de IA (Claude, Gemini, OpenAI, Cursor, etc.).

## Skills Disponibles

Las skills están localizadas en `.agent/skills/`. El agente debe usarlas automáticamente según el contexto de la tarea.

| Contexto | Skill |
|---------|-------|
| Desarrollo Angular frontend | `.agent/skills/angular/` |
| Layout y app shell | `.agent/skills/app-layout/` |
| Componentes Spartan UI | `.agent/skills/spartan/` |
| Estilos con Tailwind CSS | `.agent/skills/tailwind-4/` |
| Código TypeScript | `.agent/skills/typescript/` |
| Crear Pull Requests | `.agent/skills/github-pr/` |
| Crear nuevas skills | `.agent/skills/skill-creator/` |

## Código

- **Código en inglés** — nombres de variables, funciones, clases, etc.
- **Comentarios en español** — para documentar el propósito, lógica de negocio, etc.

## Persistencia

- Todas las decisiones arquitectónicas y nuevos patrones deben guardarse en **Engram** (`mem_save`).
- El registro de habilidades en `.atl/skill-registry.md` debe mantenerse actualizado.