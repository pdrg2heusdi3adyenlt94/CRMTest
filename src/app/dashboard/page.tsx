'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Building2, DollarSign, TrendingUp } from 'lucide-react'
import { ProtectedPage } from '@/components/auth/protected-page'

// Mock data for charts
const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
]

const dealStageData = [
  { name: 'Lead', value: 25 },
  { name: 'Qualified', value: 15 },
  { name: 'Proposal', value: 10 },
  { name: 'Negotiation', value: 5 },
  { name: 'Closed Won', value: 3 },
  { name: 'Closed Lost', value: 2 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-500 dark:text-gray-400">Total Accounts</CardDescription>
              <Building2 className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">128</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-500 dark:text-gray-400">Total Contacts</CardDescription>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">542</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+8% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-500 dark:text-gray-400">Open Deals</CardDescription>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">24</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+3 from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-gray-500 dark:text-gray-400">Revenue</CardDescription>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">$42,567</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+18% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Revenue Overview</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Monthly revenue for the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderColor: '#e5e7eb',
                        borderRadius: '0.5rem',
                        color: '#1f2937'
                      }} 
                    />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Deal Stages</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Distribution of deals across different stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dealStageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dealStageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderColor: '#e5e7eb',
                        borderRadius: '0.5rem',
                        color: '#1f2937'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Latest activities in your CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">JD</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">John Doe</span> created a new contact for <span className="font-medium">Acme Inc</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-300 text-sm font-medium">AS</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Alice Smith</span> moved deal <span className="font-medium">Enterprise Contract</span> to negotiation stage
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">4 hours ago</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">MR</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Mike Roberts</span> closed deal <span className="font-medium">Software License</span> for $45,000
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
                    </div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  )
}