import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart2, BookOpen, FileUp, GraduationCap, Search, Upload } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full bg-background">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between py-6">
            <div className="flex gap-6 md:gap-10">
              <Link href="/" className="flex items-center space-x-2">
                <GraduationCap className="h-6 w-6" />
                <span className="font-bold">HokieMatch</span>
              </Link>
              <nav className="hidden gap-6 md:flex">
                <Link
                  href="#features"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Features
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  How It Works
                </Link>
                <Link
                  href="#"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  About
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <section className="py-8 md:py-12 lg:py-32 flex items-center min-h-[50vh]">
          <div className="container mx-auto max-w-[64rem] flex flex-col items-center gap-4 text-center px-4">
            <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Track your degree. Plan your future.
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              HokieMatch analyzes your academic progress and recommends the best path to graduation based on your unique goals and requirements.
            </p>
            <div className="flex space-x-4">
              <Button size="lg" className="gap-2">
                <FileUp className="h-4 w-4" />
                Upload Your DARS Report
              </Button>
              <Button variant="outline" size="lg">Learn More</Button>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="w-full bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
                How It Works
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Get personalized degree planning in three simple steps
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <Card className="border-none shadow-md">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold">Upload</CardTitle>
                  <Upload className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload your DARS report or transcript to get started with your personalized degree planning.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold">Analyze</CardTitle>
                  <Search className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our system analyzes your academic history, requirements, and preferences to create a tailored plan.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-xl font-bold">Recommend</CardTitle>
                  <ArrowRight className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Receive personalized course recommendations and a clear path to graduation that fits your goals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-8 md:py-12 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Everything you need to stay on track and graduate on time
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 lg:gap-10 py-8">
              <Card className="flex flex-col items-center text-center p-6 shadow-md">
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl mb-2">Class Recommendations</CardTitle>
                <CardDescription className="text-sm">
                  Get personalized class recommendations based on your academic history, requirements, and preferences.
                </CardDescription>
              </Card>
              <Card className="flex flex-col items-center text-center p-6 shadow-md">
                <BarChart2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl mb-2">GPA Tracking</CardTitle>
                <CardDescription className="text-sm">
                  Track your GPA progress and see how future course selections might impact your academic standing.
                </CardDescription>
              </Card>
              <Card className="flex flex-col items-center text-center p-6 shadow-md">
                <BarChart2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-xl mb-2">Visual Dashboard</CardTitle>
                <CardDescription className="text-sm">
                  View your progress through interactive charts and visualizations that make planning intuitive.
                </CardDescription>
              </Card>
            </div>
            <div className="mx-auto flex justify-center">
              <Button size="lg" className="gap-2">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900 py-12 md:py-16">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center">
            <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl">
              Ready to simplify your academic journey?
            </h2>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-8">
              Join thousands of students who are using HokieMatch to plan their academic future.
            </p>
            <Button size="lg" className="gap-2" asChild>
              <Link href="/upload-dars">
                <FileUp className="h-4 w-4" />
                Upload Your DARS Report
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-slate-50 dark:bg-transparent w-full">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <GraduationCap className="h-6 w-6" />
            <p className="text-center text-sm leading-loose md:text-left">
              &copy; {new Date().getFullYear()} HokieMatch. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              About
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
