# Clerk v7 `<PricingTable appearance>`: API as installed

Checked 2026-09-24 against the installed packages: `@clerk/nextjs` 7.9.2, `@clerk/react` 6.15.2, `@clerk/shared` 4.31.1.
`@clerk/ui`, `@clerk/types` and `@clerk/clerk-js` are **not** installed. The appearance types from `@clerk/ui` are
bundled into `@clerk/react`'s d.ts.

Abbreviations:
- `R` = `node_modules/@clerk/react/dist/types-8bkUI4Jw.d.mts`
- `S` = `node_modules/@clerk/shared/dist/types/clerk.d.ts`

## How the typing is wired
- `S:36-48`: `ClerkAppearanceTheme = ClerkAppearanceRegistry['theme']`. This is `any` until a framework package fills it in.
- `node_modules/@clerk/react/dist/index.d.mts:9-13`: augments the registry with `theme: Theme`, so `appearance` is fully typed.
- `@clerk/nextjs` re-exports `PricingTable` from `@clerk/react` (`node_modules/@clerk/nextjs/dist/types/client-boundary/uiComponents.d.ts:4`).

## 3. Does PricingTable accept `appearance`? Yes, and `checkoutProps.appearance` too
`S:2162-2182`:
```ts
type PricingTableBaseProps = {
  highlightedPlan?: string;
  for?: ForPayerType;            // 'user' | 'organization'
  appearance?: ClerkAppearanceTheme;
  checkoutProps?: Pick<__internal_CheckoutProps, 'appearance'>;
};
type PricingTableDefaultProps = { ctaPosition?: 'top'|'bottom'; collapseFeatures?: boolean; newSubscriptionRedirectUrl?: string };
```
- The component-level `appearance` is merged over the global `<ClerkProvider appearance>` (doc comment at `S:2174-2176`).
- The global `Appearance` also has a scoped key, `pricingTable?: Theme`, and a `checkout?: Theme` key (`R:10827-10833`).
- The `Theme` shape is `{ theme?, options?, variables?, elements?, captcha? }` (`R:10596-10637`). `cssLayerName` is a global option (`R:10769-10776`).

## 1. `variables` keys (`type Variables`, `R:10429-10590`)
| Key | Meaning (from the doc comment) | Default |
|---|---|---|
| `colorPrimary` | brand color, used for primary buttons | `#2F3037` |
| `colorPrimaryForeground` | text on top of a primary background | `white` |
| `colorDanger` / `colorSuccess` / `colorWarning` | status colors | |
| `colorNeutral` | base for borders, hover backgrounds. Use light shades (`white`) on dark themes | `black` |
| `colorForeground` | default text | `inherit` |
| `colorMuted` | low-importance background | |
| `colorMutedForeground` | secondary or subtitle text | `#747686` |
| `colorBackground` | **card container background** | `white` |
| `colorInput` / `colorInputForeground` | input background and input text | |
| `colorShimmer`, `colorRing`, `colorShadow`, `colorModalBackdrop` | | |
| `colorBorder` | base border color | derived from `colorNeutral` |
| `fontFamily`, `fontFamilyButtons`, `fontFamilyMono` | fonts | `inherit` |
| `fontSize` (string or xs..xl scale), `fontWeight` (scale) | | `0.8125rem` |
| `borderRadius` | base `md` radius. The card uses `xl` | `0.375rem` |
| `spacing` | base spacing | `1rem` |

**Old names that no longer exist:** grepping `R` finds no `colorText`, `colorTextSecondary`, `colorTextOnPrimaryBackground`,
`colorInputText`, `colorInputBackground` or `spacingUnit`. They are gone from the installed `Variables` type, so using them is a
TypeScript error. The Clerk docs list them as "deprecated as of 2025-07-15 and will be removed in the next major version", with these replacements:
colorText→colorForeground, colorTextSecondary→colorMutedForeground, colorTextOnPrimaryBackground→colorPrimaryForeground,
colorInputText→colorInputForeground, colorInputBackground→colorInput, spacingUnit→spacing.
Source: https://clerk.com/docs/nextjs/guides/customizing-clerk/appearance-prop/variables

