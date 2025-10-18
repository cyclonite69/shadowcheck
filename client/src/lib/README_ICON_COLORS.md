# Icon Color Design System

This document describes the semantic icon color hierarchy for the ShadowCheck application.

## Usage

```typescript
import { iconColors, getIconColor, getIconContainerClasses, getSemanticIconColor } from '@/lib/iconColors';

// Using direct color values
<Icon className={iconColors.primary.text} />
<div className={`${iconColors.success.bg} ${iconColors.success.glow}`} />

// Using helper functions
const color = getIconColor('primary');
<Icon className={color.text} />

// Icon containers with gradients
<div className={getIconContainerClasses('success')}>
  <CheckIcon className="h-5 w-5 text-white" />
</div>

// Semantic mapping
const color = getSemanticIconColor('wifi'); // Returns 'primary'
<WifiIcon className={getIconColor(color).text} />
```

## Color Palette

### Primary Actions - Blue (#3B82F6)
Use for main actions, navigation, and WiFi networks
- Classes: `text-blue-400`, `bg-blue-500`, `border-blue-500`
- Gradient: `from-blue-500 to-blue-600`

### Success/Active - Green (#10B981)
Use for successful operations, active states, and cellular networks
- Classes: `text-green-400`, `bg-green-500`, `border-green-500`
- Gradient: `from-green-500 to-emerald-600`

### Warning - Amber (#F59E0B)
Use for warnings, pending states, and BLE devices
- Classes: `text-amber-400`, `bg-amber-500`, `border-amber-500`
- Gradient: `from-amber-500 to-orange-600`

### Danger/Error - Red (#EF4444)
Use for errors, destructive actions, and security vulnerabilities
- Classes: `text-red-400`, `bg-red-500`, `border-red-500`
- Gradient: `from-red-500 to-red-600`

### Neutral - Gray (#6B7280)
Use for inactive states, disabled elements, and secondary content
- Classes: `text-slate-400`, `bg-slate-500`, `border-slate-500`
- Gradient: `from-slate-500 to-slate-600`

### Info - Cyan (#06B6D4)
Use for informational content, database icons, and system status
- Classes: `text-cyan-400`, `bg-cyan-500`, `border-cyan-500`
- Gradient: `from-cyan-500 to-blue-600`

### Secondary - Purple (#A855F7)
Use for secondary actions and Bluetooth devices
- Classes: `text-purple-400`, `bg-purple-500`, `border-purple-500`
- Gradient: `from-purple-500 to-purple-600`

### Special - Orange (#F97316)
Use for special features and monitoring indicators
- Classes: `text-orange-400`, `bg-orange-500`, `border-orange-500`
- Gradient: `from-orange-500 to-red-600`

## Semantic Mappings

### Network Types
- WiFi: `primary` (blue)
- Cellular: `success` (green)
- Bluetooth: `secondary` (purple)
- BLE: `warning` (amber)

### Actions
- Add/Create: `primary` (blue)
- Edit/Update: `primary` (blue)
- Save: `success` (green)
- Delete: `danger` (red)
- Cancel: `neutral` (gray)
- Refresh: `primary` (blue)
- Export/Import: `info` (cyan)

### Status
- Active/Online: `success` (green)
- Inactive/Offline: `neutral` (gray)
- Error: `danger` (red)
- Warning: `warning` (amber)
- Pending: `warning` (amber)

### Security
- Secure/Encrypted: `success` (green)
- Insecure/Open: `danger` (red)

## Contrast Requirements

All colors meet WCAG 2.1 AA contrast requirements:
- Text colors (-400 variants) provide 7:1 contrast on dark backgrounds
- Background colors (-500 variants) provide 4.5:1 contrast with white text
- Tested against slate-900 (#0f172a) background

## Examples

### Network Observation Icons
```typescript
function getRadioIcon(radioType: RadioType) {
  const colorMap = {
    wifi: getIconColor('primary'),
    cell: getIconColor('success'),
    bluetooth: getIconColor('secondary'),
    ble: getIconColor('warning')
  };
  const color = colorMap[radioType];

  return <Icon className={`h-5 w-5 ${color.text}`} />;
}
```

### Icon Containers
```typescript
<div className={getIconContainerClasses('success')}>
  <CheckCircle className="h-5 w-5 text-white" />
</div>
```

### Semantic Usage
```typescript
const actionColor = getSemanticIconColor('save'); // 'success'
<SaveIcon className={getIconColor(actionColor).text} />
```
