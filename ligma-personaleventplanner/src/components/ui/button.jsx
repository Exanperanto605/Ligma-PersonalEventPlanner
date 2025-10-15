"use client"

const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-[#6366f1] text-white hover:bg-[#4f46e5]",
    ghost: "hover:bg-[#6366f1]/10 hover:text-[#6366f1]",
    outline: "border border-[#6366f1]/20 hover:bg-[#6366f1]/10 hover:text-[#6366f1]",
  }

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-sm",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }