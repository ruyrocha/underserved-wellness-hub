import { forwardRef } from 'react'
import { Select, type SelectProps } from '../../primitives/Select/Select'

// Common IANA timezone identifiers — extend as needed
const TIMEZONES = [
  { value: 'America/New_York',    label: 'Eastern Time (ET)'    },
  { value: 'America/Chicago',     label: 'Central Time (CT)'    },
  { value: 'America/Denver',      label: 'Mountain Time (MT)'   },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)'    },
  { value: 'America/Anchorage',   label: 'Alaska Time (AK)'     },
  { value: 'Pacific/Honolulu',    label: 'Hawaii Time (HT)'     },
  { value: 'America/Puerto_Rico', label: 'Atlantic Time (PR)'   },
  { value: 'UTC',                 label: 'UTC'                  },
]

type TimezoneSelectProps = Omit<SelectProps, 'children'>

export const TimezoneSelect = forwardRef<HTMLSelectElement, TimezoneSelectProps>(
  (props, ref) => (
    <Select ref={ref} {...props}>
      <option value="" disabled>Select timezone…</option>
      {TIMEZONES.map((tz) => (
        <option key={tz.value} value={tz.value}>{tz.label}</option>
      ))}
    </Select>
  ),
)
TimezoneSelect.displayName = 'TimezoneSelect'
