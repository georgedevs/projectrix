'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import TechBackground from "@/components/TechBackground";

const PricingPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started with project collaboration",
      price: "0",
      features: [
        "3 Generated project ideas per month",
        "Project collaboration tools",
        "Public project listings",
        "GitHub integration",
        "Access to community features",
      ]
    },
    {
      name: "Pro",
      description: "For developers who want to maximize their collaboration potential",
      price: "5",
      features: [
        "Unlimited Generated project ideas",
        "Project collaboration tools",
        "Public project listings",
        "GitHub integration",
        "Access to community features",
        "Early access to new features"
      ],
      badge: "Most Popular"
    }
  ];

  const faqs = [
    {
      question: "Can I upgrade or downgrade at any time?",
      answer: "Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated amount for the remainder of the current billing cycle."
    },
    {
      question: "What happens when I reach my project idea generation limit?",
      answer: "On the free plan, once you've used your 3 project generations, you'll need to upgrade to Pro for unlimited generations."
    },
    {
      question: "Is there a minimum commitment period?",
      answer: "No, both our Free and Pro plans are month-to-month with no long-term commitment required. You can cancel at any time."
    }
  ];

  const handleFaqToggle = (index: number): void => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <main className="min-h-screen bg-background">
        <TechBackground/>
      <Header/>
      <section className="py-20">
        <div className="container px-4 mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-700 dark:to-blue-400 bg-clip-text text-transparent font-orbitron">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect plan for your development journey. Start for free and upgrade as you grow.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex"
              >
                <Card className={`relative flex flex-col w-full ${plan.name === 'Pro' ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 pt-6">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-black dark:bg-white text-white dark:text-black shadow-lg">
                        <Sparkles className="h-4 w-4" />
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <CardHeader className={plan.badge ? "pt-8" : ""}>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 flex-grow">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      <span className="text-sm font-medium">Includes:</span>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="mt-auto">
                    <Button 
                      className={`w-full gap-2 transform transition-all active:translate-y-1 active:shadow-none ${
                        plan.name === 'Pro' 
                          ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]' 
                          : 'bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 shadow-[0_4px_0_0_rgba(0,0,0,1)] dark:shadow-[0_4px_0_0_rgba(255,255,255,1)]'
                      }`}
                      size="lg"
                    >
                      Get Started
                      {plan.name === 'Pro' && <Sparkles className="h-4 w-4" />}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div 
            className="mt-20 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-900 to-blue-600 dark:from-blue-700 dark:to-blue-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  {/* Background shadow element */}
                  <div className="absolute inset-0 bg-black/20 dark:bg-white/20 translate-x-1 translate-y-1 rounded-xl transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />

                  {/* Main card */}
                  <motion.div
                    className={`relative p-6 rounded-xl bg-white dark:bg-black border border-black/20 dark:border-white/20 overflow-hidden transition-all duration-300 ${
                      openFaqIndex === index ? 'shadow-lg' : ''
                    }`}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    {/* Floating particles */}
                    {openFaqIndex === index && (
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
                            animate={{
                              x: [0, Math.random() * 100 - 50],
                              y: [0, Math.random() * 100 - 50],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Question header */}
                    <button
                      onClick={() => handleFaqToggle(index)}
                      className="w-full flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-900/20 dark:from-blue-400/20 dark:to-blue-700/20 blur-lg rounded-full" />
                          <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
                      </div>
                      <div className="flex-shrink-0">
                        {openFaqIndex === index ? (
                          <Minus className="w-5 h-5 text-primary" />
                        ) : (
                          <Plus className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </button>

                    {/* Answer content */}
                    <AnimatePresence>
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 pl-14">
                            <div className="relative">
                              <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-blue-600/20 via-blue-900/20 to-transparent dark:from-blue-400/20 dark:via-blue-700/20" />
                              <p className="text-muted-foreground">{faq.answer}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <Footer/>
    </main>
  );
};

export default PricingPage;