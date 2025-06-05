import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Facebook, Instagram, Linkedin, MessageCircle, Slack, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-blue-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Users className="h-6 w-6 text-purple-600" />
            <span className="text-xl">ContactSync</span>
          </Link>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/login" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          </div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
                    Sync Your Contacts Across All Platforms
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Connect LinkedIn, Instagram, Facebook, Slack, Discord and more to keep your contacts updated
                    everywhere.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-purple-200 hover:bg-purple-50 transition-all duration-200"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Automatic Sync</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Duplicate Detection</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>CardDAV Support</span>
                  </div>
                </div>
              </div>
              <div className="mx-auto flex items-center justify-center lg:justify-end">
                <div className="relative w-full max-w-[450px] aspect-square">
                  <Image
                    src="/placeholder.svg?height=500&width=500"
                    alt="Contact Sync Illustration"
                    width={500}
                    height={500}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platforms Section */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Connect All Your Platforms</h2>
              <p className="text-gray-600 max-w-[700px] mx-auto">
                Seamlessly sync contacts from all your favorite social networks and messaging apps
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-3">
                  <Linkedin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-center">LinkedIn</h3>
              </div>

              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-3">
                  <Facebook className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-medium text-center">Facebook</h3>
              </div>

              <div className="flex flex-col items-center p-4 bg-pink-50 rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-pink-100 rounded-full mb-3">
                  <Instagram className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="font-medium text-center">Instagram</h3>
              </div>

              <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-purple-100 rounded-full mb-3">
                  <Slack className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-medium text-center">Slack</h3>
              </div>

              <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="w-16 h-16 flex items-center justify-center bg-indigo-100 rounded-full mb-3">
                  <MessageCircle className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-medium text-center">Discord</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 bg-gradient-to-b from-purple-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Smart Features</h2>
              <p className="text-gray-600 max-w-[700px] mx-auto">
                Our intelligent tools make contact management effortless
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white/80 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Smart Merging</CardTitle>
                  <CardDescription>Intelligent duplicate detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our advanced algorithms detect duplicate contacts and suggest merges, keeping your contact list
                    clean and organized.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/features/merging"
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-pink-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-pink-600"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Session Authentication</CardTitle>
                  <CardDescription>Connect to any platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Use session cookies to connect with platforms that don&apos;t offer official APIs, like LinkedIn and
                    Instagram.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/features/session-auth"
                    className="text-pink-600 hover:text-pink-700 font-medium flex items-center"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-blue-600"
                    >
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                      <path d="M12 8v4l3 3"></path>
                    </svg>
                  </div>
                  <CardTitle className="text-xl">Automatic Sync</CardTitle>
                  <CardDescription>Always up-to-date contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Schedule automatic synchronization to keep your contacts updated across all your devices and
                    platforms.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    href="/features/auto-sync"
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">What Our Users Say</h2>
              <p className="text-gray-600 max-w-[700px] mx-auto">
                Join thousands of satisfied users who have simplified their contact management
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                      <span className="text-purple-700 font-bold">JD</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">John Doe</h4>
                    <p className="text-sm text-gray-600">Marketing Director</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  &quot;ContactSync has been a game-changer for managing my professional network. I can finally keep all my
                  contacts in sync across platforms!&quot;
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#8B5CF6"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="bg-pink-50 p-6 rounded-xl border border-pink-100">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-pink-200 flex items-center justify-center">
                      <span className="text-pink-700 font-bold">SJ</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-sm text-gray-600">Freelance Designer</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  &quot;The duplicate detection feature saved me hours of manual work. Now I have a clean contact list
                  without any duplicates!&quot;
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#EC4899"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-blue-700 font-bold">MB</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">Michael Brown</h4>
                    <p className="text-sm text-gray-600">Sales Executive</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  &quot;Being able to sync LinkedIn contacts without an official API is incredible. This tool is essential
                  for any sales professional!&quot;
                </p>
                <div className="flex mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#3B82F6"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Simplify Your Contact Management?</h2>
            <p className="max-w-[600px] mx-auto mb-8 opacity-90">
              Join thousands of users who have streamlined their contact management with ContactSync.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 transition-all duration-200"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-gray-900 text-gray-300">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-white mb-4">
                <Users className="h-5 w-5 text-purple-400" />
                <span>ContactSync</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                The ultimate solution for syncing and managing your contacts across all platforms.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© 2023 ContactSync. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <select className="bg-gray-800 text-gray-300 text-sm rounded-md px-3 py-1 border border-gray-700">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
