import group1597885301 from "@/assets/Group 1597885301.png";
import rectangle4237 from "@/assets/Rectangle 4237.png";
import { Button } from "./ui/button";

const LiveChatVideo = () => {
  return (
    <section className="bg-black text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Side - Video Call Image & Text */}
          <div>
            <div className="mb-6">
              <Button 
                size="sm" 
                className="bg-gray-800 text-white hover:bg-gray-700 rounded-lg mb-6"
              >
                Start Now
              </Button>
            </div>
            <div className="mb-8">
              <img 
                src={rectangle4237} 
                alt="Video Meeting" 
                className="w-full h-auto rounded-2xl"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Live Chat & Video Meetings
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                Chat with sellers and buyers on our internal chat system that offers payment system, fraud protection and many more helpful functions.
              </p>
            </div>
          </div>

          {/* Right Side - Mobile App Interface */}
          <div className="flex items-center justify-center">
            <img 
              src={group1597885301} 
              alt="Chat Interface" 
              className="w-full h-auto max-w-sm"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveChatVideo;


