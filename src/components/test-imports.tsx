'use client'

// Test all the imports that were mentioned as problematic
import { AuthProvider } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// This is just a test component to verify imports work
export default function TestImports() {
  return (
    <div>
      <h1>Import Test Component</h1>
      <p>Testing that all imports work correctly</p>
      <Button>Test Button</Button>
      <Label htmlFor="test">Test Label</Label>
      <Input id="test" placeholder="Test Input" />
    </div>
  );
}