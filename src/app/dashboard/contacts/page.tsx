'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Plus, MoreHorizontal, Mail, Phone, Building2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data for contacts
const contactsData = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@acme.com', phone: '+1 (555) 123-4567', position: 'CEO', accountId: 1, accountName: 'Acme Inc' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@globex.com', phone: '+1 (555) 987-6543', position: 'CTO', accountId: 2, accountName: 'Globex Corporation' },
  { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@initech.com', phone: '+1 (555) 456-7890', position: 'Marketing Director', accountId: 3, accountName: 'Initech' },
  { id: 4, firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@umbrella.com', phone: '+1 (555) 234-5678', position: 'Sales Manager', accountId: 4, accountName: 'Umbrella Corp' },
  { id: 5, firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@wayne.com', phone: '+1 (555) 876-5432', position: 'VP of Operations', accountId: 5, accountName: 'Wayne Enterprises' },
]

export default function ContactsPage() {
  const [contacts] = useState(contactsData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredContacts = contacts.filter(contact => 
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer contacts
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="text-gray-900 dark:text-white">All Contacts</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
                  className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">
            {contacts.length} contacts found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="text-gray-700 dark:text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Phone</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Position</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Account</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {contact.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {contact.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {contact.position}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        {contact.accountName}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredContacts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No contacts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}