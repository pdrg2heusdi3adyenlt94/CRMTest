'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Plus, MoreHorizontal } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data for accounts
const accountsData = [
  { id: 1, name: 'Acme Inc', email: 'contact@acme.com', phone: '+1 (555) 123-4567', website: 'acme.com', status: 'Active' },
  { id: 2, name: 'Globex Corporation', email: 'info@globex.com', phone: '+1 (555) 987-6543', website: 'globex.com', status: 'Active' },
  { id: 3, name: 'Initech', email: 'support@initech.com', phone: '+1 (555) 456-7890', website: 'initech.com', status: 'Inactive' },
  { id: 4, name: 'Umbrella Corp', email: 'hello@umbrella.com', phone: '+1 (555) 234-5678', website: 'umbrella.com', status: 'Active' },
  { id: 5, name: 'Wayne Enterprises', email: 'contact@wayne.com', phone: '+1 (555) 876-5432', website: 'wayne.com', status: 'Active' },
]

export default function AccountsPage() {
  const [accounts] = useState(accountsData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.website.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer accounts
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="text-gray-900 dark:text-white">All Accounts</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search accounts..."
                  className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">
            {accounts.length} accounts found
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
                  <TableHead className="text-gray-700 dark:text-gray-300">Website</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {account.name}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {account.email}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {account.phone}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {account.website}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }`}>
                        {account.status}
                      </span>
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
          
          {filteredAccounts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No accounts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}