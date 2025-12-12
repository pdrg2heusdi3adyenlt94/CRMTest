'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, User, Building2, Bell, Lock, Globe, CreditCard } from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and CRM settings
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Settings</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Configure your CRM preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-3/4">
          <Card className="bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center">
                {tabs.find(tab => tab.id === activeTab)?.icon && (
                  <div className="h-5 w-5 mr-2">
                    {(() => {
                      const Icon = tabs.find(tab => tab.id === activeTab)?.icon;
                      return Icon ? <Icon className="h-5 w-5 mr-2" /> : null;
                    })()}
                  </div>
                )}
                {tabs.find(tab => tab.id === activeTab)?.label} Settings
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                {activeTab === 'profile' && 'Update your personal profile information'}
                {activeTab === 'organization' && 'Manage your organization details'}
                {activeTab === 'notifications' && 'Configure notification preferences'}
                {activeTab === 'security' && 'Manage security settings and password'}
                {activeTab === 'preferences' && 'Customize your CRM preferences'}
                {activeTab === 'billing' && 'Manage billing information and payment methods'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                      <Input id="firstName" defaultValue="John" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone</Label>
                    <Input id="phone" defaultValue="+1 (555) 123-4567" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300">Bio</Label>
                    <textarea 
                      id="bio" 
                      rows={4} 
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Tell us about yourself..."
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'organization' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-gray-700 dark:text-gray-300">Organization Name</Label>
                    <Input id="orgName" defaultValue="Acme Inc." className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-gray-700 dark:text-gray-300">Industry</Label>
                      <Select defaultValue="technology">
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="size" className="text-gray-700 dark:text-gray-300">Organization Size</Label>
                      <Select defaultValue="50-200">
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="50-200">50-200 employees</SelectItem>
                          <SelectItem value="200-500">200-500 employees</SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-700 dark:text-gray-300">Website</Label>
                    <Input id="website" defaultValue="https://acme.com" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">Address</Label>
                    <Input id="address" defaultValue="123 Main St, New York, NY 10001" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Save Organization Settings
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in the app</p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS</p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Notification Types</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input id="new-account" type="checkbox" className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" defaultChecked />
                        <label htmlFor="new-account" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">New account created</label>
                      </div>
                      <div className="flex items-center">
                        <input id="deal-updated" type="checkbox" className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" defaultChecked />
                        <label htmlFor="deal-updated" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Deal status updated</label>
                      </div>
                      <div className="flex items-center">
                        <input id="task-assigned" type="checkbox" className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" defaultChecked />
                        <label htmlFor="task-assigned" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Task assigned to me</label>
                      </div>
                      <div className="flex items-center">
                        <input id="project-updates" type="checkbox" className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="project-updates" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Project updates</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
