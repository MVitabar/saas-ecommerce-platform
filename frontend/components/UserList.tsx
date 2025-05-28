import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Crown } from 'lucide-react';
import type { User } from '~backend/user/types';

interface UserListProps {
  users: User[];
}

const planColors = {
  free: 'bg-gray-100 text-gray-800',
  basic: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
  enterprise: 'bg-orange-100 text-orange-800',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  canceled: 'bg-red-100 text-red-800',
  past_due: 'bg-yellow-100 text-yellow-800',
};

export default function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No users found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {user.role === 'admin' ? (
                    <Crown className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Users className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={planColors[user.subscriptionPlan]}>
                      {user.subscriptionPlan}
                    </Badge>
                    <Badge className={statusColors[user.subscriptionStatus]}>
                      {user.subscriptionStatus}
                    </Badge>
                    {user.role === 'admin' && (
                      <Badge variant="outline">Admin</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  Manage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
