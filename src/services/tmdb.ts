import { STREAMING_PLATFORMS } from '@/constants';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w92';

const INDUSTRY_COUNTRY_MAP: Record<string, string> = {
  'Hollywood': 'US',
  'Bollywood': 'IN',
  'Lollywood': 'PK',
  'Tollywood': 'IN', // Telugu
  'Kollywood': 'IN', // Tamil
};

const LANGUAGE_CODE_MAP: Record<string, string> = {
  'English': 'en',
  'Hindi': 'hi',
  'Urdu': 'ur',
  'Telugu': 'te',
  'Tamil': 'ta',
  'Spanish': 'es',
  'French': 'fr',
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const buildApiUrl = (basePath: string, params: Record<string, string> = {}) => {
  const urlParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params
  });
  return `${TMDB_BASE_URL}${basePath}?${urlParams.toString()}`;
}

const buildDiscoverParams = (
  genreIds: number[],
  region: string,
  languages: string[],
  industries: string[],
  platforms: string[],
  dateRange: string,
  type: 'movie' | 'series'
) => {
  const params: Record<string, string> = {
    sort_by: 'popularity.desc',
    page: '1',
  };

  params.watch_region = region || 'US';

  const today = getTodayDateString();
  const currentYear = new Date().getFullYear();
  const dateKey = type === 'movie' ? 'primary_release_date' : 'first_air_date';
  
  switch (dateRange) {
    case 'today':
      params[`${dateKey}.gte`] = today;
      params[`${dateKey}.lte`] = today;
      break;
    case String(currentYear):
      params[`${dateKey}.gte`] = today;
      params[`${dateKey}.lte`] = `${currentYear}-12-31`;
      break;
    case String(currentYear + 1):
      params[`${dateKey}.gte`] = `${currentYear + 1}-01-01`;
      params[`${dateKey}.lte`] = `${currentYear + 1}-12-31`;
      break;
    case 'all':
    default:
      params[`${dateKey}.gte`] = today;
      break;
  }

  if (genreIds.length > 0) {
    params.with_genres = genreIds.join('|');
  }

  const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
  if (langCodes.length > 0) {
    params.with_original_language = langCodes.join('|');
  }

  const countryCodes = [...new Set(industries.map(ind => INDUSTRY_COUNTRY_MAP[ind]).filter(Boolean))];
  if (countryCodes.length > 0) {
    params.with_origin_country = countryCodes.join('|');
  }
  
  const platformIds = platforms.map(p => STREAMING_PLATFORMS[p]).filter(Boolean);
  if (platformIds.length > 0) {
    params.with_watch_providers = platformIds.join('|');
  }

  return params;
};

const apiFetch = async (path: string, params?: Record<string, string>) => {
    if (!TMDB_API_KEY) {
      console.error("TMDB API Key is missing. Please add it to your .env file.");
      // Return an empty structure to prevent app crashes.
      return Promise.resolve({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    
    const url = buildApiUrl(path, params);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            // TMDB uses status_message for its errors.
            const errorMessage = errorData.status_message || `Request failed with status ${response.status}`;
            console.error(`API Error (${response.status}) for URL: ${url}`, errorMessage);
            throw new Error(errorMessage);
        }
        return response.json();
    } catch (error) {
        if (error instanceof TypeError) { // Catches network errors like CORS, DNS, etc.
            console.error('Network Error: Failed to fetch. This could be a CORS issue, network problem, or an invalid/blocked API key.', { url, error });
        }
        throw error; // Re-throw to be handled by the component's catch block
    }
};

export const tmdbApi = {
  discoverMovies: (genreIds: number[], region: string, languages: string[], industries: string[], platforms: string[], dateRange: string) => {
    const params = buildDiscoverParams(genreIds, region, languages, industries, platforms, dateRange, 'movie');
    return apiFetch('/discover/movie', params);
  },

  discoverSeries: (genreIds: number[], region: string, languages: string[], industries: string[], platforms: string[], dateRange: string) => {
    const params = buildDiscoverParams(genreIds, region, languages, industries, platforms, dateRange, 'series');
    return apiFetch('/discover/tv', params);
  },

  searchMovies: (query: string, languages: string[]) => {
    const params: Record<string, string> = { query, page: '1' };
    const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
    if (langCodes.length > 0) {
      params.language = langCodes[0];
    }
    return apiFetch('/search/movie', params);
  },

  searchSeries: (query: string, languages: string[]) => {
    const params: Record<string, string> = { query, page: '1' };
    const langCodes = languages.map(lang => LANGUAGE_CODE_MAP[lang]).filter(Boolean);
    if (langCodes.length > 0) {
      params.language = langCodes[0];
    }
    return apiFetch('/search/tv', params);
  },
  
  getMovieVideos: (movieId: number) => {
    return apiFetch(`/movie/${movieId}/videos`);
  },

  getMovieWatchProviders: async (movieId: number, region: string = 'US') => {
    const data = await apiFetch(`/movie/${movieId}/watch/providers`);
    return data.results?.[region] || null;
  },

  getSeriesWatchProviders: async (seriesId: number, region: string = 'US') => {
    const data = await apiFetch(`/tv/${seriesId}/watch/providers`);
    return data.results?.[region] || null;
  },

  getSeriesVideos: (seriesId: number) => {
    return apiFetch(`/tv/${seriesId}/videos`);
  },

  getPosterUrl: (posterPath: string | null) => {
    if (!posterPath) return '/placeholder.svg';
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
  },

  getLogoUrl: (logoPath: string | null) => {
    if (!logoPath) return '/placeholder.svg';
    return `${TMDB_LOGO_BASE_URL}${logoPath}`;
  },

  formatDate: (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC'
    });
  }
};
