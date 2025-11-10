import { MainNav } from "@/components/main-nav"
import { AnimatedSection } from "@/components/animated-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, FileText, Accessibility, Wifi, Users } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center max-w-4xl">
          <AnimatedSection animation="fade-in">
            <Badge variant="secondary" className="mb-6">
              Built for Hackathon 2025
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Healthcare made simple, inclusive, and accessible
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              AI-powered prescription simplifier and symptom narrator for every Indian. Breaking language barriers with
              voice-first technology.
            </p>
          </AnimatedSection>

          <AnimatedSection animation="slide-up" delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 hover-lift" asChild>
                <Link href="/patient">
                  <Mic className="mr-2 h-5 w-5" />
                  Try Patient Demo
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover-lift bg-transparent" asChild>
                <Link href="/doctor">
                  <Users className="mr-2 h-5 w-5" />
                  Doctor Dashboard
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection animation="fade-in">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Bridging Healthcare Gaps with AI</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Four core features designed to make healthcare accessible for everyone
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileText,
                title: "Prescription Simplifier",
                description:
                  "Convert complex medical prescriptions into simple, step-by-step instructions in local languages",
                delay: 0,
              },
              {
                icon: Mic,
                title: "Symptom Narrator",
                description:
                  "Voice-first symptom recording and AI-powered transcription for accurate medical communication",
                delay: 100,
              },
              {
                icon: Wifi,
                title: "Offline Mode",
                description: "Works without internet connectivity, perfect for rural areas with limited network access",
                delay: 200,
              },
              {
                icon: Accessibility,
                title: "Accessibility",
                description:
                  "Designed for all users with large buttons, high contrast, and screen reader compatibility",
                delay: 300,
              },
            ].map((feature, index) => (
              <AnimatedSection key={index} animation="slide-up" delay={feature.delay}>
                <Card className="text-center hover-lift transition-all duration-300 h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection animation="fade-in">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple three-step process to bridge the healthcare communication gap
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Patient Speaks",
                description:
                  "Patient describes symptoms using voice recording. AI transcribes and summarizes the information for doctors.",
                delay: 0,
              },
              {
                step: "2",
                title: "Doctor Uploads",
                description:
                  "Doctor uploads prescription image. AI simplifies complex medical terms into clear, actionable instructions.",
                delay: 200,
              },
              {
                step: "3",
                title: "Patient Receives",
                description: "Patient gets clear step-by-step audio and visual guidance in their preferred language.",
                delay: 400,
              },
            ].map((item, index) => (
              <AnimatedSection key={index} animation="scale-in" delay={item.delay}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 hover-lift transition-all duration-300">
                    <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <AnimatedSection animation="fade-in">
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-12">The Healthcare Challenge in India</h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { stat: "100M+", description: "patients face language barriers in healthcare communication" },
                { stat: "65%", description: "of rural India lacks reliable internet connectivity" },
                { stat: "1 in 3", description: "patients struggle to understand medical prescriptions" },
              ].map((item, index) => (
                <AnimatedSection key={index} animation="scale-in" delay={index * 100}>
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">{item.stat}</div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection animation="slide-up" delay={400}>
              <Card className="bg-background border-primary/20 hover-lift transition-all duration-300">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-4 text-foreground">MediAssistAI bridges the gap</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    By combining voice-first technology, offline capabilities, and AI-powered simplification, we're
                    making healthcare accessible to every Indian, regardless of language, literacy, or location.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl text-foreground">MediAssistAI</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground mb-2">© 2025 MediAssistAI – Built at Hackathon 2025</p>
              <div className="flex space-x-4 justify-center md:justify-end">
                <Button variant="ghost" size="sm" className="hover-lift">
                  GitHub
                </Button>
                <Button variant="ghost" size="sm" className="hover-lift">
                  Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
