import { Home, ShieldCheck, Sparkles, Wrench, type LucideIcon } from "lucide-react";

export interface BlogPost {
  id: string;
  category: string;
  categoryColor: string;
  tagBg: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  icon: LucideIcon;
  bannerGradient: string;
}

export const blogPostsData: BlogPost[] = [
  {
    id: "elegir-taladro-inalambrico",
    category: "Herramientas",
    categoryColor: "#18D6D1",
    tagBg: "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30",
    title: "Cómo elegir tu primer taladro inalámbrico: Guía definitiva",
    excerpt:
      "Descubrí qué potencia, voltaje y tipo de batería necesitás según el uso que le vas a dar en tu hogar o taller, sin pagar de más.",
    date: "15 Sep 2026",
    readTime: "4 min de lectura",
    icon: Wrench,
    bannerGradient: "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent",
  },
  {
    id: "comprar-seguro-online",
    category: "Guía UNO",
    categoryColor: "#FF6A00",
    tagBg: "bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/30",
    title: "5 claves para comprar por internet de forma simple y 100% segura",
    excerpt:
      "Consejos infalibles para proteger tus datos, verificar comercios confiables y seguir tus envíos en tiempo real sin complicaciones.",
    date: "12 Sep 2026",
    readTime: "3 min de lectura",
    icon: ShieldCheck,
    bannerGradient: "from-[#FF6A00]/20 via-[#FF6A00]/5 to-transparent",
  },
  {
    id: "kit-herramientas-esenciales",
    category: "Hogar & Taller",
    categoryColor: "#18D6D1",
    tagBg: "bg-[#18D6D1]/10 text-[#00a6a0] border-[#18D6D1]/30",
    title: "El kit básico de herramientas que no puede faltar en ningún hogar",
    excerpt:
      "Desde destornilladores magnéticos hasta pinzas universales: el equipamiento indispensable para resolver cualquier imprevisto.",
    date: "08 Sep 2026",
    readTime: "5 min de lectura",
    icon: Home,
    bannerGradient: "from-[#18D6D1]/20 via-[#18D6D1]/5 to-transparent",
  },
  {
    id: "tendencias-herramientas-2026",
    category: "Tecnología",
    categoryColor: "#FF6A00",
    tagBg: "bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]/30",
    title: "Herramientas a batería con motor brushless: ¿Por qué valen la pena?",
    excerpt:
      "Analizamos la eficiencia energética, durabilidad y rendimiento de la nueva generación de motores sin escobillas para bricolaje y uso profesional.",
    date: "01 Sep 2026",
    readTime: "6 min de lectura",
    icon: Sparkles,
    bannerGradient: "from-[#FF6A00]/20 via-[#FF6A00]/5 to-transparent",
  },
];
