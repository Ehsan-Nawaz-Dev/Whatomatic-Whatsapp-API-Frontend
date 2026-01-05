import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <span className="inline-block text-sm font-semibold text-primary mb-3">BLOG</span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Latest from WhatFlow</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            This is a placeholder blog page. Use it to publish product updates, automation tips, and
            Shopify growth strategies.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No posts yet. Add your first article here when you are ready to share updates with your
          merchants.
        </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Blog;
