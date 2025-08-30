import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  DollarSign,
  PiggyBank,
  Target,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { AccountStatusBanner } from '@/components/dashboard/AccountStatusBanner';
import { useSubscriptionData } from '@/hooks/useSubscriptionData';
import { toast } from 'sonner';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const { isProUser, accountType } = useSubscriptionData();

  // Handle upgrade success
  useEffect(() => {
    if (searchParams.get('upgrade') === 'success') {
      setShowUpgradeSuccess(true);
      toast.success('🎉 Welcome to Pro! Your account has been upgraded successfully.');
      // Clean up URL
      setSearchParams({});
      
      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowUpgradeSuccess(false);
      }, 10000);
    }
  }, [searchParams, setSearchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Net Worth',
      value: '$245,000',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Retirement Savings',
      value: '$89,500',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: PiggyBank,
    },
    {
      title: 'Monthly Income',
      value: '$6,200',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Investment Return',
      value: '+7.8%',
      change: '-0.3%',
      changeType: 'negative' as const,
      icon: Target,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'contribution',
      description: '401(k) Monthly Contribution',
      amount: '+$500',
      date: 'Today',
      status: 'completed',
    },
    {
      id: 2,
      type: 'dividend',
      description: 'Investment Dividend Payment',
      amount: '+$125',
      date: 'Yesterday',
      status: 'completed',
    },
    {
      id: 3,
      type: 'consultation',
      description: 'Financial Planning Session',
      amount: '',
      date: '3 days ago',
      status: 'scheduled',
    },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: 'Review Investment Portfolio',
      description: 'Quarterly review and rebalancing',
      dueDate: 'Due in 5 days',
      priority: 'high',
    },
    {
      id: 2,
      title: 'Update Beneficiary Information',
      description: 'Add new family member as beneficiary',
      dueDate: 'Due in 2 weeks',
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Tax Document Upload',
      description: 'Upload latest tax returns',
      dueDate: 'Due in 1 month',
      priority: 'low',
    },
  ];

  const formatWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there';
    return `${greeting}, ${name}!`;
  };

  return (
    <div className="space-y-6">
      {/* Upgrade Success Message */}
      {showUpgradeSuccess && (
        <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Upgrade Successful!</h3>
                </div>
                <p className="text-muted-foreground mb-3">
                  Welcome to Pro! You now have unlimited access to all AI features, priority support, and advanced analytics.
                </p>
                <div className="flex gap-2">
                  <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Pro Account
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowUpgradeSuccess(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Status Banner */}
      {!bannerDismissed && (
        <AccountStatusBanner 
          onDismiss={() => setBannerDismissed(true)}
          showDismiss={true}
        />
      )}

      {/* Welcome Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {formatWelcomeMessage()}
          </h1>
          {isProUser && (
            <Badge variant="default" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white backdrop-blur-md">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Here's an overview of your retirement planning progress.
          {isProUser && " Enjoy unlimited access to all Pro features!"}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-success" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-destructive" />
                )}
                <span className={stat.changeType === 'positive' ? 'text-success' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest financial transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activity.amount && (
                    <span className="font-medium text-success">{activity.amount}</span>
                  )}
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>
              Action items to keep your retirement planning on track
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.title}</h4>
                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'destructive'
                            : task.priority === 'medium'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {task.dueDate}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Retirement Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Retirement Progress
          </CardTitle>
          <CardDescription>
            Track your progress toward your retirement goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Retirement Goal Progress</span>
              <span>68% complete</span>
            </div>
            <Progress value={68} className="h-2" />
            <p className="text-xs text-muted-foreground">
              $89,500 of $130,000 goal by age 65
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold">23</div>
              <div className="text-sm text-muted-foreground">Years to retirement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">$500</div>
              <div className="text-sm text-muted-foreground">Monthly contribution</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">7.8%</div>
              <div className="text-sm text-muted-foreground">Average return</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => navigate('/dashboard/calculator')}>
              Run Calculator
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/financial')}>
              Adjust Contributions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your retirement planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/financial')}
            >
              <DollarSign className="h-6 w-6" />
              <span>Add Income</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/documents')}
            >
              <AlertCircle className="h-6 w-6" />
              <span>Upload Documents</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/consultations')}
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Meeting</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/dashboard/beneficiaries')}
            >
              <Target className="h-6 w-6" />
              <span>Update Goals</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}