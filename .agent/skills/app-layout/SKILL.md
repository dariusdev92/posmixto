---
name: app-layout
description: >
  Angular app layout patterns: app shell, layout structure, routing integration.
  Trigger: When creating app shells, layout components, or configuring application routing with layouts.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## What is a Layout

A layout (or app shell) is the **root container** that wraps all application content. It typically includes:

- Header / Navigation
- Main content area (router outlet)
- Footer
- Sidebar (optional)

> Layout is **NOT** a feature — it's app infrastructure. It should be in its own folder, not in `features/`.

## Layout Placement

Per the **Scope Rule**, layouts are **app-wide singletons**:

| Usage | Placement |
|-------|-----------|
| App layout (1 app) | `layout/` in root |
| Multiple layouts | `layout/public/`, `layout/auth/` |

```
src/app/
├── layout/                    ← Layout components
│   ├── layout.ts             ← Main shell (app-shell)
│   ├── header.ts
│   ├── sidebar.ts
│   └── footer.ts
├── core/
│   └── services/
├── features/
│   └── ...
└── app.routes.ts
```

## Layout Structure

```typescript
// layout/layout.ts
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  template: `
    <app-header />
    <div class="app-container">
      <app-sidebar />
      <main class="content">
        <router-outlet />
      </main>
    </div>
    <app-footer />
  `
})
export class Layout {}
```

## Layout + Routing

### Option 1: Layout in Routes (parent route)

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: Layout,           // Parent wraps children
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then(m => m.Home) },
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/routes').then(m => m.routes) },
    ]
  },
  {
    path: 'auth',
    component: AuthLayout,        // Different layout for auth routes
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.Login) },
    ]
  }
];
```

### Option 2: Dual Layout Pattern

```typescript
export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [...protectedRoutes]
  },
  {
    path: '',
    component: PublicLayout,
    children: [...publicRoutes]
  }
];
```

## When to Use Multiple Layouts

| Use Case | Layout |
|----------|--------|
| Auth required | AuthLayout (with sidebar) |
| Public pages | PublicLayout (no auth needed) |
| Full-screen (modal) | ModalLayout (no header/footer) |

Example dual layout structure:

```
layout/
├── layout.ts              // Main (authenticated)
├── public/
│   └── public-layout.ts  // Landing pages
└── auth/
    └── auth-layout.ts     // Login/register
```

## Best Practices

### DO
- **Lazy load the layout** if possible
- Use signals for layout state (sidebar open/closed, theme)
- Put layout in its own folder (`layout/`)
- Use single `<router-outlet />` for content

### DON'T
- Don't put layout in `shared/` — it's not "shared between features"
- Don't create multiple layouts for small differences — use signals instead
- Don't hardcode routes in layout template — use `routerLink`

## Layout State with Signals

```typescript
export class Layout {
  readonly sidebarOpen = signal(true);
  readonly theme = signal<'light' | 'dark'>('light');

  toggleSidebar() {
    this.sidebarOpen.update(v => !v());
  }
}
```

```html
<button (click)="toggleSidebar()">
  @if (sidebarOpen()) { Close } @else { Open }
</button>
```

## Keywords

layout, app shell, router outlet, layout routing, shell component