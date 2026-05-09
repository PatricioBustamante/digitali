# Digitali · Design System

Sistema de design tokens basado en una **rejilla de 8px**, con sub-grid de 4px reservado para tipografía e iconografía. Single source of truth para colores, tipografía, espaciado, radios y componentes.

```
design-system/
├── tokens/
│   ├── tokens.css     # CSS custom properties
│   ├── tokens.json    # DTCG-style JSON (Figma / Style Dictionary)
│   └── tokens.ts      # TypeScript exports + helpers
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Stack.tsx
│   ├── Examples.tsx
│   └── index.ts
├── scripts/
│   ├── validate-grid.ts    # ejecutable con tsx
│   └── validate-grid.mjs   # ejecutable con node (sin build)
└── docs/
    └── (espacio para Storybook, Figma config, etc.)
```

---

## 1. La rejilla

| Concepto        | Valor           | Uso                                                                                                          |
| --------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Base grid**   | 8px             | Toda spacing y dimensión de componente                                                                       |
| **Sub-grid**    | 4px             | Solo tipografía (font-size, line-height) e iconos pequeños                                                   |
| **Excepciones** | 12px en padding | Permitido cuando rompe el grid de 8 pero mantiene ritmo en altura total múltiplo de 8 (ej. botón 40 = 8 × 5) |

**Regla de oro:** la **altura total** de cualquier elemento debe ser múltiplo de 8.
Un botón con `padding-y: 12` y `font-size: 16` da `12 + 16 + 12 = 40px ✓`.

---

## 2. Spacing scale

| Token | Valor | Múltiplo        |
| ----- | ----- | --------------- |
| `2xs` | 4px   | 0.5× (sub-grid) |
| `xs`  | 8px   | 1×              |
| `sm`  | 16px  | 2×              |
| `md`  | 24px  | 3×              |
| `lg`  | 32px  | 4×              |
| `xl`  | 40px  | 5×              |
| `2xl` | 48px  | 6×              |
| `3xl` | 56px  | 7×              |
| `4xl` | 64px  | 8×              |
| `5xl` | 80px  | 10×             |
| `6xl` | 96px  | 12×             |

```css
.example {
  padding: var(--space-md);
  gap: var(--space-sm);
}
```

```tsx
import { Stack } from "./design-system/components";
<Stack gap="md" padding="lg">
  …
</Stack>;
```

---

## 3. Tipografía

Tamaños y line-heights en pasos de **4px** (siempre componen al grid de 8 al apilarse en pares).

| Token | font-size | line-height sugerido |
| ----- | --------- | -------------------- |
| `xs`  | 12        | 16                   |
| `sm`  | 14        | 20                   |
| `md`  | 16        | 24                   |
| `lg`  | 18        | 24                   |
| `xl`  | 20        | 28                   |
| `2xl` | 24        | 32                   |
| `3xl` | 32        | 40                   |
| `4xl` | 40        | 48                   |
| `5xl` | 48        | 56                   |

Letter spacing: `-0.5px` (display) · `0` (default) · `0.5px` (UI labels) · `1px` (uppercase eyebrows).

---

## 4. Componentes (todos sobre el grid)

| Componente | Altura | Padding | Radius |
| ---------- | ------ | ------- | ------ |
| `Button`   | 40     | 12 × 16 | 8      |
| `Card`     | —      | 24      | 8      |
| `Input`    | 40     | 8 × 12  | 8      |
| `Badge`    | 24     | 4 × 8   | 4      |

```tsx
import { Button, Card, Input, Badge, Stack } from "./design-system/components";

<Card title="Login">
  <Stack gap="sm">
    <Input placeholder="Email" />
    <Input placeholder="Password" type="password" />
    <Button variant="primary">Sign in</Button>
  </Stack>
</Card>;
```

---

## 5. Cómo consumir los tokens

### CSS (HTML plano)

```html
<link rel="stylesheet" href="design-system/tokens/tokens.css" />
```

```css
.my-card {
  padding: var(--card-padding);
  border-radius: var(--card-radius);
  font-size: var(--fs-md);
  line-height: var(--lh-md);
}
```

### TypeScript / React

```ts
import tokens, {
  spacing,
  fontSize,
  components,
  px,
} from "./design-system/tokens/tokens";

const styles = {
  padding: px(spacing.md),
  fontSize: px(fontSize.md),
  height: px(components.button.height),
};
```

### Figma / Style Dictionary

`tokens.json` sigue el draft DTCG (Design Tokens Community Group). Cárgalo con:

- **Tokens Studio for Figma** (importa JSON nativamente).
- **Style Dictionary** para transformar a Android/iOS/etc.

---

## 6. Validación del grid

Cualquier token nuevo debe pasar el validador antes de mergear.

```bash
# sin build (lee tokens.json):
node design-system/scripts/validate-grid.mjs

# con tsx (lee tokens.ts directamente):
npx tsx design-system/scripts/validate-grid.ts
```

El validador clasifica cada token en tres niveles:

- `✓ OK` — múltiplo de 8 (preferido)
- `◐ HALF` — múltiplo de 4 (aceptado en tipografía y casos puntuales)
- `✗ FAIL` — no alineado, **rompe el sistema**

**Exit code 1** si hay violaciones — ideal para CI.

### Ejemplos

```ts
// ✓ OK
{ padding: 24, height: 40, gap: 16 }

// ◐ HALF (aceptable en typography)
{ fontSize: 14, lineHeight: 20 }

// ✗ FAIL
{ padding: 13, height: 37, margin: 7 }
```

---

## 7. Reglas de uso para developers

1. **No uses pixeles literales** en estilos. Siempre vía token.
2. **No inventes valores intermedios**. Si un caso pide 18px de padding, evalúa si encaja en 16 o 24 — y si genuinamente no encaja, propón añadir el token a `tokens.ts` (no lo hardcodees).
3. **Componentes son contratos**: si ajustas la altura de un Input, ajusta el token, no el callsite.
4. **CI debe correr `validate-grid`** en cada PR que toque tokens.
5. **Cada nuevo componente** debe documentar su altura total y demostrar que es múltiplo de 8.

---

## 8. Sincronización con la web actual

El sitio principal (`css/tokens.css`) usa los mismos nombres de tokens que este sistema, pero conserva su escala con `rem` para mantener compatibilidad visual con el diseño existente. La migración total a la escala `px` del design system se hará paulatinamente sección por sección.

## 9. Especificaciones de desarrollo

1. Formulario, no permitir generar multiples peticiones de mensaje automatizados para realizar una caida forzosa de la web por numero de peticiones.

2. Posibilida de poder integrar CMS para administrar contenido.

3. Que el formulario este apuntado a un mail determinado con los mensajes de contacto.
