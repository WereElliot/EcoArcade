import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function baseIcon(path: ReactNode, props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {path}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </>,
    props
  );
}

export function LearnIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M4 5h7a3 3 0 0 1 3 3v11H7a3 3 0 0 0-3 3Z" />
      <path d="M20 5h-7a3 3 0 0 0-3 3v11h7a3 3 0 0 1 3 3Z" />
    </>,
    props
  );
}

export function ActIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M12 3c2.6 2.8 4 5.1 4 7.1A4 4 0 0 1 8 10c0-2 1.4-4.3 4-7Z" />
      <path d="M12 21c4.4-1.8 7-5 7-8.7A4.9 4.9 0 0 0 14.1 7" />
    </>,
    props
  );
}

export function CommunityIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a3 3 0 0 1 0 5.74" />
    </>,
    props
  );
}

export function RewardsIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6" />
    </>,
    props
  );
}

export function SearchIcon(props: IconProps) {
  return baseIcon(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
    props
  );
}

export function BellIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </>,
    props
  );
}

export function FlameIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M12 3s4 4.3 4 8.2A4 4 0 0 1 8 11c0-2.8 1.8-5.2 4-8Z" />
      <path d="M12 21a5 5 0 0 0 5-5c0-3-2-4.6-5-7-3 2.4-5 4-5 7a5 5 0 0 0 5 5Z" />
    </>,
    props
  );
}

export function GemIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M6 8 9 3h6l3 5-6 13Z" />
      <path d="M3 8h18" />
    </>,
    props
  );
}

export function PointsIcon(props: IconProps) {
  return baseIcon(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10" />
      <path d="M8 10h4.5a2.5 2.5 0 0 1 0 5H8" />
    </>,
    props
  );
}

export function SparkIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
    </>,
    props
  );
}

export function CommentIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </>,
    props
  );
}

export function BookmarkIcon(props: IconProps) {
  return baseIcon(
    <>
      <path d="M6 4h12v16l-6-4-6 4Z" />
    </>,
    props
  );
}

export function ChevronRightIcon(props: IconProps) {
  return baseIcon(<path d="m9 18 6-6-6-6" />, props);
}
