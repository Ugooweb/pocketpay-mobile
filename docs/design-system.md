# PocketPay Design System

A practical style guide for contributors adding screens and components to Stellar PocketPay. All design tokens live in `src/constants/theme.ts`. Import them instead of hardcoding values.

```ts
import { COLORS, SIZES, RADIUS, FONTS } from '../constants/theme';
```

---

## Colour Palette

The app uses a premium dark-only palette inspired by fintech and crypto wallets. There is no light theme — the UI is always dark.

### Backgrounds

| Token | Hex | Use |
|---|---|---|
| `COLORS.background` | `#0B0D17` | Screen background, page root |
| `COLORS.surface` | `#15192B` | Cards, modals, list containers |
| `COLORS.surfaceLight` | `#1E243D` | Elevated surfaces, disabled button fills |

Screens always set `backgroundColor: COLORS.background`. Cards sit on top using `COLORS.surface`.

### Accents

| Token | Hex | Use |
|---|---|---|
| `COLORS.primary` | `#00E5FF` | Primary actions, active tab, links, focus rings |
| `COLORS.primaryDark` | `#00B8CC` | Pressed/active state of primary |
| `COLORS.secondary` | `#7B61FF` | Secondary actions, "Receive" button, alternating accents |

Use `COLORS.primary` for the most important action on a screen. Use `COLORS.secondary` for a second competing action (e.g. Send / Receive side by side).

### Status Colours

| Token | Hex | Use |
|---|---|---|
| `COLORS.success` | `#00E676` | Received funds, confirmation states, positive info banners |
| `COLORS.error` | `#FF3D00` | Sent funds, destructive actions, validation errors |
| `COLORS.warning` | `#FFC400` | Warning banners (e.g. secret key exposure) |

Status colours are also used at reduced opacity for icon container backgrounds:

```ts
// Icon tint backgrounds — 10% opacity
backgroundColor: 'rgba(0, 230, 118, 0.1)'  // success tint
backgroundColor: 'rgba(255, 61, 0, 0.1)'   // error tint
backgroundColor: 'rgba(0, 229, 255, 0.1)'  // primary tint
backgroundColor: 'rgba(255, 196, 0, 0.1)'  // warning tint
```

### Text

| Token | Hex | Use |
|---|---|---|
| `COLORS.textPrimary` | `#FFFFFF` | Headings, primary body text, values |
| `COLORS.textSecondary` | `#A0AABF` | Labels, subtitles, supporting text |
| `COLORS.textMuted` | `#637087` | Placeholder text, timestamps, footer copy |

### Borders

| Token | Hex | Use |
|---|---|---|
| `COLORS.border` | `#2A314A` | Card borders, input borders, dividers |

---

## Typography

The app uses the system font (`'System'`) which resolves to San Francisco on iOS and Roboto on Android. No custom fonts are loaded.

### Scale

| Role | fontSize | fontWeight | Colour |
|---|---|---|---|
| Screen title | `28` | `'bold'` | `textPrimary` |
| Balance / hero value | `32–36` | `'bold'` | `textPrimary` |
| Section title | `18` | `'600'` | `textPrimary` |
| Card title | `16–20` | `'bold'` or `'600'` | `textPrimary` |
| Body / list item | `16` | `'500'` or normal | `textPrimary` |
| Label (above input) | `14` | `'500'` | `textSecondary` |
| Supporting / subtitle | `14` | normal | `textSecondary` |
| Caption / timestamp | `12` | normal | `textSecondary` or `textMuted` |
| Micro (footer, pill) | `12` | normal | `textMuted` |

### Section headers

Section headers in settings use uppercase + letter-spacing to create visual separation:

```ts
{
  fontSize: 14,
  fontWeight: '500',
  color: COLORS.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: 1,
}
```

### Button labels

Button text is `fontSize: 16`, `fontWeight: '600'`, `letterSpacing: 0.5`.

### Monospace / Key display

Public and secret keys are displayed in the default system font at `fontSize: 14`. Secret keys use `COLORS.error` and `fontWeight: 'bold'` to visually communicate their sensitivity.

---

## Spacing

All spacing comes from the `SIZES` scale. Do not use arbitrary pixel values.

| Token | Value | Typical use |
|---|---|---|
| `SIZES.xs` | `4` | Tight gaps, small margins between adjacent labels |
| `SIZES.sm` | `8` | Gap between label and value, icon margin |
| `SIZES.md` | `16` | Inner card padding, gap between inputs |
| `SIZES.lg` | `24` | Screen horizontal padding, section gap |
| `SIZES.xl` | `32` | Card padding, section margin |
| `SIZES.xxl` | `40` | Bottom padding on scroll views, large vertical gaps |

### Screen padding

All screens use consistent horizontal padding. Use `SIZES.lg` (24) or `SIZES.xl` (32) depending on the density of the content:

```ts
// Standard screen container
container: {
  flex: 1,
  backgroundColor: COLORS.background,
  padding: SIZES.lg,  // or SIZES.xl for less-dense screens
}
```

