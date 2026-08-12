'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { EmailTemplate } from '@/lib/db/schema'
import { updateEmailTemplate, updateGuide } from '@/app/coliving/admin/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SaveButton, Panel } from '@/components/admin/admin-ui'

function TemplateCard({
  secret,
  template,
  title,
  description,
  tags,
}: {
  secret: string
  template?: EmailTemplate
  title: string
  description: string
  tags: string
}) {
  const [subject, setSubject] = useState(template?.subject ?? '')
  const [body, setBody] = useState(template?.body ?? '')

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 rounded border border-neon/30 bg-neon/10 px-2 py-0.5 text-[10px] font-mono text-neon">
          {tags}
        </span>
      </div>
      <div className="space-y-2">
        <Label>Default Subject</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Default Body</Label>
        <Textarea
          rows={7}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      <SaveButton
        onSave={async () => {
          if (!template) return
          await updateEmailTemplate(secret, template.type, { subject, body })
          toast.success(`${title} saved`)
        }}
      />
    </div>
  )
}

function GuideEditor({
  secret,
  slug,
  title,
  badge,
  initial,
}: {
  secret: string
  slug: string
  title: string
  badge: string
  initial: string
}) {
  const [content, setContent] = useState(initial)
  const [charCount, setCharCount] = useState(initial.length)

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    setCharCount(e.target.value.length)
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-foreground">{title}</h4>
          <span className="mt-0.5 inline-block rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            {badge}
          </span>
        </div>
        <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
          {charCount.toLocaleString()} chars
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Supports Markdown &mdash;{' '}
        <code className="text-neon">## headings</code>,{' '}
        <code className="text-neon">**bold**</code>,{' '}
        <code className="text-neon">| table |</code>,{' '}
        <code className="text-neon">- [ ] task</code>,{' '}
        <code className="text-neon">:::tdac ... :::</code> card
      </p>
      <Textarea
        rows={24}
        value={content}
        onChange={handleChange}
        className="font-mono text-xs leading-relaxed"
        spellCheck={false}
      />
      <div className="flex items-center justify-between gap-3">
        <SaveButton
          onSave={async () => {
            await updateGuide(secret, slug, { content })
            toast.success(`${title} saved`)
          }}
          label="Save Guide"
        />
        <button
          type="button"
          onClick={() => {
            setContent(initial)
            setCharCount(initial.length)
          }}
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Reset to last saved
        </button>
      </div>
    </div>
  )
}

export function KnowledgeHubTab({
  secret,
  templates,
  chiangmaiContent,
  internalContent,
}: {
  secret: string
  templates: EmailTemplate[]
  chiangmaiContent: string
  internalContent: string
}) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-neon">{'// '}</span>Knowledge Hub
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Centralised templates and documentation. Update live content without
          touching code.
        </p>
      </header>

      {/* Template Library */}
      <Panel
        title="Template Library"
        subtitle="Variables are auto-filled when an admin triggers an email action. Trigger actions live in Application Hub."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TemplateCard
            secret={secret}
            template={templates.find((t) => t.type === 'need_info')}
            title="Need More Info"
            description="Sent when status is set to Need Info."
            tags="[Name]"
          />
          <TemplateCard
            secret={secret}
            template={templates.find((t) => t.type === 'approved')}
            title="Approval & Welcome"
            description="Sent when status is set to Approved (requires dates)."
            tags="[Name] [Check-in] [Check-out]"
          />
        </div>
      </Panel>

      {/* Handbook Database */}
      <Panel
        title="Handbook Database"
        subtitle="Markdown is rendered live on the respective public and internal guide pages."
      >
        <div className="grid grid-cols-1 gap-6">
          <GuideEditor
            secret={secret}
            slug="chiangmai"
            title="Chiang Mai Guide"
            badge="Public — /coliving/chiangmai"
            initial={chiangmaiContent}
          />
          <GuideEditor
            secret={secret}
            slug="welcome-internal"
            title="Internal Welcome Guide"
            badge="Hidden — /coliving/welcome-internal-2026"
            initial={internalContent}
          />
        </div>
      </Panel>
    </div>
  )
}
