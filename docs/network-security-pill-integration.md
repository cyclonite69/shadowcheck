# Network Security Pill - Integration Notes

## Overview
The `NetworkSecurityPill` component provides a translucent pill-shaped badge for displaying network security types in the ShadowCheck dashboard. It combines a circular icon badge with color-coded text abbreviations in a semi-transparent container.

## Component Usage

### Basic Integration
```tsx
import { NetworkSecurityPill } from '@/components/NetworkSecurityPill';

// In table cell
<NetworkSecurityPill type="WPA2-PSK" radioType={row.original.type} />

// Standalone
<NetworkSecurityPill type="WPA3-SAE" />
```

### Props
- `type` (string): Security type key from `SECURITY_TYPE_MAP`
- `radioType` (optional string): Radio type code ('E' = BLE, 'B' = BT, 'G' = GSM, 'L' = LTE)

## Visual Specifications

### Pill Container
- **Background**: `rgba(hex, 0.15)` - 15% opacity themed background
- **Border**: `1px solid rgba(hex, 0.3)` - 30% opacity themed border
- **Border Radius**: 20px (pill shape)
- **Padding**: 4px 8px
- **Hover State**: Background changes to `rgba(hex, 0.25)` (25% opacity)

### Badge Circle
- **Size**: 36px × 36px
- **Border**: 3px solid with 30% opacity
- **Glow Effect**: `box-shadow: 0 0 8px rgba(hex, 0.3)`
- **Icon**: 20px emoji centered

### Text
- **Font Size**: 13px
- **Font Weight**: 700 (bold)
- **Color**: Full hex color (100% opacity)
- **Truncation**: Abbreviations > 12 characters are truncated with ellipsis

## Filter Dropdown Integration
The security filter dropdown in `AccessPointsPage.tsx` uses the same mapping and styling:

```tsx
{['WPA3-SAE', 'WPA2-EAP', 'WPA2-PSK', ...].map((securityType) => {
  const style = getSecurityTypeStyle(securityType);
  return (
    <DropdownMenuCheckboxItem key={securityType}>
      <div className="flex items-center gap-2" title={style.description}>
        <span className="text-base">{style.icon}</span>
        <span className={`text-xs font-medium ${style.text}`}>
          {style.abbr}
        </span>
      </div>
    </DropdownMenuCheckboxItem>
  );
})}
```

## Accessibility
- **ARIA Label**: Includes security type, abbreviation, and description
- **Role**: `status` for screen reader context
- **Title Tooltip**: Shows full description and type on hover
- **Keyboard Navigation**: Focusable in filter dropdowns

## Responsive Design
- **Desktop**: Full pill with 36px badge
- **Mobile**: Use `NetworkSecurityPillCompact` variant (smaller dimensions)
- **Table Overflow**: Horizontal scroll enabled on small screens

## Color Mapping
All colors are defined in `SECURITY_TYPE_MAP` with hex values:
- **WiFi Security**: Green (#32CD32), Gold (#FFD700), Blue (#0000FF), Red (#FF0000), Orange (#FF4500), Teal (#008080)
- **Radio Types**: Purple (#9370DB), Indigo (#4B0082), Gray (#808080), Cyan (#00FFFF)

## Demo
View the standalone HTML demo at `docs/network-security-pill-demo.html` for a complete example with filter grid and sample table.
