# Radio Type Classification: Kismet vs WiGLE

## Problem Statement

The `networks_legacy` table contains data imported from **Kismet**, which uses different radio type codes than the **WiGLE standard**. This causes misclassification and confusion in the UI.

## Type Code Mapping

### Kismet Type Codes (in `networks_legacy.type`)

| Code | Kismet Label | Count | What It Actually Is |
|------|-------------|-------|---------------------|
| **W** | WiFi | 61,236 | ✅ WiFi (802.11) - Correct |
| **B** | Bluetooth | 16,443 | ✅ Bluetooth - Correct |
| **E** | Ethernet | 76,863 | ⚠️ **MISNAMED!** Actually Bluetooth or WiFi bridges |
| **L** | LTE | 252 | Should be **C** (Cellular) |
| **G** | GPRS/GSM | 156 | Should be **C** (Cellular) |
| **N** | Unknown | 47 | Unknown (possibly NFC, very high frequencies) |

### WiGLE Standard Type Codes (what we should display)

| Code | Label | Description |
|------|-------|-------------|
| **W** | WiFi | 802.11 wireless networks |
| **B** | Bluetooth | Bluetooth/BLE devices |
| **C** | Cellular | LTE/GSM/GPRS/5G networks |

## The "E" Type Problem

Kismet stores Bluetooth devices as type **'E' (Ethernet)**, which is misleading:

- **Type E + Frequency 7936**: Bluetooth devices (Kismet convention)
- **Type E + WiFi frequencies (2412-7125 MHz)**: Actually WiFi bridges
- **Type E + Frequency 0/NULL**: Bluetooth with no frequency data

### Why 7936 MHz?

**7936 MHz (7.936 GHz) is a fake frequency** that doesn't exist in any wireless standard. Kismet uses this as a sentinel value to mark Bluetooth devices while storing them as type 'E'.

## Solution: Non-Destructive Classification

### Statistics After Normalization

Before:
- E (Ethernet): 76,863 networks
- W (WiFi): 61,236 networks  
- B (Bluetooth): 16,443 networks

After (using normalized view):
- B (Bluetooth): 93,199 networks (+76,756 from misclassified E)
- W (WiFi): 61,257 networks (correct)
- C (Cellular): 408 networks (L + G combined)
- Unknown: 133 networks (type N)

## Files Modified

1. **`client/src/components/NetworkObservationsTableView.tsx`**
   - Updated `getRadioTypeLabel()` to analyze frequency for intelligent classification

2. **`schema/radio_type_normalized_view.sql`**
   - Created `app.networks_normalized` view (non-destructive)
   - Created `app.get_normalized_type_stats()` helper function

3. **`docs/RADIO_TYPE_CLASSIFICATION.md`**
   - This documentation file

## Important: Legacy Data is Preserved

**The `networks_legacy` table is never mutated.** All classification corrections happen:

1. **At display time** (frontend function)
2. **Through views** (database view)

## Testing

Check normalized statistics:
```sql
SELECT * FROM app.get_normalized_type_stats();
```

View before/after comparison:
```sql
SELECT 
    type AS original_type,
    type_normalized,
    COUNT(*) as count
FROM app.networks_normalized
GROUP BY type, type_normalized
ORDER BY count DESC;
```
