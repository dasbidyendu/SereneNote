import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BarChart, Bot, Users } from 'lucide-react';
import { Logo } from '@/components/logo';
import { PageShell } from '@/components/page-shell';

function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="#features">Features</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#about">About</Link>
          </Button>
        </nav>
        <Button asChild>
          <Link href="/login">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full p-8 bg-background/50">
      <div className="container mx-auto text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SereneNote. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  const features = [
    {
      icon: <BarChart className="h-8 w-8 text-accent" />,
      title: 'Mood Tracking',
      description: 'Visualize your emotional journey with our intuitive mood tracking and analysis tools.',
      image: PlaceHolderImages.find(p => p.id === 'feature-mood'),
    },
    {
      icon: <Bot className="h-8 w-8 text-accent" />,
      title: 'CBT Suggestions',
      description: 'Receive AI-powered, personalized suggestions based on Cognitive Behavioral Therapy.',
      image: PlaceHolderImages.find(p => p.id === 'feature-cbt'),
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      title: 'Community',
      description: 'Connect with others by sharing your public journals and reading their stories.',
      image: PlaceHolderImages.find(p => p.id === 'feature-community'),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-shadow-lg">
              Find Your Inner Peace
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-shadow">
              A sanctuary for your thoughts. Track your mood, reflect on your day, and find calm with SereneNote.
            </p>
            <Button size="lg" asChild>
              <Link href="/login">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-2">Features to Guide You</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Everything you need to cultivate mindfulness and emotional well-being.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="overflow-hidden">
                  {feature.image && (
                     <Image
                      src={feature.image.imageUrl}
                      alt={feature.image.description}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                      data-ai-hint={feature.image.imageHint}
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-4">
                       <div className="bg-accent/20 p-3 rounded-lg">{feature.icon}</div>
                       <CardTitle className="font-headline">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Our Philosophy</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              At SereneNote, we believe in the power of self-reflection. Our mission is to provide a safe,
              calm, and supportive space for you to explore your thoughts and emotions. We blend gentle technology
              with proven mental wellness techniques to help you on your path to a more serene life.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
