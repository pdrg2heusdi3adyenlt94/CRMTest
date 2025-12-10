'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Plus, MoreHorizontal, Calendar, User, FileText } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock data for projects
const projectsData = [
  { id: 1, name: 'Website Redesign', description: 'Complete overhaul of company website', status: 'Active', startDate: '2023-10-01', endDate: '2024-01-15', assignedTo: 'Alice Smith', accountId: 1, accountName: 'Acme Inc' },
  { id: 2, name: 'Mobile App Development', description: 'New mobile application for customer engagement', status: 'Planning', startDate: '2023-11-01', endDate: '2024-05-30', assignedTo: 'John Doe', accountId: 2, accountName: 'Globex Corporation' },
  { id: 3, name: 'Data Migration', description: 'Migrate legacy systems to cloud platform', status: 'Completed', startDate: '2023-08-15', endDate: '2023-11-30', assignedTo: 'Bob Johnson', accountId: 3, accountName: 'Initech' },
  { id: 4, name: 'API Integration', description: 'Integrate third-party services with existing systems', status: 'Active', startDate: '2023-09-20', endDate: '2024-02-28', assignedTo: 'Michael Brown', accountId: 4, accountName: 'Umbrella Corp' },
  { id: 5, name: 'Security Audit', description: 'Comprehensive security assessment', status: 'On Hold', startDate: '2023-12-01', endDate: '2024-01-31', assignedTo: 'Jane Smith', accountId: 5, accountName: 'Wayne Enterprises' },
]

export default function ProjectsPage() {
  const [projects] = useState(projectsData)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Planning':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'Active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer projects
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="text-gray-900 dark:text-white">All Projects</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <CardDescription className="text-gray-500 dark:text-gray-400 mt-2">
            {projects.length} projects found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="text-gray-700 dark:text-gray-300">Project</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Start Date</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">End Date</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Account</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Assigned To</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-400" />
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300 max-w-xs">
                      {project.description}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {project.startDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {project.endDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {project.accountName}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {project.assignedTo}
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
          
          {filteredProjects.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No projects found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}