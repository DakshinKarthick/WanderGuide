import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-5xl font-bold mb-6 text-[#4A67C0] dark:text-[#6A87E0]">Welcome to WanderGuide</h1>
        <p className="text-xl mb-8 max-w-2xl text-gray-800 dark:text-gray-200">
          Discover the beauty and diversity of India with our curated travel experiences. From majestic mountains to
          serene beaches, ancient temples to modern cities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
          <div className="bg-[#6A87E0] dark:bg-[#5A77D0] p-6 rounded-lg text-white">
            <h3 className="font-bold mb-2">Explore Destinations</h3>
            <p>Discover India's most beautiful and culturally rich locations</p>
          </div>
          <div className="bg-white dark:bg-gray-700 p-6 rounded-lg text-gray-800 dark:text-white border border-[#6A87E0] dark:border-[#5A77D0]">
            <h3 className="font-bold mb-2">Plan Your Trip</h3>
            <p>Create custom itineraries tailored to your preferences</p>
          </div>
          <div className="bg-[#E6F0FF] dark:bg-[#3A57B0] p-6 rounded-lg text-gray-800 dark:text-white">
            <h3 className="font-bold mb-2">Local Experiences</h3>
            <p>Immerse yourself in authentic Indian culture and traditions</p>
          </div>
        </div>
        <Link href="/locations">
          <Button className="bg-[#4A67C0] hover:bg-[#6A87E0] text-white dark:bg-[#6A87E0] dark:hover:bg-[#8AA7FF]">
            Explore Destinations
          </Button>
        </Link>
      </div>
    </div>
  )
}
