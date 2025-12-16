
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, BarChart, Bot, Users, Heart, Star, MessageSquare, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Logo />
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" asChild><Link href="#features">Features</Link></Button>
          <Button variant="ghost" asChild><Link href="#about">About</Link></Button>
          <Button variant="ghost" asChild><Link href="#how-we-help">How We Help</Link></Button>
          <Button variant="ghost" asChild><Link href="#ratings">Ratings</Link></Button>
          <Button variant="ghost" asChild><Link href="#contact">Contact Us</Link></Button>
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
    <footer className="w-full p-8 bg-secondary/50">
      <div className="container mx-auto text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} SereneNote. All rights reserved.</p>
      </div>
    </footer>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const cardVariants = (delay: number) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: delay,
      ease: "easeOut"
    }
  }
});

function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ name, email, message });
        
        toast({
            title: "Message Sent!",
            description: "Thank you for reaching out. We'll get back to you soon.",
        });

        setName('');
        setEmail('');
        setMessage('');
    };
    
    if (!isClient) {
        return null;
    }

    return (
         <Card className="max-w-xl mx-auto p-6 bg-card/60 backdrop-blur-sm border-primary/20">
            <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    type="text" 
                    placeholder="Your Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                />
                <Input 
                    type="email" 
                    placeholder="Your Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Textarea 
                    placeholder="Your Message" 
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
                <Button type="submit" className="w-full">Send Message</Button>
            </form>
            </CardContent>
        </Card>
    );
}


export default function LandingPage() {
  const features = [
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: 'Mood Tracking',
      description: 'Visualize your emotional journey with our intuitive mood tracking and analysis tools.',
      image: PlaceHolderImages.find(p => p.id === 'feature-mood'),
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: 'CBT Suggestions',
      description: 'Receive AI-powered, personalized suggestions based on Cognitive Behavioral Therapy.',
      image: PlaceHolderImages.find(p => p.id === 'feature-cbt'),
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Community',
      description: 'Connect with others by sharing your public journals and reading their stories.',
      image: PlaceHolderImages.find(p => p.id === 'feature-community'),
    },
  ];

  const helpItems = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: 'Develop Self-Awareness',
      description: 'Understand your emotional patterns and triggers through daily journaling and mood tracking.'
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: 'Reduce Stress & Anxiety',
      description: 'Leverage CBT-based techniques and AI suggestions to manage stress in a healthy way.'
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: 'Feel Connected',
      description: 'Optionally share your journey and draw strength from a supportive community of peers.'
    }
  ];

  const ratings = [
    {
      name: 'Alex D.',
      comment: '"SereneNote has been a game-changer for my mental health. The AI suggestions are surprisingly insightful!"',
      stars: 5,
    },
    {
      name: 'Samantha P.',
      comment: '"I love the community feature. It makes me feel less alone in my struggles. Beautifully designed app."',
      stars: 5,
    },
    {
      name: 'Michael R.',
      comment: '"A simple yet powerful tool. Tracking my mood has helped me see patterns I never noticed before."',
      stars: 4,
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
            <Image
              src="/download.jpg"
              alt="Pink flowers"
              fill
              className="object-cover object-center"
              priority
              data-ai-hint="pink flower"
            />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />
          <div className="relative z-10 p-4 max-w-7xl mx-auto flex justify-start">
             <motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="text-left"
             >
                <h1 className="text-4xl md:text-7xl font-bold font-headline mb-4 text-shadow-lg">
                  Find Your Inner Peace
                </h1>
                <p className="text-lg md:text-xl max-w-xl mb-8 text-shadow">
                  A sanctuary for your thoughts. Track your mood, reflect on your day, and find calm with SereneNote.
                </p>
                <Button size="lg" asChild>
                  <Link href="/login">
                    Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
             </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <motion.section 
          id="features" 
          className="py-16 md:py-24 bg-secondary/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-2">Features to Guide You</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Everything you need to cultivate mindfulness and emotional well-being.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div key={index} variants={cardVariants(index * 0.2)}>
                  <Card className="overflow-hidden bg-card/60 backdrop-blur-sm border-primary/20 h-full">
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
                         <div className="bg-primary/20 p-3 rounded-lg">{feature.icon}</div>
                         <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section 
          id="about" 
          className="py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Our Philosophy</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              At SereneNote, we believe in the power of self-reflection. Our mission is to provide a safe,
              calm, and supportive space for you to explore your thoughts and emotions. We blend gentle technology
              with proven mental wellness techniques to help you on your path to a more serene life.
            </p>
          </div>
        </motion.section>

        {/* How We Help Section */}
        <motion.section 
          id="how-we-help" 
          className="py-16 md:py-24 bg-secondary/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-2">How We Help You</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Guiding you towards a more balanced and mindful state of being.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {helpItems.map((item, index) => (
                <motion.div key={index} variants={cardVariants(index * 0.2)}>
                  <Card className="text-center p-6 bg-card/60 backdrop-blur-sm border-primary/20 h-full">
                    <div className="flex justify-center mb-4">
                      <div className="bg-primary/20 p-4 rounded-full">{item.icon}</div>
                    </div>
                    <h3 className="text-xl font-bold font-headline mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Ratings Section */}
        <motion.section 
          id="ratings" 
          className="py-16 md:py-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-2">What Our Users Say</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Real stories from people on their journey with SereneNote.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {ratings.map((rating, index) => (
                <motion.div key={index} variants={cardVariants(index * 0.2)}>
                  <Card className="p-6 bg-card/60 backdrop-blur-sm border-primary/20 h-full">
                     <CardContent className="p-0">
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${i < rating.stars ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`} />
                        ))}
                      </div>
                      <p className="text-muted-foreground italic mb-4">{rating.comment}</p>
                      <p className="font-bold text-right">- {rating.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact Us Section */}
        <motion.section 
          id="contact" 
          className="py-16 md:py-24 bg-secondary/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-2">Get In Touch</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </div>
            <ContactForm />
          </div>
        </motion.section>

      </main>
      <Footer />
    </div>
  );
}
