# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When structuring Angular projects or deciding where to place components. | angular-architecture | .agent/skills/angular/architecture/SKILL.md |
| When creating Angular components, using signals, or setting up zoneless. | angular-core | .agent/skills/angular/core/SKILL.md |
| When working with forms, validation, or form state in Angular. | angular-forms | .agent/skills/angular/forms/SKILL.md |
| When optimizing Angular app performance, images, or lazy loading. | angular-performance | .agent/skills/angular/performance/SKILL.md |
| When creating PRs, writing PR descriptions, or using gh CLI for pull requests. | github-pr | .agent/skills/github-pr/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI. | skill-creator | .agent/skills/skill-creator/SKILL.md |
| When styling with Tailwind - cn(), theme variables, no var() in className. | tailwind-4 | .agent/skills/tailwind-4/SKILL.md |
| When writing TypeScript code - types, interfaces, generics. | typescript | .agent/skills/typescript/SKILL.md |
| When working with Spartan UI components - Brain/Helm, @spartan-ng packages, or any headless + styled component library. | spartan-ng | .agent/skills/spartan/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### angular-architecture
- **The Scope Rule**: Components used by 1 feature live in `features/[feature]/components/`. Used by 2+ features live in `features/shared/components/`.
- **Naming**: No suffixes (`.component.ts`, `.service.ts`, `.model.ts`). Use `user-profile.ts` instead of `user-profile.component.ts`. Folder structure defines context.
- **Dependency Injection**: Use `inject()` instead of constructor injection.
- **Style**: Use `protected` for template members, `readonly` for inputs/outputs/queries. Name handlers for actions (`saveUser`) not events (`handleClick`).

### angular-core
- **Standalone**: Components are standalone by default. Do NOT set `standalone: true`. Use `imports: []` and `OnPush` strategy.
- **Inputs/Outputs**: Use function-based `input()`, `input.required()`, `output()`, and `model()`. NEVER use decorators.
- **Signals**: Use `signal()` for state and `computed()` for derived values. Use `effect()` for side effects/watching inputs.
- **Lifecycle**: Do NOT use `ngOnInit`, `ngOnChanges`, etc. Signals + `effect()` or `computed()` replace them.
- **Control Flow**: Use native `@if`, `@for` (with `track`), and `@switch`.
- **Zoneless**: Always use `provideZonelessChangeDetection()`. Remove `zone.js` from the project.

### angular-forms
- **Choice**: Use `fb.nonNullable.group()` (Reactive Forms) for production; Signal Forms (experimental) for new signal-based apps.
- **Reactive Forms**: ALWAYS use `nonNullable` for type safety. Use `getRawValue()` for typed results.
- **Signal Forms**: Use `form()`, `FormField` component, and built-in signal validators (`required`, `email`).

### angular-performance
- **Images**: ALWAYS use `NgOptimizedImage` (`ngSrc`). Set `width`/`height` or `fill`. Use `priority` for LCP images.
- **Defer**: Use `@defer` for lazy-loading components. Triggers: `on viewport`, `on interaction`, `on idle`, `on timer`.
- **Routing**: Use `loadComponent` or `loadChildren` for lazy routing.
- **Hydration**: Use `provideClientHydration()` for SSR projects.

### github-pr
- **Title**: Use conventional commits `<type>(<scope>): <short description>`.
- **Atomic**: One concept per commit. Prefer splitting giant PRs into logical pieces.
- **Description**: Must include Summary (What/Why), Changes list, and Testing checklist.
- **CLI**: Use `gh pr create` with HEREDOC for complex descriptions. Use `--draft` for WIP.

### skill-creator
- **Structure**: Skills live in `skills/{name}/` with `SKILL.md`. Optional `assets/` and `references/`.
- **Frontmatter**: Required: `name`, `description` (with Trigger), `license`, `metadata.author`, `metadata.version`.
- **Rules**: Critical patterns first. Minimal examples. Commands section. Local paths for references.
- **Registry**: After creating, add to `AGENTS.md` and update `skill-registry.md`.

### tailwind-4
- **Semantic Classes**: NEVER use `var()` or hex colors in `className`. Use Tailwind classes (e.g., `bg-primary`, `text-white`).
- **CN Utility**: Use `cn()` ONLY for conditional classes or merging props. Use plain `className` for static styles.
- **Dynamic**: Use `style` prop for truly dynamic values (e.g., width %).
- **Constants**: Use `var()` only in JS constants for libraries that don't accept classes (e.g., Recharts).

### typescript
- **Const Types**: ALWAYS define objects with `as const` and extract types from them. No direct union types.
- **Flat Interfaces**: Keep one level depth. Extract nested objects to dedicated interfaces.
- **Strict**: NEVER use `any`. Use `unknown` or generics. Use `import type` for type-only imports.
- **Guards**: Use `value is Type` guards for safe narrowing.

### spartan-ng
- **Layer Choice**: Use Helm for styled UI, Brain for headless/custom. NEVER mix Brain + Helm selectors on same element.
- **Composition**: Use hostDirectives (not manual wrapping). Always use Title in Dialog/AlertDialog.
- **Card**: Full composition — `hlmCardHeader` / `hlmCardTitle` / `hlmCardDescription` / `hlmCardContent` / `hlmCardFooter`.
- **Form Fields**: Use `HlmField` + `HlmFieldLabel` + `HlmFieldError`. NOT manual `@if` for errors.
- **Styling**: Use `hlm()` for inline, `classes()` for host. Semantic tokens (e.g., `bg-primary`) — not raw colors.
- **Icons**: Use `ng-icon[hlm]`, not raw SVGs. Components handle sizing.
- **CVA**: Use variants before custom classes (`variant="outline"` not custom Tailwind).

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | AGENTS.md | Standalone configuration |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.
