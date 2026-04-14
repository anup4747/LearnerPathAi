import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Brain, Sparkles, Layers, TrendingDown, HelpCircle,
  Search, Cpu, GraduationCap, Map, BookOpen, CheckSquare,
  FileText, LayoutTemplate, MessageCircle, BarChart, Database,
  ArrowDown
} from "lucide-react";

const RevealOnScroll = ({ children, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

const NumberCounter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
       if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-vscode-bg text-vscode-text font-['Inter'] selection:bg-vscode-accent selection:text-white">
      {/* SECTION 1: NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md border-b border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Brain className="w-8 h-8 text-vscode-accent" />
            <span className="text-xl font-bold text-white tracking-tight">EduGen</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-semibold text-vscode-accent border border-vscode-accent rounded-full hover:bg-vscode-accent/10 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="px-5 py-2.5 text-sm font-semibold text-white bg-vscode-accent rounded-full hover:bg-vscode-accent/90 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 2: HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vscode-accent/20 rounded-full blur-[120px] animate-float1 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-float2 pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          <RevealOnScroll>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-vscode-accent/30 bg-slate-900/50 backdrop-blur-sm mb-8 animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-vscode-accent" />
              <span className="text-sm font-medium text-slate-300">Powered by Google Gemini AI</span>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="delay-100">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              <span className="text-white block">Stop Searching.</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-vscode-accent via-indigo-400 to-purple-400 block mt-2">
                Start Learning.
              </span>
            </h1>
          </RevealOnScroll>

          <RevealOnScroll className="delay-200">
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-10 leading-relaxed font-medium">
              Tell EduGen what you want to learn. It builds your entire course — 
              roadmap, chapters, quizzes, and exams — powered by AI. In minutes.
            </p>
          </RevealOnScroll>

          <RevealOnScroll className="delay-300">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/signup" className="group relative overflow-hidden w-full sm:w-auto px-8 py-4 text-white font-semibold rounded-full bg-gradient-to-r from-vscode-accent to-indigo-600 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shimmer"></div>
                <span className="relative flex items-center justify-center gap-2">
                  Start Learning for Free <span className="text-xl">→</span>
                </span>
              </Link>
              <button onClick={() => scrollToSection('how-it-works')} className="w-full sm:w-auto px-8 py-4 text-slate-300 font-semibold rounded-full border border-slate-700 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all">
                See How It Works
              </button>
            </div>
          </RevealOnScroll>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Scroll to explore</span>
          <ArrowDown className="w-5 h-5 text-vscode-accent animate-bounce-slow" />
        </div>
      </section>

      {/* SECTION 3: SOCIAL PROOF BAR */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800/50 text-center">
            <RevealOnScroll className="pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2"><NumberCounter end={5000} />+</div>
              <div className="text-sm text-slate-400 font-medium tracking-wide">Courses Generated</div>
            </RevealOnScroll>
            <RevealOnScroll className="pt-4 md:pt-0 delay-100">
              <div className="text-3xl md:text-4xl font-bold text-vscode-accent mb-2"><NumberCounter end={50} />+</div>
              <div className="text-sm text-slate-400 font-medium tracking-wide">Topics Supported</div>
            </RevealOnScroll>
            <RevealOnScroll className="pt-4 md:pt-0 delay-200">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2"><NumberCounter end={3} /></div>
              <div className="text-sm text-slate-400 font-medium tracking-wide">Assessment Levels</div>
            </RevealOnScroll>
            <RevealOnScroll className="pt-4 md:pt-0 delay-300">
              <div className="text-3xl md:text-4xl font-bold text-vscode-accent mb-2">100%</div>
              <div className="text-sm text-slate-400 font-medium tracking-wide">AI Generated</div>
            </RevealOnScroll>
            <RevealOnScroll className="pt-4 md:pt-0 delay-400 col-span-2 md:col-span-1">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">Free</div>
              <div className="text-sm text-slate-400 font-medium tracking-wide">To Use Forever</div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SECTION 4: PROBLEM STATEMENT SECTION */}
      <section id="about" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">The Problem with Learning Online Today</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                You are not the problem. The internet just was not designed for structured learning.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Layers className="w-8 h-8 text-vscode-accent" />,
                title: "Too Much Content, Zero Direction",
                body: "YouTube has 800 hours of content uploaded every minute. Coursera has 7,000+ courses. But nobody tells you which one to take first, second, or next."
              },
              {
                icon: <TrendingDown className="w-8 h-8 text-teal-400" />,
                title: "96% of Online Courses Go Unfinished",
                body: "Students start motivated but lose momentum when they have no structure, no checkpoints, and no way to measure their own progress."
              },
              {
                icon: <HelpCircle className="w-8 h-8 text-purple-400" />,
                title: "Learning Without Testing is Just Reading",
                body: "Most platforms give you content but no way to know if you actually understood it. You finish a course and still feel unsure."
              }
            ].map((card, i) => (
              <RevealOnScroll key={i} className={`delay-[${i * 100}ms]`}>
                <div className="h-full bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 hover:border-vscode-accent/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] hover:-translate-y-2 transition-all duration-300 group">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-slate-800 mb-6 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">{card.body}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: SOLUTION — HOW EDUGEN WORKS */}
      <section id="how-it-works" className="py-24 bg-[#080b12] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <RevealOnScroll>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How EduGen Works</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Three steps. One platform. Complete learning experience.
              </p>
            </div>
          </RevealOnScroll>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 relative">
            <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-slate-800/60 -z-10"></div>
            <div className="lg:hidden absolute top-0 bottom-0 left-[39px] w-[2px] bg-slate-800/60 -z-10"></div>

            {[
              {
                num: "01",
                icon: <Search className="w-6 h-6 text-white" />,
                title: "Tell EduGen What to Learn",
                body: "Type any topic — Python, Machine Learning, React, Data Structures, Finance, Design. Choose your level: Beginner, Intermediate, or Advanced."
              },
              {
                num: "02",
                icon: <Cpu className="w-6 h-6 text-white" />,
                title: "AI Generates Your Complete Course",
                body: "In minutes, Gemini AI creates your personalized roadmap, writes full chapter blogs, designs chapter quizzes, and builds your midterm and final exam."
              },
              {
                num: "03",
                icon: <GraduationCap className="w-6 h-6 text-white" />,
                title: "Study, Test, and Complete",
                body: "Read your AI-written chapters, take interactive quizzes, get an AI assistant to answer your doubts, and earn your course completion."
              }
            ].map((step, i) => (
              <RevealOnScroll key={i} className={`flex-1 relative delay-[${i * 150}ms]`}>
                <div className="flex lg:flex-col gap-6 lg:gap-0 lg:text-center items-start lg:items-center group">
                  <div className="relative">
                    <div className="absolute lg:top-10 lg:left-1/2 lg:-translate-x-1/2 -top-4 -left-4 text-7xl font-black text-slate-800/30 group-hover:text-vscode-accent/20 transition-colors pointer-events-none select-none z-0">
                      {step.num}
                    </div>
                    <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-vscode-accent to-purple-600 flex items-center justify-center p-[2px] mb-8 lg:mx-auto shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:scale-110 transition-transform">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-vscode-accent flex items-center justify-center">
                          {step.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 relative z-10">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium relative z-10">{step.body}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: FEATURES SHOWCASE */}
      <section id="features" className="py-24 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything You Need to Learn Anything</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Built for students who are serious about learning.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Feature 1: Large Left */}
            <RevealOnScroll className="lg:col-span-2">
              <div className="h-full bg-slate-900/80 p-8 md:p-10 rounded-[2rem] border border-slate-800 hover:border-vscode-accent/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                    <Map size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">AI-Generated Learning Roadmap</h3>
                  <p className="text-slate-400 font-medium max-w-md">EduGen analyzes your topic and level and creates a structured roadmap with 5 to 8 chapters, each with clear objectives, reading time, and difficulty level. No more guessing what to study next.</p>
                </div>
                <div className="relative z-10 bg-slate-950 p-6 rounded-2xl border border-slate-800/80 shadow-xl ml-auto w-full md:w-3/4 transform group-hover:scale-[1.02] transition-transform">
                  <div className="flex gap-4 items-start mb-6">
                    <div className="w-8 h-8 rounded-full bg-vscode-accent flex items-center justify-center text-white text-xs font-bold">1</div>
                    <div>
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                      <div className="h-2 w-48 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                  <div className="w-0.5 h-6 bg-slate-800 ml-4 mb-2"></div>
                  <div className="flex gap-4 items-start opacity-50">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold">2</div>
                    <div>
                      <div className="h-4 w-40 bg-slate-600 rounded mb-2"></div>
                      <div className="h-2 w-32 bg-slate-800 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Features 2 & 3: Small Right */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <RevealOnScroll className="flex-1 delay-100">
                <div className="h-full bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Blog-Style Chapter Articles</h3>
                  <p className="text-sm text-slate-400 font-medium">Every chapter is a full educational article — minimum 500 words, with subheadings, real examples, code blocks if needed, key takeaways, and a preview of what comes next.</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll className="flex-1 delay-200">
                <div className="h-full bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 hover:border-green-500/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                    <CheckSquare size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Chapter Quizzes</h3>
                  <p className="text-sm text-slate-400 font-medium">5 MCQ questions after every chapter with auto-scoring. Each answer comes with a one-line explanation so you understand why you were right or wrong.</p>
                </div>
              </RevealOnScroll>
            </div>

             {/* Features 4: Small Left */}
             <div className="flex flex-col gap-6 lg:col-span-1">
              <RevealOnScroll className="flex-1">
                <div className="h-full bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 hover:border-orange-500/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Midterm and Final Exams</h3>
                  <p className="text-sm text-slate-400 font-medium">A midterm exam at the halfway point and a comprehensive final exam at the end — with MCQs, short answers, and a capstone project.</p>
                </div>
              </RevealOnScroll>
              <RevealOnScroll className="flex-1 delay-100">
                <div className="h-full bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
                    <MessageCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Context-Aware AI Chatbot</h3>
                  <p className="text-sm text-slate-400 font-medium">An AI assistant embedded in your learning panel that knows exactly what topic and chapter you are studying. Ask anything, get an immediate answer.</p>
                </div>
              </RevealOnScroll>
            </div>

            {/* Feature 5: Large Right */}
            <RevealOnScroll className="lg:col-span-2 delay-200">
              <div className="h-full bg-slate-900/80 p-8 md:p-10 rounded-[2rem] border border-slate-800 hover:border-vscode-accent/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10 mb-8 md:mb-0 md:w-1/2">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                    <LayoutTemplate size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">VS Code-Style Learning Interface</h3>
                  <p className="text-slate-400 font-medium">The learning interface feels like your code editor. Left panel for navigation, center panel for content, right panel for your AI assistant. Designed for developers and engineering students.</p>
                </div>
                <div className="relative z-10 md:absolute md:right-8 md:bottom-8 md:top-8 w-full md:w-5/12 bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl flex overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <div className="w-1/5 border-r border-slate-800 flex flex-col p-2 space-y-2 opacity-50">
                    <div className="w-full h-3 bg-slate-800 rounded"></div>
                    <div className="w-3/4 h-2 bg-slate-800 rounded"></div>
                    <div className="w-full h-2 bg-slate-800 rounded"></div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col gap-3">
                    <div className="w-1/2 h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="w-full h-2 bg-slate-700 rounded"></div>
                    <div className="w-full h-2 bg-slate-700 rounded"></div>
                    <div className="w-3/4 h-2 bg-slate-700 rounded"></div>
                  </div>
                  <div className="w-1/4 border-l border-slate-800 p-2 flex flex-col justify-end opacity-80">
                     <div className="w-full h-6 bg-vscode-accent/20 rounded-md border border-vscode-accent/30 mt-auto"></div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
             
             {/* Feature 7 & 8 */}
             <RevealOnScroll className="lg:col-span-2">
               <div className="h-full bg-slate-900/80 p-8 md:p-10 rounded-[2rem] border border-slate-800 hover:border-teal-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row gap-8 items-center justify-between group">
                  <div className="flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-6">
                      <Database size={28} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Your Learning History, Always Saved</h3>
                    <p className="text-slate-400 font-medium">Every course you generate is saved permanently in your account. Come back a week later and resume exactly where you left off. Switch between topics anytime.</p>
                  </div>
                  <div className="w-full md:w-80 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl group-hover:scale-105 transition-transform">
                     <div className="flex justify-between items-center mb-4">
                        <div className="font-semibold text-white">Topics</div>
                        <div className="text-xs text-vscode-accent">View all</div>
                     </div>
                     <div className="space-y-3">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                           <div className="text-sm font-medium text-slate-200">React Basics</div>
                           <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-md">100%</div>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                           <div className="text-sm font-medium text-slate-200">System Design</div>
                           <div className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-md">45%</div>
                        </div>
                     </div>
                  </div>
               </div>
             </RevealOnScroll>
             <RevealOnScroll className="lg:col-span-1 delay-100">
                <div className="h-full bg-slate-900/80 p-8 rounded-[2rem] border border-slate-800 hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6">
                    <BarChart size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Progress Tracking</h3>
                  <p className="text-sm text-slate-400 font-medium">Track quiz scores, exam results, and overall performance. A results dashboard appears after completing all assessments with a full breakdown.</p>
                </div>
              </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SECTION 7: TECH STACK SECTION */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <RevealOnScroll>
            <h2 className="text-3xl font-bold text-white mb-4">Built With Modern Technology</h2>
            <p className="text-lg text-slate-400 mb-12">Open, fast, and completely free to run.</p>
          </RevealOnScroll>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              { icon: "⚛️", name: "React + Vite", desc: "Lightning fast frontend" },
              { icon: "🧠", name: "Google Gemini AI", desc: "Course content generation" },
              { icon: "🐍", name: "Flask (Python)", desc: "Backend API and AI pipeline" },
              { icon: "🍃", name: "MongoDB", desc: "Persistent learning storage" },
              { icon: "🔐", name: "Supabase", desc: "Secure authentication" },
              { icon: "🌊", name: "Tailwind CSS", desc: "Utility-first styling" }
            ].map((tech, i) => (
              <RevealOnScroll key={i} className={`delay-[${i * 50}ms]`}>
                <div className="flex items-center gap-4 bg-slate-900/80 px-6 py-4 rounded-full border border-slate-800 hover:border-slate-600 transition-colors">
                  <span className="text-2xl">{tech.icon}</span>
                  <div className="text-left">
                    <div className="font-bold text-slate-200 text-sm">{tech.name}</div>
                    <div className="text-xs text-slate-500">{tech.desc}</div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: TESTIMONIAL / USE CASE SECTION */}
      <section className="py-24 bg-[#080b12]">
        <div className="max-w-7xl mx-auto px-6">
          <RevealOnScroll>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Who is EduGen For?</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Anyone who learns better with structure.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                avatar: "🎓", color: "bg-blue-500/20 text-blue-500", name: "The Engineering Student",
                quote: "I use EduGen before exams to generate a quick structured review of topics my professor barely explained. The quizzes at the end of each chapter tell me exactly what I still do not know.",
                tags: ["Exam Prep", "Self Study", "Technical Topics"]
              },
              {
                avatar: "💼", color: "bg-orange-500/20 text-orange-500", name: "The Career Switcher",
                quote: "I am transitioning from marketing to data science. EduGen gave me a complete ML roadmap at beginner level and wrote every chapter in plain English. I went from confused to confident in two weeks.",
                tags: ["Career Change", "Beginner Friendly", "AI / ML"]
              },
              {
                avatar: "💻", color: "bg-purple-500/20 text-purple-500", name: "The Self-Learner",
                quote: "I tried Coursera, Udemy, YouTube. I always got lost. EduGen is the first tool that just tells me exactly what to do and tests me on it. I actually finished a full course for the first time.",
                tags: ["No Prior Knowledge", "Structured Learning", "Any Topic"]
              }
            ].map((persona, i) => (
              <RevealOnScroll key={i} className={`delay-[${i * 100}ms]`}>
                <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${persona.color}`}>
                        {persona.avatar}
                      </div>
                      <div className="font-bold text-white text-lg">{persona.name}</div>
                    </div>
                    <p className="text-slate-400 italic mb-8 leading-relaxed">"{persona.quote}"</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {persona.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-vscode-accent/10 text-vscode-accent text-xs font-semibold rounded-full border border-vscode-accent/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: CTA SECTION (FINAL) */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/20 to-[#080b12] z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vscode-accent/10 rounded-full blur-[100px] animate-pulse z-0 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <RevealOnScroll>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Your Learning Journey Starts Here</h2>
            <p className="text-xl text-slate-300 mb-10 font-medium">
              Generate your first personalized course in under 2 minutes. <br className="hidden md:block" />
              No credit card. No subscription. Just learning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link to="/signup" className="w-full sm:w-auto px-8 py-4 text-white font-semibold rounded-full bg-gradient-to-r from-vscode-accent to-purple-600 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                Create My First Course →
              </Link>
              <button onClick={() => scrollToSection('about')} className="w-full sm:w-auto px-8 py-4 text-slate-300 font-semibold rounded-full border border-slate-700 hover:text-white hover:bg-slate-800 transition-all">
                Learn More About EduGen
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400 font-medium">
              <span className="flex items-center gap-2"><span className="text-vscode-accent">✓</span> Free forever</span>
              <span className="flex items-center gap-2"><span className="text-vscode-accent">✓</span> No credit card required</span>
              <span className="flex items-center gap-2"><span className="text-vscode-accent">✓</span> Powered by Google Gemini</span>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 10: FOOTER */}
      <footer className="bg-[#080b12] border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-vscode-accent" />
                <span className="text-xl font-bold text-white">EduGen</span>
              </div>
              <p className="text-slate-500 text-sm mb-4">
                AI-powered personalized learning for everyone.
              </p>
              <p className="text-slate-600 text-sm">
                © 2025 EduGen. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-vscode-accent transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollToSection('features')} className="hover:text-vscode-accent transition-colors">Features</button></li>
                <li><Link to="/signup" className="hover:text-vscode-accent transition-colors">Start Learning</Link></li>
                <li><Link to="/login" className="hover:text-vscode-accent transition-colors">Sign In</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Technology</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>Built with React + Vite</li>
                <li>Powered by Gemini AI</li>
                <li>MongoDB Storage</li>
                <li>Supabase Auth</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">About</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                EduGen was built as a Design Thinking project to solve the real problem of learner overwhelm in online education.
              </p>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-slate-800 text-sm text-slate-500">
            Made with ❤️ for learners everywhere
          </div>
        </div>
      </footer>
    </div>
  );
}
