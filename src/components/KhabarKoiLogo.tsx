import React from 'react';

interface KhabarKoiLogoProps {
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export const KhabarKoiLogo: React.FC<KhabarKoiLogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  const isDark = variant === 'dark';

  const sizeMap = {
    sm: {
      fontSize: 'text-xl font-black',
      tagSize: 'text-[8px]',
      swooshWidth: 46,
    },
    md: {
      fontSize: 'text-2xl font-black',
      tagSize: 'text-[9px]',
      swooshWidth: 56,
    },
    lg: {
      fontSize: 'text-3xl font-black',
      tagSize: 'text-[10px]',
      swooshWidth: 70,
    },
    xl: {
      fontSize: 'text-4xl sm:text-5xl font-black',
      tagSize: 'text-[11px]',
      swooshWidth: 96,
    },
  };

  const current = sizeMap[size];

  const kabarColor = isDark ? '#FFFFFF' : '#111827';
  const koiColor = '#C2410C'; // Rich deep dark orange
  const tagColor = isDark ? '#CBD5E1' : '#64748B';

  return (
    <div className={`inline-flex flex-col items-center justify-center text-center select-none leading-none ${className}`}>
      {/* Typography: Only Khabar Koi */}
      <div className={`tracking-tight ${current.fontSize}`}>
        <span style={{ color: kabarColor }}>Khabar</span>{' '}
        <span style={{ color: koiColor }}>Koi</span>
      </div>

      {/* Khuda Lagse in very small font in the middle under Khabar Koi */}
      {showTagline && (
        <div className="flex flex-col items-center justify-center mt-1 w-full">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-[1.5px] bg-[#C2410C] rounded-full" />
            <span
              className={`font-black tracking-widest uppercase ${current.tagSize}`}
              style={{ color: tagColor }}
            >
              Khuda Lagse
            </span>
            <span className="w-1.5 h-[1.5px] bg-[#C2410C] rounded-full" />
          </div>

          {/* Clean smile curve accent centered */}
          <svg
            width={current.swooshWidth}
            height="4"
            viewBox="0 0 60 4"
            fill="none"
            className="mt-0.5"
          >
            <path
              d="M2 1 C 20 4.5, 40 4.5, 58 1"
              stroke="#C2410C"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
