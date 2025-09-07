import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { UserPreferences } from '@/types';
import { Radar, Sparkles, Users, Calendar, Star, Languages, Film, Tv, Gamepad2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Country } from 'country-state-city';
import { toast } from 'sonner';

const MOVIE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const SERIES_GENRES = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Kids', 'Mystery', 'News', 'Reality', 'Sci-Fi & Fantasy',
  'Soap', 'Talk', 'War & Politics', 'Western'
];

const GAME_GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports',
  'Racing', 'Fighting', 'Shooter', 'Platform', 'Puzzle', 'Arcade',
  'Horror', 'Indie', 'MMO', 'Battle Royale'
];

const LANGUAGES = ['English', 'Hindi', 'Urdu', 'Telugu', 'Tamil', 'Spanish', 'French'];
const INDUSTRIES = ['Hollywood', 'Bollywood', 'Tollywood', 'Lollywood', 'Kollywood'];

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    location: { country: '' },
    age: '',
    languages: [] as string[],
    industries: [] as string[],
    platforms: [] as string[],
    movieGenres: [] as string[],
    seriesGenres: [] as string[],
    gameGenres: [] as string[]
  });
  const { setUser } = useUser();
  
  const countries = useMemo(() => Country.getAllCountries(), []);

  const handleToggle = (item: string, type: 'languages' | 'industries' | 'movieGenres' | 'seriesGenres' | 'gameGenres') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(item)
        ? prev[type].filter(g => g !== item)
        : [...prev[type], item]
    }));
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleComplete = () => {
    const userData: UserPreferences = {
      name: formData.name,
      email: formData.email,
      gender: formData.gender,
      location: formData.location,
      age: parseInt(formData.age),
      languages: formData.languages,
      industries: formData.industries,
      platforms: formData.platforms,
      interests: {
        movies: formData.movieGenres,
        series: formData.seriesGenres,
        games: formData.gameGenres
      },
      notifications_enabled: false,
      notification_list: []
    };
    setUser(userData);
    
    console.log(`Simulating welcome email to: ${formData.email}`);
    toast.success('Setup Complete!', {
      description: `A welcome email has been sent to ${formData.email}.`,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.email && formData.location.country && formData.age && formData.gender;
      case 2:
        return formData.languages.length > 0 && formData.industries.length > 0;
      case 3:
        return formData.movieGenres.length > 0;
      case 4:
        return formData.seriesGenres.length > 0;
      case 5:
        return formData.gameGenres.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-neon-pink rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-neon-pink bg-clip-text text-transparent">
                Welcome to RadarApp
              </CardTitle>
              <CardDescription>
                Let's get to know you better to personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup defaultValue={formData.gender} onValueChange={(v) => setFormData(p => ({ ...p, gender: v as any}))} className="flex gap-4 pt-2">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male">Male</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female">Female</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="other" id="other" /><Label htmlFor="other">Other</Label></div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" placeholder="25" value={formData.age} onChange={(e) => setFormData(p => ({ ...p, age: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={formData.location.country} onValueChange={countryIso => setFormData(p => ({ ...p, location: { country: countryIso } }))}>
                  <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
                  <SelectContent>{countries.map(c => <SelectItem key={c.isoCode} value={c.isoCode}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-electric-blue to-neon-cyan rounded-full flex items-center justify-center">
                <Film className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-electric-blue to-neon-cyan bg-clip-text text-transparent">Content Preferences</CardTitle>
              <CardDescription>Tell us what you like to watch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="flex items-center gap-2 mb-3 text-lg"><Languages className="w-5 h-5"/>Languages</Label>
                <div className="flex flex-wrap justify-center gap-2">
                  {LANGUAGES.map(lang => (
                    <Badge key={lang} variant={formData.languages.includes(lang) ? "default" : "outline"} className={`cursor-pointer p-3 text-center transition-all ${formData.languages.includes(lang) ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-primary-foreground' : 'hover:border-neon-cyan'}`} onClick={() => handleToggle(lang, 'languages')}>{lang}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-3 text-lg"><Star className="w-5 h-5"/>Industries</Label>
                <div className="flex flex-wrap justify-center gap-2">
                  {INDUSTRIES.map(ind => (
                    <Badge key={ind} variant={formData.industries.includes(ind) ? "default" : "outline"} className={`cursor-pointer p-3 text-center transition-all ${formData.industries.includes(ind) ? 'bg-gradient-to-r from-electric-blue to-neon-cyan text-primary-foreground' : 'hover:border-neon-cyan'}`} onClick={() => handleToggle(ind, 'industries')}>{ind}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        const allMovieGenresSelected = formData.movieGenres.length === MOVIE_GENRES.length;
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-neon-cyan to-electric-blue rounded-full flex items-center justify-center mb-4"><Star className="w-8 h-8 text-primary-foreground" /></div>
              <div className="flex justify-center items-center relative">
                <CardTitle className="text-2xl bg-gradient-to-r from-neon-cyan to-electric-blue bg-clip-text text-transparent">Movie Preferences</CardTitle>
                <Button variant="link" onClick={() => setFormData(p => ({...p, movieGenres: allMovieGenresSelected ? [] : MOVIE_GENRES}))} className="absolute right-0 top-1/2 -translate-y-1/2">
                  {allMovieGenresSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <CardDescription>Select your favorite movie genres</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                {MOVIE_GENRES.map(genre => (<Badge key={genre} variant={formData.movieGenres.includes(genre) ? "default" : "outline"} className={`cursor-pointer p-3 text-center transition-all ${formData.movieGenres.includes(genre) ? 'bg-gradient-to-r from-neon-cyan to-electric-blue text-primary-foreground' : 'hover:border-neon-cyan'}`} onClick={() => handleToggle(genre, 'movieGenres')}>{genre}</Badge>))}
              </div>
            </CardContent>
          </Card>
        );
      case 4:
        const allSeriesGenresSelected = formData.seriesGenres.length === SERIES_GENRES.length;
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-neon-pink to-primary rounded-full flex items-center justify-center mb-4"><Tv className="w-8 h-8 text-primary-foreground" /></div>
              <div className="flex justify-center items-center relative">
                <CardTitle className="text-2xl bg-gradient-to-r from-neon-pink to-primary bg-clip-text text-transparent">Series Preferences</CardTitle>
                <Button variant="link" onClick={() => setFormData(p => ({...p, seriesGenres: allSeriesGenresSelected ? [] : SERIES_GENRES}))} className="absolute right-0 top-1/2 -translate-y-1/2">
                  {allSeriesGenresSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <CardDescription>Select your favorite TV series genres</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                {SERIES_GENRES.map(genre => (<Badge key={genre} variant={formData.seriesGenres.includes(genre) ? "default" : "outline"} className={`cursor-pointer p-3 text-center transition-all ${formData.seriesGenres.includes(genre) ? 'bg-gradient-to-r from-neon-pink to-primary text-primary-foreground' : 'hover:border-neon-pink'}`} onClick={() => handleToggle(genre, 'seriesGenres')}>{genre}</Badge>))}
              </div>
            </CardContent>
          </Card>
        );
      case 5:
        const allGameGenresSelected = formData.gameGenres.length === GAME_GENRES.length;
        return (
          <Card className="w-full max-w-2xl mx-auto bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-golden to-accent rounded-full flex items-center justify-center mb-4"><Gamepad2 className="w-8 h-8 text-primary-foreground" /></div>
              <div className="flex justify-center items-center relative">
                <CardTitle className="text-2xl bg-gradient-to-r from-golden to-accent bg-clip-text text-transparent">Gaming Preferences</CardTitle>
                <Button variant="link" onClick={() => setFormData(p => ({...p, gameGenres: allGameGenresSelected ? [] : GAME_GENRES}))} className="absolute right-0 top-1/2 -translate-y-1/2">
                  {allGameGenresSelected ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <CardDescription>Select your favorite game genres (feature coming soon!)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                {GAME_GENRES.map(genre => (<Badge key={genre} variant={formData.gameGenres.includes(genre) ? "default" : "outline"} className={`cursor-pointer p-3 text-center transition-all ${formData.gameGenres.includes(genre) ? 'bg-gradient-to-r from-golden to-accent text-primary-foreground' : 'hover:border-golden'}`} onClick={() => handleToggle(genre, 'gameGenres')}>{genre}</Badge>))}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="relative z-10 w-full max-w-4xl">
        <div className="mb-8 flex justify-center">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(i => (<div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-muted'}`} />))}
          </div>
        </div>
        {renderStep()}
        <div className="mt-8 flex justify-center space-x-4">
          {step > 1 && (<Button variant="outline" onClick={() => setStep(step - 1)} className="border-primary/20 hover:border-primary">Back</Button>)}
          <Button onClick={step === 5 ? handleComplete : handleNext} disabled={!canProceed()} className="bg-gradient-to-r from-primary to-neon-pink hover:shadow-lg hover:shadow-primary/25 transition-all">
            {step === 5 ? (<><Radar className="w-4 h-4 mr-2" />Complete Setup</>) : ('Next')}
          </Button>
        </div>
      </div>
    </div>
  );
};
