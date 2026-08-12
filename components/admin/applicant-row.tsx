'use client'

import { ChevronDown, Loader2, BedDouble, Mail, MailX } from 'lucide-react'
import type { Application, EmailTemplate, RoomUnit, StatusLog } from '@/lib/db/schema'
import { APPLICATION_STATUSES } from '@/lib/config'
import {
  contactLink,
  fillTemplate,
  formatAdminDate,
  mailtoLink,
  statusColor,
} from '@/lib/admin-utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  useApplicationStatus,
  useExpandableRow,
  useResidentRecordForm,
  useRoomAssignmentSuggestions,
  useTagEditor,
} from '@/components/admin/applicant-row-hooks'
import {
  ApplicantAnswers,
  QuickReachToolbar,
  ResidentRecordSection,
  RoomAssignmentSection,
  StatusHistory,
  StayScheduler,
} from '@/components/admin/applicant-row-sections'

export function ApplicantRow({
  secret,
  app,
  templates,
  roomUnits,
  assignedUnit,
  occupiedUnitIds,
  logs,
  autoOpen,
  onAutoOpenHandled,
}: {
  secret: string
  app: Application
  templates: EmailTemplate[]
  roomUnits: RoomUnit[]
  assignedUnit?: RoomUnit
  occupiedUnitIds: Set<number>
  logs: StatusLog[]
  autoOpen?: boolean
  onAutoOpenHandled?: () => void
}) {
  const { open, setOpen, highlight, rowRef } = useExpandableRow(
    autoOpen,
    onAutoOpenHandled,
  )

  const {
    status,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    toolbarOpen,
    pending,
    onStatusChange,
    commitCheckIn,
    commitCheckOut,
    markEmailSent,
    skipEmail,
  } = useApplicationStatus(secret, app)

  const { ranked, suggestedIds, roomPending, assignRoom } =
    useRoomAssignmentSuggestions(secret, app, roomUnits, occupiedUnitIds)

  const residentRecord = useResidentRecordForm(secret, app)
  const tagEditor = useTagEditor(secret, app)

  const needInfoTpl = templates.find((t) => t.type === 'need_info')
  const approvedTpl = templates.find((t) => t.type === 'approved')
  const chat = contactLink(app.contactMethod, app.imContact)

  const needInfoMail = (() => {
    const { subject, body } = fillTemplate(needInfoTpl, { name: app.name })
    return mailtoLink(app.email, subject, body)
  })()

  const approvedMail = (() => {
    const { subject, body } = fillTemplate(approvedTpl, {
      name: app.name,
      checkIn,
      checkOut,
    })
    return mailtoLink(app.email, subject, body)
  })()

  const approvedReady = status === 'Approved' && !!checkIn && !!checkOut

  return (
    <>
      <tr
        ref={rowRef}
        className={cn(
          'border-t border-border align-top transition-colors duration-500',
          highlight && 'bg-neon/10',
        )}
      >
        <td className="p-3">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 text-left"
          >
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180',
              )}
            />
            <span className="font-bold text-foreground">{app.name}</span>
          </button>
        </td>
        <td className="p-3 text-sm text-muted-foreground">{app.email}</td>
        <td className="hidden p-3 text-sm text-muted-foreground lg:table-cell">
          {app.imContact ? (
            <span>
              {app.contactMethod && (
                <span className="mr-1 text-xs font-bold uppercase text-neon">
                  {app.contactMethod}
                </span>
              )}
              {app.imContact}
            </span>
          ) : (
            <span className="opacity-40">&mdash;</span>
          )}
        </td>
        <td className="hidden max-w-[16rem] truncate p-3 text-sm text-muted-foreground xl:table-cell">
          {app.currentProject || <span className="opacity-40">&mdash;</span>}
        </td>
        <td className="max-w-40 truncate p-3 text-sm text-muted-foreground">
          {assignedUnit ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <BedDouble className="size-3.5 shrink-0 text-neon" />
              {assignedUnit.building} {assignedUnit.roomNo}
            </span>
          ) : (
            <span className="opacity-40">&mdash;</span>
          )}
        </td>
        <td className="p-3">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger
              className={cn('h-8 w-[150px] border text-xs', statusColor(status))}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {logs[0] && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
              {formatAdminDate(logs[0].createdAt)}
              {logs[0].emailSent ? (
                <Mail className="size-2.5 shrink-0 text-neon" />
              ) : (
                <MailX className="size-2.5 shrink-0 opacity-60" />
              )}
            </p>
          )}
        </td>
        <td className="p-3 text-right">
          {pending && (
            <Loader2 className="ml-auto size-4 animate-spin text-neon" />
          )}
        </td>
      </tr>

      {status === 'Approved' && (
        <StayScheduler
          checkIn={checkIn}
          onCheckInChange={setCheckIn}
          onCheckInCommit={commitCheckIn}
          checkOut={checkOut}
          onCheckOutChange={setCheckOut}
          onCheckOutCommit={commitCheckOut}
        />
      )}

      {toolbarOpen && (status === 'Need Info' || status === 'Approved') && (
        <QuickReachToolbar
          status={status}
          needInfoMail={needInfoMail}
          approvedMail={approvedMail}
          approvedReady={approvedReady}
          chat={chat}
          onEmailLinkClick={markEmailSent}
          onSkipEmail={skipEmail}
        />
      )}

      {open && (
        <tr className="bg-card/30">
          <td colSpan={7} className="px-3 pb-4">
            <div className="flex flex-col gap-4">
              <ApplicantAnswers app={app} />

              <StatusHistory logs={logs} />

              <RoomAssignmentSection
                app={app}
                assignedUnit={assignedUnit}
                ranked={ranked}
                suggestedIds={suggestedIds}
                roomPending={roomPending}
                onAssign={assignRoom}
              />

              <ResidentRecordSection
                tags={tagEditor.tags}
                tagInput={tagEditor.tagInput}
                onTagInputChange={tagEditor.setTagInput}
                tagsPending={tagEditor.pending}
                onAddTag={tagEditor.addTag}
                onRemoveTag={tagEditor.removeTag}
                roomAssignment={residentRecord.roomAssignment}
                onRoomAssignmentChange={residentRecord.setRoomAssignment}
                contribution={residentRecord.contribution}
                onContributionChange={residentRecord.setContribution}
                internalFeedback={residentRecord.internalFeedback}
                onInternalFeedbackChange={residentRecord.setInternalFeedback}
                message={residentRecord.message}
                saving={residentRecord.pending}
                onSave={residentRecord.save}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
