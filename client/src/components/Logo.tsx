import { useState } from 'react'

interface LogoProps {
  size?: number
  className?: string
  src?: string
  forceFallback?: boolean
}

export default function Logo({ size = 40, className = '', src = '/brand/equilibrium-logo.png', forceFallback = false }: LogoProps) {
  const iconSize = Math.round(size)
  const [failed, setFailed] = useState(false)
  const shouldFallback = forceFallback || failed || !src

  // Fallback: ícone vetorial simples caso a imagem não carregue
  if (shouldFallback) {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Logo Equilibrium"
      >
        <defs>
          <filter id="eq-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feOffset dy="2" />
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.2 0" />
            <feBlend in="SourceGraphic" mode="normal" />
          </filter>
        </defs>

        {/* Fundo suave e anel */}
        <g filter="url(#eq-shadow)">
          <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.08" />
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" opacity="0.35" fill="none" />
          <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.25" fill="none" />
        </g>

        {/* Marca "EQ" central */}
        <text
          x="32"
          y="32"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fontWeight="700"
          fill="currentColor"
        >
          EQ
        </text>

        {/* Barras de equilíbrio (decorativas) */}
        <rect x="22" y="39" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.35" />
        <rect x="24" y="44" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.25" />
      </svg>
    )
  }

  // Logo oficial dentro de um SVG, recortado em círculo
  const radius = iconSize / 2
  const clipId = `brand-clip-${iconSize}`

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox={`0 0 ${iconSize} ${iconSize}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo Equilibrium"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={radius} cy={radius} r={radius} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <image
          href={src}
          width={iconSize}
          height={iconSize}
          preserveAspectRatio="xMidYMid slice"
          onError={() => setFailed(true)}
        />
      </g>
    </svg>
  )
}