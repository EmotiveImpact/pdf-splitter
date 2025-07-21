'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Building,
  Save,
  Shield,
  Calendar,
  MapPin
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfileViewPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Mock user data
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '(555) 123-4567',
    company: 'Acme Corporation',
    jobTitle: 'Operations Manager',
    address: '123 Business Ave, Austin, TX 78701',
    joinedDate: '2023-01-15'
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.'
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <PageContainer>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Profile Settings</h1>
            <p className='text-muted-foreground'>
              Manage your account information and preferences
            </p>
          </div>
          <div className='flex gap-2'>
            {isEditing ? (
              <>
                <Button variant='outline' onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className='mr-2 h-4 w-4' />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <User className='mr-2 h-4 w-4' />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-col items-center text-center'>
                <Avatar className='mb-4 h-24 w-24'>
                  <AvatarImage src='' />
                  <AvatarFallback className='text-lg'>
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>

                <h3 className='text-xl font-semibold'>
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className='text-muted-foreground'>{profile.jobTitle}</p>
                <p className='text-sm text-muted-foreground'>
                  {profile.company}
                </p>

                <div className='mt-4 flex items-center gap-2'>
                  <Badge variant='secondary'>
                    <Shield className='mr-1 h-3 w-3' />
                    Admin
                  </Badge>
                </div>
              </div>

              <div className='space-y-3 border-t pt-4'>
                <div className='flex items-center gap-2 text-sm'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span>
                    Joined {new Date(profile.joinedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Mail className='h-4 w-4 text-muted-foreground' />
                  <span>{profile.email}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Phone className='h-4 w-4 text-muted-foreground' />
                  <span>{profile.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Info */}
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        firstName: e.target.value
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        lastName: e.target.value
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label htmlFor='email'>Email Address</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                    <Input
                      id='email'
                      type='email'
                      value={profile.email}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          email: e.target.value
                        }))
                      }
                      disabled={!isEditing}
                      className='pl-10'
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <div className='relative'>
                    <Phone className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                    <Input
                      id='phone'
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          phone: e.target.value
                        }))
                      }
                      disabled={!isEditing}
                      className='pl-10'
                    />
                  </div>
                </div>
              </div>

              {/* Work Info */}
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label htmlFor='company'>Company</Label>
                  <div className='relative'>
                    <Building className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
                    <Input
                      id='company'
                      value={profile.company}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          company: e.target.value
                        }))
                      }
                      disabled={!isEditing}
                      className='pl-10'
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='jobTitle'>Job Title</Label>
                  <Input
                    id='jobTitle'
                    value={profile.jobTitle}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        jobTitle: e.target.value
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor='address'>Address</Label>
                <div className='relative'>
                  <MapPin className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    id='address'
                    value={profile.address}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        address: e.target.value
                      }))
                    }
                    disabled={!isEditing}
                    className='pl-10'
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
