import group1597885298 from "@/assets/Group 1597885298.png";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SecureSimpleSeamless = () => {
  return (
    <section className="bg-black text-white">
      {/* Top Section - EX -Secure, Simple, Seamless */}
      <div className="py-20 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-start max-w-7xl mx-auto">
            <div>
              <h2 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                EX -Secure, Simple, Seamless
              </h2>
            </div>
            <div className="pt-8 md:pt-12">
              <p className="text-white text-lg md:text-xl leading-relaxed">
                EX is where serious buyers meet real sellers. Whether you're looking to acquire your next cash-flowing asset or exit your business with confidence — EX gives you the place to do it right. We combine clean design with powerful analytics, secure infrastructure, and a smooth user experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Discover All Listings */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Side - Mobile App Image */}
            <div className="flex justify-center md:justify-start">
              <img 
                src={group1597885298} 
                alt="EX Mobile App" 
                className="w-full max-w-sm md:max-w-md h-auto object-contain"
              />
            </div>

            {/* Right Side - Text Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Discover All Listings
              </h2>
              <p className="text-white/80 text-lg mb-8">
                EX provides you a simple userface to
              </p>
              <ul className="space-y-4 mb-10 text-white/90">
                <li className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-lg">Browse thousands of listings</span>
                </li>
                <li className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-lg">Use advanced Filter Options</span>
                </li>
                <li className="flex items-center gap-3">
                  <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-lg">Contact the best sellers</span>
                </li>
              </ul>
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 rounded-xl px-8 py-6 border border-black"
                asChild
              >
                <Link to="/all-listings">See All Listings</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecureSimpleSeamless;


