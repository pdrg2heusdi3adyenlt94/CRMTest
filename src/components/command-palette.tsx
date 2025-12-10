'use client'

import { useEffect, useState } from 'react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Command } from 'cmdk'
import { Search } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Command className="hidden" />
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => window.location.href = '/dashboard'}>
              Dashboard
            </CommandItem>
            <CommandItem onSelect={() => window.location.href = '/dashboard/accounts'}>
              Accounts
            </CommandItem>
            <CommandItem onSelect={() => window.location.href = '/dashboard/contacts'}>
              Contacts
            </CommandItem>
            <CommandItem onSelect={() => window.location.href = '/dashboard/deals'}>
              Deals
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}