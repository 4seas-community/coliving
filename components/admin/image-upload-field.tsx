'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ImageIcon, Loader2, Upload } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { uploadSiteImage } from '@/app/coliving/admin/actions'

// Editable image field used across the Settings tab: a live thumbnail
// preview, a URL text input (paste any external link), and an
// upload/replace button that stores the file in Vercel Blob and swaps
// the field's value to the returned public URL.
export function ImageUploadField({
  secret,
  label,
  value,
  onChange,
}: {
  secret: string
  label: string
  value: string
  onChange: (url: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [previewError, setPreviewError] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    startTransition(async () => {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadSiteImage(secret, formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setPreviewError(false)
      onChange(result.url)
      toast.success('Image uploaded')
    })
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-3">
        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {value && !previewError ? (
            <img
              src={value}
              alt={`${label} preview`}
              className="size-full object-cover"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon className="size-5" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input
            value={value}
            onChange={(e) => {
              setPreviewError(false)
              onChange(e.target.value)
            }}
            placeholder="/path/to/image.jpg or https://..."
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
            className="w-fit gap-2 text-xs"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {value ? 'Replace image' : 'Upload image'}
          </Button>
        </div>
      </div>
    </div>
  )
}
