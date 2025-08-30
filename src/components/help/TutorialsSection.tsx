import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, FileText, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  content_url: string;
  thumbnail_url?: string;
}

interface TutorialsSectionProps {
  searchQuery: string;
}

export function TutorialsSection({ searchQuery }: TutorialsSectionProps) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      // Mock data for now - in real implementation, this would come from Supabase
      const mockTutorials: Tutorial[] = [
        {
          id: '1',
          title: 'Getting Started with Portfolio Management',
          description: 'Learn the basics of managing your investment portfolio',
          type: 'video',
          duration: 300,
          difficulty: 'beginner',
          category: 'investment',
          content_url: '/tutorials/portfolio-basics.mp4',
          thumbnail_url: '/thumbnails/portfolio.jpg'
        },
        {
          id: '2',
          title: 'Setting Up Beneficiaries',
          description: 'Complete guide to adding and managing beneficiaries',
          type: 'text',
          duration: 180,
          difficulty: 'beginner',
          category: 'estate',
          content_url: '/tutorials/beneficiaries-guide.pdf'
        },
        {
          id: '3',
          title: 'Advanced Tax Strategies',
          description: 'Optimize your tax planning with advanced techniques',
          type: 'video',
          duration: 600,
          difficulty: 'advanced',
          category: 'tax',
          content_url: '/tutorials/tax-strategies.mp4',
          thumbnail_url: '/thumbnails/tax.jpg'
        },
        {
          id: '4',
          title: 'Retirement Planning Calculator',
          description: 'How to use our retirement planning tools effectively',
          type: 'video',
          duration: 420,
          difficulty: 'intermediate',
          category: 'retirement',
          content_url: '/tutorials/retirement-calc.mp4'
        }
      ];
      
      setTutorials(mockTutorials);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'investment', 'estate', 'tax', 'retirement'];
  
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = searchQuery === '' || 
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTutorials.map((tutorial) => (
          <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                {tutorial.type === 'video' ? (
                  <Play className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-primary" />
                )}
                <Badge className={getDifficultyColor(tutorial.difficulty)}>
                  {tutorial.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{tutorial.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {tutorial.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {tutorial.thumbnail_url && (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(tutorial.duration)}
                </div>
                <Button size="sm">
                  {tutorial.type === 'video' ? 'Watch' : 'Read'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTutorials.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No tutorials found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or category filter.
          </p>
        </div>
      )}
    </div>
  );
}