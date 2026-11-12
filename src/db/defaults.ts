export interface DefaultContentSeed {
  key: string;
  value: string;
  type: "text" | "textarea" | "image" | "url" | "color";
  label: string;
  section: string;
}

export const DEFAULT_SITE_CONTENT: DefaultContentSeed[] = [
  // Theme & Global Identity
  { key: "theme.primaryColor", value: "#eb2d4a", type: "color", label: "Brand Primary Accent Color", section: "settings" },
  { key: "site.name", value: "Mek Engineering Corporation", type: "text", label: "Company Legal Name", section: "global" },
  { key: "site.shortName", value: "MEK ENGINEERING", type: "text", label: "Header & Footer Logo Title", section: "global" },
  { key: "site.established", value: "Since 1968", type: "text", label: "Header Tagline / Established Year", section: "global" },
  { key: "site.logoUrl", value: "", type: "image", label: "Optional Logo Image (leave blank for bold wordmark)", section: "global" },
  { key: "site.url", value: "https://mekengg.com", type: "url", label: "Canonical Production URL", section: "settings" },

  // Header Navigation Labels
  { key: "nav.home", value: "Home", type: "text", label: "Nav Link: Home", section: "global" },
  { key: "nav.products", value: "Products", type: "text", label: "Nav Link: Products", section: "global" },
  { key: "nav.categories", value: "Categories", type: "text", label: "Nav Link: Categories", section: "global" },
  { key: "nav.subcategories", value: "Subcategories", type: "text", label: "Nav Link: Subcategories", section: "global" },
  { key: "nav.brands", value: "Brands", type: "text", label: "Nav Link: Brands", section: "global" },
  { key: "nav.about", value: "About", type: "text", label: "Nav Link: About", section: "global" },
  { key: "nav.contact", value: "Contact", type: "text", label: "Nav Link: Contact", section: "global" },
  { key: "nav.ctaButton", value: "Get Quote", type: "text", label: "Header Primary CTA Text", section: "global" },

  // Footer Content
  {
    key: "footer.description",
    value: "Serving workshops, contractors, and industrial buyers since 1968 from Victoria Ranigunj, Secunderabad. Wholesale and B2B supplier of power tools, precision measuring instruments, garden tools, and industrial equipment.",
    type: "textarea",
    label: "Footer Brand Description",
    section: "global",
  },
  { key: "footer.quickLinksHeading", value: "Quick Links", type: "text", label: "Footer Column 1 Heading", section: "global" },
  { key: "footer.categoriesHeading", value: "Top Categories", type: "text", label: "Footer Column 2 Heading", section: "global" },
  { key: "footer.contactHeading", value: "Contact Us", type: "text", label: "Footer Column 3 Heading", section: "global" },
  { key: "footer.viewAllCategories", value: "View All Categories", type: "text", label: "Footer View All Categories Link", section: "global" },
  { key: "footer.copyright", value: "© 2026 Mek Engineering Corporation. All rights reserved.", type: "text", label: "Footer Copyright Notice", section: "global" },
  { key: "footer.creditPrefix", value: "Wholesale Industrial Supply •", type: "text", label: "Footer Right Tagline Prefix", section: "global" },
  { key: "footer.creditHighlight", value: "Secunderabad, India", type: "text", label: "Footer Right Tagline Highlight", section: "global" },
  { key: "social.facebook", value: "", type: "url", label: "Facebook URL (leave blank to hide)", section: "global" },
  { key: "social.twitter", value: "", type: "url", label: "Twitter / X URL (leave blank to hide)", section: "global" },
  { key: "social.instagram", value: "", type: "url", label: "Instagram URL (leave blank to hide)", section: "global" },
  { key: "social.linkedin", value: "", type: "url", label: "LinkedIn URL (leave blank to hide)", section: "global" },
  { key: "social.whatsapp", value: "919391079492", type: "text", label: "WhatsApp Number (digits with country code)", section: "global" },

  // Contact Details (shared across Footer, Contact Page & Product Quote Cards)
  {
    key: "contact.addressLine1",
    value: "5-1-458, Victoria Ranigunj, Bolaram Nagar,",
    type: "text",
    label: "Address Line 1",
    section: "contact",
  },
  {
    key: "contact.addressLine2",
    value: "Rani Gunj, Secunderabad, Telangana - 500003",
    type: "text",
    label: "Address Line 2",
    section: "contact",
  },
  { key: "contact.phone", value: "+91 93910 79492", type: "text", label: "Primary Phone Number", section: "contact" },
  { key: "contact.phoneAvailability", value: "Monday – Saturday (Business Hours)", type: "text", label: "Phone Availability Subtext", section: "contact" },
  { key: "contact.email", value: "info@mekengg.com", type: "text", label: "Official Email Address", section: "contact" },
  { key: "contact.emailResponse", value: "For wholesale inquiries & quotations", type: "text", label: "Email Card Subtext", section: "contact" },
  {
    key: "contact.mapEmbedUrl",
    value: "https://www.google.com/maps?q=Ranigunj,Secunderabad,Telangana+500003&output=embed",
    type: "url",
    label: "Google Maps Embed URL",
    section: "contact",
  },

  // Home Page - Categories Section
  { key: "home.categories.badge", value: "Our Catalog", type: "text", label: "Home Categories Eyebrow Badge", section: "home" },
  { key: "home.categories.heading", value: "Shop by Category", type: "text", label: "Home Categories Heading", section: "home" },
  { key: "home.categories.description", value: "Explore cordless and corded power tools, rotary hammers, grinders, woodworking machines, outdoor garden equipment, and precision measuring instruments.", type: "textarea", label: "Home Categories Description", section: "home" },
  { key: "home.categories.cta", value: "View All Categories", type: "text", label: "Home Categories Link Text", section: "home" },

  // Home Page - Subcategories Strip
  { key: "home.subcategories.badge", value: "Specialized Segments", type: "text", label: "Home Subcategories Badge", section: "home" },
  { key: "home.subcategories.heading", value: "Browse by Subcategory", type: "text", label: "Home Subcategories Heading", section: "home" },
  { key: "home.subcategories.description", value: "Locate the exact industrial tool class for your requirement - from cordless impact drivers and angle grinders to laser rangefinders and brushcutters.", type: "textarea", label: "Home Subcategories Description", section: "home" },
  { key: "home.subcategories.cta", value: "Explore All Subcategories", type: "text", label: "Home Subcategories CTA", section: "home" },

  // Home Page - Featured Products Section
  { key: "home.featured.badge", value: "Featured Catalog", type: "text", label: "Home Featured Products Badge", section: "home" },
  { key: "home.featured.heading", value: "Featured Equipment", type: "text", label: "Home Featured Products Heading", section: "home" },
  { key: "home.featured.description", value: "Selected professional power tools, measuring instruments, and workshop machines for contractors, fabricators, and industrial buyers.", type: "textarea", label: "Home Featured Products Description", section: "home" },
  { key: "home.featured.cta", value: "View Full Catalog", type: "text", label: "Home Featured Products CTA", section: "home" },

  // Home Page - Brands Section
  { key: "home.brands.badge", value: "Industrial Brands", type: "text", label: "Home Brands Eyebrow Badge", section: "home" },
  { key: "home.brands.heading", value: "Authorized Manufacturers", type: "text", label: "Home Brands Heading", section: "home" },
  { key: "home.brands.cta", value: "See All Brands", type: "text", label: "Home Brands CTA", section: "home" },

  // Home Page - Legacy / Pillars Section
  { key: "home.legacy.bgImage", value: "/images/carousel/store-interior.png", type: "image", label: "Home Legacy Background Image", section: "home" },
  { key: "home.legacy.badge", value: "Since 1968", type: "text", label: "Home Legacy Badge", section: "home" },
  { key: "home.legacy.headingLine1", value: "Mek Engineering", type: "text", label: "Home Legacy Heading Line 1", section: "home" },
  { key: "home.legacy.headingLine2", value: "Corporation", type: "text", label: "Home Legacy Heading Line 2", section: "home" },
  {
    key: "home.legacy.paragraph",
    value: "Since 1968, Mek Engineering Corporation has served workshops, contractors, and industrial buyers from Victoria Ranigunj, Secunderabad with genuine tools, machinery, and reliable wholesale supply.",
    type: "textarea",
    label: "Home Legacy Paragraph",
    section: "home",
  },
  { key: "home.legacy.ctaPrimary", value: "Our Legacy", type: "text", label: "Home Legacy Primary CTA", section: "home" },
  { key: "home.legacy.ctaSecondary", value: "Request Bulk Quote", type: "text", label: "Home Legacy Secondary CTA", section: "home" },
  { key: "home.legacy.stat1Value", value: "1968", type: "text", label: "Legacy Pillar 1 Value", section: "home" },
  { key: "home.legacy.stat1Label", value: "Established in Secunderabad", type: "text", label: "Legacy Pillar 1 Label", section: "home" },
  { key: "home.legacy.stat2Value", value: "GST", type: "text", label: "Legacy Pillar 2 Value", section: "home" },
  { key: "home.legacy.stat2Label", value: "Wholesale & B2B Billing", type: "text", label: "Legacy Pillar 2 Label", section: "home" },
  { key: "home.legacy.stat3Value", value: "Genuine", type: "text", label: "Legacy Pillar 3 Value", section: "home" },
  { key: "home.legacy.stat3Label", value: "Authorized Brand Supply", type: "text", label: "Legacy Pillar 3 Label", section: "home" },

  // Home Page - Bottom CTA Strip
  { key: "home.cta.badge", value: "Wholesale & Institutional Procurement", type: "text", label: "Home Bottom CTA Badge", section: "home" },
  { key: "home.cta.heading", value: "Need Bulk Pricing or Custom Industrial Sourcing?", type: "text", label: "Home Bottom CTA Heading", section: "home" },
  { key: "home.cta.paragraph", value: "Connect directly with our sales desk at Victoria Ranigunj, Secunderabad for GST wholesale invoicing, industrial toolkits, and OEM spare inquiries.", type: "textarea", label: "Home Bottom CTA Paragraph", section: "home" },
  { key: "home.cta.button", value: "Contact Our Sales Desk", type: "text", label: "Home Bottom CTA Button", section: "home" },

  // Products Listing Page (/products)
  { key: "products.hero.badge", value: "Industrial Catalog", type: "text", label: "Products Page Badge", section: "products" },
  { key: "products.hero.heading", value: "All Industrial Products", type: "text", label: "Products Page Main Heading", section: "products" },
  { key: "products.hero.paragraph", value: "Explore our catalog of cordless and corded power tools, rotary hammers, grinders, woodworking machines, garden equipment, and precision measuring instruments.", type: "textarea", label: "Products Page Subtitle Paragraph", section: "products" },
  { key: "products.filters.heading", value: "Filter Catalog", type: "text", label: "Products Filter Sidebar Title", section: "products" },
  { key: "products.empty.heading", value: "No Matching Equipment Found", type: "text", label: "Products Empty State Heading", section: "products" },
  { key: "products.empty.paragraph", value: "Try clearing one or more filters or contact our sales desk with the model or part number you are looking for.", type: "textarea", label: "Products Empty State Paragraph", section: "products" },

  // Product Detail Page (/products/[id])
  { key: "productDetail.specsHeading", value: "Technical Specifications", type: "text", label: "Product Detail Specs Heading", section: "products" },
  { key: "productDetail.featuresHeading", value: "Key Industrial Highlights", type: "text", label: "Product Detail Highlights Heading", section: "products" },
  { key: "productDetail.descriptionHeading", value: "Detailed Overview", type: "text", label: "Product Detail Description Heading", section: "products" },
  { key: "productDetail.quoteCta", value: "Request Wholesale Quote", type: "text", label: "Product Detail Quote Button", section: "products" },
  { key: "productDetail.whatsappCta", value: "Inquire on WhatsApp", type: "text", label: "Product Detail WhatsApp Button", section: "products" },
  { key: "productDetail.assuranceTitle", value: "Genuine Authorized Supply", type: "text", label: "Product Detail Assurance Title", section: "products" },
  { key: "productDetail.assuranceText", value: "Supplied with official manufacturer warranty and GST tax invoice from Mek Engineering Corporation.", type: "textarea", label: "Product Detail Assurance Paragraph", section: "products" },
  { key: "productDetail.relatedHeading", value: "Related Industrial Equipment", type: "text", label: "Product Detail Related Heading", section: "products" },

  // Categories Page (/categories & /categories/[id])
  { key: "categories.hero.badge", value: "Our Catalog", type: "text", label: "Categories Page Badge", section: "categories" },
  { key: "categories.hero.heading", value: "Product Categories", type: "text", label: "Categories Page Heading", section: "categories" },
  { key: "categories.hero.paragraph", value: "Browse our range of professional power tools, measuring instruments, outdoor equipment, and accessories organized by department.", type: "textarea", label: "Categories Page Subtitle", section: "categories" },
  { key: "categoryDetail.subcategoriesHeading", value: "Subcategories in This Department", type: "text", label: "Category Detail Subcategories Heading", section: "categories" },
  { key: "categoryDetail.productsHeading", value: "Available Equipment & Tools", type: "text", label: "Category Detail Products Heading", section: "categories" },

  // Subcategories Page (/subcategories & /subcategories/[id])
  { key: "subcategories.hero.badge", value: "Product Classification", type: "text", label: "Subcategories Page Badge", section: "subcategories" },
  { key: "subcategories.hero.heading", value: "All Product Subcategories", type: "text", label: "Subcategories Page Heading", section: "subcategories" },
  { key: "subcategories.hero.paragraph", value: "Filter specialized industrial tool classes across cordless tools, drills, grinders, hammers, saws, garden tools, and digital measuring instruments.", type: "textarea", label: "Subcategories Page Paragraph", section: "subcategories" },
  { key: "subcategoryDetail.productsHeading", value: "Equipment in This Subcategory", type: "text", label: "Subcategory Detail Products Heading", section: "subcategories" },

  // Brands Page (/brands & /brands/[id])
  { key: "brands.hero.badge", value: "Authorized Dealer", type: "text", label: "Brands Page Badge", section: "brands" },
  { key: "brands.hero.heading", value: "Industrial Brands", type: "text", label: "Brands Page Heading", section: "brands" },
  { key: "brands.hero.paragraph", value: "We supply genuine power tools, hand tools, and measuring instruments from recognized industrial manufacturers.", type: "textarea", label: "Brands Page Paragraph", section: "brands" },
  { key: "brands.pillar1.title", value: "Genuine Products", type: "text", label: "Brands Pillar 1 Title", section: "brands" },
  { key: "brands.pillar1.text", value: "Authentic factory-sealed power tools, hand tools, and measuring instruments from recognized industrial manufacturers.", type: "textarea", label: "Brands Pillar 1 Text", section: "brands" },
  { key: "brands.pillar2.title", value: "Manufacturer Warranty", type: "text", label: "Brands Pillar 2 Title", section: "brands" },
  { key: "brands.pillar2.text", value: "Official manufacturer warranty and proper GST tax invoicing on wholesale and retail purchases.", type: "textarea", label: "Brands Pillar 2 Text", section: "brands" },
  { key: "brands.pillar3.title", value: "Wholesale Quotations", type: "text", label: "Brands Pillar 3 Title", section: "brands" },
  { key: "brands.pillar3.text", value: "Dedicated B2B pricing and sourcing assistance from our showroom in Victoria Ranigunj, Secunderabad.", type: "textarea", label: "Brands Pillar 3 Text", section: "brands" },
  { key: "brandDetail.productsHeading", value: "Official Brand Catalog", type: "text", label: "Brand Detail Products Heading", section: "brands" },

  // About Page (/about)
  { key: "about.hero.bgImage", value: "/images/carousel/bosch-store.png", type: "image", label: "About Hero Background Image", section: "about" },
  { key: "about.hero.badge", value: "Since 1968", type: "text", label: "About Hero Badge", section: "about" },
  { key: "about.hero.heading", value: "Serving Industry Since 1968", type: "text", label: "About Hero Heading", section: "about" },
  { key: "about.hero.paragraph", value: "For over five decades, Mek Engineering Corporation has supplied workshops, contractors, and industrial buyers from Victoria Ranigunj, Secunderabad.", type: "textarea", label: "About Hero Paragraph", section: "about" },
  { key: "about.stat1.value", value: "1968", type: "text", label: "About Pillar 1 Value", section: "about" },
  { key: "about.stat1.label", value: "Year Established", type: "text", label: "About Pillar 1 Label", section: "about" },
  { key: "about.stat2.value", value: "B2B & Retail", type: "text", label: "About Pillar 2 Value", section: "about" },
  { key: "about.stat2.label", value: "Industrial Supply", type: "text", label: "About Pillar 2 Label", section: "about" },
  { key: "about.stat3.value", value: "GST", type: "text", label: "About Pillar 3 Value", section: "about" },
  { key: "about.stat3.label", value: "Tax Invoicing", type: "text", label: "About Pillar 3 Label", section: "about" },
  { key: "about.stat4.value", value: "Ranigunj", type: "text", label: "About Pillar 4 Value", section: "about" },
  { key: "about.stat4.label", value: "Secunderabad Showroom", type: "text", label: "About Pillar 4 Label", section: "about" },
  { key: "about.story.badge", value: "Who We Are", type: "text", label: "About Story Eyebrow", section: "about" },
  { key: "about.story.heading", value: "Our Legacy", type: "text", label: "About Story Heading", section: "about" },
  {
    key: "about.story.paragraph1",
    value: "We are a Sole Proprietorship firm engaged as a wholesale and B2B trader of Power Tools, Hand Tools, Tool Kits, Saw Blades, Electric Drills, Angle Grinders, Precision Measuring Instruments, and Industrial Equipment.",
    type: "textarea",
    label: "About Story Paragraph 1",
    section: "about",
  },
  {
    key: "about.story.paragraph2",
    value: "Operating from Victoria Ranigunj, Secunderabad since 1968, we focus on supplying genuine products, transparent wholesale quotations, and dependable service to workshops, contractors, and industrial buyers.",
    type: "textarea",
    label: "About Story Paragraph 2",
    section: "about",
  },
  {
    key: "about.story.quote",
    value: "\"Under the direction of Zoeb Bootwala (Manager), we have built a trusted reputation in the industrial hardware trade through straightforward dealing and genuine supply.\"",
    type: "textarea",
    label: "About Leadership Quote",
    section: "about",
  },
  { key: "about.story.image1", value: "/images/carousel/store-interior.png", type: "image", label: "About Showcase Image 1", section: "about" },
  { key: "about.story.image2", value: "/images/carousel/dewalt-site.png", type: "image", label: "About Showcase Image 2", section: "about" },
  { key: "about.why.heading", value: "Why Buyers Work With Us", type: "text", label: "About Why Choose Us Heading", section: "about" },
  { key: "about.why.subtitle", value: "Practical industrial sourcing backed by decades of showroom experience in Secunderabad.", type: "textarea", label: "About Why Choose Us Subtitle", section: "about" },
  { key: "about.why.card1Title", value: "Genuine Brand Supply", type: "text", label: "About Card 1 Title", section: "about" },
  { key: "about.why.card1Text", value: "Authorized industrial supplier offering genuine tools and equipment from recognized manufacturers.", type: "textarea", label: "About Card 1 Paragraph", section: "about" },
  { key: "about.why.card2Title", value: "Practical Tool Guidance", type: "text", label: "About Card 2 Title", section: "about" },
  { key: "about.why.card2Text", value: "Our experienced showroom team helps you match the right power tools, instruments, and accessories to your application.", type: "textarea", label: "About Card 2 Paragraph", section: "about" },
  { key: "about.why.card3Title", value: "Wholesale & B2B Sourcing", type: "text", label: "About Card 3 Title", section: "about" },
  { key: "about.why.card3Text", value: "Serving workshops, contractors, and industrial buyers from Victoria Ranigunj, Secunderabad with transparent quotations and GST billing.", type: "textarea", label: "About Card 3 Paragraph", section: "about" },

  // Contact Page (/contact)
  { key: "contact.hero.badge", value: "Support & Wholesale Sales", type: "text", label: "Contact Page Badge", section: "contact" },
  { key: "contact.hero.heading", value: "Get in Touch", type: "text", label: "Contact Page Heading", section: "contact" },
  { key: "contact.hero.paragraph", value: "Have a question about our industrial catalog, need a bulk GST quotation, or looking for a specific model? Reach out to our sales desk.", type: "textarea", label: "Contact Page Subtitle", section: "contact" },
  { key: "contact.details.heading", value: "Contact Details", type: "text", label: "Contact Details Column Heading", section: "contact" },
  { key: "contact.location.label", value: "Showroom Address", type: "text", label: "Contact Location Card Heading", section: "contact" },
  { key: "contact.phone.label", value: "Sales Desk Phone", type: "text", label: "Contact Phone Card Heading", section: "contact" },
  { key: "contact.email.label", value: "Email Desk", type: "text", label: "Contact Email Card Heading", section: "contact" },
  { key: "contact.form.heading", value: "Send Us a Message", type: "text", label: "Contact Form Heading", section: "contact" },
  { key: "contact.form.paragraph", value: "Fill out the inquiry form below and our sales team will get back to you via email or phone.", type: "textarea", label: "Contact Form Description", section: "contact" },
  { key: "contact.form.submitText", value: "Send Inquiry", type: "text", label: "Contact Form Submit Button", section: "contact" },
];

