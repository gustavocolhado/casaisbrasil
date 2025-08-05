import DesktopLayout from '@/components/layout/DesktopLayout'
import MobileLayout from '@/components/layout/MobileLayout'

export default function RecommendationsPage() {
  return (
    <>
      <div className="hidden md:block">
        <DesktopLayout />
      </div>
      <div className="md:hidden">
        <MobileLayout />
      </div>
    </>
  )
} 