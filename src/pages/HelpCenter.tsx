import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitContact } from "@/lib/api";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const HelpCenter = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      setName("");
      setEmail("");
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, email, message });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-24 space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-muted-foreground mb-4">
            Find answers about setting up WhatFlow with your Shopify store. Use the form below to
            contact our team and we will get back to you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl border border-border bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">How can we help?</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              placeholder="Describe your question or issue..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" variant="hero" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send message"}
            </Button>
            {mutation.isSuccess && (
              <span className="text-xs text-success">Message sent!</span>
            )}
            {mutation.isError && (
              <span className="text-xs text-destructive">Failed to send. Please try again.</span>
            )}
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default HelpCenter;
