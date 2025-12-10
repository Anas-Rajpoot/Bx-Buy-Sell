import { Search, ChevronDown, SlidersHorizontal, ArrowUpRight, Layers } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import heroCard1 from "@/assets/hero-card-1.png";
import heroCard2 from "@/assets/hero-card-2.png";
import heroCard3 from "@/assets/hero-card-3.png";

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Hero = ({ searchQuery, setSearchQuery }: HeroProps) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const trendingTopics = ["Shopify", "E-Commerce", "YouTube Automation", "SaaS"];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
      // Scroll to listings section
      const listingsSection = document.getElementById('listings');
      if (listingsSection) {
        listingsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      toast.error("Please enter a search term");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <section className="relative bg-primary text-primary-foreground pt-32 pb-0 overflow-visible">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Buy & Sell Companies<br />in 3 simple Steps
          </h1>
          <p className="text-lg md:text-xl mb-6 text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Join the #1 platform for buying & selling companies. Discover, connect, and exchange with ease—your journey starts here today!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mb-12 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
              <span>Secure Payments with EXPay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
              <span>Simple 3-step process</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
              <span>Start in 1 Minute</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-12">
            <div className="bg-primary-foreground/5 backdrop-blur-xl rounded-[10px] px-6 py-2 border border-primary-foreground/5">
              <div className="flex gap-3 items-center">
                <div className={`flex-1 bg-primary-foreground/10 rounded-[10px] flex items-center px-8 py-5 border transition-all ${
                  isSearchFocused ? 'border-accent shadow-glow' : 'border-transparent'
                }`}>
                  <Layers className="w-5 h-5 mr-4 text-primary-foreground/80" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder="What Are You Looking For?"
                    className="flex-1 bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 outline-none text-lg"
                  />
                  <ChevronDown className="w-5 h-5 ml-4 text-primary-foreground/80" />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-16 w-16 rounded-2xl bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0 transition-all"
                >
                  <SlidersHorizontal className="w-6 h-6" />
                </Button>
                <Button 
                  variant="accent" 
                  size="icon" 
                  onClick={handleSearch}
                  className="h-14 w-14 rounded-[10px] shadow-lg hover:scale-105 transition-transform"
                >
                  <Search className="w-7 h-7" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="text-sm text-primary-foreground/70 mr-2">Trending Topics</span>
            {trendingTopics.map((topic) => (
              <Button
                key={topic}
                variant="ghost"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border border-primary-foreground/20 rounded-full px-5 py-2 text-sm font-medium transition-all"
              >
                {topic}
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            ))}
          </div>

          <div className="relative w-full max-w-7xl mx-auto mt-8 flex items-end justify-center mb-0">
            {/* Large center image - positioned at bottom */}
            <img 
              src={heroCard1} 
              alt="Dashboard" 
              className="w-full z-10"
            />
            
            {/* Small image - top left corner of big image */}
            <img 
              src={heroCard3} 
              alt="Archived Chats" 
              className="absolute left-4 top-0 w-72 hover:scale-105 transition-transform z-20"
            />
            
            {/* Small image - top right corner of big image */}
            <img 
              src={heroCard2} 
              alt="Chat Details" 
              className="absolute right-0 -top-4 w-80 hover:scale-105 transition-transform z-20"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
