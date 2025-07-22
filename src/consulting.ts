/// <reference lib="dom" />

interface TranslationStrings {
  create: string;
  humanFriendly: string;
  interfaces: string;
  description: string;
  scheduleConsultation: string;
  learnMore: string;
  advertMetricSatisfaction: string;
  advertMetricAdoption: string;
  advertMetricEngagement: string;
  featureWhyJerry: string;
  featureHumanCentered: string;
  featureHumanCenteredDesc: string;
  featureConversationalAI: string;
  featureConversationalDesc: string;
  featureInHouseImplementation: string;
  featureInHouseDesc: string;
}

type Translations = Record<"en" | "sv", TranslationStrings>;

const translations: Translations = {
  en: {
    create: "Create",
    humanFriendly: "Human-Friendly",
    interfaces: "Interfaces",
    description:
      "I help you implement AI solutions with actual use cases. Transform complex workflows into intuitive, conversational experiences.",
    scheduleConsultation: "Schedule Consultation",
    learnMore: "Case Studies",
    advertMetricSatisfaction: "Satisfaction Guarantee",
    advertMetricAdoption: "Lower Operating Costs",
    advertMetricEngagement: "More Efficient Workflows",
    featureWhyJerry: "Why",
    featureHumanCentered: "User-Centered Design",
    featureHumanCenteredDesc:
      "Modular and adaptable solutions that grow with your business",
    featureConversationalAI: "Expertise",
    featureConversationalDesc:
      "5+ years of work experience with AI solutions for complex problems",
    featureInHouseImplementation: "Customized",
    featureInHouseDesc:
      "Find the right solution for your specific company in terms of price and timeline",
  },
  sv: {
    create: "Skapa",
    humanFriendly: "Människovänliga",
    interfaces: "Gränssnitt",
    description:
      "Jag hjälper dig implementera AI-lösningar som med faktiska användningsområden. Förvandla komplexa arbetsflöden till intuitiva, konversationsbaserade upplevelser.",
    scheduleConsultation: "Boka Konsultation",
    learnMore: "Case Studies",
    advertMetricSatisfaction: "Nöjdhetsgaranti",
    advertMetricAdoption: "Lägre Driftkostnader",
    advertMetricEngagement: "Effektivare Arbetsflöden",
    featureWhyJerry: "Varför",
    featureHumanCentered: "Uvecklar-centrerad Design",
    featureHumanCenteredDesc:
      "Modulära och anpassningsbara lösningar som växer med ditt företag",
    featureConversationalAI: "Expertis",
    featureConversationalDesc:
      "5+ års arbetserfarenhet av AI-lösningar för komplexa problem",
    featureInHouseImplementation: "Anpassad",
    featureInHouseDesc:
      "Hitta rätt lösning för just ditt företag i pris och tid",
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

    // Mouse tracking for gradient effect
    document.addEventListener("mousemove", this.handleMouseMove);
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
    this.updateElement("stat-satisfaction", t.advertMetricSatisfaction);
    this.updateElement("stat-adoption", t.advertMetricAdoption);
    this.updateElement("stat-engagement", t.advertMetricEngagement);

    // Update feature section
    this.updateElement("why-choose-title", t.featureWhyJerry);
    this.updateElement("feature-1-title", t.featureHumanCentered);
    this.updateElement("feature-1-desc", t.featureHumanCenteredDesc);
    this.updateElement("feature-2-title", t.featureConversationalAI);
    this.updateElement("feature-2-desc", t.featureConversationalDesc);
    this.updateElement("feature-3-title", t.featureInHouseImplementation);
    this.updateElement("feature-3-desc", t.featureInHouseDesc);
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

  private handleMouseMove = (event: MouseEvent): void => {
    const { clientX, clientY } = event;

    // Use the hero section as the reference container for better responsiveness
    const heroSection = document.querySelector(".hero-grid") as HTMLElement;
    if (!heroSection) return;

    const rect = heroSection.getBoundingClientRect();

    // Normalize mouse position to 0-1 range relative to the hero section
    const mouseX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const mouseY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    // Calculate distance to consultation button for color control
    const consultationButton = document.querySelector(
      ".cta-button"
    ) as HTMLElement;

    // Base colors: yellow (60°) to coral (16°) - flipped left to right
    const coralHue = 16;
    const yellowHue = 60;
    let baseHue = yellowHue - mouseX * (yellowHue - coralHue); // Interpolate from yellow to coral
    let brightness = 65; // Default lightness
    let saturation = 100; // High saturation for vibrant colors

    if (consultationButton) {
      const buttonRect = consultationButton.getBoundingClientRect();
      const heroRect = heroSection.getBoundingClientRect();

      // Get button center relative to hero section
      const buttonCenterX =
        (buttonRect.left + buttonRect.width / 2 - heroRect.left) /
        heroRect.width;
      const buttonCenterY =
        (buttonRect.top + buttonRect.height / 2 - heroRect.top) /
        heroRect.height;

      // Calculate distance from mouse to button center
      const distanceX = mouseX - buttonCenterX;
      const distanceY = mouseY - buttonCenterY;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Normalize distance (closer = lower value)
      const normalizedDistance = Math.min(distance / 1.4, 1);

      // Make it brighter when closer to button
      brightness = 60 + (1 - normalizedDistance) * 25; // Range: 60-85%
      saturation = 90 + (1 - normalizedDistance) * 10; // Range: 90-100%
    }

    // Calculate final hue values - keep yellow to coral range
    const startHue = baseHue;
    const endHue = Math.max(coralHue, baseHue - 20); // Don't go below coral

    // Create HSL colors matching coral to yellow theme
    const startColor = `hsl(${startHue}, ${saturation}%, ${brightness}%)`;
    const endColor = `hsl(${endHue}, ${saturation}%, ${brightness}%)`;

    // Update the gradient text element
    const gradientElement = document.querySelector(
      ".gradient-text"
    ) as HTMLElement;
    if (gradientElement) {
      gradientElement.style.background = `linear-gradient(to bottom left, ${startColor}, ${endColor})`;
      gradientElement.style.backgroundClip = "text";
      gradientElement.style.webkitBackgroundClip = "text";
      gradientElement.style.color = "transparent";
    }
  };
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ConsultingPage();
});
