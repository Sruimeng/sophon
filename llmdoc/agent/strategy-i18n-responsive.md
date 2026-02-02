---
id: strategy-i18n-responsive
type: strategy
related_ids: [constitution, style-hemingway, doc-standard]
---

# Strategy: i18n + Responsive Adaptation

## 1. Context

**Current State:**
- 25+ hardcoded UI strings across 5 files (_index.tsx, PromptForm.tsx, LayerTabs.tsx, SamplingSlider.tsx, ProbabilityProgress.tsx)
- i18next configured with 7 languages (en, zh, ja, ko, es, pt, ru)
- Right panel fixed layout (absolute right-4, max-w-sm) breaks on mobile
- Bottom input bar conflicts with right panel on small screens
- Missing mobile navigation/drawer

**Complexity Assessment:**
<Assessment>
**Complexity:** Level 2 (i18n extraction is mechanical, responsive layout requires component redesign but no deep math)
</Assessment>

## 2. Constitution Compliance

**Rules of Engagement** (from Librarian):

1. **i18n Protocol:**
   - Use `useTranslation()` hook
   - Namespaced keys: `t('inference.embedding')`, `t('ui.submit')`
   - NO hardcoded strings

2. **Responsive Protocol:**
   - Mobile-first design
   - UnoCSS breakpoints: `sm:640px`, `md:768px`, `lg:1024px`
   - NO inline styles except dynamic values
   - NO hardcoded breakpoints

3. **Style Protocol** (Ref: `style-hemingway.md`):
   - Terse, early returns
   - Max 3 nesting levels
   - Type-first design
   - NO "what" comments
   - NO `any` type

4. **Forbidden:**
   - Nested ternaries > 2 levels
   - Inline fetch calls
   - Magic breakpoint numbers

## 3. Translation Key Structure

<MathSpec>
**Namespace Hierarchy:**
```
{
  inference: {
    title: "Embedding Visualization",
    embedding: "Embedding",
    reranker: "Reranker",
    submit: "Generate",
    stop: "Stop",
    clear: "Clear",
    placeholder: "Enter your prompt...",
    layers: {
      attention: "Attention",
      embedding: "Embedding",
      all: "All Layers"
    },
    sampling: {
      title: "Sampling Rate",
      tokens: "tokens"
    },
    probability: {
      title: "Token Probability",
      noData: "No data available"
    }
  },
  ui: {
    loading: "Loading...",
    error: "Error",
    retry: "Retry"
  }
}
```

**Encoding Rule:**
`hardcoded_string → namespace.key`

**Examples:**
- "Embedding Visualization" → `inference.title`
- "Attention" → `inference.layers.attention`
- "Sampling Rate: {value} tokens" → `inference.sampling.title` + interpolation
</MathSpec>

## 4. Phase 1: i18n Extraction

### 4.1 Files to Modify

**Target Files:**
1. `app/routes/inference._index/route.tsx` (main page title)
2. `app/routes/inference._index/PromptForm.tsx` (submit/stop/clear buttons, placeholder)
3. `app/routes/inference._index/LayerTabs.tsx` (layer names)
4. `app/routes/inference._index/SamplingSlider.tsx` (sampling rate label)
5. `app/routes/inference._index/ProbabilityProgress.tsx` (no data message)

**New Translation File:**
- `locales/en.json` (add `inference` namespace)
- `locales/zh.json` (add Chinese translations)
- Replicate for ja, ko, es, pt, ru

### 4.2 Pseudo-code (i18n Extraction)

```typescript
// BEFORE: PromptForm.tsx
<button>Generate</button>

// AFTER: PromptForm.tsx
const { t } = useTranslation();
<button>{t('inference.submit')}</button>

// ALGORITHM:
FUNCTION extractI18n(component):
  1. Import: const { t } = useTranslation()
  2. Find: All string literals in JSX
  3. Replace: "text" → {t('namespace.key')}
  4. Interpolation: "Rate: {value}" → {t('key', { value })}
  5. Plurals: Use i18next count syntax
END
```

## 5. Phase 2: Responsive Layout Redesign

### 5.1 Breakpoint Strategy

**Mobile-First Approach:**
```
Base (0-639px):   Drawer hidden, toggle button visible
sm (640-767px):   Drawer slides from right
md (768-1023px):  Drawer pinned, reduced width
lg (1024px+):     Full-width right panel (current design)
```

### 5.2 Component Architecture

