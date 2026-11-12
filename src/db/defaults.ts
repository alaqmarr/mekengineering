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
    value: "Empowering industries since 1968. We provide top-tier power tools, precision measuring devices, machinery, and genuine spare parts. Authorized dealers for Bosch, DeWalt, Taparia, and more.",
    type: "textarea",
    label: "Footer Brand Description",
    section: "global",
  },
  { key: "footer.quickLinksHeading", value: "Quick Links", type: "text", label: "Footer Column 1 Heading", section: "global" },
  { key: "footer.categoriesHeading", value: "Top Categories", type: "text", label: "Footer Column 2 Heading", section: "global" },
  { key: "footer.contactHeading", value: "Contact Us", type: "text", label: "Footer Column 3 Heading", section: "global" },
  { key: "footer.viewAllCategories", value: "View All Categories", type: "text", label: "Footer View All Categories Link", section: "global" },
  { key: "footer.copyright", value: "© 2026 Mek Engineering Corporation. All rights reserved.", type: "text", label: "Footer Copyright Notice", section: "global" },
  { key: "footer.creditPrefix", value: "Precision Wholesale Industrial Supply •", type: "text", label: "Footer Right Tagline Prefix", section: "global" },
  { key: "footer.creditHighlight", value: "Secunderabad, India", type: "text", label: "Footer Right Tagline Highlight", section: "global" },
  { key: "social.facebook", value: "https://facebook.com", type: "url", label: "Facebook URL", section: "global" },
  { key: "social.twitter", value: "https://x.com", type: "url", label: "Twitter / X URL", section: "global" },
  { key: "social.instagram", value: "https://instagram.com", type: "url", label: "Instagram URL", section: "global" },
  { key: "social.linkedin", value: "https://linkedin.com", type: "url", label: "LinkedIn URL", section: "global" },
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
  { key: "contact.phoneAvailability", value: "Mon – Sat • 10:00 AM to 8:00 PM IST", type: "text", label: "Phone Availability Subtext", section: "contact" },
  { key: "contact.email", value: "info@mekengineering.com", type: "text", label: "Official Email Address", section: "contact" },
  { key: "contact.emailResponse", value: "Response time: < 24 hrs", type: "text", label: "Email Response Time Subtext", section: "contact" },
  {
    key: "contact.mapEmbedUrl",
    value: "https://www.google.com/maps?q=Ranigunj,Secunderabad,Telangana+500003&output=embed",
    type: "url",
    label: "Google Maps Embed URL",
    section: "contact",
  },

  // Home Page — Categories Section
  { key: "home.categories.badge", value: "Our Catalog", type: "text", label: "Home Categories Eyebrow Badge", section: "home" },
  { key: "home.categories.heading", value: "Shop by Category", type: "text", label: "Home Categories Heading", section: "home" },
  { key: "home.categories.description", value: "Explore Bosch Professional laser rangefinders, thermal detectors, line & rotary lasers, optical levels, digital inclinometers, and genuine accessories.", type: "textarea", label: "Home Categories Description", section: "home" },
  { key: "home.categories.cta", value: "View All Categories", type: "text", label: "Home Categories Link Text", section: "home" },

  // Home Page — Subcategories Strip
  { key: "home.subcategories.badge", value: "Specialized Segments", type: "text", label: "Home Subcategories Badge", section: "home" },
  { key: "home.subcategories.heading", value: "Browse by Subcategory", type: "text", label: "Home Subcategories Heading", section: "home" },
  { key: "home.subcategories.description", value: "Pinpoint the exact Bosch Professional measuring instrument class for your jobsite — from green-beam rangefinders to radar wallscanners.", type: "textarea", label: "Home Subcategories Description", section: "home" },
  { key: "home.subcategories.cta", value: "Explore All Subcategories", type: "text", label: "Home Subcategories CTA", section: "home" },

  // Home Page — Featured Products Section
  { key: "home.featured.badge", value: "Editor's Pick", type: "text", label: "Home Featured Products Badge", section: "home" },
  { key: "home.featured.heading", value: "Featured Equipment", type: "text", label: "Home Featured Products Heading", section: "home" },
  { key: "home.featured.description", value: "Hand-picked flagship Bosch Professional measuring instruments trusted by civil engineers, MEP contractors, and industrial plants across India.", type: "textarea", label: "Home Featured Products Description", section: "home" },
  { key: "home.featured.cta", value: "View Full Catalog", type: "text", label: "Home Featured Products CTA", section: "home" },

  // Home Page — Brands Section
  { key: "home.brands.badge", value: "Trusted by Professionals", type: "text", label: "Home Brands Eyebrow Badge", section: "home" },
  { key: "home.brands.heading", value: "Authorized Global Manufacturers", type: "text", label: "Home Brands Heading", section: "home" },
  { key: "home.brands.cta", value: "See All Brands", type: "text", label: "Home Brands CTA", section: "home" },

  // Home Page — Legacy / Stats Section
  { key: "home.legacy.bgImage", value: "/images/carousel/store-interior.png", type: "image", label: "Home Legacy Background Image", section: "home" },
  { key: "home.legacy.badge", value: "Since 1968", type: "text", label: "Home Legacy Badge", section: "home" },
  { key: "home.legacy.headingLine1", value: "Mek Engineering", type: "text", label: "Home Legacy Heading Line 1", section: "home" },
  { key: "home.legacy.headingLine2", value: "Corporation", type: "text", label: "Home Legacy Heading Line 2", section: "home" },
  {
    key: "home.legacy.paragraph",
    value: "For over 55 years, we have defined excellence in industrial supply. As premier wholesale traders in Secunderabad, we bridge the gap between global manufacturers and local industry needs with 100% genuine equipment.",
    type: "textarea",
    label: "Home Legacy Paragraph",
    section: "home",
  },
  { key: "home.legacy.ctaPrimary", value: "Our Legacy", type: "text", label: "Home Legacy Primary CTA", section: "home" },
  { key: "home.legacy.ctaSecondary", value: "Request Bulk Quote", type: "text", label: "Home Legacy Secondary CTA", section: "home" },
  { key: "home.legacy.stat1Value", value: "55+", type: "text", label: "Legacy Stat 1 Number", section: "home" },
  { key: "home.legacy.stat1Label", value: "Years Experience", type: "text", label: "Legacy Stat 1 Label", section: "home" },
  { key: "home.legacy.stat2Value", value: "10k+", type: "text", label: "Legacy Stat 2 Number", section: "home" },
  { key: "home.legacy.stat2Label", value: "Products Sold", type: "text", label: "Legacy Stat 2 Label", section: "home" },
  { key: "home.legacy.stat3Value", value: "100%", type: "text", label: "Legacy Stat 3 Number", section: "home" },
  { key: "home.legacy.stat3Label", value: "Client Satisfaction & Genuine Supply", type: "text", label: "Legacy Stat 3 Label", section: "home" },

  // Home Page — Bottom CTA Strip
  { key: "home.cta.badge", value: "Wholesale & Institutional Procurement", type: "text", label: "Home Bottom CTA Badge", section: "home" },
  { key: "home.cta.heading", value: "Need Bulk Pricing or Custom Industrial Sourcing?", type: "text", label: "Home Bottom CTA Heading", section: "home" },
  { key: "home.cta.paragraph", value: "Connect directly with our technical sales desk at Victoria Ranigunj, Secunderabad for GST wholesale invoicing, plant setup toolkits, and genuine OEM spares.", type: "textarea", label: "Home Bottom CTA Paragraph", section: "home" },
  { key: "home.cta.button", value: "Speak With Our Engineers", type: "text", label: "Home Bottom CTA Button", section: "home" },

  // Products Listing Page (/products)
  { key: "products.hero.badge", value: "Industrial Catalog", type: "text", label: "Products Page Badge", section: "products" },
  { key: "products.hero.heading", value: "All Industrial Products", type: "text", label: "Products Page Main Heading", section: "products" },
  { key: "products.hero.paragraph", value: "Explore our complete range of Bosch Professional laser rangefinders, thermal imaging cameras, wall detectors, line & rotary lasers, optical levels, inclinometers, and accessories.", type: "textarea", label: "Products Page Subtitle Paragraph", section: "products" },
  { key: "products.filters.heading", value: "Filter Catalog", type: "text", label: "Products Filter Sidebar Title", section: "products" },
  { key: "products.empty.heading", value: "No Matching Equipment Found", type: "text", label: "Products Empty State Heading", section: "products" },
  { key: "products.empty.paragraph", value: "Try clearing one or more filters or contact our sales desk — we stock thousands of additional SKUs offline.", type: "textarea", label: "Products Empty State Paragraph", section: "products" },

  // Product Detail Page (/products/[id])
  { key: "productDetail.specsHeading", value: "Technical Specifications", type: "text", label: "Product Detail Specs Heading", section: "products" },
  { key: "productDetail.featuresHeading", value: "Key Industrial Highlights", type: "text", label: "Product Detail Highlights Heading", section: "products" },
  { key: "productDetail.descriptionHeading", value: "Detailed Overview", type: "text", label: "Product Detail Description Heading", section: "products" },
  { key: "productDetail.quoteCta", value: "Request Wholesale Quote", type: "text", label: "Product Detail Quote Button", section: "products" },
  { key: "productDetail.whatsappCta", value: "Inquire on WhatsApp", type: "text", label: "Product Detail WhatsApp Button", section: "products" },
  { key: "productDetail.assuranceTitle", value: "100% Genuine Authorized Dealer Guarantee", type: "text", label: "Product Detail Guarantee Title", section: "products" },
  { key: "productDetail.assuranceText", value: "Supplied with official manufacturer warranty, GST tax invoice, and authorized service support from Mek Engineering Corporation.", type: "textarea", label: "Product Detail Guarantee Paragraph", section: "products" },
  { key: "productDetail.relatedHeading", value: "Related Industrial Equipment", type: "text", label: "Product Detail Related Heading", section: "products" },

  // Categories Page (/categories & /categories/[id])
  { key: "categories.hero.badge", value: "Our Catalog", type: "text", label: "Categories Page Badge", section: "categories" },
  { key: "categories.hero.heading", value: "Product Categories", type: "text", label: "Categories Page Heading", section: "categories" },
  { key: "categories.hero.paragraph", value: "Explore our comprehensive range of Bosch Professional measuring instruments and accessories organized by category.", type: "textarea", label: "Categories Page Subtitle", section: "categories" },
  { key: "categoryDetail.subcategoriesHeading", value: "Subcategories in This Department", type: "text", label: "Category Detail Subcategories Heading", section: "categories" },
  { key: "categoryDetail.productsHeading", value: "Available Equipment & Tools", type: "text", label: "Category Detail Products Heading", section: "categories" },

  // Subcategories Page (/subcategories & /subcategories/[id])
  { key: "subcategories.hero.badge", value: "Precision Classification", type: "text", label: "Subcategories Page Badge", section: "subcategories" },
  { key: "subcategories.hero.heading", value: "All Product Subcategories", type: "text", label: "Subcategories Page Heading", section: "subcategories" },
  { key: "subcategories.hero.paragraph", value: "Drill down into specialized Bosch Professional measuring tool classes across laser rangefinders, thermal cameras, radar detectors, line/rotary lasers, optical levels, and accessories.", type: "textarea", label: "Subcategories Page Paragraph", section: "subcategories" },
  { key: "subcategoryDetail.productsHeading", value: "Equipment in This Subcategory", type: "text", label: "Subcategory Detail Products Heading", section: "subcategories" },

  // Brands Page (/brands & /brands/[id])
  { key: "brands.hero.badge", value: "Authorized Dealer", type: "text", label: "Brands Page Badge", section: "brands" },
  { key: "brands.hero.heading", value: "Premium Industrial Brands", type: "text", label: "Brands Page Heading", section: "brands" },
  { key: "brands.hero.paragraph", value: "We partner directly with global manufacturing leaders to bring you authentic, high-performance tools. Zero compromise on quality.", type: "textarea", label: "Brands Page Paragraph", section: "brands" },
  { key: "brands.pillar1.title", value: "100% Authentic", type: "text", label: "Brands Pillar 1 Title", section: "brands" },
  { key: "brands.pillar1.text", value: "No grey market imports. Only genuine factory-sealed products direct from manufacturers.", type: "textarea", label: "Brands Pillar 1 Text", section: "brands" },
  { key: "brands.pillar2.title", value: "Full Warranty", type: "text", label: "Brands Pillar 2 Title", section: "brands" },
  { key: "brands.pillar2.text", value: "Official manufacturer warranty and GST invoicing applicable on all wholesale & retail sales.", type: "textarea", label: "Brands Pillar 2 Text", section: "brands" },
  { key: "brands.pillar3.title", value: "Service Support", type: "text", label: "Brands Pillar 3 Title", section: "brands" },
  { key: "brands.pillar3.text", value: "Authorized service center assistance and genuine OEM spare parts availability.", type: "textarea", label: "Brands Pillar 3 Text", section: "brands" },
  { key: "brandDetail.productsHeading", value: "Official Brand Catalog", type: "text", label: "Brand Detail Products Heading", section: "brands" },

  // About Page (/about)
  { key: "about.hero.bgImage", value: "/images/carousel/bosch-store.png", type: "image", label: "About Hero Background Image", section: "about" },
  { key: "about.hero.badge", value: "Since 1968", type: "text", label: "About Hero Badge", section: "about" },
  { key: "about.hero.heading", value: "Building The Future", type: "text", label: "About Hero Heading", section: "about" },
  { key: "about.hero.paragraph", value: "For over five decades, Mek Engineering Corporation has been the backbone of industrial supply in Secunderabad and across Southern India.", type: "textarea", label: "About Hero Paragraph", section: "about" },
  { key: "about.stat1.value", value: "55+", type: "text", label: "About Stat 1 Value", section: "about" },
  { key: "about.stat1.label", value: "Years of Legacy", type: "text", label: "About Stat 1 Label", section: "about" },
  { key: "about.stat2.value", value: "10k+", type: "text", label: "About Stat 2 Value", section: "about" },
  { key: "about.stat2.label", value: "Products Cataloged", type: "text", label: "About Stat 2 Label", section: "about" },
  { key: "about.stat3.value", value: "5k+", type: "text", label: "About Stat 3 Value", section: "about" },
  { key: "about.stat3.label", value: "Happy Clients", type: "text", label: "About Stat 3 Label", section: "about" },
  { key: "about.stat4.value", value: "20+", type: "text", label: "About Stat 4 Value", section: "about" },
  { key: "about.stat4.label", value: "Partner Brands", type: "text", label: "About Stat 4 Label", section: "about" },
  { key: "about.story.badge", value: "Who We Are", type: "text", label: "About Story Eyebrow", section: "about" },
  { key: "about.story.heading", value: "Our Legacy", type: "text", label: "About Story Heading", section: "about" },
  {
    key: "about.story.paragraph1",
    value: "We are a Sole Proprietorship based firm, engaged as the foremost Wholesale Trader of Tool Kits, Grease Dispensers, Saw Blades, Electric Drills, Angle Grinders, Precision Measuring Instruments, and Industrial Machinery.",
    type: "textarea",
    label: "About Story Paragraph 1",
    section: "about",
  },
  {
    key: "about.story.paragraph2",
    value: "Our products are high in demand due to their premium quality, seamless finish, heavy-duty endurance, and competitive wholesale prices. Furthermore, we ensure timely delivery of these products to our clients, holding our reputation as a trusted partner in the industrial supply chain since 1968.",
    type: "textarea",
    label: "About Story Paragraph 2",
    section: "about",
  },
  {
    key: "about.story.quote",
    value: "\"Under the direction of Zoeb Bootwala (Manager), we have been able to achieve a reputed name in the industry through unwavering integrity and technical excellence.\"",
    type: "textarea",
    label: "About Leadership Quote",
    section: "about",
  },
  { key: "about.story.image1", value: "/images/carousel/store-interior.png", type: "image", label: "About Showcase Image 1", section: "about" },
  { key: "about.story.image2", value: "/images/carousel/dewalt-site.png", type: "image", label: "About Showcase Image 2", section: "about" },
  { key: "about.why.heading", value: "Why Professionals Choose Us", type: "text", label: "About Why Choose Us Heading", section: "about" },
  { key: "about.why.subtitle", value: "We define excellence through our commitment to genuine quality and responsive service.", type: "textarea", label: "About Why Choose Us Subtitle", section: "about" },
  { key: "about.why.card1Title", value: "Authenticity Guaranteed", type: "text", label: "About Card 1 Title", section: "about" },
  { key: "about.why.card1Text", value: "We are official authorized dealers. 100% genuine products sourced directly from manufacturers.", type: "textarea", label: "About Card 1 Paragraph", section: "about" },
  { key: "about.why.card2Title", value: "Expert Consultation", type: "text", label: "About Card 2 Title", section: "about" },
  { key: "about.why.card2Text", value: "Our experienced technical team helps you select the exact tools for your industrial workload.", type: "textarea", label: "About Card 2 Paragraph", section: "about" },
  { key: "about.why.card3Title", value: "Rapid Logistics", type: "text", label: "About Card 3 Title", section: "about" },
  { key: "about.why.card3Text", value: "Ready stock in Ranigunj, Secunderabad ensuring fast dispatch so your jobsite never stalls.", type: "textarea", label: "About Card 3 Paragraph", section: "about" },

  // Contact Page (/contact)
  { key: "contact.hero.badge", value: "Support & Wholesale Sales", type: "text", label: "Contact Page Badge", section: "contact" },
  { key: "contact.hero.heading", value: "Get in Touch", type: "text", label: "Contact Page Heading", section: "contact" },
  { key: "contact.hero.paragraph", value: "Have a question about our industrial catalog, need a bulk GST quotation, or looking for specific OEM spare parts? Our team is ready to assist.", type: "textarea", label: "Contact Page Subtitle", section: "contact" },
  { key: "contact.details.heading", value: "Contact Details", type: "text", label: "Contact Details Column Heading", section: "contact" },
  { key: "contact.location.label", value: "Our Showroom & Warehouse", type: "text", label: "Contact Location Card Heading", section: "contact" },
  { key: "contact.phone.label", value: "Direct Sales Line", type: "text", label: "Contact Phone Card Heading", section: "contact" },
  { key: "contact.email.label", value: "Email Desk", type: "text", label: "Contact Email Card Heading", section: "contact" },
  { key: "contact.form.heading", value: "Send Us a Message", type: "text", label: "Contact Form Heading", section: "contact" },
  { key: "contact.form.paragraph", value: "Fill out the inquiry form below and our sales engineers will respond promptly via email or phone.", type: "textarea", label: "Contact Form Description", section: "contact" },
  { key: "contact.form.submitText", value: "Send Inquiry", type: "text", label: "Contact Form Submit Button", section: "contact" },
];

