// Minimal line-icon set — hand-drawn to match the rest of the app (no icon
// library dependency, keeps the bundle small and the CSP free of new sources).
// Consistent stroke style: 20x20 viewBox, 1.6 stroke, round caps/joins.

function Icon({ children, size = 20, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function WalletIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v7a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 13.5v-7Z" />
      <path d="M3 8h13.5" />
      <circle cx="13.5" cy="11.25" r="1" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function PulseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2.5 10.5h3l1.8-4.5 3 8.5 1.8-4.5h5.4" />
    </Icon>
  )
}

export function TargetIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="10" r="6.75" />
      <circle cx="10" cy="10" r="3.5" />
      <circle cx="10" cy="10" r="0.75" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function PiggyBankIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 10.2c0-3 2.7-5.2 6-5.2 2 0 3.75.85 4.8 2.2h1.7l-.7 2-1 .3v1.7c0 .5-.2.8-.6 1l-1.4.7v1.6h-2v-1.1c-.55.1-1.15.15-1.8.15-.5 0-1-.05-1.45-.13L7 15.5H5v-1.85C4.4 13 4 12 4 10.9v-.7Z" />
      <circle cx="12.3" cy="9" r="0.65" fill="currentColor" stroke="none" />
      <path d="M4 10.5 2.5 9.8" />
    </Icon>
  )
}

export function LayersIcon(props) {
  return (
    <Icon {...props}>
      <path d="M10 3.2 17 7l-7 3.8L3 7l7-3.8Z" />
      <path d="M3 10.6 10 14.4l7-3.8" />
      <path d="M3 13.8 10 17.6l7-3.8" />
    </Icon>
  )
}

export function GridIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="6" height="6" rx="1.3" />
      <rect x="11" y="3" width="6" height="6" rx="1.3" />
      <rect x="3" y="11" width="6" height="6" rx="1.3" />
      <rect x="11" y="11" width="6" height="6" rx="1.3" />
    </Icon>
  )
}

export function SlidersIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 5h12M4 10h12M4 15h12" />
      <circle cx="7.5" cy="5" r="1.6" fill="var(--surface-1)" />
      <circle cx="13" cy="10" r="1.6" fill="var(--surface-1)" />
      <circle cx="9" cy="15" r="1.6" fill="var(--surface-1)" />
    </Icon>
  )
}

export function ArrowDownRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5.5 5.5 14.5 14.5" />
      <path d="M7 14.5h7.5V7" />
    </Icon>
  )
}

export function ArrowUpRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5.5 14.5 14.5 5.5" />
      <path d="M8 5.5h6.5V12" />
    </Icon>
  )
}

export function CoinsIcon(props) {
  return (
    <Icon {...props}>
      <ellipse cx="7.3" cy="6" rx="4.3" ry="2.2" />
      <path d="M3 6v6c0 1.2 1.9 2.2 4.3 2.2S11.6 13.2 11.6 12" />
      <path d="M3 9c0 1.2 1.9 2.2 4.3 2.2S11.6 10.2 11.6 9" />
      <ellipse cx="13" cy="9.5" rx="4" ry="2" />
      <path d="M9 9.5v3.7c0 1.1 1.8 2 4 2s4-.9 4-2V9.5" />
      <path d="M9 12.5c0 1.1 1.8 2 4 2s4-.9 4-2" />
    </Icon>
  )
}
