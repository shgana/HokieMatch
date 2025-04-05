import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  FileUp,
  GraduationCap,
  Search,
  Upload,
} from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="w-full border-b bg-[#861F41] text-white">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-5 w-5" />
              <span>HokieMatch</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="#features"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:text-white hover:bg-white/10"
            >
              Log In
            </Button>
            <Button size="sm" className="bg-[#FF6600] hover:bg-[#FF6600]/90 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-gradient-to-b from-[#861F41]/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-[800px] text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-[#000000]">
                Track your degree.<br />
                Plan your future.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-[600px] mx-auto">
                HokieMatch analyzes your academic progress and recommends the best
                path to graduation based on your unique goals and requirements.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/upload-dars">
                  <Button size="lg" className="gap-2 bg-[#861F41] hover:bg-[#861F41]/90 text-white cursor-pointer">
                    <FileUp className="h-4 w-4" />
                    Upload Your DARS Report
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-[#861F41] text-[#861F41] hover:bg-[#861F41]/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-[800px] text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[#861F41]">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get personalized degree planning in three simple steps
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="bg-white rounded-lg p-6 shadow-sm border-t-4 border-[#861F41]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#861F41]">Upload</h3>
                  <Upload className="h-6 w-6 text-[#FF6600]" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Upload your DARS report or transcript to get started with your personalized degree planning.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-t-4 border-[#861F41]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#861F41]">Analyze</h3>
                  <Search className="h-6 w-6 text-[#FF6600]" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Our system analyzes your academic history, requirements, and preferences to create a tailored plan.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border-t-4 border-[#861F41]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#861F41]">Recommend</h3>
                  <ArrowRight className="h-6 w-6 text-[#FF6600]" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Receive personalized course recommendations and a clear path to graduation that fits your goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-[800px] text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[#861F41]">
                Features
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to stay on track and graduate on time
              </p>
            </div>
            {/* Center the grid by adding max-w and mx-auto */}
            <div className="mt-16 max-w-[64rem] mx-auto grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-10 py-8">
              <Card className="text-center border-none shadow-md overflow-hidden">
                <div className="h-2 bg-[#FF6600]"></div>
                <CardHeader className="pb-2">
                  <BookOpen className="h-12 w-12 mx-auto text-[#861F41] mb-4" />
                  <CardTitle className="text-[#861F41]">Class Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Get personalized class recommendations based on your academic history,
                    requirements, and preferences.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-none shadow-md overflow-hidden">
                <div className="h-2 bg-[#FF6600]"></div>
                <CardHeader className="pb-2">
                  <BarChart2 className="h-12 w-12 mx-auto text-[#861F41] mb-4" />
                  <CardTitle className="text-[#861F41]">GPA Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Track your GPA progress and see how future course selections might impact
                    your academic standing.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center border-none shadow-md overflow-hidden">
                <div className="h-2 bg-[#FF6600]"></div>
                <CardHeader className="pb-2">
                  <BarChart2 className="h-12 w-12 mx-auto text-[#861F41] mb-4" />
                  <CardTitle className="text-[#861F41]">Visual Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    View your progress through interactive charts and visualizations that make
                    planning intuitive.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <Button size="lg" className="bg-[#861F41] hover:bg-[#861F41]/90 text-white">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-[#861F41] text-white">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to simplify your academic journey?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-[42rem]">
              Join thousands of students who are using HokieMatch to plan their academic future.
            </p>
            <div className="mt-8">
              <Link href="/upload-dars" className="inline-block">
                <Button size="lg" className="gap-2 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white cursor-pointer">
                  <FileUp className="h-4 w-4" />
                  Upload Your DARS Report
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-[#861F41]/10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-2 md:flex-row">
            <GraduationCap className="h-5 w-5 text-[#861F41]" />
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} HokieMatch. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-[#861F41] transition-colors"
            >
              About
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-[#861F41] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-[#861F41] transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
