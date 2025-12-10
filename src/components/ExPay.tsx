import group75 from "@/assets/Group 75.png";
import { Button } from "./ui/button";
import { Shield, Zap, Globe, Layers } from "lucide-react";

const ExPay = () => {
  const features = [
    {
      icon: Layers,
      title: "No Risk",
      description: "EX PAY removes the risk of the whole transaction. So you can focus on the deal."
    },
    {
      icon: Shield,
      title: "Trustworthy Escrow Service",
      description: "Get your money safe through EX Pay. We protect (buyers & sellers)."
    },
    {
      icon: Zap,
      title: "Fast and Safe",
      description: "Receive or send payments quickly. No unnecessary steps & low fees."
    },
    {
      icon: Globe,
      title: "Seamless Integration",
      description: "Complete your business transactions smoothly without leaving our platform."
    }
  ];

  return (
    <section className="bg-black text-white py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Secure Payments with EX PAY
          </h2>
          <p className="text-white/80 text-lg max-w-3xl mx-auto">
            EX PAY is the trusted payment solution on our marketplace, ensuring every transaction is secure, fast, and reliable. Whether you are buying or selling a business, Ex Pay offers safe and seamless payments directly on our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left Side - Features List */}
          <div>
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-white">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100 rounded-xl px-8 py-6"
            >
              Read More
            </Button>
          </div>

          {/* Right Side - Payment UI Cards Image */}
          <div className="flex items-center justify-center">
            <img 
              src={group75} 
              alt="EX PAY Payment Process" 
              className="w-full h-auto max-w-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExPay;


