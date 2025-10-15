"use client"

import { createContext, useContext, useState } from "react"

const DropdownMenuContext = createContext({})

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = ({ children, asChild }) => {
  const { setIsOpen } = useContext(DropdownMenuContext)
  const Child = asChild ? children.type : "button"
  
  return (
    <Child
      onClick={() => setIsOpen(prev => !prev)}
      {...(asChild ? children.props : {})}
    >
      {asChild ? null : children}
    </Child>
  )
}

const DropdownMenuContent = ({ children, align = "center", className = "" }) => {
  const { isOpen } = useContext(DropdownMenuContext)
  if (!isOpen) return null
  
  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div 
      className={`absolute z-50 top-full mt-1 min-w-[8rem] overflow-hidden rounded-md border border-gray-800 bg-gray-900 p-1 shadow-md ${alignClasses[align]} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ children, className = "", ...props }) => (
  <button
    className={`relative flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-800 ${className}`}
    {...props}
  >
    {children}
  </button>
)

const DropdownMenuSeparator = ({ className = "" }) => (
  <div className={`-mx-1 my-1 h-px bg-gray-800 ${className}`} />
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}