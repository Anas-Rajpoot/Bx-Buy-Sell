import { Building2, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/_App Icon 1 (2).png";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={logo} 
                alt="EX Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <p className="text-white/70">
              The trusted marketplace for buying and selling businesses worldwide.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-white/70">
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Resources</h3>
            <ul className="space-y-2 text-white/70">
              <li><a href="#" className="hover:text-accent transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Security</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-white/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                support@ex.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-white/60">
          <p>&copy; 2024 EX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
