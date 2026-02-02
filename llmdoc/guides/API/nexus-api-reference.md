---
id: api-reference
type: documentation
version: 0.0.1
---

# Nexus Design System API Reference

## Installation

```bash
pnpm add @sruim/nexus-design
```

**Peer Dependencies:**
```json
{
  "react": ">=18.0.0",
  "react-dom": ">=18.0.0"
}
```

---

## Quick Start

### 1. UnoCSS Configuration

```typescript
// uno.config.ts
import { theme } from '@sruim/nexus-design';
import { defineConfig, presetUno } from 'unocss';

export default defineConfig({
  presets: [presetUno()],
  theme,
});
```

### 2. Import Styles

```typescript
// main.tsx or App.tsx
import '@sruim/nexus-design/style.css';
```

### 3. Setup Dialoger (Required for Dialog.show)

```tsx
import { Dialoger } from '@sruim/nexus-design';

function App() {
  return (
    <>
      <YourApp />
      <Dialoger />
    </>
  );
}
```

---

## Import Paths

| Path | Description |
|------|-------------|
| `@sruim/nexus-design` | All exports (UI, components, utils, theme) |
| `@sruim/nexus-design/style.css` | Global styles |

---

## UI Components

### Button

```tsx
import { Button } from '@sruim/nexus-design';
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'solid' \| 'hollow' \| 'plain'` | `'solid'` | Visual style |
| `size` | `'small' \| 'middle' \| 'large'` | `'large'` | Button size |
| `asChild` | `boolean` | `false` | Render as child element |
| `disabled` | `boolean` | `false` | Disabled state |

**Size Specs:**
- `small`: h-6, text-2.5
- `middle`: h-8, text-3
- `large`: w-56, h-10, text-3.5

```tsx
<Button variant="solid" size="large">Submit</Button>
<Button variant="hollow">Cancel</Button>
<Button variant="plain">Link</Button>
<Button asChild><a href="/home">Home</a></Button>
```

---

### Dialog

```tsx
import { Dialog, Dialoger } from '@sruim/nexus-design';
```

**Compound Components:**
- `Dialog` - Root (also standalone component)
- `Dialog.Root` - Radix Root
- `Dialog.Trigger` - Trigger element
- `Dialog.Portal` - Portal wrapper
- `Dialog.Overlay` - Backdrop overlay
- `Dialog.Content` - Content container

**Static Method:**
```tsx
Dialog.show(content: ReactNode, params?: DialogParams) => () => void
```

| Param | Type | Description |
|-------|------|-------------|
| `overlayClassName` | `string` | Custom overlay class |
| `onOpenChange` | `(open: boolean) => void` | Open state callback |
| `modal` | `boolean` | Modal behavior |

```tsx
// Declarative
<Dialog open={open} onOpenChange={setOpen}>
  <YourContent />
</Dialog>

// Imperative
const close = Dialog.show(<YourContent />);
// Later: close();
```

---

### Confirm

```tsx
import { Confirm } from '@sruim/nexus-design';
```

| Prop | Type | Description |
|------|------|-------------|
| `title` | `ReactNode` | Dialog title |
| `description` | `ReactNode` | Dialog description |
| `cancelText` | `string` | Cancel button text |
| `confirmText` | `string` | Confirm button text |
| `cancel` | `ReactNode` | Custom cancel element |
| `confirm` | `ReactNode` | Custom confirm element |
| `onCancel` | `() => void` | Cancel callback |
| `onConfirm` | `() => void` | Confirm callback |

**Static Method:**
```tsx
Confirm.show(params?: ConfirmParams) => void
```

```tsx
Confirm.show({
  title: 'Delete Item?',
  description: 'This action cannot be undone.',
  cancelText: 'Cancel',
  confirmText: 'Delete',
  onConfirm: () => deleteItem(),
});
```

---

### Select

```tsx
import { Select } from '@sruim/nexus-design';
```

**Compound Components:**
- `Select` - Root
- `Select.Trigger` - Trigger with arrow icon
- `Select.Value` - Display value
- `Select.Content` - Dropdown content (auto-portaled)
- `Select.Item` - Option item
- `Select.Group` - Option group
- `Select.Label` - Group label
- `Select.Separator` - Divider
- `Select.ScrollUpButton` - Scroll up
- `Select.ScrollDownButton` - Scroll down

```tsx
<Select value={value} onValueChange={setValue}>
  <Select.Trigger className="w-48">
    <Select.Value placeholder="Select..." />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="a">Option A</Select.Item>
    <Select.Item value="b">Option B</Select.Item>
  </Select.Content>
</Select>
```

---

### Tabs

```tsx
import { Tabs } from '@sruim/nexus-design';
```

**Compound Components:**
- `Tabs` - Root
- `Tabs.List` - Tab list container
- `Tabs.Trigger` - Tab trigger
- `Tabs.Content` - Tab panel

```tsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs>
```

---

### Popover

```tsx
import { Popover } from '@sruim/nexus-design';
```

