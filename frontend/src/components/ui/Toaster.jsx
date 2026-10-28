import { Toaster as SonnerToaster, toast } from 'sonner'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { useApp } from '@/context/AppContext'

/**
 * FocusFlow Redesigned Toaster
 * Polished, vibrant, accessible notification UI extending Sonner
 * with dedicated semantic accents for light and dark themes.
 */
export function Toaster(props) {
  const { state } = useApp()
  const theme = state?.theme === 'dark' ? 'dark' : 'light'

  return (
    <SonnerToaster
      theme={theme}
      position="bottom-right"
      closeButton
      expand={false}
      visibleToasts={4}
      duration={3600}
      offset="20px"
      gap={10}
      icons={{
        success: (
          <div className="focusflow-toast-icon-badge focusflow-toast-icon-success" aria-hidden="true">
            <CheckCircle2 className="w-4 h-4 stroke-[2.25]" />
          </div>
        ),
        error: (
          <div className="focusflow-toast-icon-badge focusflow-toast-icon-error" aria-hidden="true">
            <AlertCircle className="w-4 h-4 stroke-[2.25]" />
          </div>
        ),
        warning: (
          <div className="focusflow-toast-icon-badge focusflow-toast-icon-warning" aria-hidden="true">
            <AlertTriangle className="w-4 h-4 stroke-[2.25]" />
          </div>
        ),
        info: (
          <div className="focusflow-toast-icon-badge focusflow-toast-icon-info" aria-hidden="true">
            <Info className="w-4 h-4 stroke-[2.25]" />
          </div>
        ),
        loading: (
          <div className="focusflow-toast-icon-badge focusflow-toast-icon-reminder" aria-hidden="true">
            <Loader2 className="w-4 h-4 animate-spin stroke-[2.25]" />
          </div>
        ),
      }}
      toastOptions={{
        className: 'focusflow-toast',
      }}
      {...props}
    />
  )
}

/**
 * Study reminder notification helper with FocusFlow violet/indigo styling
 */
export const reminderToast = (title, options = {}) => {
  return toast(title, {
    icon: (
      <div className="focusflow-toast-icon-badge focusflow-toast-icon-reminder" aria-hidden="true">
        <Sparkles className="w-4 h-4 stroke-[2.25]" />
      </div>
    ),
    className: 'focusflow-toast-reminder',
    ...options,
  })
}

export default Toaster
