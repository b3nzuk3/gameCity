import React, { useEffect, useState, useMemo } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const fallbackReviews = [
  {
    id: 1,
    name: 'Kevin Mutua',
    avatar: 'K',
    profile_photo_url: '',
    color: 'bg-blue-600',
    rating: 5,
    text: "GameCity provided me with the best PC build for my architectural work. The performance is unmatched and the cable management is incredibly clean. Highly recommended!",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: 'Sarah Ochieng',
    avatar: 'S',
    profile_photo_url: '',
    color: 'bg-purple-600',
    rating: 5,
    text: "Got my PS5 from them. Fast delivery and excellent customer service. They even helped me set up my PSN account. Will definitely buy from them again.",
    date: "1 month ago"
  },
  {
    id: 3,
    name: 'Dennis Kipkorir',
    avatar: 'D',
    profile_photo_url: '',
    color: 'bg-emerald-600',
    rating: 5,
    text: "The absolute best place to buy PC components in Nairobi. Upgraded to an RTX 4080 and the team was super helpful in ensuring my power supply could handle it.",
    date: "3 months ago"
  }
];

interface Review {
  authorAttribution: {
    displayName: string;
    photoUri: string;
    uri: string;
  };
  rating: number;
  relativePublishTimeDescription: string;
  text: {
    text: string;
    languageCode: string;
  };
  publishTime: string;
}

interface PlaceDetails {
  rating: number;
  reviews: Review[];
  userRatingCount: number;
}

const GoogleReviews = () => {
  const [data, setData] = useState<PlaceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000); // Autoplay every 3 seconds
    return () => clearInterval(interval);
  }, [api]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.warn('Failed to fetch real reviews, falling back to static');
        }
      } catch (error) {
        console.error('Error fetching Google Reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Seeded random functions for daily shuffling
  const getDailySeed = () => {
    const date = new Date();
    return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  };

  const shuffleArray = (array: any[], seed: number) => {
    const shuffled = [...array];
    let m = shuffled.length, t, i;
    while (m) {
      const random = Math.sin(seed++) * 10000;
      i = Math.floor((random - Math.floor(random)) * m--);
      t = shuffled[m];
      shuffled[m] = shuffled[i];
      shuffled[i] = t;
    }
    return shuffled;
  };

  // Format reviews for display (only use live data unless it fails, shuffle daily)
  const displayReviews = useMemo(() => {
    let pool: any[] = [];
    
    if (data?.reviews && data.reviews.length > 0) {
      const live = data.reviews
        .filter(r => r.rating >= 4 && r.text?.text) // Only show 4+ star reviews with text
        .map((r, index) => ({
          id: `live-${index}`,
          name: r.authorAttribution?.displayName || 'Google User',
          avatar: (r.authorAttribution?.displayName || 'G').charAt(0),
          color: ['bg-blue-600', 'bg-purple-600', 'bg-emerald-600', 'bg-yellow-600'][index % 4],
          profile_photo_url: r.authorAttribution?.photoUri || '',
          rating: r.rating,
          text: r.text.text,
          date: r.relativePublishTimeDescription,
        }));
      pool = [...live];
    } else {
      // Only use fallbacks if live data completely fails to load
      pool = [...fallbackReviews];
    }
    
    // Remove duplicates if any
    const uniquePool = Array.from(new Map(pool.map(item => [item.text, item])).values());

    const dailySeed = getDailySeed();
    return shuffleArray(uniquePool, dailySeed).slice(0, 6);
  }, [data]);

  const overallRating = data?.rating || 4.9;
  const totalRatings = data?.userRatingCount || 142;

  return (
    <section className="py-8 md:py-20 px-4 md:px-6 relative overflow-hidden">
      {/* Background glow effects matching index */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-yellow-500/5 rounded-full filter blur-[100px] -z-10 pointer-events-none"></div>

      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-8 md:mb-14">
          <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-gray-800/80 border border-gray-700/50 rounded-full mb-4 shadow-lg backdrop-blur-md">
            <GoogleIcon />
            <span>Google Customer Reviews</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-3 md:mb-5 text-white">
            Trusted by Our Gamers
          </h2>
          
          {loading ? (
            <div className="h-10 w-32 bg-gray-800 animate-pulse rounded-md"></div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl font-bold text-white">{overallRating}</span>
              <div className="flex flex-col">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <span className="text-muted-foreground text-xs md:text-sm">Based on {totalRatings} reviews</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View (Masonry) */}
        <div className="hidden md:block columns-2 lg:columns-3 gap-8">
          {loading ? (
            // Loading skeletons for cards
            [...Array(3)].map((_, i) => (
              <div key={i} className="break-inside-avoid mb-8 p-8 rounded-2xl glass-card bg-gray-800/40 h-64 animate-pulse">
                <div className="flex gap-3 items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-4/6 bg-gray-700 rounded"></div>
              </div>
            ))
          ) : (
            displayReviews.map((review) => (
              <div
                key={review.id}
                className="break-inside-avoid mb-8 p-8 rounded-2xl glass-card bg-gray-800/40 hover-scale flex flex-col relative group transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:bg-gray-800/60"
              >
                {/* Subtle top border highlight */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.profile_photo_url ? (
                      <img src={review.profile_photo_url} alt={review.name} className="w-12 h-12 rounded-full shadow-inner" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                        {review.avatar}
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-base text-white flex items-center gap-1">
                        {review.name}
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                      </h3>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                  <GoogleIcon />
                </div>
                
                <div className="flex gap-1 mb-3">
                  {[...Array(Math.floor(review.rating))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                
                <p className="text-gray-300 text-base leading-relaxed flex-grow">
                  "{review.text}"
                </p>
              </div>
            ))
          )}
        </div>

        {/* Mobile View (Carousel) */}
        <div className="md:hidden w-full max-w-[90vw] mx-auto">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {loading ? (
                // Loading skeletons for cards
                [...Array(3)].map((_, i) => (
                  <CarouselItem key={i} className="pl-4">
                    <div className="p-6 rounded-2xl glass-card bg-gray-800/40 h-[250px] animate-pulse">
                      <div className="flex gap-3 items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 w-16 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 w-4/6 bg-gray-700 rounded"></div>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                displayReviews.map((review) => (
                  <CarouselItem key={review.id} className="pl-4">
                    <div className="p-6 rounded-2xl glass-card bg-gray-800/40 flex flex-col relative h-full min-h-[200px]">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {review.profile_photo_url ? (
                            <img src={review.profile_photo_url} alt={review.name} className="w-10 h-10 rounded-full shadow-inner" referrerPolicy="no-referrer" />
                          ) : (
                            <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-lg shadow-inner`}>
                              {review.avatar}
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-semibold text-sm text-white flex items-center gap-1">
                              {review.name}
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                            </h3>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                        <GoogleIcon />
                      </div>
                      
                      <div className="flex gap-1 mb-3">
                        {[...Array(Math.floor(review.rating))].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      
                      <p className="text-gray-300 text-sm leading-relaxed flex-grow">
                        "{review.text}"
                      </p>
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
            {/* Swiping is preferred on mobile, but keeping small side buttons for accessibility if space allows */}
          </Carousel>
          
          {/* Pagination Indicators */}
          {count > 0 && (
            <div className="py-2 flex justify-center gap-2 mt-4">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === current ? "bg-yellow-500 w-6" : "bg-gray-600 w-2 hover:bg-gray-500"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default GoogleReviews;
