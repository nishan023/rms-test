import { useNavigate } from "react-router-dom";
import {
    Menu,
    ChevronRight,
    QrCode,
    Settings,
    Users,
    CreditCard,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
    LayoutDashboard,
    Zap,
    ShieldCheck,
    Smartphone
} from "lucide-react";
import { useState } from "react";

const LandingPage = () => {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const features = [
        {
            title: "Digital Menu Management",
            desc: "Update items, prices, and availability in real-time. No more reprinting paper menus.",
            icon: <Menu className="w-6 h-6 text-[#16516f]" />
        },
        {
            title: "QR Code Ordering",
            desc: "Contactless ordering for dine-in customers. Reduce wait times and improve efficiency.",
            icon: <QrCode className="w-6 h-6 text-[#16516f]" />
        },
        {
            title: "Inventory Tracking",
            desc: "Keep tabs on your stock levels and get alerts when items are running low.",
            icon: <Settings className="w-6 h-6 text-[#16516f]" />
        },
        {
            title: "Customer Ledger",
            desc: "Manage credit and loyalty for regular customers with a powerful built-in ledger.",
            icon: <CreditCard className="w-6 h-6 text-[#16516f]" />
        }
    ];

    const pricing = [
        {
            name: "Basic",
            price: "499",
            features: ["Single Outlet", "Digital Menu", "QR Ordering", "Standard Support"],
            button: "Start Free",
            active: false
        },
        {
            name: "Premium",
            price: "1999",
            features: ["Up to 3 Outlets", "Inventory Management", "Credit Ledger", "Priority Support", "Analytics Dashboard"],
            button: "Most Popular",
            active: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            features: ["Unlimited Outlets", "Custom Domain", "White Labeling", "Dedicated Manager", "Full API Access"],
            button: "Contact Us",
            active: false
        }
    ];

    const faqs = [
        {
            q: "What is LeafClutch technology?",
            a: "LeafClutch is a modern restaurant management platform designed to help cafes, restaurants, and hotels digitize their menus and streamline operations through QR ordering and smart admin tools."
        },
        {
            q: "Do I need to download an app?",
            a: "No! LeafClutch is entirely web-based. Customers simply scan a QR code and order directly from their browser, while admins manage everything through our sleek web dashboard."
        },
        {
            q: "How does the credit ledger work?",
            a: "The credit ledger allows you to record 'Pay Later' orders for trusted customers. You can track their total due, send reminders, and manage payments easily."
        }
    ];

    const navLinks = ["Home", "Features", "Pricing", "About"];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#16516f] rounded-lg flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">LeafClutch <span className="text-[#16516f]">Technology</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-slate-600 hover:text-[#16516f] transition-colors">{link}</a>
                    ))}
                </div>
                <button
                    onClick={() => navigate('/admin/login')}
                    className="bg-[#16516f] text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#16516f]/20 hover:bg-[#114058] transition-all hover:scale-105 active:scale-95"
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <section id="home" className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3 h-3" /> Elevate your dining experience
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1]">
                        Digital Dining, <br />
                        <span className="text-[#16516f] italic">Simplified.</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                        From QR-based ordering to powerful inventory management, LeafClutch Technology provides you with the modern tools to run your restaurant like a pro.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <button className="bg-[#16516f] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 group shadow-xl shadow-[#16516f]/10">
                            Get Started Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                            Request Demo
                        </button>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-orange-100 rounded-[2rem] -rotate-2 -z-10"></div>
                    <img
                        src="/landing_hero_restaurant_1768761483087.png"
                        alt="Hero"
                        className="rounded-[2rem] shadow-2xl transition-transform hover:scale-[1.02] duration-500"
                    />
                    <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 max-w-xs animate-bounce-subtle">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">45% Faster Service</p>
                            <p className="text-xs text-slate-500">Verified by local cafes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section id="features" className="bg-slate-50 py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900">Built for modern businesses</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto italic">Everything you need to manage your restaurant in one smart platform.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:border-[#16516f]/20 hover:shadow-xl transition-all group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-white to-slate-100 shadow-sm border border-slate-50">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Big Feature Section */}
            <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="order-2 lg:order-1 relative">
                    <img src="/qr_scanning_hand_1768761497253.png" alt="QR Scanning" className="rounded-3xl shadow-2xl" />
                    <div className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-pulse">
                        <QrCode className="w-12 h-12 text-[#16516f]" />
                    </div>
                </div>
                <div className="order-1 lg:order-2 space-y-8">
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                        We make you look <br />
                        <span className="text-[#16516f] underline decoration-orange-400 underline-offset-8">different.</span>
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        Stand out with a digital experience that wows your guests. Our platform doesn't just manage orders; it elevates your brand's technical identity, making every interaction premium and smooth.
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Real-time order tracking for guests",
                            "Beautiful branded digital menus",
                            "Integrated WhatsApp notifications",
                            "Seamless credit management"
                        ].map(item => (
                            <li key={item} className="flex items-center gap-3 font-semibold text-slate-700">
                                <ShieldCheck className="w-5 h-5 text-[#16516f]" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-[#16516f] text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl lg:text-5xl font-extrabold">Simple & Transparent Pricing</h2>
                        <p className="text-blue-100 italic">Choose a plan that fits your hospitality needs.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pricing.map((p, i) => (
                            <div key={i} className={`p-10 rounded-3xl border flex flex-col ${p.active ? 'bg-white text-slate-900 border-white shadow-2xl scale-105 z-10' : 'bg-[#1a5b7d] border-white/20'}`}>
                                <p className="font-bold text-sm mb-2 uppercase tracking-widest">{p.name}</p>
                                <div className="flex items-end gap-1 mb-8">
                                    <span className="text-4xl font-black">Rs. {p.price}</span>
                                    <span className="text-xs opacity-60 mb-2">/month</span>
                                </div>
                                <div className="space-y-4 flex-1 mb-10">
                                    {p.features.map(feat => (
                                        <div key={feat} className="flex items-center gap-3 text-sm font-medium">
                                            <CheckCircle2 className={`w-4 h-4 ${p.active ? 'text-[#16516f]' : 'text-emerald-400'}`} /> {feat}
                                        </div>
                                    ))}
                                </div>
                                <button className={`w-full py-4 rounded-xl font-bold transition-all ${p.active ? 'bg-[#16516f] text-white hover:bg-[#114058]' : 'bg-white text-[#16516f] hover:bg-slate-100'}`}>
                                    {p.button}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 max-w-3xl mx-auto px-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((f, i) => (
                        <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <button
                                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors"
                            >
                                <span className="font-bold text-slate-800 text-left">{f.q}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                            </button>
                            {activeFaq === i && (
                                <div className="p-6 bg-slate-50 text-slate-600 text-sm leading-relaxed border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                    {f.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-400 to-orange-500 rounded-[3rem] p-12 lg:p-20 text-center space-y-8 shadow-2xl shadow-orange-500/20 text-white">
                    <h2 className="text-4xl lg:text-6xl font-black tracking-tight">Ready to transform your restaurant?</h2>
                    <p className="text-lg text-orange-50 font-medium max-w-2xl mx-auto opacity-90">
                        Join 50+ restaurants who have already switched to LeafClutch Technology. Get your digital menu ready in minutes.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <button className="bg-white text-orange-600 px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-lg">
                            Start Your Free Trial
                        </button>
                        <button className="bg-[#16516f] text-white px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all text-lg flex items-center gap-2">
                            <Smartphone className="w-5 h-5" /> Download App
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-16 text-white border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#16516f] rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">LeafClutch Technology</span>
                        </div>
                        <p className="text-slate-400 max-w-md text-sm leading-relaxed italic">
                            Empowering the hospitality industry with cutting-edge digital solutions. From street food stalls to luxury resorts, LeafClutch is your partner in growth.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-slate-300 uppercase tracking-widest text-xs">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Digital Menu</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">QR Ordering</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-slate-300 uppercase tracking-widest text-xs">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-800 text-center text-slate-500 text-sm">
                    &copy; {new Date().getFullYear()} LeafClutch Technology. All rights reserved. Made for modern hospitality.
                </div>
            </footer>

            {/* Custom Styles for animations */}
            <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default LandingPage;