export const DEFAULT_PAGE_SEO = [
  {
    route: "/",
    title: "Mek Engineering Corporation | Power Tools & Industrial Equipment Since 1968",
    description:
      "Established in 1968 at Victoria Ranigunj, Secunderabad, Mek Engineering Corporation supplies wholesale Power Tools, Hand Tools, Precision Measuring Instruments, Garden Tools, and Industrial Equipment.",
    keywords:
      "Mek Engineering Corporation, Power Tools Secunderabad, Industrial Tools Hyderabad, Bosch Dealer Secunderabad, DeWalt Tools, Taparia Wholesale, Ranigunj Hardware Tools",
    ogTitle: "Mek Engineering Corporation | Industrial Supply Since 1968",
    ogDescription: "Wholesale supplier of Bosch, DeWalt, Taparia, CZAR Power Pro, TEZ, and Makita tools in Secunderabad.",
    ogImage: "/images/carousel/store-interior.png",
  },
  {
    route: "/products",
    title: "All Industrial Products | Power Tools, Measuring & Garden Tools | Mek Engineering",
    description:
      "Browse our catalog of Bosch Professional cordless tools, drills, grinders, rotary hammers, woodworking machines, garden equipment, and measuring instruments. Request a quote for final wholesale pricing.",
    keywords: "Bosch Power Tools, Cordless Drills, Angle Grinders, Rotary Hammers, Laser Rangefinders, Secunderabad Wholesale Tools, Mek Engineering",
    ogTitle: "Industrial Equipment Catalog | Mek Engineering Corporation",
    ogDescription: "Explore genuine power tools, measuring instruments, and outdoor equipment. Request wholesale quotes online.",
    ogImage: "/images/carousel/bosch-store.png",
  },
  {
    route: "/categories",
    title: "Product Categories | Power Tools, Measuring & Outdoor Equipment | Mek Engineering",
    description:
      "Explore industrial tool categories at Mek Engineering Corporation: Cordless Tools, Drills, Angle Grinders, Rotary & Demolition Hammers, Saws, Pro Garden Tools, and Measuring Instruments.",
    keywords: "Cordless Power Tools, Angle Grinders, Rotary Hammers, Woodworking Tools, Laser Rangefinders, Garden Tools",
    ogTitle: "Industrial Tool Categories | Mek Engineering Corporation",
    ogDescription: "Browse professional power tools and industrial equipment organized by category.",
    ogImage: "/images/carousel/store-interior.png",
  },
  {
    route: "/subcategories",
    title: "Product Subcategories | Specialized Industrial Tools | Mek Engineering",
    description:
      "Browse specialized industrial tool subcategories across cordless impact drivers, SDS-plus hammers, angle grinders, circular saws, brushcutters, laser rangefinders, and optical levels.",
    keywords: "Impact Drivers, SDS Plus Rotary Hammer, Angle Grinder, Brushcutter, Laser Rangefinder, Line Laser",
    ogTitle: "Specialized Tool Subcategories | Mek Engineering Corporation",
    ogDescription: "Detailed classification of professional power tools, garden equipment, and measuring instruments.",
    ogImage: "/images/carousel/dewalt-site.png",
  },
  {
    route: "/brands",
    title: "Industrial Brands | Bosch, DeWalt, Taparia, CZAR, TEZ, Makita | Mek Engineering",
    description:
      "Authorized industrial supplier for Bosch, DeWalt, Taparia, CZAR Power Pro, TEZ, and Makita in Secunderabad with official manufacturer warranty and GST billing.",
    keywords: "Bosch Dealer Secunderabad, DeWalt Tools, Taparia Hand Tools, CZAR Power Pro, TEZ Tools, Makita",
    ogTitle: "Authorized Industrial Brands | Mek Engineering Corporation",
    ogDescription: "Genuine power tools, hand tools, and measuring equipment from leading manufacturers.",
    ogImage: "/images/carousel/bosch-store.png",
  },
  {
    route: "/about",
    title: "About Us | Serving Industry Since 1968 | Mek Engineering Corporation",
    description:
      "Learn about Mek Engineering Corporation, established in 1968 in Victoria Ranigunj, Secunderabad under the management of Zoeb Bootwala.",
    keywords: "About Mek Engineering, Zoeb Bootwala, Industrial Wholesale Secunderabad Since 1968",
    ogTitle: "About Mek Engineering Corporation | Since 1968",
    ogDescription: "Wholesale supplier of industrial tools and equipment in Victoria Ranigunj, Secunderabad since 1968.",
    ogImage: "/images/carousel/store-interior.png",
  },
  {
    route: "/contact",
    title: "Contact Us & Request Wholesale Quote | Mek Engineering Corporation",
    description:
      "Visit Mek Engineering Corporation at 5-1-458, Victoria Ranigunj, Secunderabad - 500003 or call +91 93910 79492 for wholesale industrial tool quotations.",
    keywords: "Contact Mek Engineering, Ranigunj Secunderabad Tools Shop, Request Wholesale Quote",
    ogTitle: "Contact Mek Engineering Corporation | Sales & Quotes",
    ogDescription: "Reach our Victoria Ranigunj, Secunderabad showroom for product availability and wholesale quotes.",
    ogImage: "/images/carousel/store-interior.png",
  },
];

