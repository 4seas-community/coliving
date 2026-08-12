'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SaveButton } from '@/components/admin/admin-ui'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { updateSiteSetting } from '@/app/coliving/admin/actions'
import { SITE_SETTINGS_KEYS, type CheckinGuideContent } from '@/lib/site-content'

// Small local helper: update a single field of the content state object.
function useField<T>(
  content: T,
  setContent: (next: T) => void,
) {
  return function set<K extends keyof T>(key: K, value: T[K]) {
    setContent({ ...content, [key]: value })
  }
}

export function CheckinGuideEditor({
  secret,
  initial,
}: {
  secret: string
  initial: CheckinGuideContent
}) {
  const [content, setContent] = useState(initial)
  const set = useField(content, setContent)

  function updateCheckinHour(index: number, key: 'building' | 'hours', value: string) {
    const next = content.checkinHours.map((row, i) =>
      i === index ? { ...row, [key]: value } : row,
    )
    set('checkinHours', next)
  }

  function updateBuildingsTable(
    index: number,
    key: 'building' | 'checkin' | 'card',
    value: string,
  ) {
    const next = content.buildingsTable.map((row, i) =>
      i === index ? { ...row, [key]: value } : row,
    )
    set('buildingsTable', next)
  }

  function updateBuilding(
    index: number,
    key: keyof CheckinGuideContent['buildings'][number],
    value: string,
  ) {
    const next = content.buildings.map((b, i) =>
      i === index ? { ...b, [key]: value } : b,
    )
    set('buildings', next)
  }

  async function save() {
    await updateSiteSetting(secret, SITE_SETTINGS_KEYS.checkinGuide, content)
    toast.success('Check-in Guide updated')
  }

  return (
    <div className="space-y-6">
      {/* 1. Times */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">1. Check-in & Check-out Times</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Check-in</Label>
            <Input value={content.checkIn} onChange={(e) => set('checkIn', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Check-out</Label>
            <Input value={content.checkOut} onChange={(e) => set('checkOut', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Early check-in</Label>
            <Input value={content.earlyCheckIn} onChange={(e) => set('earlyCheckIn', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Late check-out</Label>
            <Input value={content.lateCheckOut} onChange={(e) => set('lateCheckOut', e.target.value)} />
          </div>
        </div>
      </div>

      <Separator />

      {/* 2. Address */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">2. Check-in Address</h4>
        <div className="space-y-2">
          <Label>Address name</Label>
          <Input value={content.addressName} onChange={(e) => set('addressName', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Address lines (one per line)</Label>
          <Textarea
            rows={3}
            value={content.addressLines}
            onChange={(e) => set('addressLines', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Google Maps URL</Label>
          <Input value={content.addressMapsUrl} onChange={(e) => set('addressMapsUrl', e.target.value)} />
        </div>
        <ImageUploadField
          secret={secret}
          label="Building photo"
          value={content.addressPhoto}
          onChange={(url) => set('addressPhoto', url)}
        />
      </div>

      <Separator />

      {/* 3. Front Desk */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">3. Front Desk (Welcome Desk)</h4>
        <div className="space-y-2">
          <Label>Front desk text (blank line = new paragraph, lines starting with &quot;- &quot; become a list)</Label>
          <Textarea
            rows={6}
            value={content.frontDeskText}
            onChange={(e) => set('frontDeskText', e.target.value)}
          />
        </div>
        <ImageUploadField
          secret={secret}
          label="Front desk photo"
          value={content.frontDeskPhoto}
          onChange={(url) => set('frontDeskPhoto', url)}
        />
        <div className="space-y-2">
          <Label>Front desk photo caption</Label>
          <Input
            value={content.frontDeskPhotoCaption}
            onChange={(e) => set('frontDeskPhotoCaption', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* 4. Check-in Hours table */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">4. Check-in Hours</h4>
        {content.checkinHours.map((row, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              value={row.building}
              onChange={(e) => updateCheckinHour(i, 'building', e.target.value)}
              placeholder="Building"
            />
            <Input
              value={row.hours}
              onChange={(e) => updateCheckinHour(i, 'hours', e.target.value)}
              placeholder="Check-in window"
            />
          </div>
        ))}
      </div>

      <Separator />

      {/* 5. Late check-in */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">5. Late Check-in</h4>
        <div className="space-y-2">
          <Label>Late check-in text</Label>
          <Textarea
            rows={4}
            value={content.lateCheckinText}
            onChange={(e) => set('lateCheckinText', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Highlighted notice</Label>
          <Input
            value={content.lateCheckinNotice}
            onChange={(e) => set('lateCheckinNotice', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Baiyoke exception text</Label>
          <Textarea
            rows={2}
            value={content.lateCheckinBaiyokeText}
            onChange={(e) => set('lateCheckinBaiyokeText', e.target.value)}
          />
        </div>
        <ImageUploadField
          secret={secret}
          label="Late check-in photo"
          value={content.lateCheckinPhoto}
          onChange={(url) => set('lateCheckinPhoto', url)}
        />
        <div className="space-y-2">
          <Label>Late check-in photo caption</Label>
          <Input
            value={content.lateCheckinPhotoCaption}
            onChange={(e) => set('lateCheckinPhotoCaption', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* 6. Buildings overview */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">6. Our Buildings — Overview</h4>
        <div className="space-y-2">
          <Label>Walk note</Label>
          <Input
            value={content.buildingsWalkNote}
            onChange={(e) => set('buildingsWalkNote', e.target.value)}
          />
        </div>
        <ImageUploadField
          secret={secret}
          label="Overview photo"
          value={content.buildingsOverviewPhoto}
          onChange={(url) => set('buildingsOverviewPhoto', url)}
        />
        <div className="space-y-2">
          <Label>Overview photo caption</Label>
          <Input
            value={content.buildingsOverviewPhotoCaption}
            onChange={(e) => set('buildingsOverviewPhotoCaption', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Overview table</Label>
          {content.buildingsTable.map((row, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                value={row.building}
                onChange={(e) => updateBuildingsTable(i, 'building', e.target.value)}
                placeholder="Building"
              />
              <Input
                value={row.checkin}
                onChange={(e) => updateBuildingsTable(i, 'checkin', e.target.value)}
                placeholder="Check in at"
              />
              <Input
                value={row.card}
                onChange={(e) => updateBuildingsTable(i, 'card', e.target.value)}
                placeholder="Key card"
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 7. Building details */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-foreground">7. About Each Building</h4>
        {content.buildings.map((building, i) => (
          <div key={building.key} className="space-y-3 rounded-lg border border-border bg-background p-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={building.name}
                onChange={(e) => updateBuilding(i, 'name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Address / description line</Label>
              <Textarea
                rows={2}
                value={building.address}
                onChange={(e) => updateBuilding(i, 'address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Maps URL</Label>
              <Input
                value={building.mapsUrl}
                onChange={(e) => updateBuilding(i, 'mapsUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Warning (optional, shown as amber callout)</Label>
              <Input
                value={building.warning}
                onChange={(e) => updateBuilding(i, 'warning', e.target.value)}
              />
            </div>
            <ImageUploadField
              secret={secret}
              label="Building photo"
              value={building.photo}
              onChange={(url) => updateBuilding(i, 'photo', url)}
            />
            <div className="space-y-2">
              <Label>Photo caption</Label>
              <Input
                value={building.photoCaption}
                onChange={(e) => updateBuilding(i, 'photoCaption', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={building.description}
                onChange={(e) => updateBuilding(i, 'description', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* 8. WiFi */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">8. WiFi</h4>
        <div className="space-y-2">
          <Label>WiFi text</Label>
          <Textarea rows={2} value={content.wifiText} onChange={(e) => set('wifiText', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Pattita note</Label>
          <Textarea
            rows={2}
            value={content.wifiPattitaNote}
            onChange={(e) => set('wifiPattitaNote', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Library warning</Label>
          <Textarea
            rows={2}
            value={content.wifiLibraryWarning}
            onChange={(e) => set('wifiLibraryWarning', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* 9. Links */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-foreground">9. Chiang Mai Guide & Community Links</h4>
        <div className="space-y-2">
          <Label>Chiang Mai Guide URL</Label>
          <Input
            value={content.chiangmaiGuideUrl}
            onChange={(e) => set('chiangmaiGuideUrl', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp URL</Label>
          <Input value={content.whatsappUrl} onChange={(e) => set('whatsappUrl', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Telegram URL</Label>
          <Input value={content.telegramUrl} onChange={(e) => set('telegramUrl', e.target.value)} />
        </div>
      </div>

      <SaveButton onSave={save} label="Save Check-in Guide" />
    </div>
  )
}
