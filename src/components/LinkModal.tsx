"use client"

import * as React from "react"
import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Id } from "../../convex/_generated/dataModel"
import { toast } from "sonner"
import { Plus, Loader2, Edit } from "lucide-react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { DropdownMenuItem } from "./ui/dropdown-menu"

interface LinkModalProps {
  link?: {
    _id: Id<"links">
    originalUrl: string
    shortCode: string
  }
  mode?: "create" | "edit"
}

export function LinkModal({ link, mode = "create" }: LinkModalProps) {
  const [open, setOpen] = useState(false)
  const [originalUrl, setOriginalUrl] = useState(link?.originalUrl || "")
  const [customCode, setCustomCode] = useState(link?.shortCode || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createShortLink = useMutation(api.links.createShortLink)
  const updateLink = useMutation(api.links.updateLink)

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateShortCode = (code: string): boolean => {
    if (code.length === 0) return true // Allow empty for auto-generation
    if (code.length > 32) return false
    // Only allow alphanumeric characters and hyphens
    return /^[a-zA-Z0-9-]+$/.test(code)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!originalUrl.trim()) {
      toast.error("Please enter a URL")
      return
    }

    if (!validateUrl(originalUrl)) {
      toast.error("Please enter a valid URL")
      return
    }

    if (customCode && !validateShortCode(customCode)) {
      toast.error("Short code can only contain letters, numbers, and hyphens (max 32 characters)")
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === "edit" && link) {
        await updateLink({
          linkId: link._id,
          originalUrl: originalUrl.trim(),
          customCode: customCode.trim() || undefined,
        })
        toast.success("Link updated successfully!")
      } else {
        const result = await createShortLink({
          originalUrl: originalUrl.trim(),
          customCode: customCode.trim() || undefined,
        })
        toast.success(`Short link created: /${result.shortCode}`)
      }
      
      setOpen(false)
      setOriginalUrl("")
      setCustomCode("")
    } catch (error: any) {
      toast.error(error.message || "Failed to save link")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setOriginalUrl(link?.originalUrl || "")
    setCustomCode(link?.shortCode || "")
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        resetForm()
      }
    }}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>
        ) : (
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit link
          </DropdownMenuItem>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Link" : "Create Short Link"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" 
              ? "Update your link details below."
              : "Enter a URL to create a short link. Leave the custom code empty to auto-generate one."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Original URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">
                Custom Short Code 
                <span className="text-sm text-muted-foreground ml-1">(optional)</span>
              </Label>
              <Input
                id="code"
                placeholder="my-custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                maxLength={32}
              />
              <p className="text-xs text-muted-foreground">
                {customCode.length}/32 characters. Only letters, numbers, and hyphens allowed.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Creating..."}
                </>
              ) : (
                mode === "edit" ? "Update Link" : "Create Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
