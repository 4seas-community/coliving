import type { ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Recursively extract plain text from a React children tree. Needed because
// react-markdown wraps every markdown node (even plain text) in element
// objects — a naive `String(children)` never sees the actual text.
function childrenToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return ''
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(childrenToText).join('')
  }
  if (typeof node === 'object' && 'props' in node) {
    return childrenToText((node as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

// Pre-process custom :::tdac ... ::: blocks into a single blockquote with a TDAC marker.
// Empty lines inside become `> ` (non-breaking blank quote lines) so the whole block
// stays as one blockquote node and doesn't get split by remark.
function preprocess(raw: string): string {
  return raw.replace(/:::tdac\n([\s\S]*?):::/g, (_match, inner) => {
    const lines = inner
      .trim()
      .split('\n')
      .map((l: string) => (l.trim() === '' ? '>' : `> ${l}`))
      .join('\n')
    // Marker must survive markdown parsing untouched (no bold/italic syntax),
    // otherwise remark converts it to a <strong>/<em> node and the string
    // check in the blockquote renderer below never matches.
    return `> TDAC_MARKER\n>\n${lines}`
  })
}

export function Markdown({ content }: { content: string }) {
  const processed = preprocess(content)
  return (
    <div className="space-y-5 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 border-b border-border pb-2 text-xl font-bold tracking-tight text-foreground">
              <span className="text-neon">{'// '}</span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-base font-bold text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => {
            // If all children are <img> elements, render as a photo grid
            const arr = Array.isArray(children) ? children : [children]
            const allImgs = arr.every(
              (c) => c && typeof c === 'object' && 'type' in c && (c as { type: unknown }).type === 'img',
            )
            if (allImgs && arr.length > 1) {
              return (
                <span className={`grid gap-2 ${arr.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {children}
                </span>
              )
            }
            return (
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {children}
              </p>
            )
          },
          ul: ({ children }) => (
            <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children, className }) => {
            const isTask = className?.includes('task-list-item')
            return (
              <li className={isTask ? 'flex items-start gap-2' : 'flex gap-3'}>
                {!isTask && (
                  <span className="mt-2 inline-block size-1.5 shrink-0 bg-neon" />
                )}
                <span>{children}</span>
              </li>
            )
          },
          input: ({ type, checked }) => {
            if (type === 'checkbox') {
              return (
                <span
                  className={`mr-2 mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? 'border-neon bg-neon text-primary-foreground'
                      : 'border-border'
                  }`}
                >
                  {checked && (
                    <svg viewBox="0 0 12 12" fill="none" className="size-3">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              )
            }
            return null
          },
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">{children}</strong>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-neon underline underline-offset-4 hover:text-foreground"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-sm text-neon">
              {children}
            </code>
          ),
          blockquote: ({ children }) => {
            // Detect TDAC card: first child paragraph contains __TDAC__ marker
            const childArray = Array.isArray(children) ? children : [children]
            // react-markdown interleaves whitespace-only text nodes ("\n")
            // between block children inside a blockquote — skip those to
            // find the actual first element.
            const realChildren = childArray.filter(
              (c) => childrenToText(c).trim() !== '',
            )
            const isTdac = childrenToText(realChildren[0]).includes(
              'TDAC_MARKER',
            )

            if (isTdac) {
              // Remove the marker paragraph, render rest as card
              const rest = realChildren.slice(1)
              return (
                <div className="rounded-xl border border-neon/30 bg-neon/5 px-5 py-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-block size-2 rounded-full bg-neon" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neon">
                      Required Before Arrival
                    </span>
                  </div>
                  <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {rest}
                  </div>
                </div>
              )
            }

            return (
              <blockquote className="border-l-2 border-neon pl-4 text-sm italic text-muted-foreground">
                {children}
              </blockquote>
            )
          },
          img: ({ src, alt }) => (
            <span className="block overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt ?? ''}
                className="h-56 w-full object-cover sm:h-72"
              />
            </span>
          ),
          hr: () => <hr className="border-border" />,
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border bg-card">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">{children}</tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-muted-foreground">{children}</td>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
}
