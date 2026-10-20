"use client"

import { useState } from "react"
import { Download, FileText, Mail, Pencil, Plus, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { allSections, cadenceLabel, hourLabel, isEmail, parseRecipients, rangeOptions, sectionLabels, weekdays } from "@/components/dashboard/reports/report-options"
import { EmptyState, ErrorState, ListSkeleton, PageHeader, Panel } from "@/components/dashboard/ui"
import { FormField, selectClassName } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { networks, type NetworkId } from "@/config/networks"
import { analyticsHistoryDays } from "@/config/pricing"
import { useBrandTimeZone } from "@/hooks/use-brand-timezone"
import { errorMessage } from "@/lib/api/errors"
import { saveBlob } from "@/lib/api/reports"
import type { ReportFrequency, ReportSchedule, ReportSection } from "@/lib/api/types"
import { formatInZone } from "@/lib/tz-format"
import { useAccounts } from "@/lib/queries/accounts"
import { useBilling } from "@/lib/queries/billing"
import { useCreateSchedule, useDeleteSchedule, useDownloadReport, useReportSchedules, useSendTestReport, useUpdateSchedule } from "@/lib/queries/reports"

export function ReportsView() {
  return (
    <>
      <PageHeader title="Reports" description="Download a PDF of your analytics, or have one emailed to you and your clients on a schedule." />
      <div className="space-y-6">
        <DownloadPanel />
        <SchedulesPanel />
      </div>
    </>
  )
}

function SectionPicker({ value, onChange }: { value: ReportSection[]; onChange: (next: ReportSection[]) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {allSections.map((s) => {
        const checked = value.includes(s)
        return (
          <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={checked} onCheckedChange={(on) => onChange(on ? [...value, s] : value.filter((x) => x !== s))} />
            {sectionLabels[s]}
          </label>
        )
      })}
    </div>
  )
}

function DownloadPanel() {
  const billing = useBilling()
  const accounts = useAccounts()
  const download = useDownloadReport()
  const [range, setRange] = useState(28)
  const [network, setNetwork] = useState<NetworkId | "">("")
  const [sections, setSections] = useState<ReportSection[]>(allSections)

  const historyDays = billing.data ? analyticsHistoryDays(billing.data.subscription.planId) : 365
  const connected = (accounts.data ?? []).filter((a) => a.status !== "disconnected" && a.available !== false)

  function onDownload() {
    download.mutate(
      { range, network: network || undefined, sections: sections.length === allSections.length ? undefined : sections },
      {
        onSuccess: ({ blob, filename }) => {
          saveBlob(blob, filename)
          toast.success("Report downloaded.")
        },
        onError: (error) => toast.error(errorMessage(error)),
      }
    )
  }

  return (
    <Panel title="Download a report" bodyClassName="p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="report-range" label="Period" hint={historyDays < 90 ? "Longer periods need a paid plan." : undefined}>
          <select id="report-range" className={selectClassName} value={range} onChange={(e) => setRange(Number(e.target.value))}>
            {rangeOptions.map((o) => (
              <option key={o.days} value={o.days} disabled={o.days > historyDays}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="report-network" label="Networks">
          <select id="report-network" className={selectClassName} value={network} onChange={(e) => setNetwork(e.target.value as NetworkId | "")}>
            <option value="">All connected networks</option>
            {connected.map((a) => (
              <option key={a.network} value={a.network}>
                {networks[a.network].name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">Include</p>
        <SectionPicker value={sections} onChange={setSections} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={onDownload} disabled={download.isPending || sections.length === 0}>
          <Download /> {download.isPending ? "Preparing…" : "Download PDF"}
        </Button>
        <p className="text-xs text-muted-foreground">Numbers a platform doesn&apos;t report show as &ldquo;n/a&rdquo;, never as zero.</p>
      </div>
    </Panel>
  )
}

function SchedulesPanel() {
  const { data, error, refetch } = useReportSchedules()
  const timeZone = useBrandTimeZone()
  const update = useUpdateSchedule()
  const remove = useDeleteSchedule()
  const test = useSendTestReport()
  const [editing, setEditing] = useState<ReportSchedule | "new" | null>(null)

  return (
    <Panel
      title="Scheduled reports"
      action={
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus /> New schedule
        </Button>
      }
      bodyClassName="p-5 sm:p-6"
    >
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data ? (
        <ListSkeleton rows={2} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="No scheduled reports yet"
          description="Pick a day and the people who should get it. Each email has the PDF attached and the key numbers in the message."
        />
      ) : (
        <ul className="divide-y divide-border">
          {data.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">{cadenceLabel(s)}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">To {s.recipients.join(", ")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {s.enabled ? `Next: ${formatInZone(s.nextRunAt, timeZone, "EEE d MMM, HH:mm")}` : "Paused"}
                  {s.lastSentAt ? ` · Last sent ${formatInZone(s.lastSentAt, timeZone, "d MMM, HH:mm")}` : ""}
                </p>
                {s.lastError ? <p className="mt-1 text-xs text-destructive">Last run failed: {s.lastError}</p> : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Switch
                  checked={s.enabled}
                  aria-label={`${s.enabled ? "Pause" : "Resume"} ${s.name}`}
                  onCheckedChange={(enabled) => update.mutate({ id: s.id, patch: { enabled } }, { onError: (e) => toast.error(errorMessage(e)) })}
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={test.isPending}
                  onClick={() =>
                    test.mutate(s.id, {
                      onSuccess: ({ sentTo }) => toast.success(`Test report sent to ${sentTo}.`),
                      onError: (e) => toast.error(errorMessage(e)),
                    })
                  }
                >
                  <Send /> Send test to me
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(s)}>
                  <Pencil /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => {
                    if (!window.confirm(`Delete "${s.name}"? Reports already sent are not affected.`)) return
                    remove.mutate(s.id, { onSuccess: () => toast.success("Schedule deleted."), onError: (e) => toast.error(errorMessage(e)) })
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing ? <ScheduleDialog schedule={editing === "new" ? null : editing} timeZone={timeZone} onClose={() => setEditing(null)} /> : null}
    </Panel>
  )
}

function ScheduleDialog({ schedule, timeZone, onClose }: { schedule: ReportSchedule | null; timeZone: string; onClose: () => void }) {
  const create = useCreateSchedule()
  const update = useUpdateSchedule()
  const [name, setName] = useState(schedule?.name ?? "Weekly report")
  const [frequency, setFrequency] = useState<ReportFrequency>(schedule?.frequency ?? "weekly")
  const [weekday, setWeekday] = useState(schedule?.weekday ?? 1)
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.dayOfMonth ?? 1)
  const [hour, setHour] = useState(schedule?.hour ?? 8)
  const [rangeDays, setRangeDays] = useState(schedule?.rangeDays ?? 7)
  const [sections, setSections] = useState<ReportSection[]>(schedule?.sections.length ? schedule.sections : allSections)
  const [recipients, setRecipients] = useState((schedule?.recipients ?? []).join(", "))
  const [problem, setProblem] = useState<string | null>(null)
  const pending = create.isPending || update.isPending

  function save() {
    const list = parseRecipients(recipients)
    const bad = list.find((e) => !isEmail(e))
    if (!name.trim()) return setProblem("Give the schedule a name.")
    if (list.length === 0) return setProblem("Add at least one recipient.")
    if (bad) return setProblem(`"${bad}" isn't a valid email address.`)
    if (list.length > 10) return setProblem("You can send to up to 10 recipients.")
    if (sections.length === 0) return setProblem("Pick at least one section.")
    setProblem(null)
    const body = {
      name: name.trim(),
      frequency,
      weekday,
      dayOfMonth,
      hour,
      rangeDays,
      recipients: list,
      sections: sections.length === allSections.length ? [] : sections,
    }
    const done = {
      onSuccess: () => {
        toast.success(schedule ? "Schedule saved." : "Schedule created.")
        onClose()
      },
      onError: (e: unknown) => setProblem(errorMessage(e)),
    }
    if (schedule) update.mutate({ id: schedule.id, patch: body }, done)
    else create.mutate(body, done)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit schedule" : "New report schedule"}</DialogTitle>
          <DialogDescription>
            <Mail className="mr-1 inline size-3.5" />
            Each recipient gets the PDF as an attachment. Times are in {timeZone}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField id="sched-name" label="Name">
            <Input id="sched-name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="sched-frequency" label="Repeats">
              <select
                id="sched-frequency"
                className={selectClassName}
                value={frequency}
                onChange={(e) => {
                  const next = e.target.value as ReportFrequency
                  // Keep the natural period for the cadence unless the user already chose a different one.
                  if (rangeDays === (frequency === "weekly" ? 7 : 28)) setRangeDays(next === "weekly" ? 7 : 28)
                  setFrequency(next)
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </FormField>
            {frequency === "weekly" ? (
              <FormField id="sched-weekday" label="On">
                <select id="sched-weekday" className={selectClassName} value={weekday} onChange={(e) => setWeekday(Number(e.target.value))}>
                  {weekdays.map((d, i) => (
                    <option key={d} value={i + 1}>
                      {d}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              <FormField id="sched-day" label="On day" hint="Up to the 28th so every month has it.">
                <select id="sched-day" className={selectClassName} value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <FormField id="sched-hour" label="At">
              <select id="sched-hour" className={selectClassName} value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                {Array.from({ length: 24 }, (_, h) => h).map((h) => (
                  <option key={h} value={h}>
                    {hourLabel(h)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="sched-range" label="Covers">
              <select id="sched-range" className={selectClassName} value={rangeDays} onChange={(e) => setRangeDays(Number(e.target.value))}>
                {rangeOptions.map((o) => (
                  <option key={o.days} value={o.days}>
                    {o.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField id="sched-recipients" label="Send to" hint="Separate emails with commas, spaces or new lines. Up to 10.">
            <textarea
              id="sched-recipients"
              rows={2}
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="you@company.com, client@company.com"
              className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </FormField>
          <div>
            <p className="mb-2 text-sm font-medium">Include</p>
            <SectionPicker value={sections} onChange={setSections} />
          </div>
          {problem ? (
            <p role="alert" className="text-sm text-destructive">
              {problem}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? "Saving…" : schedule ? "Save changes" : "Create schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
