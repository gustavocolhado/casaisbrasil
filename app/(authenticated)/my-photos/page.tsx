import DesktopLayout from '@/components/layout/DesktopLayout'
import MobileLayout from '@/components/layout/MobileLayout'

export default function MyPhotosPage() {
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