**Compound Components:**
- `Popover` - Root
- `Popover.Trigger` - Trigger element
- `Popover.Content` - Content (sideOffset=12)
- `Popover.Portal` - Portal wrapper
- `Popover.Anchor` - Anchor element
- `Popover.Arrow` - Arrow indicator
- `Popover.Close` - Close button
- `Popover.Title` - Title with close icon

```tsx
<Popover>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Content className="p-4">
    <Popover.Title>Settings</Popover.Title>
    <p>Popover content</p>
  </Popover.Content>
</Popover>
```

---

### Tooltip

```tsx
import { Tooltip } from '@sruim/nexus-design';
```

**Compound Components:**
- `Tooltip` - Root (openDelay=0, closeDelay=200)
- `Tooltip.Trigger` - Trigger element
- `Tooltip.Content` - Content (sideOffset=12)
- `Tooltip.Portal` - Portal wrapper
- `Tooltip.Arrow` - Arrow indicator
- `Tooltip.Tips` - Preset tips icon with content

| Content Prop | Type | Default | Description |
|--------------|------|---------|-------------|
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Position |
| `sideOffset` | `number` | `12` | Offset from trigger |
| `collisionPadding` | `number` | `12` | Collision padding |

```tsx
<Tooltip>
  <Tooltip.Trigger>Hover me</Tooltip.Trigger>
  <Tooltip.Content>Tooltip text</Tooltip.Content>
</Tooltip>

// Quick tips icon
<Tooltip.Tips side="right">Help text here</Tooltip.Tips>
```

---

### Checkbox

```tsx
import { Checkbox } from '@sruim/nexus-design';
```

| Prop | Type | Description |
|------|------|-------------|
| `checked` | `boolean \| 'indeterminate'` | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | Change callback |
| `disabled` | `boolean` | Disabled state |

```tsx
<Checkbox checked={checked} onCheckedChange={setChecked} />
```

---

### Switch

```tsx
import { Switch } from '@sruim/nexus-design';
```

| Prop | Type | Description |
|------|------|-------------|
| `checked` | `boolean` | Checked state |
| `onCheckedChange` | `(checked: boolean) => void` | Change callback |
| `disabled` | `boolean` | Disabled state |

```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

---

### Slider

```tsx
import { Slider } from '@sruim/nexus-design';
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number[]` | - | Current value |
| `onValueChange` | `(value: number[]) => void` | - | Change callback |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `showValue` | `boolean` | `false` | Show input field |
| `showAuto` | `boolean` | `false` | Show "Auto" when 0 |
| `inputClassName` | `string` | - | Input field class |
| `disabled` | `boolean` | `false` | Disabled state |

```tsx
<Slider value={[50]} onValueChange={setValue} min={0} max={100} showValue />
```

---

### Progress

```tsx
import { Progress } from '@sruim/nexus-design';
```

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Progress value (0-100) |
| `indicator` | `string` | Custom indicator class |

```tsx
<Progress value={75} />
```

---

### Toggle

```tsx
import { Toggle } from '@sruim/nexus-design';
```

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'button' \| 'navigation' \| 'icon'` | Visual style |
| `pressed` | `boolean` | Pressed state |
| `onPressedChange` | `(pressed: boolean) => void` | Change callback |

```tsx
<Toggle variant="button" pressed={on} onPressedChange={setOn}>
  Bold
</Toggle>
```

---

### ToggleGroup

```tsx
import { ToggleGroup } from '@sruim/nexus-design';
```

**Compound Components:**
- `ToggleGroup` - Root
- `ToggleGroup.Item` - Toggle item

| Root Prop | Type | Description |
|-----------|------|-------------|
| `type` | `'single' \| 'multiple'` | Selection mode |
| `value` | `string \| string[]` | Selected value(s) |
| `onValueChange` | `(value) => void` | Change callback |

| Item Prop | Type | Description |
|-----------|------|-------------|
| `value` | `string` | Item value |
| `variant` | `'button' \| 'navigation' \| 'icon'` | Visual style |

```tsx
<ToggleGroup type="single" value={align} onValueChange={setAlign}>
  <ToggleGroup.Item value="left" variant="icon">L</ToggleGroup.Item>
  <ToggleGroup.Item value="center" variant="icon">C</ToggleGroup.Item>
  <ToggleGroup.Item value="right" variant="icon">R</ToggleGroup.Item>
</ToggleGroup>
```

---

### Avatar

```tsx
import { Avatar } from '@sruim/nexus-design';
```

**Compound Components:**
- `Avatar` / `Avatar.Root` - Container
- `Avatar.Image` - Image element
- `Avatar.Fallback` - Fallback content

```tsx
<Avatar className="size-10">
  <Avatar.Image src="/avatar.jpg" alt="User" />
  <Avatar.Fallback>JD</Avatar.Fallback>
</Avatar>
```

---

### Badge

```tsx
import { Badge } from '@sruim/nexus-design';
```

Positioned absolutely (top-right). Parent needs `position: relative`.

```tsx
<div className="relative">
  <Icon icon="i-nexus:bell" />
  <Badge>3</Badge>
</div>
```

---

### Drawer

```tsx
import { Drawer } from '@sruim/nexus-design';
```

