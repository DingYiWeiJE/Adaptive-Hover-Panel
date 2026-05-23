import { createPortal } from 'react-dom'
import { useEffect, useState, type ReactNode } from 'react'

interface PortalProps {
  children: ReactNode
}

export function Portal({ children }: PortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(document.body)
  }, [])

  return container ? createPortal(children, container) : null
}