### Scroll view bottom padding

Add `paddingBottom: SIZES.xxl` (or a multiple) to scroll view content to prevent content from being hidden behind the tab bar.

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `RADIUS.sm` | `8` | Small internal elements |
| `RADIUS.md` | `12` | Contact items, key boxes, info banners |
| `RADIUS.lg` | `16` | Cards, inputs, primary buttons |
| `RADIUS.xl` | `24` | Large feature cards |
| `RADIUS.round` | `9999` | Pills, circular avatars, public key chip |

---

## Cards

Cards group related content on the `COLORS.surface` background with a 1px `COLORS.border` border.

### Standard card

```tsx
<View style={{
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.lg,
  padding: SIZES.xl,
  borderWidth: 1,
  borderColor: COLORS.border,
  marginBottom: SIZES.lg,
}}>
  {/* content */}
</View>
```

Used for: balance display, vault balance, form containers, settings sections.

### Compact list card

For lists of items (transactions, contacts), wrap the whole list in a single card and use internal dividers rather than individual cards per item:

```tsx
<View style={{
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.lg,
  padding: SIZES.md,
}}>
  {items.map((item, i) => (
    <View key={item.id} style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SIZES.md,
      borderBottomWidth: i < items.length - 1 ? 1 : 0,
      borderBottomColor: COLORS.border,
    }}>
      {/* row content */}
    </View>
  ))}
</View>
```

### Warning / status banner

Tinted banners use a 10% opacity background of the relevant status colour with a matching 30% opacity border:

```tsx
// Warning banner
<View style={{
  backgroundColor: 'rgba(255, 196, 0, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255, 196, 0, 0.3)',
  borderRadius: RADIUS.lg,
  padding: SIZES.lg,
}}>
  <AlertTriangle color={COLORS.warning} />
  <Text style={{ color: COLORS.warning }}>Warning message</Text>
</View>

// Info/success banner
<View style={{
  flexDirection: 'row',
  backgroundColor: 'rgba(0, 230, 118, 0.1)',
  borderRadius: RADIUS.md,
  padding: SIZES.md,
  alignItems: 'center',
}}>
  <ShieldCheck color={COLORS.success} size={24} />
  <Text style={{ color: COLORS.success, flex: 1, fontSize: 12, lineHeight: 18 }}>
    Info message
  </Text>
</View>
```

### Icon container

Circular tinted containers for transaction type icons or feature icons:

```tsx
<View style={{
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: 'rgba(0, 230, 118, 0.1)', // or error/primary tint
  justifyContent: 'center',
  alignItems: 'center',
}}>
  <ArrowDownLeft color={COLORS.success} />
</View>
```

For larger feature icons (e.g. vault), use `width/height: 80`, `borderRadius: 40`.

---

## Buttons

Use the shared `Button` component from `src/components/Button.tsx`. Do not create raw `TouchableOpacity` buttons for primary actions.

```tsx
import { Button } from '../components/Button';
```

### Variants

| Variant | Background | Text colour | Use |
|---|---|---|---|
| `primary` (default) | `COLORS.primary` (`#00E5FF`) | `COLORS.background` (dark) | Main CTA per screen |
| `secondary` | `COLORS.secondary` (`#7B61FF`) | `COLORS.background` (dark) | Second competing action |
| `outline` | transparent | `COLORS.primary` | Tertiary or menu-style actions |
| `danger` | `COLORS.error` (`#FF3D00`) | `COLORS.background` (dark) | Destructive actions (sign out, delete) |

### Loading state

Pass `isLoading` to show an `ActivityIndicator` in place of the label. The button is automatically disabled while loading.

```tsx
<Button title="Send Payment" onPress={handleSend} isLoading={isLoading} />
```

### Disabled state

Pass `disabled` prop. Background becomes `COLORS.surfaceLight`, text becomes `COLORS.textMuted`.

### Sizing and layout

Buttons have a fixed height of `56` and `borderRadius: RADIUS.lg` (16). For side-by-side buttons, give each `flex: 1` and separate with `marginHorizontal: SIZES.xs`:

```tsx
<View style={{ flexDirection: 'row' }}>
  <Button title="Send"    style={{ flex: 1, marginHorizontal: SIZES.xs }} />
  <Button title="Receive" variant="secondary" style={{ flex: 1, marginHorizontal: SIZES.xs }} />
</View>
```

### Don'ts

- Don't put two `primary` buttons on the same screen.
- Don't use `danger` for anything that isn't destructive and irreversible.
- Don't use `outline` as a primary CTA — it's for supporting actions.

---

## Inputs

Use the shared `Input` component from `src/components/Input.tsx`.

```tsx
import { Input } from '../components/Input';
```

### Basic usage

```tsx
<Input
  label="Destination Address"
  placeholder="G..."
  value={destination}
  onChangeText={setDestination}
  autoCapitalize="none"
  autoCorrect={false}
/>
```

### Validation errors

Pass an `error` string to show the error message below the input with a red border:

```tsx
<Input
  label="Amount (XLM)"
  placeholder="0.00"
  value={amount}
  onChangeText={setAmount}
  keyboardType="decimal-pad"
  error={amountError}
/>
```

### Icons

Use `leftIcon` and `rightIcon` for inline icons (e.g. a scan QR button on the right of an address input):

```tsx
<Input
  label="Recipient"
  leftIcon={<User color={COLORS.textMuted} size={20} />}
  rightIcon={<QrCode color={COLORS.primary} size={20} onPress={openScanner} />}
  {...inputProps}
/>
```

### Anatomy

- Height: `56` (matches buttons)
- Background: `COLORS.surface`
- Border: `1px COLORS.border`, error state switches to `COLORS.error`
- Border radius: `RADIUS.lg` (16)
- Label: `fontSize: 14`, `fontWeight: '500'`, `COLORS.textSecondary`, `marginBottom: SIZES.sm`
- Placeholder text: `COLORS.textMuted`
- Input text: `COLORS.textPrimary`, `fontSize: 16`
- Error text: `COLORS.error`, `fontSize: 12`, `marginTop: SIZES.xs`
- Inputs include `marginBottom: SIZES.md` (16) by default via the container

---

## Navigation & Tab Bar

### Tab bar

The bottom tab bar uses `COLORS.surface` as its background with a `1px COLORS.border` top border:

```ts
tabBarStyle: {
  backgroundColor: COLORS.surface,
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
}
tabBarActiveTintColor: COLORS.primary
tabBarInactiveTintColor: COLORS.textMuted
```

Icons come from `lucide-react-native`. Use the icon that best describes the tab's purpose — keep icon size at the default provided by the tab navigator.

### Header

Headers are transparent over the dark background (no shadow/elevation):

```ts
headerStyle: {
  backgroundColor: COLORS.background,
  shadowColor: 'transparent',
  elevation: 0,
}
headerTintColor: COLORS.textPrimary
```

---

## Dark Mode

The app is built dark-first. The `isDarkMode` toggle in `appStore` exists for future extension, but currently the colour tokens are fixed. All screens should consume `COLORS` tokens — never hardcode hex values — so that if a light mode is ever introduced, switching theme only requires updating `theme.ts`.

### Rules for dark-mode-safe components

1. **Always use `COLORS.*` tokens** for every colour value (background, text, border, icon).
2. **Never hardcode** `'#fff'`, `'#000'`, `'white'`, or `'black'`.
3. **Use opacity variants** for tinted surfaces (e.g. `rgba(0, 229, 255, 0.1)`) rather than mixing opaque colours manually.
4. **Icons** from `lucide-react-native` should receive `color={COLORS.textPrimary}`, `color={COLORS.primary}`, or a status colour — not a hardcoded hex.
5. **`RefreshControl`** and other system components: set `tintColor={COLORS.primary}` to keep them on-brand in dark mode.
6. **Switch** component: set `trackColor={{ false: COLORS.border, true: COLORS.primary }}` so the track matches the palette.

### appStore dark mode toggle

The `isDarkMode` state is in `src/store/appStore.ts`. If you need to conditionally apply a style based on theme (e.g. a component that has a different layout in light mode), consume it via:

```ts
import { useAppStore } from '../store/appStore';
const { isDarkMode } = useAppStore();
```

---

## Icons

Icons come from [`lucide-react-native`](https://lucide.dev). Import named icons directly:

```ts
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
```

Standard sizes used across the app:

| Context | Size |
|---|---|
| Tab bar | navigator default (~24) |
| Inline / row icon | `20–24` |
| Empty state | `48` |
| Feature / hero icon | `40` |

Always pass a `color` prop from `COLORS`. Do not rely on the default icon colour.

---

## Empty States

Empty states are centred in their container with a large icon and muted label text:

```tsx
<View style={{ alignItems: 'center', marginTop: SIZES.xxl * 2 }}>
  <Clock color={COLORS.textMuted} size={48} style={{ marginBottom: SIZES.md }} />
  <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>No recent transactions</Text>
</View>
```

Use a `48px` icon from lucide, `COLORS.textMuted` for both the icon and the label, and a descriptive but brief label.

---

## Keyboard Handling

Screens with forms that need the keyboard to scroll content above it should use `KeyboardAvoidingView`:

```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
>
  {/* form content */}
</KeyboardAvoidingView>
```

For long forms, wrap in `ScrollView` with `bounces={false}` and `contentContainerStyle={{ flexGrow: 1 }}`.

---

## Quick Reference

```
Backgrounds:   background #0B0D17 · surface #15192B · surfaceLight #1E243D
Accents:       primary #00E5FF · secondary #7B61FF
Status:        success #00E676 · error #FF3D00 · warning #FFC400
Text:          primary #FFFFFF · secondary #A0AABF · muted #637087
Border:        #2A314A

Spacing:  xs=4  sm=8  md=16  lg=24  xl=32  xxl=40
Radius:   sm=8  md=12  lg=16  xl=24  round=9999
```
