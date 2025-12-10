import group125 from "@/assets/Group 125.png";

const stats = [
  { value: "8+", label: "New Listings Daily" },
  { value: "10K", label: "Total User Base" },
  { value: "500M", label: "Requested Deal Volume" },
];

const AboutEx = () => {
  return (
    <section className="bg-black text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-10">
            <button className="text-white border border-white/20 border-b-[#D3FC50] border-b-2 rounded-lg px-5 py-2.5 font-medium bg-white/5">
              EXIT OPPORTUNITIES
            </button>
            <button className="text-white border border-white/20 rounded-lg px-5 py-2.5 font-medium bg-white/5">
              Company Exchange
            </button>
          </div>

          {/* Top Section - About EX Text & Customer Review */}
          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Left - Platform Description */}
              <div className="pt-2">
                <p className="text-white text-lg md:text-xl leading-relaxed">
                  EX provides you an intuitive dashboard, realtime analytics, and a secure marketplace for BUYING & SELLING Companies.
                </p>
              </div>

              {/* Right - Customer Review Box */}
              <div className="flex justify-center md:justify-start -mt-4">
                <img 
                  src={group125} 
                  alt="Customer Reviews" 
                  className="w-auto h-auto max-w-[260px]"
                />
              </div>
            </div>
          </div>

          {/* Bottom Section - Statistics */}
          <div className="border-t border-dashed border-white/10 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <div className="text-sm md:text-base text-white/80 mb-2 uppercase tracking-wide">
                    {stat.label}
                  </div>
                  <div className="text-5xl md:text-6xl font-bold text-white">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutEx;

