'use client'

import React, { useEffect, useRef, forwardRef } from 'react'
import { MathfieldElement } from 'mathlive'

// Extend the MathfieldElement to include React props
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement> & {
        value?: string
        placeholder?: string
        disabled?: boolean
        'read-only'?: boolean
        'virtual-keyboard-mode'?: 'manual' | 'onfocus' | 'off'
        'virtual-keyboards'?: string
        'default-mode'?: 'text' | 'math'
        'smart-fence'?: boolean | string
        'smart-superscript'?: boolean | string
        'remove-extraneous-parentheses'?: boolean | string
      }
    }
  }
}

interface MathFieldProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  virtualKeyboardMode?: 'manual' | 'onfocus' | 'off'
  virtualKeyboards?: string
  readOnly?: boolean
  rows?: number
  id?: string
}

const MathField = forwardRef<MathfieldElement, MathFieldProps>(
  ({ 
    value = '', 
    onChange, 
    placeholder = 'Enter mathematical expression...', 
    className = '',
    disabled = false,
    virtualKeyboardMode = 'manual',
    virtualKeyboards = 'all',
    readOnly = false,
    rows = 4,
    id,
    ...props 
  }, ref) => {
    const mathFieldRef = useRef<MathfieldElement>(null)

    useEffect(() => {
      // Register the custom element
      if (typeof window !== 'undefined' && !customElements.get('math-field')) {
        try {
          customElements.define('math-field', MathfieldElement)
          console.log('MathField custom element registered')
        } catch (error) {
          console.error('Error registering MathField custom element:', error)
        }
      }
    }, [])

    useEffect(() => {
      const mathField = mathFieldRef.current
      if (!mathField) return

      // Configure MathLive fonts to use CDN
      if (typeof window !== 'undefined') {
        try {
          MathfieldElement.fontsDirectory = 'https://unpkg.com/mathlive@0.107.0/dist/fonts/'
          console.log('MathLive fonts configured to use CDN')
        } catch (error) {
          console.error('Error configuring MathLive fonts:', error)
        }
      }

      // Configure the mathfield properly
      mathField.disabled = false
      mathField.readOnly = false
      
      // Set essential properties
      mathField.setAttribute('contenteditable', 'true')
      mathField.setAttribute('tabindex', '0')
      
      // Configure virtual keyboard using attributes only
      if (virtualKeyboardMode !== 'off') {
        mathField.setAttribute('virtual-keyboard-mode', virtualKeyboardMode)
        mathField.setAttribute('virtual-keyboards', virtualKeyboards)
        mathField.setAttribute('default-mode', 'text')
        mathField.setAttribute('smart-fence', 'true')
        mathField.setAttribute('smart-superscript', 'true')
        mathField.setAttribute('remove-extraneous-parentheses', 'true')
        mathField.setAttribute('selection-style', 'outlined')
        
        console.log('MathField configured with attributes')
      }
      
      // Set colors using CSS custom properties
      mathField.style.setProperty('--text-color', '#ffffff')
      mathField.style.setProperty('--selection-background-color', '#3b82f680')
      mathField.style.setProperty('--caret-color', '#3b82f6')
      mathField.style.color = '#ffffff'
      mathField.style.caretColor = '#3b82f6'

      // Add click handler to show keyboard only on click
      const handleClick = () => {
        if (virtualKeyboardMode === 'manual' && mathField.executeCommand) {
          mathField.executeCommand('toggleVirtualKeyboard')
        }
      }
      
      mathField.addEventListener('click', handleClick)
      
      // Cleanup
      return () => {
        mathField.removeEventListener('click', handleClick)
      }
      
    }, [virtualKeyboardMode, virtualKeyboards])

    // Handle virtual keyboard backspace specifically
    useEffect(() => {
      const mathField = mathFieldRef.current
      if (!mathField) return

      const handleKeydown = (event: KeyboardEvent) => {
        console.log('Key pressed:', event.key, event.code)
        
        if (event.key === 'Backspace' || event.code === 'Backspace') {
          event.preventDefault()
          event.stopPropagation()
          
          try {
            // Use MathLive's built-in command
            mathField.executeCommand('deleteBackward')
            console.log('Backspace command executed successfully')
          } catch (error) {
            console.error('Backspace command failed:', error)
          }
          return false
        }
      }

      // Add event listeners
      mathField.addEventListener('keydown', handleKeydown, true)
      document.addEventListener('keydown', handleKeydown, true)

      // Handle virtual keyboard clicks
      const handleVirtualKeyClick = (event: Event) => {
        const target = event.target as HTMLElement
        
        // Check if it's a backspace button on virtual keyboard
        if (target && (
          target.textContent?.includes('⌫') || 
          target.getAttribute('data-key') === 'Backspace' ||
          target.classList.contains('ML__keyboard-key--backspace') ||
          target.closest('[data-key="Backspace"]')
        )) {
          event.preventDefault()
          event.stopPropagation()
          
          console.log('Virtual keyboard backspace clicked')
          
          try {
            mathField.executeCommand('deleteBackward')
            console.log('Virtual backspace executed')
          } catch (error) {
            console.error('Virtual backspace failed:', error)
          }
          
          return false
        }
      }

      // Listen for clicks on the virtual keyboard
      document.addEventListener('click', handleVirtualKeyClick, true)
      document.addEventListener('touchend', handleVirtualKeyClick, true)

      return () => {
        mathField.removeEventListener('keydown', handleKeydown, true)
        document.removeEventListener('keydown', handleKeydown, true)
        document.removeEventListener('click', handleVirtualKeyClick, true)
        document.removeEventListener('touchend', handleVirtualKeyClick, true)
      }
    }, [])

    useEffect(() => {
      const mathField = mathFieldRef.current
      if (!mathField) return

      // Set up input event listener
      const handleInput = (event: Event) => {
        const target = event.target as MathfieldElement
        onChange?.(target.value)
      }

      const handleFocus = () => {
        console.log('MathField focused')
        // Ensure cursor is visible
        mathField.style.caretColor = '#3b82f6'
        
        if (virtualKeyboardMode !== 'off') {
          try {
            mathField.executeCommand('showVirtualKeyboard')
          } catch (error) {
            console.error('Error showing virtual keyboard:', error)
          }
        }
      }

      const handleBlur = () => {
        console.log('MathField blurred')
      }

      mathField.addEventListener('input', handleInput)
      mathField.addEventListener('focus', handleFocus)
      mathField.addEventListener('blur', handleBlur)

      return () => {
        mathField.removeEventListener('input', handleInput)
        mathField.removeEventListener('focus', handleFocus)
        mathField.removeEventListener('blur', handleBlur)
      }
    }, [onChange, virtualKeyboardMode])

    useEffect(() => {
      const mathField = mathFieldRef.current
      if (!mathField) return

      // Update value when prop changes
      if (value !== mathField.value) {
        mathField.setValue(value, { silenceNotifications: true })
      }
    }, [value])

    // Ensure proper styling for virtual keyboard
    useEffect(() => {
      if (virtualKeyboardMode === 'off') return

      const styleVirtualKeyboard = () => {
        const keyboards = document.querySelectorAll('.ML__virtual-keyboard, .ML__virtual-keyboard-container, .ML__keyboard')
        
        keyboards.forEach((keyboard) => {
          const element = keyboard as HTMLElement
          element.style.zIndex = '999999'
          element.style.position = 'fixed'
          element.style.visibility = 'visible'
          element.style.pointerEvents = 'auto'
        })

        // Style backspace keys specifically
        const backspaceKeys = document.querySelectorAll('.ML__keyboard-key[data-key="Backspace"], .ML__keyboard-key--backspace')
        backspaceKeys.forEach((key) => {
          const element = key as HTMLElement
          element.style.pointerEvents = 'auto'
          element.style.cursor = 'pointer'
          element.style.opacity = '1'
        })
      }

      const interval = setInterval(styleVirtualKeyboard, 100)
      
      // Also run immediately
      styleVirtualKeyboard()

      return () => {
        clearInterval(interval)
      }
    }, [virtualKeyboardMode])

    return (
      <div className="relative">
        <math-field
          ref={(element) => {
            if (element) {
              (mathFieldRef as React.MutableRefObject<MathfieldElement | null>).current = element
              if (typeof ref === 'function') {
                ref(element)
              } else if (ref) {
                (ref as React.MutableRefObject<MathfieldElement | null>).current = element
              }
            }
          }}
          id={id}
          placeholder={placeholder}
          disabled={false}
          read-only={false}
          virtual-keyboard-mode={virtualKeyboardMode}
          virtual-keyboards={virtualKeyboards}
          default-mode="text"
          smart-fence="true"
          smart-superscript="true"
          remove-extraneous-parentheses="true"
          style={{
            minHeight: `${rows * 1.5}rem`,
            width: '100%',
            fontSize: '16px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontStyle: 'normal',
            fontWeight: 'normal',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.375rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#ffffff',
            padding: '0.75rem',
            outline: 'none',
            transition: 'border-color 0.2s ease-in-out',
            zIndex: 1,
            caretColor: '#3b82f6',
          }}
          className={`focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 ${className}`}
          {...props}
        />
        
        <style jsx>{`
          math-field {
            --text-color: #ffffff !important;
            --selection-background-color: #3b82f680 !important;
            --caret-color: #3b82f6 !important;
          }
          
          math-field .ML__text {
            color: #ffffff !important;
            opacity: 1 !important;
          }
          
          math-field .ML__selection {
            background-color: #3b82f680 !important;
          }
          
          math-field .ML__caret {
            border-color: #3b82f6 !important;
            display: block !important;
            visibility: visible !important;
          }
        `}</style>
      </div>
    )
  }
)

MathField.displayName = 'MathField'

export default MathField