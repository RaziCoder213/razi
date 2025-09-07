import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Check, Star } from 'lucide-react';
import { Movie, TVShow, WatchProvider } from '@/types';
import { tmdbApi } from '@/services/tmdb';
import { useUser } from '@/contexts/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ContentCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'series';
  onClick: () => void;
  onToggleNotification: (e: React.MouseEvent) => void;
  isNotificationEnabled: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ item, type, onClick, onToggleNotification, isNotificationEnabled }) => {
  const { user } = useUser();
  const [watchProviders, setWatchProviders] = useState<WatchProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    const fetchWatchProviders = async () => {
      if (!user?.location.country) {
        setLoadingProviders(false);
        return;
      }
      
      setLoadingProviders(true);
      try {
        const providers = type === 'movie' 
          ? await tmdbApi.getMovieWatchProviders(item.id, user.location.country)
          : await tmdbApi.getSeriesWatchProviders(item.id, user.location.country);
        
        if (providers?.flatrate) {
          setWatchProviders(providers.flatrate.slice(0, 4)); // Show max 4 providers
        }
      } catch (error) {
        console.error('Failed to fetch watch providers:', error);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchWatchProviders();
  }, [item.id, type, user?.location.country]);

  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const posterUrl = tmdbApi.getPosterUrl(item.poster_path);

  return (
    <Card 
      className="group overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all hover:shadow-glow cursor-pointer flex flex-col"
      onClick={onClick}
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex-grow space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-sm line-clamp-2 flex-1">{title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 ml-2"
              onClick={(e) => {
                e.stopPropagation();
                onToggleNotification(e);
              }}
            >
              {isNotificationEnabled ? 
                <Check className="h-4 w-4 text-green-500" /> : 
                <Plus className="h-4 w-4" />
              }
            </Button>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{tmdbApi.formatDate(releaseDate)}</span>
            <div className="flex items-center gap-1 ml-auto">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{item.vote_average.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-3 min-h-[52px] flex flex-col justify-end">
          {loadingProviders ? (
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <div className="flex gap-2 items-center">
                <Skeleton className="h-6 w-6 rounded-sm" />
                <Skeleton className="h-6 w-6 rounded-sm" />
                <Skeleton className="h-6 w-6 rounded-sm" />
              </div>
            </div>
          ) : watchProviders.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Available on:</p>
              <div className="flex gap-2 flex-wrap items-center">
                {watchProviders.map((provider) => (
                  <Tooltip key={provider.provider_id}>
                    <TooltipTrigger>
                      <img
                        src={tmdbApi.getLogoUrl(provider.logo_path)}
                        alt={provider.provider_name}
                        className="w-6 h-6 rounded-sm object-contain"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{provider.provider_name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ) : (
             <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Streaming on:</p>
                <p className="text-xs text-muted-foreground/70">Info not yet available</p>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
