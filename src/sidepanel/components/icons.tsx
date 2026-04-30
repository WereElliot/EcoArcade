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
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3.25a5.75 5.75 0 0 0-5.75 5.75v1.06c0 1.32-.42 2.61-1.2 3.68l-1.17 1.59A1.25 1.25 0 0 0 4.9 17.3h14.2a1.25 1.25 0 0 0 1.01-1.97l-1.17-1.6a6.4 6.4 0 0 1-1.19-3.67V9A5.75 5.75 0 0 0 12 3.25Zm-2.7 15.4a2.7 2.7 0 0 0 5.4 0H9.3Z" />
    </svg>
  );
}

export function FlameIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.22 2.8a.75.75 0 0 0-1.08 0c-2.58 2.87-4.89 5.72-4.89 8.88 0 2.12.95 3.84 2.34 5.01A6.2 6.2 0 0 0 12 21.2a6.2 6.2 0 0 0 3.4-1c1.4-1.17 2.35-2.9 2.35-5.02 0-3.03-1.94-5.22-4.28-7.33-.48-.43-.93-.84-1.25-1.22-.47-.57-.83-1.16-1.18-1.83Z" />
      <path d="M12 11.1c-1.72 1.55-2.9 2.66-2.9 4.34a2.9 2.9 0 1 0 5.8 0c0-1.46-.83-2.46-2.12-3.68L12 11.1Z" opacity=".4" />
    </svg>
  );
}

export function GemIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8.17 3.5a1.75 1.75 0 0 0-1.45.77l-3.15 4.7a1.75 1.75 0 0 0 .15 2.15l7.01 8.24a1.75 1.75 0 0 0 2.54 0l7.01-8.24a1.75 1.75 0 0 0 .15-2.14l-3.15-4.71a1.75 1.75 0 0 0-1.45-.77H8.17Z" />
      <path d="M8.2 5.2 6.03 9h11.94L15.8 5.2h-2.43L12 8.12 10.63 5.2H8.2Z" opacity=".35" />
    </svg>
  );
}

export function PointsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 3.25a8.75 8.75 0 1 0 0 17.5 8.75 8.75 0 0 0 0-17.5Z" />
      <path
        d="M9.1 7.8h3.48a3.2 3.2 0 0 1 0 6.4H10.7v2.08a.7.7 0 1 1-1.4 0V8.5a.7.7 0 0 1 .7-.7Zm1.6 1.4v3.6h1.88a1.8 1.8 0 1 0 0-3.6H10.7Z"
        fill="#092314"
      />
    </svg>
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

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <circle cx="12" cy="12" r="4.1" />
      <path d="M12 1.85a.8.8 0 0 1 .8.8v2.1a.8.8 0 0 1-1.6 0v-2.1a.8.8 0 0 1 .8-.8Zm0 17.4a.8.8 0 0 1 .8.8v2.1a.8.8 0 0 1-1.6 0v-2.1a.8.8 0 0 1 .8-.8ZM4.74 4.73a.8.8 0 0 1 1.13 0l1.48 1.48a.8.8 0 0 1-1.14 1.13L4.74 5.86a.8.8 0 0 1 0-1.13Zm11.9 11.9a.8.8 0 0 1 1.13 0l1.49 1.48a.8.8 0 0 1-1.14 1.14l-1.48-1.49a.8.8 0 0 1 0-1.13ZM1.85 12a.8.8 0 0 1 .8-.8h2.1a.8.8 0 0 1 0 1.6h-2.1a.8.8 0 0 1-.8-.8Zm17.4 0a.8.8 0 0 1 .8-.8h2.1a.8.8 0 0 1 0 1.6h-2.1a.8.8 0 0 1-.8-.8ZM6.2 16.65a.8.8 0 0 1 1.14 1.13l-1.48 1.49a.8.8 0 1 1-1.13-1.14l1.47-1.48Zm11.9-11.9a.8.8 0 0 1 1.14 1.13l-1.49 1.48a.8.8 0 1 1-1.13-1.13l1.48-1.48Z" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.27 2.6a.75.75 0 0 0-.94.88 8.45 8.45 0 0 1-10 10 .75.75 0 0 0-.87.95 9.55 9.55 0 1 0 11.81-11.83Z" />
    </svg>
  );
}

export function PanelLeftCloseIcon(props: IconProps) {
  return baseIcon(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m15 9-3 3 3 3" />
    </>,
    props
  );
}

export function PanelLeftOpenIcon(props: IconProps) {
  return baseIcon(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m12 9 3 3-3 3" />
    </>,
    props
  );
}
