#!/usr/bin/env python3
"""
Bluetooth Channel Frequency Tool

Determines Bluetooth Classic (BR/EDR) and Bluetooth Low Energy (BLE)
channel numbers from a given frequency in MHz.

Usage:
    python bt_channel_tool.py <frequency_mhz>

Examples:
    python bt_channel_tool.py 2402  # BLE advertising channel
    python bt_channel_tool.py 2450  # Valid for both BT and BLE
    python bt_channel_tool.py 2403  # Valid for BT Classic only
"""

import argparse
import sys
from typing import Tuple, Optional


def calculate_bt_classic_channel(frequency: int) -> Tuple[bool, Optional[int]]:
    """
    Calculate Bluetooth Classic (BR/EDR) channel number from frequency.

    Bluetooth Classic uses 79 channels with 1 MHz spacing from 2402-2480 MHz.

    Args:
        frequency: Frequency in MHz

    Returns:
        Tuple of (is_valid, channel_number)
        - is_valid: True if frequency is valid for Bluetooth Classic
        - channel_number: Channel index (0-78) or None if invalid
    """
    BT_MIN_FREQ = 2402
    BT_MAX_FREQ = 2480
    BT_CHANNEL_SPACING = 1

    # Check if frequency is within valid range
    if frequency < BT_MIN_FREQ or frequency > BT_MAX_FREQ:
        return (False, None)

    # Calculate channel number (0-78)
    channel = frequency - BT_MIN_FREQ

    return (True, channel)


def calculate_ble_channel(frequency: int) -> Tuple[bool, Optional[int], bool, Optional[str]]:
    """
    Calculate Bluetooth Low Energy (BLE) channel number from frequency.

    BLE uses 40 channels with 2 MHz spacing. Only even frequencies are valid.
    Three channels are designated as advertising channels:
    - Channel 37: 2402 MHz (physical index 0)
    - Channel 38: 2426 MHz (physical index 12)
    - Channel 39: 2480 MHz (physical index 39)

    Args:
        frequency: Frequency in MHz

    Returns:
        Tuple of (is_valid, channel_number, is_advertising, advertising_name)
        - is_valid: True if frequency is valid for BLE
        - channel_number: Physical channel index (0-39) or None if invalid
        - is_advertising: True if this is an advertising channel
        - advertising_name: "Channel 37", "Channel 38", or "Channel 39" if advertising
    """
    BLE_MIN_FREQ = 2402
    BLE_MAX_FREQ = 2480
    BLE_CHANNEL_SPACING = 2

    # BLE only uses even frequencies
    if frequency % 2 != 0:
        return (False, None, False, None)

    # Check if frequency is within valid range
    if frequency < BLE_MIN_FREQ or frequency > BLE_MAX_FREQ:
        return (False, None, False, None)

    # Calculate physical channel index (0-39)
    # Physical index = (frequency - 2402) / 2
    channel = (frequency - BLE_MIN_FREQ) // BLE_CHANNEL_SPACING

    # Check if this is an advertising channel
    advertising_channels = {
        0: "Channel 37",   # 2402 MHz
        12: "Channel 38",  # 2426 MHz
        39: "Channel 39"   # 2480 MHz
    }

    is_advertising = channel in advertising_channels
    advertising_name = advertising_channels.get(channel)

    return (True, channel, is_advertising, advertising_name)


def display_results(frequency: int, bt_result: Tuple[bool, Optional[int]],
                   ble_result: Tuple[bool, Optional[int], bool, Optional[str]]) -> None:
    """
    Display formatted results for Bluetooth channel analysis.

    Args:
        frequency: Input frequency in MHz
        bt_result: Result from calculate_bt_classic_channel()
        ble_result: Result from calculate_ble_channel()
    """
    bt_valid, bt_channel = bt_result
    ble_valid, ble_channel, is_advertising, advertising_name = ble_result

    print(f"\n{'='*60}")
    print(f"Bluetooth Channel Analysis for {frequency} MHz")
    print(f"{'='*60}\n")

    # Bluetooth Classic (BR/EDR) results
    print("📻 Bluetooth Classic (BR/EDR):")
    if bt_valid:
        print(f"   ✓ Valid - Channel {bt_channel}")
        print(f"   └─ Range: 79 channels (0-78), 1 MHz spacing")
    else:
        print(f"   ✗ Invalid - Outside 2402-2480 MHz range")

    print()

    # Bluetooth Low Energy (BLE) results
    print("📡 Bluetooth Low Energy (BLE):")
    if ble_valid:
        print(f"   ✓ Valid - Physical Channel {ble_channel}")
        print(f"   └─ Range: 40 channels (0-39), 2 MHz spacing")

        if is_advertising:
            print(f"   🔔 Advertising Channel: {advertising_name}")
            print(f"   └─ Used for device discovery and connection establishment")
        else:
            print(f"   📊 Data Channel: Used for data transmission")
    else:
        if frequency % 2 != 0:
            print(f"   ✗ Invalid - BLE requires even frequencies (2 MHz spacing)")
        else:
            print(f"   ✗ Invalid - Outside 2402-2480 MHz range")

    print()

    # Summary
    if bt_valid and ble_valid:
        print("💡 Summary: Valid for BOTH Bluetooth Classic and BLE")
    elif bt_valid:
        print("💡 Summary: Valid for Bluetooth Classic ONLY")
    elif ble_valid:
        print("💡 Summary: Valid for BLE ONLY")
    else:
        print("❌ Summary: NOT a valid Bluetooth frequency")

    print(f"{'='*60}\n")


def parse_arguments() -> argparse.Namespace:
    """
    Parse command-line arguments.

    Returns:
        Parsed arguments namespace
    """
    parser = argparse.ArgumentParser(
        description="Determine Bluetooth Classic and BLE channel numbers from frequency",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s 2402    # BLE advertising channel 37, BT Classic channel 0
  %(prog)s 2426    # BLE advertising channel 38, BT Classic channel 24
  %(prog)s 2450    # Valid for both BT and BLE (data channel)
  %(prog)s 2403    # Valid for BT Classic only (odd frequency)
  %(prog)s 2500    # Invalid - outside range

Bluetooth Classic (BR/EDR):
  - 79 channels (0-78)
  - 1 MHz spacing
  - 2402-2480 MHz

Bluetooth Low Energy (BLE):
  - 40 channels (0-39)
  - 2 MHz spacing (even frequencies only)
  - 2402-2480 MHz
  - 3 advertising channels: 37 (2402), 38 (2426), 39 (2480)
        """
    )

    parser.add_argument(
        'frequency',
        type=int,
        help='Frequency in MHz (e.g., 2402, 2450, 2480)'
    )

    return parser.parse_args()


def main() -> int:
    """
    Main entry point for the Bluetooth channel tool.

    Returns:
        Exit code (0 for success)
    """
    try:
        args = parse_arguments()
        frequency = args.frequency

        # Validate frequency is positive
        if frequency <= 0:
            print(f"❌ Error: Frequency must be positive (got {frequency} MHz)")
            return 1

        # Calculate channels for both Bluetooth standards
        bt_result = calculate_bt_classic_channel(frequency)
        ble_result = calculate_ble_channel(frequency)

        # Display results
        display_results(frequency, bt_result, ble_result)

        return 0

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        return 130
    except Exception as e:
        print(f"❌ Unexpected error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