export const DEFAULT_HERO_SLIDES = [
  {
    badge: "Authorized Industrial Supply",
    titlePart1: "AUTHORIZED",
    titleHighlight: "BOSCH",
    titlePart2: "DEALER",
    subtitle: "Power Tools, Measuring Instruments & Pro Garden Equipment",
    primaryCtaText: "View Catalog",
    primaryCtaHref: "/products",
    secondaryCtaText: "Request Quote",
    secondaryCtaHref: "/contact",
    imageUrl: "/images/carousel/bosch-store.png",
    sortOrder: 1,
    isActive: true,
  },
  {
    badge: "Industrial Power Tools",
    titlePart1: "",
    titleHighlight: "DEWALT",
    titlePart2: "INDUSTRIAL",
    subtitle: "Heavy-Duty Cordless & Corded Equipment for Demanding Jobsites",
    primaryCtaText: "View Catalog",
    primaryCtaHref: "/products",
    secondaryCtaText: "Request Quote",
    secondaryCtaHref: "/contact",
    imageUrl: "/images/carousel/dewalt-site.png",
    sortOrder: 2,
    isActive: true,
  },
  {
    badge: "Serving Industry Since 1968",
    titlePart1: "MEK",
    titleHighlight: "ENGINEERING",
    titlePart2: "CORP.",
    subtitle: "Wholesale Industrial Tools & Machinery • Victoria Ranigunj, Secunderabad",
    primaryCtaText: "View Catalog",
    primaryCtaHref: "/products",
    secondaryCtaText: "Contact Us",
    secondaryCtaHref: "/contact",
    imageUrl: "/images/carousel/store-interior.png",
    sortOrder: 3,
    isActive: true,
  },
];