export const DEFAULT_PAGE_SEO = [
  {
    route: "/",
    title: "Mek Engineering Corporation | Premium Power Tools & Industrial Machinery Since 1968",
    description:
      "Established in 1968, Mek Engineering Corporation is a premier wholesale trader of Power Tools, Hand Tools, Precision Instruments, and Industrial Machinery in Secunderabad. Authorized dealers for Bosch, DeWalt, Taparia, CZAR Power Pro & TEZ.",
    keywords:
      "Mek Engineering Corporation, Power Tools Secunderabad, Industrial Machinery Hyderabad, Bosch Authorized Dealer Secunderabad, Bosch Measuring Tools India, DeWalt Tools India, Taparia Wholesale, Ranigunj Hardware Tools",
    ogTitle: "Mek Engineering Corporation | Premium Industrial Supply Since 1968",
    ogDescription: "Authorized Wholesale Dealer for Bosch, DeWalt, Taparia, CZAR Power Pro, and TEZ in Secunderabad.",
    ogImage: "/images/carousel/store-interior.png",
  },
  {
    route: "/products",
    title: "All Products | Bosch Measuring Devices & Industrial Tools | Mek Engineering Corporation",
    description:
      "Browse our full catalog of Bosch Professional laser rangefinders, thermal cameras, radar wallscanners, line & rotary lasers, optical levels, inclinometers, and accessories.",
    keywords: "Bosch GLM, Bosch GTC, Bosch GLL, Bosch GOL, Bosch D-tect, Laser Rangefinder Secunderabad, Mek Engineering",
    ogTitle: "Industrial Equipment Catalog | Mek Engineering Corporation",
    ogDescription: "Explore 100% genuine Bosch Professional measuring tools and industrial equipment.",
    ogImage: "/images/carousel/bosch-store.png",
  },
  {
    route: "/categories",
    title: "Product Categories | Bosch Measuring Devices | Mek Engineering",
    description:
      "Explore Bosch Professional product categories at Mek Engineering Corporation: Laser Rangefinders, Thermal & Detection, Point/Line/Rotation Lasers, Optical Levels, Angle Measurers, and Accessories.",
    keywords: "Laser Rangefinders, Thermal Cameras, Line Lasers, Optical Levels, Digital Inclinometers, Bosch Accessories",
    ogTitle: "Industrial Tool Categories | Mek Engineering Corporation",
    ogDescription: "Shop professional-grade Bosch measuring equipment organized by category.",
    ogImage: "/images/carousel/store-interior.png",
  },
  {
    route: "/subcategories",
    title: "Product Subcategories | Specialized Bosch Measuring Tools | Mek Engineering",
    description:
      "Find specialized Bosch measuring tool subcategories including Green-Beam Rangefinders, Thermal Imaging Cameras, Radar Wall Scanners, 3x360° Line Lasers, Rotary Lasers, Optical Levels, and Tripods.",
    keywords: "Green Laser Rangefinder, Thermal Camera, Wall Scanner, 3x360 Line Laser, Rotary Laser, Building Tripod",
    ogTitle: "Specialized Tool Subcategories | Mek Engineering Corporation",
    ogDescription: "Precision classification of Bosch Professional measuring instruments and accessories.",
    ogImage: "/images/carousel/dewalt-site.png",
  },
  {
    route: "/brands",
    title: "Authorized Industrial Brands | Bosch, DeWalt, Taparia, CZAR, TEZ | Mek Engineering",
    description:
      "Official authorized distributor for world-class industrial brands including Bosch, DeWalt, Taparia, CZAR Power Pro, TEZ, and Makita with full manufacturer warranty.",
    keywords: "Bosch Dealer, DeWalt Distributor, Taparia Wholesale, CZAR Power Pro, TEZ Tools",
    ogTitle: "Authorized Industrial Brands | Mek Engineering Corporation",
    ogDescription: "100% genuine factory-sealed tools from global manufacturing leaders.",
    ogImage: "/images/carousel/bosch-store.png",
  },
  {
    route: "/about",
    title: "About Us | 55+ Years of Industrial Legacy | Mek Engineering Corporation",
    description:
      "Discover Mek Engineering Corporation's journey since 1968 in Victoria Ranigunj, Secunderabad under the leadership of Zoeb Bootwala.",
    keywords: "About Mek Engineering, Zoeb Bootwala, Industrial Wholesale Secunderabad Since 1968",
    ogTitle: "55+ Years of Industrial Supply Excellence | Mek Engineering",
    ogDescription: "Serving industries across India since 1968 from Secunderabad.",
    ogImage: "/images/carousel/store-interior.png",
  },
  {
    route: "/contact",
    title: "Contact Us & Request Wholesale Quote | Mek Engineering Corporation",
    description:
      "Visit Mek Engineering Corporation at 5-1-458, Victoria Ranigunj, Secunderabad - 500003 or call +91 93910 79492 for bulk industrial tool quotes.",
    keywords: "Contact Mek Engineering, Ranigunj Secunderabad Tools Shop, Request Wholesale Quote",
    ogTitle: "Contact Mek Engineering Corporation | Sales & Quotes",
    ogDescription: "Get in touch with our Secunderabad showroom for genuine tools and bulk pricing.",
    ogImage: "/images/carousel/store-interior.png",
  },
];

export const DEFAULT_HERO_SLIDES = [
  {
    badge: "Premium Industrial Supply",
    titlePart1: "AUTHORIZED",
    titleHighlight: "BOSCH",
    titlePart2: "DEALER",
    subtitle: "Precision German Engineering for Professionals",
    primaryCtaText: "View Catalog",
    primaryCtaHref: "/products",
    secondaryCtaText: "Contact Us",
    secondaryCtaHref: "/contact",
    imageUrl: "/images/carousel/bosch-store.png",
    sortOrder: 1,
    isActive: true,
  },
  {
    badge: "Premium Industrial Supply",
    titlePart1: "",
    titleHighlight: "DEWALT",
    titlePart2: "INDUSTRIAL",
    subtitle: "Guaranteed Tough. Built for the Jobsite.",
    primaryCtaText: "View Catalog",
    primaryCtaHref: "/products",
    secondaryCtaText: "Contact Us",
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
    subtitle: "Secunderabad's Premier Wholesale Partner for Genuine Tools & Machinery",
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
    tagline: "Precision German Engineering for Professionals",
    description:
      "Official authorized distributor for Bosch Professional (Blue) measuring devices, laser rangefinders, thermal cameras, line & rotary lasers, heavy-duty power tools, and genuine industrial accessories.",
    websiteUrl: "https://www.bosch-pt.co.in",
    authorizedSince: "1985",
    rating: 5,
    featured: true,
    sortOrder: 1,
  },
  {
    name: "DeWalt",
    slug: "dewalt",
    tagline: "Guaranteed Tough. Built for the Jobsite.",
    description:
      "Official authorized distributor for DeWalt industrial power tools, XR brushless cordless equipment, miter saws, angle grinders, and jobsite storage solutions engineered for extreme durability.",
    websiteUrl: "https://www.in.dewalt.global",
    authorizedSince: "1998",
    rating: 5,
    featured: true,
    sortOrder: 2,
  },
  {
    name: "Taparia",
    slug: "taparia",
    tagline: "India's Benchmark in Forged Hand Tools",
    description:
      "Authorized wholesale distributor for Taparia drop-forged chrome-vanadium hand tools, socket sets, spanners, pliers, screwdrivers, and industrial cantilever tool kits.",
    websiteUrl: "https://www.tapariatools.com",
    authorizedSince: "1975",
    rating: 5,
    featured: true,
    sortOrder: 3,
  },
  {
    name: "CZAR Power Pro",
    slug: "czar-power-pro",
    tagline: "High-Torque Industrial Power Equipment",
    description:
      "Official authorized distributor for CZAR Power Pro heavy-duty demolition breakers, marble cutters, core drills, and fabrication shop machinery.",
    websiteUrl: "",
    authorizedSince: "2012",
    rating: 5,
    featured: true,
    sortOrder: 4,
  },
  {
    name: "TEZ",
    slug: "tez",
    tagline: "Precision Cutting, Drilling & Workshop Essentials",
    description:
      "Official authorized distributor for TEZ industrial saw blades, TCT cutters, abrasives, and high-reliability workshop power tools.",
    websiteUrl: "",
    authorizedSince: "2015",
    rating: 5,
    featured: true,
    sortOrder: 5,
  },
  {
    name: "Makita",
    slug: "makita",
    tagline: "Japanese Innovation in Cordless & Heavy Tools",
    description:
      "Authorized supplier of Makita industrial LXT cordless systems, routers, planers, and continuous-duty metalworking power tools.",
    websiteUrl: "https://makita.in",
    authorizedSince: "2005",
    rating: 5,
    featured: true,
    sortOrder: 6,
  },
];
