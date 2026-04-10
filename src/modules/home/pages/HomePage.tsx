import { HeroSection } from '../components/HeroSection';
import { CategorySection } from '../components/CategorySection';
import { FlashSaleSection } from '../components/FlashSaleSection';
import { DailyDiscoverSection } from '../components/DailyDiscoverSection';
import { HomeFooter } from '../components/HomeFooter';

export const HomePage = () => {
  return (
    <div className="bg-[#F9F9F9] text-[#1A1A1A] font-sans">
      <div className="space-y-12">
        <HeroSection />
        <CategorySection />
        <FlashSaleSection />
        <DailyDiscoverSection />
      </div>

      <HomeFooter />
    </div>
  );
};