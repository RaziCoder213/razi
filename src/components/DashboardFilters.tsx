import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, SlidersHorizontal, RefreshCw, Search } from 'lucide-react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from './ui/input';
import { useDebounce } from '@/hooks/use-debounce';

const LANGUAGES = ['English', 'Hindi', 'Urdu', 'Telugu', 'Tamil', 'Spanish', 'French'];
const INDUSTRIES = ['Hollywood', 'Bollywood', 'Tollywood', 'Lollywood', 'Kollywood'];

interface DashboardFiltersProps {
  initialFilters: {
    languages: string[];
    industries: string[];
    dateRange: string;
    searchQuery: string;
  };
  onApplyFilters: (filters: { languages: string[]; industries: string[]; dateRange: string; searchQuery: string; }) => void;
  loading: boolean;
}

const MultiSelectFilter = ({ title, options, selected, onSelectedChange }: { title: string, options: string[], selected: string[], onSelectedChange: (selected: string[]) => void }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between w-full sm:w-auto">
          <span>{title}</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => {
                    const newSelected = selected.includes(option)
                      ? selected.filter((item) => item !== option)
                      : [...selected, option];
                    onSelectedChange(newSelected);
                  }}
                >
                  <Checkbox
                    className="mr-2"
                    checked={selected.includes(option)}
                  />
                  <span>{option}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({ initialFilters, onApplyFilters, loading }) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery);
  const [otherFilters, setOtherFilters] = useState({
    languages: initialFilters.languages,
    industries: initialFilters.industries,
    dateRange: initialFilters.dateRange,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const isMounted = React.useRef(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // This effect syncs the local state if the parent component sends new initialFilters.
    setSearchQuery(initialFilters.searchQuery);
    setOtherFilters({
      languages: initialFilters.languages,
      industries: initialFilters.industries,
      dateRange: initialFilters.dateRange,
    });
  }, [initialFilters]);

  useEffect(() => {
    // This effect applies all filters whenever the debounced search or other filters change.
    // The isMounted ref prevents this from running on the initial render.
    if (isMounted.current) {
      onApplyFilters({
        ...otherFilters,
        searchQuery: debouncedSearchQuery,
      });
    } else {
      isMounted.current = true;
    }
  }, [debouncedSearchQuery, otherFilters, onApplyFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleOtherFilterChange = (type: 'languages' | 'industries' | 'dateRange', value: string[] | string) => {
    setOtherFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleResync = () => {
    onApplyFilters({
      ...otherFilters,
      searchQuery: searchQuery, // use immediate search query on manual click
    });
  };

  const totalFilters = otherFilters.languages.length + otherFilters.industries.length;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <SlidersHorizontal className="w-5 h-5" />
          Filter Your Radar
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row flex-wrap items-center gap-4">
        <div className="relative flex-grow w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search movies & series..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-full sm:w-64"
          />
        </div>
        <MultiSelectFilter
          title="Languages"
          options={LANGUAGES}
          selected={otherFilters.languages}
          onSelectedChange={(val) => handleOtherFilterChange('languages', val)}
        />
        <MultiSelectFilter
          title="Industries"
          options={INDUSTRIES}
          selected={otherFilters.industries}
          onSelectedChange={(val) => handleOtherFilterChange('industries', val)}
        />
        <Select
          value={otherFilters.dateRange}
          onValueChange={(val) => handleOtherFilterChange('dateRange', val)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select release date..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Upcoming</SelectItem>
            <SelectItem value="today">Releasing Today</SelectItem>
            <SelectItem value={String(currentYear)}>This Year ({currentYear})</SelectItem>
            <SelectItem value={String(currentYear + 1)}>Next Year ({currentYear + 1})</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleResync} disabled={loading} className="w-full sm:w-auto">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Resync
        </Button>
      </CardContent>
      {totalFilters > 0 && (
         <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
            {otherFilters.languages.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
            {otherFilters.industries.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
         </CardFooter>
      )}
    </Card>
  );
};
