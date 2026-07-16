import { useState } from 'react';
import { Mail, MessageSquare, Send, Clock, CheckCircle2, Linkedin, Phone } from 'lucide-react';
import Seo from '../components/Seo';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const infoCards = [
    {
      icon: Mail,
      color: 'text-cyan-400 bg-cyan-500/10',
      title: 'Email',
      text: 'kumardeewan321@gmail.com',
      href: 'mailto:kumardeewan321@gmail.com',
    },
    {
      icon: Linkedin,
      color: 'text-blue-400 bg-blue-500/10',
      title: 'LinkedIn',
      text: 'linkedin.com/in/deewankumar25',
      href: 'https://www.linkedin.com/in/deewankumar25',
    },
    {
      icon: Phone,
      color: 'text-emerald-400 bg-emerald-500/10',
      title: 'WhatsApp',
      text: '0335-1226921',
      href: 'https://wa.me/923351226921',
    },
    {
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10',
      title: 'Response time',
      text: 'Usually within 1-2 business days',
      href: undefined,
    },
  ];

  return (
    <>
      <Seo
        title="Contact Us — NexoraConvert"
        description="Get in touch with the NexoraConvert team. Send feedback, request a new tool, or ask a question — we'd love to hear from you."
        keywords={['contact nexoraconvert', 'contact us', 'feedback', 'support', 'file converter support']}
        canonical="https://nexoraconvert.com/#/contact"
        faqs={[
          { q: 'How do I contact NexoraConvert?', a: 'Fill out the contact form on this page or email us at kumardeewan321@gmail.com.' },
          { q: 'Can I request a new tool?', a: 'Absolutely! Tell us what tool you need in the message field and we will consider adding it.' },
          { q: 'How fast do you reply?', a: 'We typically respond within 1-2 business days.' },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute top-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-14 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl shadow-cyan-500/30">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-400">
            Have a question, found a bug, or want to request a new tool? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                Send us a message
              </h2>
              {sent ? (
                <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-emerald-500/10 px-6 py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                  <p className="mt-3 text-lg font-semibold text-white">Message sent!</p>
                  <p className="mt-1 text-sm text-slate-400">Thanks for reaching out — we'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Name</label>
                      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="input" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Subject</label>
                    <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What is this about?" className="input" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Message</label>
                    <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." className="input resize-none" />
                  </div>
                  <button type="submit" className="btn-primary w-full"><Send className="h-4 w-4" /> Send message</button>
                </form>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            {infoCards.map((item) => (
              <div key={item.title} className="card-dark p-6 transition-colors hover:border-white/20">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{item.title}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 block truncate text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {item.text}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-sm text-slate-400">{item.text}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
