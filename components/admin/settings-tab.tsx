'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Room } from '@/lib/db/schema'
import { updateRoom, updateSiteSetting } from '@/app/coliving/admin/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SaveButton, Panel } from '@/components/admin/admin-ui'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { CheckinGuideEditor } from '@/components/admin/checkin-guide-editor'
import { SITE_SETTINGS_KEYS, type CheckinGuideContent, type ColivingImages } from '@/lib/site-content'

function ThirdRoomSlot({ secret, room }: { secret: string; room?: Room }) {
  const [enabled, setEnabled] = useState(room?.enabled ?? false)
  const [title, setTitle] = useState(room?.title ?? 'The Loft Room')
  const [description, setDescription] = useState(room?.description ?? '')
  const [imageUrl, setImageUrl] = useState(room?.imageUrl ?? '')
  const [single, setSingle] = useState(String(room?.singlePrice ?? ''))
  const [double, setDouble] = useState(String(room?.doublePrice ?? ''))

  async function save() {
    if (!room) return
    await updateRoom(secret, room.slug, {
      enabled,
      title,
      description,
      imageUrl,
      singlePrice: single ? Number(single) : null,
      doublePrice: double ? Number(double) : null,
    })
    toast.success('3rd room updated')
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-foreground">3rd Premium Room</h4>
          <p className="text-xs text-muted-foreground">
            Master toggle pushes a 3rd card onto the public landing page.
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          {enabled ? 'Enabled' : 'Disabled'}
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </label>
      </div>

      {enabled && (
        <div className="space-y-4 border-t border-border pt-4">
          <div className="space-y-2">
            <Label>Room Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Room Description</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Room Image URL</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/rooms/loft.jpg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Solo (USD)</Label>
              <Input
                type="number"
                value={single}
                onChange={(e) => setSingle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Couples / Friends (USD)</Label>
              <Input
                type="number"
                value={double}
                onChange={(e) => setDouble(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      <SaveButton onSave={save} label="Save 3rd Room" />
    </div>
  )
}

function ColivingImagesEditor({ secret, initial }: { secret: string; initial: ColivingImages }) {
  const [images, setImages] = useState(initial)

  async function save() {
    await updateSiteSetting(secret, SITE_SETTINGS_KEYS.colivingImages, images)
    toast.success('Coliving landing images updated')
  }

  return (
    <div className="space-y-4">
      <ImageUploadField
        secret={secret}
        label="Hero image"
        value={images.hero}
        onChange={(url) => setImages({ ...images, hero: url })}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageUploadField
          secret={secret}
          label="Community photo 1"
          value={images.community1}
          onChange={(url) => setImages({ ...images, community1: url })}
        />
        <ImageUploadField
          secret={secret}
          label="Community photo 2"
          value={images.community2}
          onChange={(url) => setImages({ ...images, community2: url })}
        />
        <ImageUploadField
          secret={secret}
          label="Community photo 3"
          value={images.community3}
          onChange={(url) => setImages({ ...images, community3: url })}
        />
        <ImageUploadField
          secret={secret}
          label="Community photo 4"
          value={images.community4}
          onChange={(url) => setImages({ ...images, community4: url })}
        />
      </div>
      <SaveButton onSave={save} label="Save Landing Images" />
    </div>
  )
}

export function SettingsTab({
  secret,
  rooms,
  checkinGuide,
  colivingImages,
}: {
  secret: string
  rooms: Room[]
  checkinGuide: CheckinGuideContent
  colivingImages: ColivingImages
}) {
  const third = rooms.find((r) => r.slug === 'third')

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-neon">{'// '}</span>Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the check-in guide and coliving landing images.
        </p>
      </header>

      <Panel title="3rd Room Extension Slot">
        <ThirdRoomSlot secret={secret} room={third} />
      </Panel>

      <Panel
        title="Check-in Guide"
        subtitle="Edit every text field and photo shown on the private /coliving/checkin guide."
      >
        <CheckinGuideEditor secret={secret} initial={checkinGuide} />
      </Panel>

      <Panel
        title="Coliving Landing Images"
        subtitle="Replace the hero photo and the 4 community photos shown on /coliving."
      >
        <ColivingImagesEditor secret={secret} initial={colivingImages} />
      </Panel>
    </div>
  )
}
