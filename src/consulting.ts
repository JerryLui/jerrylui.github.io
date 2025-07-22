/// <reference lib="dom" />

interface Translations {
  en: {
    create: string;
    humanFriendly: string;
    interfaces: string;
    description: string;
    scheduleConsultation: string;
    learnMore: string;
    userSatisfaction: string;
    fasterAdoption: string;
    engagementBoost: string;
    whyChooseUs: string;
    humanCenteredDesign: string;
    humanCenteredDesc: string;
    conversationalAI: string;
    conversationalDesc: string;
    inHouseImplementation: string;
    inHouseDesc: string;
  };
  sv: {
    create: string;
    humanFriendly: string;
    interfaces: string;
    description: string;
    scheduleConsultation: string;
    learnMore: string;
    userSatisfaction: string;
    fasterAdoption: string;
    engagementBoost: string;
    whyChooseUs: string;
    humanCenteredDesign: string;
    humanCenteredDesc: string;
    conversationalAI: string;
    conversationalDesc: string;
    inHouseImplementation: string;
    inHouseDesc: string;
  };
}

const translations: Translations = {
  en: {
    create: "Create",
    humanFriendly: "Human-Friendly",
    interfaces: "Interfaces",
    description:
      "We help you implement in-house AI solutions that your customers actually want to use. Transform complex AI capabilities into intuitive, conversational experiences that drive engagement and satisfaction.",
    scheduleConsultation: "Schedule Consultation",
    learnMore: "Learn More",
    userSatisfaction: "User Satisfaction",
    fasterAdoption: "Faster Adoption",
    engagementBoost: "Engagement Boost",
    whyChooseUs: "Why Choose Us?",
    humanCenteredDesign: "Human-Centered Design",
    humanCenteredDesc:
      "We prioritize user experience over technical complexity",
    conversationalAI: "Conversational AI Expertise",
    conversationalDesc:
      "Transform complex data into natural, intuitive interactions",
    inHouseImplementation: "In-House Implementation",
    inHouseDesc: "Build proprietary solutions that grow with your business",
  },
  sv: {
    create: "Skapa",
    humanFriendly: "Människovänliga",
    interfaces: "Gränssnitt",
    description:
      "Vi hjälper dig implementera interna AI-lösningar som dina kunder faktiskt vill använda. Förvandla komplexa AI-funktioner till intuitiva, konversationsbaserade upplevelser som driver engagemang och tillfredsställelse.",
    scheduleConsultation: "Boka Konsultation",
    learnMore: "Läs Mer",
    userSatisfaction: "Användarnöjdhet",
    fasterAdoption: "Snabbare Adoption",
    engagementBoost: "Engagemangsökning",
    whyChooseUs: "Varför Välja Oss?",
    humanCenteredDesign: "Människocentrerad Design",
    humanCenteredDesc:
      "Vi prioriterar användarupplevelse över teknisk komplexitet",
    conversationalAI: "Konversations-AI Expertis",
    conversationalDesc:
      "Förvandla komplex data till naturliga, intuitiva interaktioner",
    inHouseImplementation: "Intern Implementering",
    inHouseDesc: "Bygg proprietära lösningar som växer med ditt företag",
  },
};

type Language = "en" | "sv";

class ConsultingPage {
  private currentLanguage: Language = "en";

  constructor() {
    this.init();
  }

  private init(): void {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem("consulting-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "sv")) {
      this.currentLanguage = savedLang;
    }

    this.setupEventListeners();
    this.updateContent();
  }

  private setupEventListeners(): void {
    // Language toggle button
    const langToggle = document.getElementById("language-toggle");
    if (langToggle) {
      langToggle.addEventListener("click", () => this.toggleLanguage());
    }

    // CTA button hover effects
    const ctaButtons = document.querySelectorAll(".cta-button");
    ctaButtons.forEach((button) => {
      button.addEventListener("mouseenter", this.handleButtonHover);
      button.addEventListener("mouseleave", this.handleButtonLeave);
    });
  }

  private toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === "en" ? "sv" : "en";
    localStorage.setItem("consulting-language", this.currentLanguage);
    this.updateContent();
  }

  private updateContent(): void {
    const t = translations[this.currentLanguage];

    // Update language toggle button
    const langToggle = document.getElementById("language-toggle");
    if (langToggle) {
      const flag = this.currentLanguage === "en" ? "🇸🇪" : "🇺🇸";
      const label = this.currentLanguage === "en" ? "Svenska" : "English";
      langToggle.innerHTML = `
        <span class="text-lg">${flag}</span>
        <span class="text-sm font-medium text-gray-300">${label}</span>
      `;
    }

    // Update main content
    this.updateElement("title-create", t.create);
    this.updateElement("title-human-friendly", t.humanFriendly);
    this.updateElement("title-interfaces", t.interfaces);
    this.updateElement("description", t.description);
    this.updateElement("schedule-btn", t.scheduleConsultation);
    this.updateElement("learn-more-btn", t.learnMore);

    // Update stats
    this.updateElement("stat-satisfaction", t.userSatisfaction);
    this.updateElement("stat-adoption", t.fasterAdoption);
    this.updateElement("stat-engagement", t.engagementBoost);

    // Update feature section
    this.updateElement("why-choose-title", t.whyChooseUs);
    this.updateElement("feature-1-title", t.humanCenteredDesign);
    this.updateElement("feature-1-desc", t.humanCenteredDesc);
    this.updateElement("feature-2-title", t.conversationalAI);
    this.updateElement("feature-2-desc", t.conversationalDesc);
    this.updateElement("feature-3-title", t.inHouseImplementation);
    this.updateElement("feature-3-desc", t.inHouseDesc);
  }

  private updateElement(id: string, text: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  private handleButtonHover = (event: Event): void => {
    const button = event.target as HTMLElement;
    const arrow = button.querySelector(".arrow-icon");
    if (arrow) {
      arrow.classList.add("translate-x-1");
    }
  };

  private handleButtonLeave = (event: Event): void => {
    const button = event.target as HTMLElement;
    const arrow = button.querySelector(".arrow-icon");
    if (arrow) {
      arrow.classList.remove("translate-x-1");
    }
  };
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ConsultingPage();
});