Color values are CSS color strings. `colorPrimary` also accepts a shade scale and `colorNeutral` an alpha scale (`R:9798-9800`).

## 2. `elements` keys for the pricing table (`ElementsConfig`, `R:10110-10152`)
Card view:
`pricingTable`, `pricingTableCard` (takes ids), `pricingTableCardHeader`, `pricingTableCardTitleContainer`, `pricingTableCardTitle`,
`pricingTableCardBadge`, `pricingTableCardDescription`, `pricingTableCardFeeContainer`, `pricingTableCardFee`,
`pricingTableCardFeePeriod`, `pricingTableCardPeriodToggle`, `pricingTableCardFeePeriodNotice`, `pricingTableCardBody`,
`pricingTableCardFeatures`, `pricingTableCardFeaturesList` (ids), `pricingTableCardFeaturesListItem` (ids),
`pricingTableCardFeaturesListItemContent`, `pricingTableCardFeaturesListItemTitle`, `pricingTableCardStatusRow`,
`pricingTableCardStatus`, `pricingTableCardFooter`, `pricingTableCardFooterButton`, `pricingTableCardFooterNotice`.

Matrix view: `pricingTableMatrix`, `...Table`, `...RowGroup`, `...RowGroupHeader`, `...RowGroupBody`, `...Row`, `...RowHeader`,
`...RowBody`, `...ColumnHeader`, `...Cell`, `...CellFooter`, `...Avatar`, `...Badge`, `...PlanName`, `...Fee`, `...FeePeriod`,
`...FeePeriodNotice`, `...FeePeriodNoticeInner`, `...FeePeriodNoticeLabel`, `...Footer`.

Generic keys that also show up in the table: `badge` (ids `primary` | `actionRequired`, `R:10297`), `button` (ids, `R:9867`).
`formButtonPrimary` (`R:10004`) is for form buttons. It is not the pricing card CTA.

**Value types:** `type UserDefinedStyle = string | CSSObject` (`R:9791`), and `Selectors` maps each key to
`UserDefinedStyle` (`R:9855-9856`). So a value can be a **class-name string** (for example Tailwind classes) **or** a **style object**.
- State and id variants are written as `key__state` or `key__id`, e.g. `pricingTableCard__<planId>` (`R:9843-9851`).
- With Tailwind v4, set `cssLayerName` (e.g. `'clerk'`) and order the layers so utilities beat Clerk's own styles.
  The docs point to the "Bring your own CSS" guide for this:
  https://clerk.com/docs/nextjs/guides/customizing-clerk/appearance-prop/overview

## Recommended mapping
| Concern | variables | elements |
|---|---|---|
| Card background | `colorBackground` | `pricingTableCard` |
| Primary button | `colorPrimary` + `colorPrimaryForeground` | `pricingTableCardFooterButton` |
| Text | `colorForeground` | `pricingTableCardTitle`, `pricingTableCardFee` |
| Secondary text | `colorMutedForeground` | `pricingTableCardDescription`, `pricingTableCardFeePeriod` |
| Font | `fontFamily` (+ `fontFamilyButtons`) | n/a |
| Radius | `borderRadius` (the card uses the `xl` step) | `pricingTableCard` |
| Card border | `colorBorder` (and `colorNeutral` for hover and dividers) | `pricingTableCard` |
| Badge | n/a | `pricingTableCardBadge` or `badge` |

```tsx
<PricingTable appearance={{
  variables: { colorPrimary, colorPrimaryForeground, colorBackground, colorForeground,
               colorMutedForeground, colorNeutral: 'white', colorBorder, fontFamily: 'Inter', borderRadius: '0.75rem' },
  elements: { pricingTableCard: 'border border-white/10', pricingTableCardFooterButton: { textTransform: 'none' } },
}} checkoutProps={{ appearance: { variables: { /* same */ } } }} />
```
