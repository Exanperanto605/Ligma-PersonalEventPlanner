"use client"

const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
  
  const variants = {
    default: "border-transparent bg-gray-900 text-gray-50",
    outline: "border-current",
  }

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }