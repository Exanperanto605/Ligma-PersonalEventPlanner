"use client"

const Avatar = ({ className = "", ...props }) => (
  <div
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1c1c1c] ${className}`}
    {...props}
  />
)

const AvatarImage = ({ className = "", src, alt = "", ...props }) => (
  <img
    className={`aspect-square h-full w-full object-cover rounded-full ${className}`}
    loading="eager"
    src={src}
    alt={alt}
    onError={(e) => {
      e.target.style.display = 'none';
    }}
    {...props}
  />
);

const AvatarFallback = ({ className = "", fallbackText = "U", ...props }) => (
  <div
    className={`flex h-full w-full items-center justify-center rounded-full bg-[#4285f4] text-white font-medium ${className}`}
    {...props}
  >
    {fallbackText}
  </div>
);

export { Avatar, AvatarImage, AvatarFallback }
