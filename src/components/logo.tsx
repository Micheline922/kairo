import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="p-1">
        <svg
          width="40"
          height="40"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Le cercle de l'éternité (discret) */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="hsl(var(--accent))"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.3"
          />

          {/* Ligne du Chronos (Le temps humain) */}
          <line
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Ligne du Kairos (Le temps de Dieu) */}
          <line
            x1="50"
            y1="20"
            x2="50"
            y2="80"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Le Point Kairos (L'illumination) */}
          <circle cx="50" cy="50" r="4" fill="hsl(var(--accent))">
            <animate
              attributeName="r"
              values="3;5;3"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>

          {/* Symbole discret de la lettre K ou Croix */}
          <path
            d="M50 50L65 35M50 50L65 65"
            stroke="hsl(var(--accent))"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold text-primary">KAIRO</span>
    </div>
  );
}
