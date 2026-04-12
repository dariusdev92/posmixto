# Buenas Prácticas del Proyecto

En este documento se recogen las convenciones técnicas base adoptadas por el equipo. Deberá ser tomado como referencia principal antes de proponer nuevos cambios arquitectónicos o de UI.

## UI y Estilos (Spartan NG & Tailwind)
- **Eliminación de Angular Material:** El proyecto migró completamente lejos de Angular Material en favor de componentes "Headless" basados en `Spartan NG`. 
- **Tailwind CSS v4:** Toda la estilización se logra mediante las utilidades nativas de Tailwind CSS. No se deben crear archivos de estilos custom (CSS) a menos que sean absolutamente fundamentales y no puedan resolverse usando clases de Tailwind.
- **SCSS Globales:** Para los archivos de pre-procesamiento SCSS es obligatorio utilizar sentencias `@use` en reemplazo de `@import`, adaptándose a las exigencias modernas del compilador de SASS y las migraciones de Bootstrap/Tailwind aplicadas.

## Ecosistema Angular 
- **Angular Reactive Forms:**
  - Cuando se modelan configuraciones complejas en los formularios se debe abusar lo menos posible de lógica manual para atar y desatar propiedades.
  - Está comprobado y es correcto utilizar rutas embebidas explícitas (e.g. `formControlName="configuration.showResult"`) en los componentes complejos (`edit-bonus-purchase`) siempre que el esquema del formulario reactive mantenga consistencia con estos sub-grupos funcionales.

## Usabilidad PWA
- Los componentes orientados a *Mobile* o de juegos (Truco, Generala, Scorekeeper, etc) deben:
  1. Utilizar un despliegue **CSS Grid** para el manejo posicional y adaptativo.
  2. Implementar un aproach minimalista: remover *labels* o márgenes innecesarios para extenderse 100% en la pantalla de visualización del usuario (Full Screen Mode).
