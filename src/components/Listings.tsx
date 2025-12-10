import { Button } from "./ui/button";
import ListingCard from "./ListingCard";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";

interface ListingsProps {
  searchQuery: string;
}

const Listings = ({ searchQuery }: ListingsProps) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const LISTINGS_PER_PAGE = 6; // Show only 6 listings on home page
  
  // Use the same hook as admin dashboard for consistent category display
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories({ nocache: true });
  
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

  const fetchListings = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching ALL listings (will filter to PUBLISH client-side)');
      
      // Fetch ALL listings (same as admin) to ensure we get the same data
      // Then filter to PUBLISH client-side to match admin behavior
      let response = await apiClient.getListings({ nocache: 'true' }); // Bypass cache to get fresh data
      console.log('📦 API Response (ALL):', response);
      
      if (response.success) {
        let listingsData = Array.isArray(response.data) ? response.data : [];
        console.log('📊 Total listings count (ALL):', listingsData.length);
        
        // Filter to only show PUBLISH listings (same logic as admin dashboard)
        // Handle different status formats: 'PUBLISH', 'publish', 'Published', etc.
        const publishedListings = listingsData.filter((l: any) => {
          const status = String(l.status || '').toUpperCase();
          return status === 'PUBLISH' || status === 'PUBLISHED';
        });
        
        console.log('📊 Published listings count (after filter):', publishedListings.length);
        console.log('📊 Status breakdown:', {
          total: listingsData.length,
          published: publishedListings.length,
          draft: listingsData.filter((l: any) => String(l.status || '').toUpperCase() === 'DRAFT').length,
          other: listingsData.filter((l: any) => {
            const s = String(l.status || '').toUpperCase();
            return s !== 'PUBLISH' && s !== 'PUBLISHED' && s !== 'DRAFT';
          }).length,
          statuses: [...new Set(listingsData.map((l: any) => l.status))]
        });
        
        // Log first listing to see structure
        if (publishedListings.length > 0) {
          console.log('✅ First published listing structure:', publishedListings[0]);
          console.log('   - Brand data:', publishedListings[0].brand);
          console.log('   - Category data:', publishedListings[0].category);
          console.log('   - Status:', publishedListings[0].status);
          console.log('   - ID:', publishedListings[0].id);
        } else {
          console.warn('⚠️ No PUBLISH listings found!');
          console.log('Total listings:', listingsData.length);
          console.log('Status breakdown:', [...new Set(listingsData.map((l: any) => l.status))]);
        }
        
        setListings(publishedListings);
      } else {
        console.error('❌ API returned error:', response.error);
        console.log('Full error response:', response);
        setListings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching listings:', error);
      console.error('Error details:', error);
      setListings([]);
    }
    setLoading(false);
  };

  const filteredListings = listings.filter(listing => {
    const categoryName = listing.category?.[0]?.name || '';
    
    // Handle category filter
    let matchesCategory = true;
    if (activeCategory !== "All") {
      // Regular category filter
      matchesCategory = listing.category?.some((cat: any) => cat.name === activeCategory);
    }
    
    const matchesSearch = searchQuery === "" || 
      listing.brand?.[0]?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="listings" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Explore the Newest
            <br />
            Business Listings
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Discover the latest business opportunities with our newest listings.
            <br />
            Find your perfect match and grow today!
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map((category, catIndex) => {
              return (
                <button
                  key={`category-${catIndex}-${category}`}
                  onClick={() => setActiveCategory(category)}
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
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredListings.slice(0, LISTINGS_PER_PAGE).map((listing, index) => {
                // Extract data from brand questions
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
                
                // Calculate financial totals from all financials
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
                
                // Ensure unique key
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

            {filteredListings.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No listings found</p>
              </div>
            )}
          </>
        )}

        {filteredListings.length > LISTINGS_PER_PAGE && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full"
              onClick={() => navigate('/all-listings')}
            >
              View All Listings ({filteredListings.length})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Listings;