**Compound Components:**
- `Drawer` - Root (shouldScaleBackground=true)
- `Drawer.Trigger` - Trigger element
- `Drawer.Portal` - Portal wrapper
- `Drawer.Overlay` - Backdrop
- `Drawer.Content` - Content (bottom sheet)
- `Drawer.Header` - Header section
- `Drawer.Title` - Title
- `Drawer.Description` - Description
- `Drawer.Footer` - Footer section
- `Drawer.Close` - Close button

```tsx
<Drawer>
  <Drawer.Trigger>Open Drawer</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Settings</Drawer.Title>
    </Drawer.Header>
    <div className="p-4">Content</div>
    <Drawer.Footer>
      <Button>Save</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>
```

---

### Form

```tsx
import { Form, useForm } from '@sruim/nexus-design';
```

**Compound Components:**
- `Form` - Root (wraps FormProvider)
- `Form.Field` - Field controller
- `Form.Item` - Field container
- `Form.Label` - Field label
- `Form.Control` - Control slot
- `Form.Description` - Help text
- `Form.Message` - Error message

**Hooks:**
- `useForm(fn, deps)` - Create form with Zod schema
- `useFormContext()` - Access form context
- `useFormField()` - Access field state

```tsx
const form = useForm((z) => ({
  resolver: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  defaultValues: { email: '', password: '' },
}));

<Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
  <Form.Field
    control={form.control}
    name="email"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Email</Form.Label>
        <Form.Control>
          <input {...field} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
  <Button type="submit">Submit</Button>
</Form>
```

---

## Composite Components

### Icon

```tsx
import { Icon } from '@sruim/nexus-design';
```

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `string` | UnoCSS icon class (e.g., `i-nexus:arrow`) |
| `className` | `string` | Additional classes |

```tsx
<Icon icon="i-nexus:arrow-monotone" className="size-5" />
```

---

### IconButton

```tsx
import { IconButton } from '@sruim/nexus-design';
```

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `string` | Icon class |
| `iconClassName` | `string` | Icon-specific class |
| `text` | `string` | Button text |
| ...ButtonProps | - | All Button props |

```tsx
<IconButton icon="i-nexus:download" text="Download" />
<IconButton icon="i-nexus:plus" variant="hollow" />
```

---

## Utilities

### cn

```tsx
import { cn } from '@sruim/nexus-design';
```

Merges class names with Tailwind conflict resolution.

```tsx
cn('px-4 py-2', condition && 'bg-blue', className)
```

---

### Helper Functions

```tsx
import { sleep, jump, download, copy, getSuffix, checkSize, checkType } from '@sruim/nexus-design';
```

| Function | Signature | Description |
|----------|-----------|-------------|
| `sleep` | `(ms: number) => Promise<void>` | Delay execution |
| `jump` | `(url: string, blank?: boolean) => void` | Navigate to URL |
| `download` | `(url: string, name?: string) => void` | Download file |
| `copy` | `(text: string, toast: string) => void` | Copy to clipboard |
| `getSuffix` | `(file: File \| string) => string` | Get file extension |
| `checkSize` | `(file: File, maxMB?: number) => boolean` | Validate file size |
| `checkType` | `(file: File, type: 'image' \| 'model') => boolean` | Validate file type |

---

## Theme Tokens

### Colors

```typescript
import { theme } from '@sruim/nexus-design';
```

| Token | Values | Usage |
|-------|--------|-------|
| `obsidian` | 100, 200, 300 | Dark backgrounds |
| `steel` | 100, 200, 300 | Light grays |
| `mist` | 100, 200, 300 | Lighter grays |
| `core.blue` | #3B82F6 | Primary accent |
| `status` | error, success, warning | Status colors |
| `surface` | primary, secondary, dim, hover | Surface colors |
| `border` | subtle, dim, focus | Border colors |
| `text` | primary, secondary, disabled, accent | Text colors |

**UnoCSS Usage:**
```tsx
<div className="bg-obsidian-100 text-text-primary border-border-subtle" />
<div className="bg-core-blue text-white" />
<div className="text-status-error" />
```

---

### Materials (Glass Effects)

```tsx
import { FrostGlass, DeepGlass, Void } from '@sruim/nexus-design';
```

| Token | Effect |
|-------|--------|
| `FrostGlass` | `backdrop-blur-12 bg-slate-900/70 border border-white/10` |
| `DeepGlass` | `backdrop-blur-12 bg-slate-950/90` |
| `Void` | `bg-obsidian-100` |

---

### Animation

| Token | Duration |
|-------|----------|
| `duration-fast` | 150ms |
| `duration-base` | 200ms |
| `duration-slow` | 300ms |
| `duration-slower` | 500ms |
| `ease-smooth` | cubic-bezier(0.4, 0, 0.2, 1) |
| `ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) |

---

## TypeScript

All components export their prop types:

```tsx
import type { ButtonProps } from '@sruim/nexus-design';
```

For Radix-based components, use:
```tsx
React.ComponentPropsWithoutRef<typeof Component>
React.ComponentRef<typeof Component>
```
