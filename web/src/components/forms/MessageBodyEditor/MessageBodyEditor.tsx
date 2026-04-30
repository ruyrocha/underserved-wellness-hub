import { forwardRef, useRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Textarea } from '../../primitives/Textarea/Textarea'

const SMS_SEGMENT = 160

export interface TemplateVariable {
  key:     string   // e.g. "first_name"
  label:   string   // e.g. "First name"
}

interface MessageBodyEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value:      string
  onChange:   React.ChangeEventHandler<HTMLTextAreaElement>
  variables?: TemplateVariable[]
  maxLength?: number
  hasError?:  boolean
}

export const MessageBodyEditor = forwardRef<HTMLTextAreaElement, MessageBodyEditorProps>(
  (
    {
      value,
      onChange,
      variables = [],
      maxLength = 1600,
      hasError,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const resolvedRef = (ref ?? internalRef) as React.RefObject<HTMLTextAreaElement>

    const len       = value.length
    const segments  = Math.ceil(len / SMS_SEGMENT) || 1
    const nearLimit = len > maxLength * 0.85

    function insertVariable(key: string) {
      const el    = resolvedRef.current
      if (!el) return
      const token = `{{${key}}}`
      const start = el.selectionStart ?? len
      const end   = el.selectionEnd   ?? len
      const next  = value.slice(0, start) + token + value.slice(end)
      // Synthesize a change event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value',
      )?.set
      nativeInputValueSetter?.call(el, next)
      el.dispatchEvent(new Event('input', { bubbles: true }))
      // Move cursor after token
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + token.length
        el.focus()
      })
    }

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <Textarea
          ref={resolvedRef}
          id={id}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          hasError={hasError}
          rows={5}
          className="resize-none"
          aria-describedby={id ? `${id}-meta` : undefined}
          {...props}
        />

        {/* Counter + segment info */}
        <div
          id={id ? `${id}-meta` : undefined}
          className="flex items-center justify-between text-xs text-neutral-400"
        >
          <span>
            {segments > 1 && (
              <span className="text-yellow-600 font-medium mr-1">
                {segments} SMS segments ·
              </span>
            )}
            Characters
          </span>
          <span className={cn(nearLimit && 'text-yellow-600 font-medium')}>
            {len} / {maxLength}
          </span>
        </div>

        {/* Variable chip palette */}
        {variables.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-neutral-400 self-center mr-1">Insert:</span>
            {variables.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => insertVariable(v.key)}
                className={cn(
                  'inline-flex items-center rounded border border-neutral-200 bg-neutral-50',
                  'px-2 py-0.5 text-xs font-mono text-neutral-600',
                  'hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700',
                  'transition-colors',
                )}
              >
                {`{{${v.key}}}`}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  },
)
MessageBodyEditor.displayName = 'MessageBodyEditor'