export const DEFAULT_BRANDS = [
  {
    name: "Bosch",
    slug: "bosch",
    tagline: "Professional Power Tools, Measuring & Garden Equipment",
    description:
      "Authorized dealer for Bosch Professional cordless tools, drills, angle grinders, rotary and demolition hammers, woodworking machines, outdoor garden tools, and digital measuring instruments.",
    websiteUrl: "https://www.bosch-pt.co.in",
    authorizedSince: "",
    rating: 5,
    featured: true,
    sortOrder: 1,
  },
  {
    name: "DeWalt",
    slug: "dewalt",
    tagline: "Heavy-Duty Cordless & Jobsite Power Tools",
    description:
      "Supplier of DeWalt industrial power tools, XR brushless cordless equipment, miter saws, angle grinders, and jobsite tool systems.",
    websiteUrl: "https://www.in.dewalt.global",
    authorizedSince: "",
    rating: 5,
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Taparia",
    slug: "taparia",
    tagline: "Forged Industrial Hand Tools",
    description:
      "Wholesale supplier of Taparia chrome-vanadium hand tools, socket sets, spanners, pliers, screwdrivers, and workshop tool kits.",
    websiteUrl: "https://www.tapariatools.com",
    authorizedSince: "",
    rating: 5,
    featured: true,
    sortOrder: 3,
  },
  {
    name: "CZAR Power Pro",
    slug: "czar-power-pro",
    tagline: "Industrial Power Equipment",
    description:
      "Supplier of CZAR Power Pro demolition breakers, cutters, drills, and workshop power tools.",
    websiteUrl: "",
    authorizedSince: "",
    rating: 5,
    featured: true,
    sortOrder: 4,
  },
  {
    name: "TEZ",
    slug: "tez",
    tagline: "Cutting, Drilling & Workshop Tools",
    description:
      "Supplier of TEZ industrial saw blades, cutters, abrasives, and workshop power tools.",
    websiteUrl: "",
    authorizedSince: "",
    rating: 5,
    featured: true,
    sortOrder: 5,
  },
  {
    name: "Makita",
    slug: "makita",
    tagline: "Cordless & Metalworking Power Tools",
    description:
      "Supplier of Makita LXT cordless tools, routers, planers, saws, and metalworking power equipment.",
    websiteUrl: "https://makita.in",
    authorizedSince: "",
    rating: 5,
    featured: true,
    sortOrder: 6,
  },
];
