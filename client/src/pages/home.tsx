import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MapPin, 
  Activity, 
  Radar, 
  Wifi, 
  Target, 
  Eye, 
  Lock,
  ArrowRight,
  BarChart3,
  Satellite,
  Search,
  Database,
  Antenna,
  Radio
} from 'lucide-react';

const features = [
  {
    icon: <Radar className="h-6 w-6" />,
    title: "Real-time Signal Intelligence",
    description: "Advanced SIGINT collection and analysis of wireless communications and RF signatures.",
    accent: "text-blue-300"
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Geospatial Intelligence", 
    description: "Military-grade mapping with PostGIS spatial analysis for forensic investigations.",
    accent: "text-green-300"
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Electronic Surveillance",
    description: "Multi-spectrum monitoring for cellular, WiFi, Bluetooth, and BLE device detection.",
    accent: "text-purple-300"
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Forensic Database",
    description: "Comprehensive intelligence database with advanced correlation and pattern analysis.",
    accent: "text-orange-300"
  }
];

const trustedByLogos = [
  "Law Enforcement",
  "Security Research", 
  "Digital Forensics",
  "SIGINT Operations",
  "Cybersecurity Teams",
  "Intelligence Agencies"
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation Bar */}
      <nav className="relative z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="icon-container w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 gold-accent">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">ShadowCheck</h1>
                <p className="text-xs text-slate-400 cyber-text tracking-wider">SIGINT FORENSICS PLATFORM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" data-testid="nav-dashboard">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/visualization">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" data-testid="nav-visualization">
                  <MapPin className="h-4 w-4 mr-2" />
                  Visualization
                </Button>
              </Link>
              <Link href="/networks">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800" data-testid="nav-networks">
                  <Wifi className="h-4 w-4 mr-2" />
                  Networks
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" data-testid="nav-launch">
                  Launch Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center">
            {/* Announcement Banner */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8 cyber-glow cyber-scan-line">
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 cyber-hexagon">
                New
              </Badge>
              <span className="text-sm text-slate-300 cyber-text">Advanced spatial queries now available</span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>

            {/* Main Headlines */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="hero-gradient-text block mb-2">
                Better Context.
              </span>
              <span className="feature-gradient-text glitch-text block mb-2" data-text="Better Intelligence.">
                Better Intelligence.
              </span>
              <span className="hero-gradient-text block">
                Better Analysis.
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              The most powerful SIGINT forensics platform backed by the industry-leading 
              spatial intelligence engine. Advanced wireless network analysis for security professionals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-dashboard"
                >
                  <Satellite className="h-5 w-5 mr-2" />
                  Launch Dashboard
                </Button>
              </Link>
              <Link href="/visualization">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg rounded-xl transition-all duration-300"
                  data-testid="button-visualization"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Explore Intelligence
                </Button>
              </Link>
            </div>

            {/* Platform Screenshots */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
              <div className="premium-card cyber-border data-stream hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="icon-container mx-auto mb-6">
                    <BarChart3 className="h-10 w-10 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">SIGINT Analytics</h3>
                  <p className="text-slate-300 cyber-text">Real-time signal intelligence metrics with advanced data correlation</p>
                  <div className="mt-4 silver-accent px-4 py-2 rounded-full inline-block">
                    <span className="text-xs font-semibold text-slate-700">CLASSIFIED</span>
                  </div>
                </CardContent>
              </div>
              
              <div className="premium-card cyber-border data-stream hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="icon-container mx-auto mb-6">
                    <Radar className="h-10 w-10 text-green-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">Electronic Warfare</h3>
                  <p className="text-slate-300 cyber-text">Multi-spectrum surveillance and RF signature analysis</p>
                  <div className="mt-4 silver-accent px-4 py-2 rounded-full inline-block">
                    <span className="text-xs font-semibold text-slate-700">TACTICAL</span>
                  </div>
                </CardContent>
              </div>
              
              <div className="premium-card cyber-border data-stream hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="icon-container mx-auto mb-6">
                    <Target className="h-10 w-10 text-orange-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-3">Forensic Intelligence</h3>
                  <p className="text-slate-300 cyber-text">Advanced pattern recognition and threat assessment</p>
                  <div className="mt-4 gold-accent px-4 py-2 rounded-full inline-block">
                    <span className="text-xs font-semibold text-slate-800">PREMIUM</span>
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-slate-500 mb-8">Trusted by professionals at</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {trustedByLogos.map((logo, index) => (
              <div key={index} className="text-slate-400 font-medium text-sm px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Industry Leading Quality
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Proprietary spatial analysis combined with cutting-edge forensics capabilities 
              give you intelligence you can trust for critical operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="premium-card group cursor-pointer hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="icon-container">
                      <div className={`${feature.accent}`}>
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-slate-200 text-lg">{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card text-center p-8 hover:scale-105">
              <div className="text-4xl font-bold text-blue-300 mb-2">2,510+</div>
              <div className="text-slate-300 silver-accent px-4 py-2 rounded-full inline-block">
                <span className="text-xs font-semibold text-slate-700">Network Observations</span>
              </div>
            </div>
            <div className="premium-card text-center p-8 hover:scale-105">
              <div className="text-4xl font-bold text-green-300 mb-2">1,268+</div>
              <div className="text-slate-300 silver-accent px-4 py-2 rounded-full inline-block">
                <span className="text-xs font-semibold text-slate-700">Distinct Networks</span>
              </div>
            </div>
            <div className="premium-card text-center p-8 hover:scale-105">
              <div className="text-4xl font-bold text-purple-300 mb-2">99.9%</div>
              <div className="text-slate-300 silver-accent px-4 py-2 rounded-full inline-block">
                <span className="text-xs font-semibold text-slate-700">Platform Reliability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Professionals Section */}
      <section className="py-24 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Built for Security Professionals
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              From real-time monitoring to deep forensics analysis, ShadowCheck provides 
              comprehensive SIGINT capabilities for any intelligence operation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="flex">
              <div className="text-center group flex-1">
                <div className="premium-card hover:scale-105 p-8 h-full flex flex-col">
                  <div className="icon-container mx-auto mb-6">
                    <Eye className="h-8 w-8 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4">Real-time Monitoring</h3>
                  <p className="text-slate-300 flex-1">
                    Monitor wireless networks and cellular signals in real-time with advanced filtering and alerting.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="text-center group flex-1">
                <div className="premium-card hover:scale-105 p-8 h-full flex flex-col">
                  <div className="icon-container mx-auto mb-6">
                    <Radio className="h-8 w-8 text-green-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4">Signal Intelligence</h3>
                  <p className="text-slate-300 flex-1">
                    Comprehensive SIGINT analysis including WiFi, Bluetooth, BLE, and cellular data collection.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="text-center group flex-1">
                <div className="premium-card hover:scale-105 p-8 h-full flex flex-col">
                  <div className="icon-container mx-auto mb-6">
                    <Lock className="h-8 w-8 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4">Security & Privacy</h3>
                  <p className="text-slate-300 flex-1">
                    Your intelligence data is secure and private by default with enterprise-grade encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to enhance your intelligence capabilities?
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            Join security professionals worldwide who trust ShadowCheck for their SIGINT operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                data-testid="button-get-started"
              >
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/visualization">
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-6 text-lg rounded-xl transition-all duration-300"
                data-testid="button-live-demo"
              >
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}