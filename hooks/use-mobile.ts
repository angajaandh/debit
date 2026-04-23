import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    
    // Initial check without causing cascading render warning
    const initialMatch = window.innerWidth < MOBILE_BREAKPOINT
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(initialMatch)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
