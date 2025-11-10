export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  const iconSize = Math.round(size)
  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo BalancePro"
      fill="none"
    >
      <rect x="8" y="12" width="48" height="40" rx="10" stroke="currentColor" strokeWidth="6" />
      <path d="M20 28h24M20 36h24" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <text x="32" y="24" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="700" fill="currentColor">BP</text>
    </svg>
  )
}