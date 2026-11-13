import { useEffect, useState } from 'react'

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      className="button button--ghost"
      onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true))}
    >
      {copied ? 'Copied' : label}
    </button>
  )
}
