
import React from "react";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Users, Award, ShieldCheck, Wrench, Clock, Building } from "lucide-react";

const About = () => {
  // Team members data
  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80",
      bio: "Tech enthusiast with over 15 years of experience in the PC hardware industry."
    },
    {
      name: "David Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80",
      bio: "Hardware engineer specializing in custom cooling solutions and overclocking."
    },
    {
      name: "Michael Williams",
      role: "Head of Products",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
      bio: "Passionate about curating the best PC components and ensuring quality control."
    },
    {
      name: "Emily Rodriguez",
      role: "Customer Support Manager",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80",
      bio: "Dedicated to providing exceptional customer service and technical support."
    }
  ];

  // Company values
  const companyValues = [
    {
      icon: <Award className="h-10 w-10 text-emerald-500" />,
      title: "Quality",
      description: "We only source and sell the highest quality components from trusted manufacturers."
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-emerald-500" />,
      title: "Reliability",
      description: "Extensive testing ensures every product we sell meets our strict performance standards."
    },
    {
      icon: <Wrench className="h-10 w-10 text-emerald-500" />,
      title: "Expertise",
      description: "Our team of tech enthusiasts brings years of experience and knowledge to help you build the perfect system."
    },
    {
      icon: <Clock className="h-10 w-10 text-emerald-500" />,
      title: "Support",
      description: "We're available 24/7 to assist with any questions or issues, before and after your purchase."
    }
  ];

  // Company timeline
  const timeline = [
    { year: "2015", event: "GreenBits founded in a small garage with a focus on custom gaming PCs" },
    { year: "2017", event: "Opened our first physical store and expanded to component sales" },
    { year: "2019", event: "Launched our online store with nationwide shipping" },
    { year: "2021", event: "Expanded to international markets with distribution centers in Europe and Asia" },
    { year: "2023", event: "Reached 100,000 customers milestone and launched our custom PC builder tool" }
  ];

  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="relative bg-forest-900 py-24">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568155931624-1578d9b343d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-forest-900/50 via-forest-900/80 to-background"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About GreenBits</h1>
              <p className="text-lg text-muted-foreground mb-6">
                We're passionate about building exceptional PC setups for gamers, creators, and professionals.
                Founded in 2015, we've grown from a small garage operation to a leading provider of premium components and custom builds.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/contact">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto">
                    Contact Us
                    <ChevronRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/category/accessories">
                  <Button variant="outline" className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/30 w-full sm:w-auto">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-20 px-4">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                At GreenBits, our mission is to provide high-quality PC components and custom builds that deliver exceptional 
                performance and value. We believe that everyone deserves access to reliable technology that enhances 
                their digital experience, whether for gaming, content creation, or professional work.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">What Sets Us Apart</h3>
                <p className="text-muted-foreground mb-6">
                  We're not just another tech retailer. Our team of passionate enthusiasts brings deep expertise 
                  and a personal touch to every interaction. When you choose GreenBits, you're not just buying 
                  components - you're joining a community that values quality, performance, and innovation.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Curated selection of premium components from trusted manufacturers</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Rigorous quality testing for every product we sell</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Expert technical support from knowledgeable staff</span>
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Custom PC building service with performance optimization</span>
                  </li>
                </ul>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1551636898-47668aa61de2?auto=format&fit=crop&q=80" 
                  alt="GreenBits office" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-20 px-4 bg-forest-800">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do at GreenBits
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => (
                <Card key={index} className="bg-forest-900 border-forest-700">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 p-3 rounded-full bg-emerald-900/50">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-20 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center mb-16">
              <div className="inline-flex items-center justify-center mb-4">
                <Users size={24} className="text-emerald-500 mr-2" />
                <span className="text-emerald-400 font-medium">Meet Our Team</span>
              </div>
              <h2 className="text-3xl font-bold text-center mb-4">The People Behind GreenBits</h2>
              <p className="text-muted-foreground text-center max-w-2xl">
                Our team of passionate tech enthusiasts brings together decades of experience in the PC industry
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="group">
                  <div className="relative mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900 to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white">{member.name}</h3>
                      <p className="text-sm text-emerald-400">{member.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="py-20 px-4 bg-forest-800">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center mb-4">
                <Building size={24} className="text-emerald-500 mr-2" />
                <span className="text-emerald-400 font-medium">Our Journey</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">The GreenBits Story</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From humble beginnings to industry leader
              </p>
            </div>

            <div className="max-w-3xl mx-auto relative">
              {/* Timeline line */}
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-forest-700 transform md:translate-x-px"></div>
              
              {/* Timeline events */}
              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <div 
                    key={index} 
                    className={`relative flex flex-col md:flex-row items-center md:items-start gap-8 ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-emerald-600 transform -translate-x-1.5 md:-translate-x-2"></div>
                    
                    {/* Year */}
                    <div className={`md:w-1/2 pl-8 md:pl-0 ${
                      index % 2 === 0 ? 'md:pr-10 text-left md:text-right' : 'md:pl-10 text-left'
                    }`}>
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-900/50 text-emerald-400 text-sm font-medium">
                        {item.year}
                      </span>
                    </div>
                    
                    {/* Event */}
                    <div className={`md:w-1/2 pl-8 md:pl-0 ${
                      index % 2 === 0 ? 'md:pl-10 text-left' : 'md:pr-10 text-left md:text-right'
                    }`}>
                      <p className="text-lg">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Your Dream PC?</h2>
              <p className="text-muted-foreground mb-8">
                Whether you're looking for individual components or a complete custom build,
                our team is here to help you create the perfect system for your needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/build">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto">
                    Build Your PC
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/30 w-full sm:w-auto">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
