import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Layers, Palette, MousePointer2, ArrowRight, History, UploadCloud, CheckCircle2, SplitSquareHorizontal, MessageSquareText, BookOpen, Keyboard } from 'lucide-react';
import { Button } from "@/components/ui/button";

const navVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const heroVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.2,
      delayChildren: 0.3
    } 
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" as const } }
};

// Re-structured Bento Grid items with specific spans and images
const bentoItems = [
  {
    icon: <History className="h-6 w-6 text-primary" />,
    title: "Multi-color Variants & States",
    description: "Built-in handling for complex, multi-path SVGs and interactive hover states.",
    className: "md:col-span-2 md:row-span-2",
    image: "/images/variants.png"
  },
  {
    icon: <SplitSquareHorizontal className="h-6 w-6 text-primary" />,
    title: "Side-by-Side Comparison",
    description: "Refine assets with microscopic viewing and transparent diff overlays.",
    className: "md:col-span-1 md:row-span-1",
    image: "/images/comparison.png"
  },
  {
    icon: <MousePointer2 className="h-6 w-6 text-primary" />,
    title: "Batch Operations",
    description: "Multi-select, invert, and export bulk archives instantly.",
    className: "md:col-span-1 md:row-span-1",
    image: "/images/batch.png"
  },
  {
    icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
    title: "Naming Validation",
    description: "Enforced project consistency with auto-fixes for duplicates and casing.",
    className: "md:col-span-1 md:row-span-1",
    image: "/images/naming.png"
  },
  {
    icon: <UploadCloud className="h-6 w-6 text-primary" />,
    title: "Local SVG Import",
    description: "Drag-and-drop raw SVGs, persisted safely via IndexedDB.",
    className: "md:col-span-2 md:row-span-1",
    image: "/images/import.png"
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background/5 to-secondary/10 text-foreground overflow-x-hidden font-sans selection:bg-primary/30">
      
      {/* Decorative Background Gradients */}
      {/* Gradient circles for modern look */}
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-background/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-primary/20 to-primary/40 rounded-full blur-[80px] opacity-30 pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-gradient-to-r from-secondary/20 to-secondary/40 rounded-full blur-[60px] opacity-20 pointer-events-none mix-blend-screen" />

      {/* Navbar */}
      <motion.nav 
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 sm:px-12 backdrop-blur-md border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-lg shadow-primary/20">
             <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm tracking-widest uppercase">Icon<span className="opacity-50">Sys</span></span>
        </div>
        <div>
          <Button 
            variant="ghost" 
            className="text-xs uppercase tracking-widest hover:bg-white/5"
            onClick={() => navigate('/app')}
          >
            Launch Tool
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-6 flex flex-col items-center justify-center text-center z-10">
        <motion.div 
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm">
            <Sparkles className="h-3 w-3" />
            <span>v2.0 Architecture</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Master Your <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/50">
              Design System
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            A premium, high-performance explorer for managing, customizing, and generating icon assets with absolute precision and AI-powered insights.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="h-14 px-8 text-sm uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate('/app')}
            >
              Enter Explorer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="h-14 px-8 text-sm uppercase tracking-widest border-muted-foreground/20 hover:bg-white/5 w-full sm:w-auto transition-all"
            >
              Read Docs
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Bento Grid Features Section */}
      <div className="relative z-20 bg-background/50 border-t border-white/5 pb-32">
        <div className="text-center pt-24 pb-16 px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
          >
            Engineered for Perfection
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto text-lg"
          >
            A closer look at the advanced capabilities built into the core engine.
          </motion.p>
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:grid-flow-dense auto-rows-fr">
            {bentoItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-3xl bg-background border border-muted flex flex-col w-full min-h-[300px] ${item.className}`}
              >
                {/* Background Image/Screenshot */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/5 via-background/2 to-transparent z-10" />
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                
                {/* Content */}
                <div className="relative z-20 mt-auto p-6 flex flex-col gap-3 bg-gradient-to-t from-background/70 via-background/30 to-transparent rounded-b-3xl">
                  <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-foreground/80">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-sm text-muted-foreground/50 z-10 relative">
        <p>Built with React, Framer Motion, and Tailwind CSS.</p>
        <p className="mt-2 text-[10px] uppercase tracking-widest">© 2026 Core UI Systems</p>
      </footer>
    </div>
  );
};

export default LandingPage;