<MathSpec>
**State Machine:**
```
MobileState = Hidden | Visible
DesktopState = Pinned

FUNCTION getDrawerState(screenWidth):
  IF width < 1024:
    RETURN { mode: 'drawer', state: MobileState }
  ELSE:
    RETURN { mode: 'panel', state: Pinned }
END

FUNCTION toggleDrawer(currentState):
  IF currentState === Hidden:
    RETURN Visible
  ELSE:
    RETURN Hidden
END
```
</MathSpec>

### 5.3 New Component: RightPanelDrawer

**Type-First Design:**
```typescript
interface RightPanelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface DrawerState {
  mode: 'drawer' | 'panel';
  isOpen: boolean;
}
```

**Pseudo-code:**
```typescript
FUNCTION RightPanelDrawer({ isOpen, onClose, children }):
  const isMobile = useMediaQuery('(max-width: 1023px)')

  IF !isMobile:
    RETURN (
      <aside class="fixed right-4 top-20 w-80">
        {children}
      </aside>
    )
  END

  RETURN (
    <Transition show={isOpen}>
      <div class="fixed inset-0 z-50">
        {/* Backdrop */}
        <div onClick={onClose} class="absolute inset-0 bg-black/50" />

        {/* Drawer */}
        <aside class="absolute right-0 top-0 h-full w-80 bg-white">
          <button onClick={onClose}>Close</button>
          {children}
        </aside>
      </div>
    </Transition>
  )
END
```

### 5.4 Bottom Input Bar Fix

**Conflict Resolution:**
```typescript
// Current: Fixed bottom bar conflicts with fixed right panel on mobile
<div class="fixed bottom-0 left-0 right-0" />

// Solution: Add padding-right on desktop
<div class="fixed bottom-0 left-0 right-0 lg:right-96" />

// RIGHT PANEL WIDTH:
const PANEL_WIDTH_LG = 384px (w-96)

// ALGORITHM:
FUNCTION calculateInputWidth(screenWidth):
  IF width >= 1024:
    RETURN `calc(100vw - ${PANEL_WIDTH_LG}px)`
  ELSE:
    RETURN '100vw'
END
```

## 6. Implementation Order

<ExecutionPlan>
**Block 1: Translation File Setup**
1. Create `locales/en.json` with `inference` namespace
2. Replicate structure for zh, ja, ko, es, pt, ru
3. Add placeholder translations (en only, others copy en for now)

**Block 2: i18n Component Migration**
4. PromptForm.tsx: Replace button text, placeholder
5. LayerTabs.tsx: Replace layer names
6. SamplingSlider.tsx: Replace label
7. ProbabilityProgress.tsx: Replace "no data" message
8. route.tsx: Replace page title

**Block 3: Responsive Component Creation**
9. Create `app/components/RightPanelDrawer.tsx`
10. Define types: `RightPanelDrawerProps`, `DrawerState`
11. Implement mobile drawer with backdrop
12. Implement desktop panel (no drawer)

**Block 4: Layout Integration**
13. Add drawer state to inference route
14. Add toggle button (hamburger icon) visible on mobile
15. Fix bottom input bar width calculation
16. Test on sm, md, lg breakpoints

**Block 5: Cleanup**
17. Remove all hardcoded strings (lint check)
18. Verify no inline breakpoint numbers
19. Check nesting depth < 3
20. Verify early returns in conditional logic
</ExecutionPlan>

## 7. Negative Constraints

**DO NOT:**
- 🚫 Add new dependencies (use existing i18next, UnoCSS)
- 🚫 Create duplicate drawer logic (reuse RightPanelDrawer)
- 🚫 Use `any` type in drawer props
- 🚫 Write inline breakpoint checks (use UnoCSS classes)
- 🚫 Leave console.log in production code
- 🚫 Add "what" comments (e.g., "// Open drawer")
- 🚫 Nest ternaries beyond 2 levels

## 8. Validation Checklist

**i18n:**
- [ ] All 5 files use `useTranslation()`
- [ ] No hardcoded UI strings remain
- [ ] Translation keys follow namespace convention
- [ ] Interpolation works for dynamic values

**Responsive:**
- [ ] Drawer opens/closes on mobile
- [ ] Panel pinned on desktop (lg breakpoint)
- [ ] Backdrop dismisses drawer
- [ ] Input bar doesn't overlap panel
- [ ] No horizontal scroll on mobile

**Style:**
- [ ] No "what" comments
- [ ] Early returns used
- [ ] Max nesting < 3
- [ ] Type-first in RightPanelDrawer
- [ ] No `any` type

## 9. Related Documentation

- Constitution: `llmdoc/reference/constitution.md`
- Style Guide: `llmdoc/reference/style-hemingway.md`
- Doc Standard: `llmdoc/guides/doc-standard.md`
- System Overview: `llmdoc/architecture/system-overview.md`
