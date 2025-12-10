import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

const AllListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || "All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 listings per page
  
  // Use the same hook as admin dashboard for consistent category display
  const { data: categoriesData = [] } = useCategories({ nocache: true });
  
  // Extract category names and add "All" option
  const categories = ["All", ...categoriesData.map((c: any) => c.name).filter((name: string) => 
    name !== "Managed by EX" && 
    name !== "🤝 Managed by EX" &&
    name !== "managed by ex" &&
    name?.trim() !== ""
  )];

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    // Update URL when category or search changes
    const params = new URLSearchParams();
    if (activeCategory !== "All") {
      params.set('category', activeCategory);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    setSearchParams(params, { replace: true });
  }, [activeCategory, searchQuery]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching ALL listings (will filter to PUBLISH client-side)');
      
      let response = await apiClient.getListings({ nocache: 'true' });
      console.log('📦 API Response (ALL):', response);
      
      if (response.success) {
        let listingsData = Array.isArray(response.data) ? response.data : [];
        console.log('📊 Total listings count (ALL):', listingsData.length);
        
        // Filter to only show PUBLISH listings
        const publishedListings = listingsData.filter((l: any) => {
          const status = String(l.status || '').toUpperCase();
          return status === 'PUBLISH' || status === 'PUBLISHED';
        });
        
        console.log('📊 Published listings count (after filter):', publishedListings.length);
        setListings(publishedListings);
      } else {
        console.error('❌ API returned error:', response.error);
        setListings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      setListings([]);
    }
    setLoading(false);
  };

  const filteredListings = listings.filter(listing => {
    const categoryName = listing.category?.[0]?.name || '';
    
    // Handle category filter
    let matchesCategory = true;
    if (activeCategory !== "All") {
      matchesCategory = listing.category?.some((cat: any) => cat.name === activeCategory);
    }
    
    const matchesSearch = searchQuery === "" || 
      listing.brand?.[0]?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              All Business Listings
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Browse through all available business opportunities
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by business name, category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category, catIndex) => {
              return (
                <button
                  key={`category-${catIndex}-${category}`}
                  onClick={() => {
                    setActiveCategory(category);
                    setCurrentPage(1); // Reset to first page on category change
                  }}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-accent text-accent-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Results Count */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredListings.length)} of {filteredListings.length} listings
            </p>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {paginatedListings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {paginatedListings.map((listing, index) => {
                      // Extract data from brand questions (same as home page)
                      const brandQuestions = listing.brand || [];
                      const getBrandAnswer = (searchTerms: string[]) => {
                        const question = brandQuestions.find((b: any) => 
                          searchTerms.some(term => b.question?.toLowerCase().includes(term.toLowerCase()))
                        );
                        return question?.answer || null;
                      };
                      
                      const businessName = getBrandAnswer(['business name', 'company name', 'brand name', 'name']) || 
                                          brandQuestions[0]?.answer || 
                                          listing.title || 
                                          'Unnamed Business';
                      const businessDescription = getBrandAnswer(['description', 'about', 'business description']) || 
                                                 listing.description || 
                                                 '';
                      const askingPrice = getBrandAnswer(['asking price', 'price', 'selling price']) || 
                                        listing.price || 
                                        0;
                      const location = getBrandAnswer(['country', 'location', 'address']) || 
                                     listing.location || 
                                     'Not specified';
                      const businessAge = getBrandAnswer(['business age', 'age', 'years']) || 
                                        listing.businessAge || 
                                        null;
                      
                      // Extract from advertisement questions
                      const adQuestions = listing.advertisement || [];
                      const getAdAnswer = (searchTerms: string[]) => {
                        const question = adQuestions.find((a: any) => 
                          searchTerms.some(term => a.question?.toLowerCase().includes(term.toLowerCase()))
                        );
                        return question?.answer || null;
                      };
                      const adDescription = getAdAnswer(['description']) || businessDescription;
                      
                      // Get image from advertisement or brand
                      let imageUrl = '';
                      const photoQuestion = adQuestions.find((a: any) => 
                        a.question?.toLowerCase().includes('photo') || a.answer_type === 'PHOTO'
                      );
                      if (photoQuestion?.answer) {
                        imageUrl = Array.isArray(photoQuestion.answer) ? photoQuestion.answer[0] : photoQuestion.answer;
                      }
                      if (!imageUrl) {
                        const brandInfo = brandQuestions[0];
                        imageUrl = brandInfo?.businessPhoto?.[0] || 
                                  brandInfo?.logo || 
                                  listing.image_url || 
                                  listing.photo || 
                                  "/placeholder.svg";
                      }
                      
                      // Calculate financial totals from all financials (same as home page)
                      const allFinancials = listing.financials || [];
                      const totalRevenue = allFinancials.reduce((sum: number, f: any) => 
                        sum + parseFloat(f.revenue_amount || 0), 0
                      );
                      const totalNetProfit = allFinancials.reduce((sum: number, f: any) => 
                        sum + parseFloat(f.net_profit || 0), 0
                      );
                      
                      // Calculate profit multiple (if price and profit available)
                      let profitMultiple = "Multiple 1.5x Profit"; // Default
                      if (askingPrice && totalNetProfit > 0) {
                        const multiple = parseFloat(askingPrice) / totalNetProfit;
                        profitMultiple = `Multiple ${multiple.toFixed(1)}x Profit`;
                      }
                      
                      // Calculate revenue multiple
                      let revenueMultiple = "0.5x Revenue"; // Default
                      if (askingPrice && totalRevenue > 0) {
                        const multiple = parseFloat(askingPrice) / totalRevenue;
                        revenueMultiple = `${multiple.toFixed(1)}x Revenue`;
                      }
                      
                      const categoryInfo = listing.category?.[0];
                      const listingKey = listing.id || `listing-${index}-${businessName}`;
                      
                      return (
                        <div
                          key={listingKey}
                          className="animate-scale-in"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <ListingCard
                            image={imageUrl}
                            category={categoryInfo?.name || 'Other'}
                            name={businessName}
                            description={adDescription || businessDescription}
                            price={`$${Number(askingPrice).toLocaleString()}`}
                            profitMultiple={profitMultiple}
                            revenueMultiple={revenueMultiple}
                            location={location}
                            locationFlag={location}
                            businessAge={businessAge ? parseInt(businessAge) : undefined}
                            netProfit={totalNetProfit > 0 ? `$${Math.round(totalNetProfit).toLocaleString()}` : undefined}
                            revenue={totalRevenue > 0 ? `$${Math.round(totalRevenue).toLocaleString()}` : undefined}
                            managedByEx={listing.managed_by_ex === true || listing.managed_by_ex === 1 || listing.managed_by_ex === 'true' || listing.managed_by_ex === '1'}
                            listingId={listing.id}
                            sellerId={listing.userId || listing.user_id}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="rounded-full"
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="rounded-full"
                            >
                              {page}
                            </Button>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <span key={page} className="px-2">...</span>;
                        }
                        return null;
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="rounded-full"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No listings found</p>
                  {(activeCategory !== "All" || searchQuery) && (
                    <Button
                      variant="outline"
                      className="mt-4 rounded-full"
                      onClick={() => {
                        setActiveCategory("All");
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AllListings;

