import group113 from "@/assets/Group 113.png";
import group1597885297 from "@/assets/Group 1597885297.png";

const Features = () => {
  return (
    <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Section - Reports & Insights Text with QR Code */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Reports & Insights
            </h2>
            <p className="text-white/90 text-lg leading-relaxed mb-8">
              Our detailed dashboard insights clear up most questions early on — so you can focus on what really matters. With key metrics presented clearly, users spend less time searching and more time deciding.
            </p>
            {/* QR Code Image below text */}
            <div className="flex justify-start">
              <img 
                src={group1597885297} 
                alt="Download Mobile App" 
                className="w-full h-auto max-w-sm"
              />
            </div>
          </div>

          {/* Right Section - Mobile App on Green Background */}
          <div className="flex items-center justify-center">
            <img 
              src={group113} 
              alt="Reports & Insights App" 
              className="w-full h-auto max-w-sm"
            />
            </div>
          </div>
        </div>
      </section>
  );
};

export default Features;