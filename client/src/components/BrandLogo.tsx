import { useState } from 'react'
import Logo from './Logo'

interface BrandLogoProps {
  size?: number
  src?: string
  className?: string
  variant?: 'mark' | 'full'
  objectPosition?: string
}

export default function BrandLogo({
  size = 44,
  src = '/brand/equilibrium-logo.png',
  className = '',
  variant = 'mark',
  objectPosition,
}: BrandLogoProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    // Fallback para o logotipo vetorial caso a imagem não seja encontrada
    return <Logo size={size} className={className} />
  }

  const pixelSize = Math.round(size)
  const isMark = variant === 'mark'

  // Para o símbolo, recortamos em círculo e ajustamos a posição
  if (isMark) {
    return (
      <div
        style={{ width: pixelSize, height: pixelSize }}
        className={`overflow-hidden rounded-full ring-1 ring-brand-400/40 bg-white/10 dark:bg-gray-900/30 ${className}`}
      >
        <img
          src={src}
          alt="Equilibrium — símbolo"
          width={pixelSize}
          height={pixelSize}
          className="w-full h-full object-cover"
          style={{ objectPosition: objectPosition || '50% 40%' }}
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  // Versão completa (banner)
  return (
    <img
      src={src}
      width={pixelSize}
      height={pixelSize}
      alt="Equilibrium — O Seu Equilíbrio Patrimonial"
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  )
}