import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import step1 from "@/assets/step-1.png";
import step2 from "@/assets/step-2.png";
import step3 from "@/assets/step-3.png";

const steps = [
  {
    number: "01",
    title: "List Your Business 4 free",
    description: "Create a compelling listing in minutes. No upfront fees, no hassle — just visibility to serious buyers.",
    image: step1,
  },
  {
    number: "02",
    title: "Interact with Buyers",
    description: "Communicate securely, answer questions, and showcase your business to qualified prospects.",
    image: step2,
  },
  {
    number: "03",
    title: "Seal the Deal with EX Pay",
    description: "Finalize your deal safely with secure payments through our escrow service >> EX Pay <<",
    image: step3,
  },
];

const HowItWorks = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How EX works</h2>
          <p className="text-lg text-muted-foreground mb-3">
            Buy & Sell Companies in 3 Easy Steps.
          </p>
          <p className="text-base text-muted-foreground mb-8">
            Seamlessly connecting buyers and sellers for faster, smoother deals.
          </p>
          
          {!isAuthenticated && (
            <div className="flex items-center justify-center gap-4 mb-12">
              <Button 
                variant="secondary" 
                size="lg"
                className="rounded-xl px-8 py-6 text-base font-semibold"
                asChild
              >
                <Link to="/buyer-signup">I'm A Buyer</Link>
              </Button>
              <Button 
                variant="accent" 
                size="lg"
                className="rounded-xl px-8 py-6 text-base font-semibold"
                asChild
              >
                <Link to="/seller-signup">I'm A Seller</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="mb-6 flex justify-center items-center">
                <div className={`w-full max-w-md aspect-[4/3] flex items-center justify-center rounded-2xl overflow-hidden ${index === 1 ? 'bg-muted p-12' : ''}`}>
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
