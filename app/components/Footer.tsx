import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-[#4A67C0] dark:bg-[#3A57B0] text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">Discover the beauty of India with our curated travel experiences.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-gray-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-200">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-gray-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-200">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="https://facebook.com" className="hover:text-gray-200">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="https://twitter.com" className="hover:text-gray-200">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="https://instagram.com" className="hover:text-gray-200">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm">
          © 2025 WanderGuide. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
