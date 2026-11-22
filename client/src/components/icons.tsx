// Icons imported from Pixelarticons on allsvgicons.com

type IconProps = {
  size: string | number;
}

export function Download({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>download button</title>
      <g fill="#ffffff">
        <path d="M21 15v4h-2v-4zm-2 4v2H5v-2zM5 15v4H3v-4zm8-12v14h-2V3z" fill="#ffffff" />
        <path d="M7 11v2h10v-2zm2 2v2h2v-2zm4 0v2h2v-2z" fill="#ffffff" />
        <path d="M15 11v2h2v-2z" fill="#ffffff" />
      </g>
    </svg>
  );
}

export function Play({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>play button</title>
      <path fill="#ffffff" d="M15 11h-2V9h2zm0 4h-2v-2h2zm-2 2h-2v-2h2zm0-8h-2V7h2zm-2-2H9V5h2zM9 21H7V3h2zm6-8h2v-2h-2zm-6 4h2v2H9z"/>
    </svg>
  );
}

export function Pause({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>pause button</title>
      <path fill="#ffffff" d="M10 20H4V4h6zm8-16v16h-6V4zm-4 2v12h2V6zM6 18h2V6H6z"/>
    </svg>
  );
}

export function VolumeMuted({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>muted volume</title>
      <path fill="#ffffff" d="M13 22h-2v-2H9v-2h2V6H9V4h2V2h2zm-4-4H7v-2h2zm-2-8H5v4h2v2H3V8h4zm10.001 5.224h-2v-2H17v-2h-1.999v-2h2v2H19v2h-1.999zm3.999 0h-2v-2h2zm0-4h-2v-2h2zM9 8H7V6h2z"/>
    </svg>
  );
}

export function VolumeLow({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>low volume</title>
      <path fill="#ffffff" d="M17 22h-2v-2h-2v-2h2V6h-2V4h2V2h2zm-4-4h-2v-2h2zM11 8v2H9v4h2v2H7V8zm2 0h-2V6h2z"/>
    </svg>
  );
}

export function VolumeMedium({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>medium volume</title>
      <path fill="#ffffff" d="M15 22h-2v-2h-2v-2h2V6h-2V4h2V2h2zm-4-4H9v-2h2zM9 8v2H7v4h2v2H5V8zm10 6h-2v-4h2zm-8-6H9V6h2z"/>
    </svg>
  );
}

export function VolumeHigh({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>high volume</title>
      <path fill="#ffffff" d="M13 22h-2v-2H9v-2h2V6H9V4h2V2h2zm-4-4H7v-2h2zm10 0h-4v-2h4zM7 10H5v4h2v2H3V8h4zm14 6h-2V8h2zm-4-2h-2v-4h2zM9 8H7V6h2zm10 0h-4V6h4z"/>
    </svg>
  )
}

export function VolumeMax({ size }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="#ffffff">
      <title>volume-3</title>
      <path fill="#ffffff" d="M11 22H9v-2H7v-2h2V6H7V4h2V2h2zm8 0h-6v-2h6zm2-2h-2v-2h2zM7 18H5v-2h2zm10 0h-4v-2h4zm6 0h-2V6h2zM5 10H3v4h2v2H1V8h4zm14 6h-2V8h2zm-4-2h-2v-4h2zM7 8H5V6h2zm10 0h-4V6h4zm4-2h-2V4h2zm-2-2h-6V2h6z"/>
    </svg>
  )
}
