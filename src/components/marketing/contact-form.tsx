"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { FormField, selectClassName } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { contactApi } from "@/lib/api/contact"
import { errorMessage } from "@/lib/api/errors"

export function ContactForm() {
  const [pending, setPending] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const email = String(form.get("email") ?? "").trim()
    const topic = String(form.get("topic") ?? "").trim()
    const message = String(form.get("message") ?? "").trim()
    const body = topic ? `[${topic}] ${message}` : message
    setPending(true)
    try {
      await contactApi.submit({ name, email, message: body })
      toast.success("Message sent")
      e.currentTarget.reset()
    } catch (error) {
      toast.error(errorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      id="contact-form"
      onSubmit={onSubmit}
      className="scroll-mt-24 rounded-[2rem] border border-border bg-card p-6 sm:p-10"
    >
      <h2 className="text-2xl font-semibold sm:text-3xl">Send a message</h2>
      <p className="mt-2 text-sm text-muted-foreground">All fields are required.</p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <FormField id="name" label="Name">
          <Input id="name" name="name" autoComplete="name" placeholder="Emily Carter" required />
        </FormField>
        <FormField id="email" label="Email">
          <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@brand.com" required />
        </FormField>
        <FormField id="topic" label="Topic" className="sm:col-span-2">
          <select id="topic" name="topic" className={selectClassName} defaultValue="question">
            <option value="question">General question</option>
            <option value="feedback">Product feedback</option>
            <option value="billing">Billing</option>
            <option value="partnership">Partnership</option>
          </select>
        </FormField>
        <FormField id="message" label="Message" className="sm:col-span-2">
          <Textarea id="message" name="message" rows={6} placeholder="How can we help?" required />
        </FormField>
      </div>
      <Button type="submit" variant="ink" size="lg" className="mt-8 w-full rounded-2xl sm:w-auto sm:px-8" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}
