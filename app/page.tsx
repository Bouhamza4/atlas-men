import HeroSection from '@/components/HeroSection'
import CategoriesSection from '@/components/CategoriesSection'
import FeaturedProductsSection from '@/components/FeaturedProductsSection'
import NewsletterSection from '@/components/NewsletterSection'
import TestimonialsSection from '@/components/TestimonialsSection'

export default function HomePage() {
  return (
    <div className="home-page">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <NewsletterSection />
      <TestimonialsSection />
    </div>
  )
}