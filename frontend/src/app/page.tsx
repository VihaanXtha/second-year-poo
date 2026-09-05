import Navbar from "@/components/sections/Navbar";
import HomepageSlider from "@/components/sections/HomepageSlider";
import About from "@/components/sections/About";
import WhyCircuitBazaar from "@/components/sections/WhyCircuitBazaar";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import ShopByCategory from "@/components/sections/ShopByCategory";
import TrustedBrands from "@/components/sections/TrustedBrands";
import StatsBar from "@/components/sections/StatsBar";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import BlogTeaser from "@/components/sections/BlogTeaser";
import FAQPreview from "@/components/sections/FAQPreview";
import VendorCTA from "@/components/sections/VendorCTA";
import NewsletterSignup from "@/components/sections/NewsletterSignup";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HomepageSlider />
      <About />
      <WhyCircuitBazaar />
      <FeaturedProducts />
      <ShopByCategory />
      <TrustedBrands />
      <StatsBar />
      <HowItWorks />
      <Testimonials />
      <BlogTeaser />
      <FAQPreview />
      <VendorCTA />
      <NewsletterSignup />
    </main>
  );
}
