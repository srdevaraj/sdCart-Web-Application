-- ============================================================================
-- V7: Electronics catalog seed — 2026-era consumer electronics
--
-- Inserts 5 top-level categories, 9 brands, 75 products (15 per brand set),
-- one primary placeholder image per product, and 3 key specifications each.
--
-- IDEMPOTENCY
--   categories / brands / products : ON CONFLICT (slug) DO NOTHING
--   product_images                 : NOT EXISTS guard on (product_id, is_primary)
--   product_specifications         : ON CONFLICT ON CONSTRAINT
--                                    uk_product_specifications_product_name
--                                    DO NOTHING
--
-- NOTE: prices are stored in INR (₹) as-is — currency display is handled by
-- the frontend.  Placeholder images follow the placehold.co pattern established
-- in V2.  cloudinary_public_id is intentionally omitted (defaults to NULL).
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. CATEGORIES  (parent_id = NULL → top-level)
--    sort_order starts at 10 to leave room after the V2 entries (1–4)
-- ---------------------------------------------------------------------------
INSERT INTO categories
    (public_id, name, slug, description, parent_id, image_url, sort_order, active, created_at, updated_at)
VALUES
    (gen_random_uuid(),
     'Smartphones', 'smartphones',
     'Flagship and mid-range smartphones from the world''s leading manufacturers. '
     'Covers iOS, Android, and foldable form factors with the latest chipsets and camera systems.',
     NULL, 'https://placehold.co/600x400?text=Smartphones', 10, TRUE, now(), now()),

    (gen_random_uuid(),
     'Laptops', 'laptops',
     'Ultrabooks, workstations, gaming rigs, and handheld PCs for every use case. '
     'Includes ARM-native Copilot+ machines and high-performance discrete GPU models.',
     NULL, 'https://placehold.co/600x400?text=Laptops', 20, TRUE, now(), now()),

    (gen_random_uuid(),
     'Smartwatches', 'smartwatches',
     'Smartwatches and fitness trackers covering health monitoring, GPS navigation, and satellite connectivity. '
     'Ranges from budget fitness bands to ultra-rugged expedition watches.',
     NULL, 'https://placehold.co/600x400?text=Smartwatches', 30, TRUE, now(), now()),

    (gen_random_uuid(),
     'Audio', 'audio',
     'Headphones, earbuds, and portable speakers with active noise cancellation and spatial audio. '
     'Covers wired, wireless, open-ear, gaming, and over-ear form factors.',
     NULL, 'https://placehold.co/600x400?text=Audio', 40, TRUE, now(), now()),

    (gen_random_uuid(),
     'Tablets', 'tablets',
     'Tablets and 2-in-1 convertibles from entry-level education devices to pro creative workstations. '
     'Includes OLED flagship slates, ARM-powered Surface hybrids, and S Pen-equipped Samsung models.',
     NULL, 'https://placehold.co/600x400?text=Tablets', 50, TRUE, now(), now())

ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 2. BRANDS  (9 unique; Apple / Samsung appear across multiple categories —
--    brand rows are category-agnostic; the product FK carries the category)
-- ---------------------------------------------------------------------------
INSERT INTO brands
    (public_id, name, slug, description, logo_url, active, created_at, updated_at)
VALUES
    (gen_random_uuid(),
     'Apple', 'apple',
     'American technology company known for the iPhone, Mac, iPad, Apple Watch, and AirPods. '
     'Products run iOS, macOS, watchOS, and iPadOS with tight hardware-software integration.',
     'https://placehold.co/200x80?text=Apple', TRUE, now(), now()),

    (gen_random_uuid(),
     'Samsung', 'samsung',
     'South Korean conglomerate and global leader in Android smartphones, AMOLED displays, and tablets. '
     'Galaxy S, Z Fold, and Tab S lines define the premium Android experience.',
     'https://placehold.co/200x80?text=Samsung', TRUE, now(), now()),

    (gen_random_uuid(),
     'Google', 'google',
     'Maker of the Pixel smartphone series featuring custom Tensor silicon and Gemini AI integration. '
     'Offers the purest Android experience with guaranteed long-term OS update commitments.',
     'https://placehold.co/200x80?text=Google', TRUE, now(), now()),

    (gen_random_uuid(),
     'Dell', 'dell',
     'American PC manufacturer offering XPS ultrabooks, Alienware gaming laptops, and Latitude business systems. '
     'Known for premium OLED displays and enterprise-grade build quality.',
     'https://placehold.co/200x80?text=Dell', TRUE, now(), now()),

    (gen_random_uuid(),
     'ASUS', 'asus',
     'Taiwanese hardware company renowned for ROG gaming laptops, Zenbook ultrabooks, and the ROG Ally handheld. '
     'Consistently leads in performance-per-dollar for enthusiast and gaming segments.',
     'https://placehold.co/200x80?text=ASUS', TRUE, now(), now()),

    (gen_random_uuid(),
     'Garmin', 'garmin',
     'American GPS technology specialist producing sports and adventure smartwatches for runners, cyclists, and mountaineers. '
     'Fenix, Epix, and Forerunner lines offer class-leading battery life and multi-band GPS accuracy.',
     'https://placehold.co/200x80?text=Garmin', TRUE, now(), now()),

    (gen_random_uuid(),
     'Sony', 'sony',
     'Japanese multinational behind the WH and WF headphone families, best known for industry-leading noise cancellation. '
     'LDAC Hi-Res Wireless audio and adaptive sound technology define the Sony listening experience.',
     'https://placehold.co/200x80?text=Sony', TRUE, now(), now()),

    (gen_random_uuid(),
     'Bose', 'bose',
     'American acoustics company and pioneer of active noise cancellation headphones and earbuds. '
     'QuietComfort and SoundLink product lines are trusted by frequent travellers and audiophiles worldwide.',
     'https://placehold.co/200x80?text=Bose', TRUE, now(), now()),

    (gen_random_uuid(),
     'Microsoft', 'microsoft',
     'American software and hardware company offering the Surface Pro, Laptop Studio, and Surface Go tablet lines. '
     'Surface devices run full Windows 11 and are optimised for Microsoft 365 productivity.',
     'https://placehold.co/200x80?text=Microsoft', TRUE, now(), now())

ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 3. PRODUCTS  (75 rows — 5 categories × 3 brands × 5 products)
--    Fields: name, slug, short_description, description, sku, price,
--            compare_at_price, cost_price, stock_quantity, status,
--            is_featured, average_rating, review_count, category_id, brand_id
-- ---------------------------------------------------------------------------

-- ======================== SMARTPHONES — APPLE (5) ==========================
INSERT INTO products
    (public_id, name, slug, short_description, description, sku,
     price, compare_at_price, cost_price,
     stock_quantity, status, is_featured, average_rating, review_count,
     category_id, brand_id, created_at, updated_at)
VALUES

    (gen_random_uuid(),
     'iPhone 18 Pro', 'iphone-18-pro',
     '6.9" ProMotion LTPO OLED, A20 Bionic, Apple Intelligence 3.0, titanium-graphene frame.',
     'The most powerful iPhone ever made. The 6.9-inch ProMotion LTPO OLED display adapts dynamically '
     'from 1 Hz to 120 Hz for buttery scrolling and all-day battery efficiency. '
     'The A20 Bionic chip with on-device Apple Intelligence 3.0 handles complex generative tasks '
     'entirely on-device, and the titanium-graphene frame keeps weight remarkably low despite its size. '
     'A 200MP main sensor with a second-generation 5× periscope telephoto delivers professional-grade results.',
     'AAPL-IPH18PRO',
     149900.00, 164900.00, 88000.00,
     50, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'iPhone 18', 'iphone-18',
     '6.3" OLED, A19 chip, satellite emergency SOS v3, all-day battery.',
     'The standard iPhone 18 brings the A19 chip and a larger 6.3-inch OLED panel to mainstream buyers. '
     'Satellite emergency SOS v3 now supports two-way messaging and roadside assistance globally. '
     'A refined 48MP main camera and improved computational photography pipeline deliver stunning shots in any light.',
     'AAPL-IPH18',
     89900.00, 99900.00, 53000.00,
     100, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'iPhone 18 Air', 'iphone-18-air',
     'Ultra-thin 5.5 mm body, eSIM-only, A19 Pro chip — the thinnest iPhone ever.',
     'At just 5.5 mm thick, the iPhone 18 Air is the slimmest smartphone Apple has ever released. '
     'The eSIM-only design eliminates the physical SIM tray to achieve the radical slim profile. '
     'The A19 Pro chip delivers Pro-class performance with exceptional thermal management despite the ultra-thin chassis.',
     'AAPL-IPH18AIR',
     99900.00, 109900.00, 59000.00,
     75, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'iPhone 17e', 'iphone-17e',
     'Budget-friendly iPhone with A18 chip, 48MP camera, and full iOS support.',
     'The iPhone 17e makes the powerful A18 chip and the full iOS ecosystem accessible at a lower price point. '
     'A 48MP main camera with Smart HDR 6 handles everyday photography with ease. '
     'Full Apple Intelligence features and a five-year software update commitment make it an outstanding long-term value.',
     'AAPL-IPH17E',
     59900.00, NULL, 35000.00,
     150, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'iPhone 16 (2026 Refresh Stock)', 'iphone-16-2026-refresh',
     'A18 chip, USB-C 3.2, excellent everyday smartphone at a reduced price.',
     'The iPhone 16 remains a compelling everyday smartphone running on the efficient A18 chip. '
     'USB-C 3.2 enables faster data transfers and universal cable compatibility. '
     'Available at a reduced price as part of the 2026 refresh cycle, making Apple quality highly accessible.',
     'AAPL-IPH16-REF',
     54900.00, NULL, 32000.00,
     200, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

-- ======================== SMARTPHONES — SAMSUNG (5) ========================

    (gen_random_uuid(),
     'Samsung Galaxy S27 Ultra', 'galaxy-s27-ultra',
     'Snapdragon 8 Elite Gen 5, 200MP quad camera, 6.9" 2K AMOLED 165Hz, on-device Gemini/Bixby hybrid AI.',
     'The Galaxy S27 Ultra pushes the boundary of what an Android flagship can do. '
     'The Snapdragon 8 Elite Gen 5 powers a 200MP quad-camera system with a 10× optical periscope telephoto. '
     'The 6.9-inch 2K Dynamic AMOLED at 165 Hz and an on-device Gemini/Bixby hybrid AI make it the most capable Galaxy Ultra yet.',
     'SAMS-GS27U',
     139999.00, 154999.00, 82000.00,
     40, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy S27', 'galaxy-s27',
     'Exynos 2600, 6.2" AMOLED, circular photo AI editing, refined compact flagship.',
     'The Galaxy S27 offers a refined compact flagship experience built around the Exynos 2600 chipset. '
     'The 6.2-inch AMOLED panel with Gorilla Glass Armor delivers a vivid, scratch-resistant display. '
     'Samsung''s circular photo AI editing lets users reframe, erase, and enhance shots non-destructively after capture.',
     'SAMS-GS27',
     79999.00, 89999.00, 47000.00,
     80, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Z Fold 7', 'galaxy-z-fold-7',
     '8" foldable inner display, hinge-free flex glass v2, Snapdragon 8 Elite Gen 5.',
     'The Galaxy Z Fold 7 sets the new standard for foldable phones with an 8-inch inner foldable display and the second-generation hinge-free flex glass. '
     'The Snapdragon 8 Elite Gen 5 keeps performance class-leading in every configuration. '
     'The refined crease-minimised panel and slimmer closed profile make it the most pocketable Fold yet.',
     'SAMS-GZF7',
     174999.00, 189999.00, 103000.00,
     25, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Z Flip 7', 'galaxy-z-flip-7',
     'Clamshell foldable with 4.1" cover screen, Snapdragon chipset, stylish form factor.',
     'The Galaxy Z Flip 7 pairs a dramatically enlarged 4.1-inch cover screen with a refined clamshell foldable design. '
     'The cover screen now supports a full widget dashboard and AI-powered camera without opening the phone. '
     'When unfolded, the 6.7-inch FHD+ AMOLED delivers a premium viewing experience in a pocketable package.',
     'SAMS-GZP7',
     99999.00, 109999.00, 59000.00,
     60, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy A57 5G', 'galaxy-a57-5g',
     'Mid-range 5G phone with 108MP camera, 6000mAh battery, and all-day performance.',
     'The Galaxy A57 5G brings flagship-tier camera specs to the mid-range with a 108MP main sensor and OIS. '
     'The massive 6000 mAh battery with 45W fast charging means the phone easily lasts two full days on a single charge. '
     '5G connectivity and a smooth 90Hz AMOLED display make it one of the best-value smartphones in its segment.',
     'SAMS-GA57-5G',
     27999.00, NULL, 16500.00,
     200, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

-- ======================== SMARTPHONES — GOOGLE (5) =========================

    (gen_random_uuid(),
     'Google Pixel 10 Pro XL', 'pixel-10-pro-xl',
     'Tensor G5, Gemini Nano on-device, Magic Editor v3, the best Android camera on the market.',
     'The Pixel 10 Pro XL combines the Tensor G5 chip''s on-device Gemini Nano AI with the most versatile camera system Google has ever built. '
     'Magic Editor v3 lets users completely reimagine scenes — changing backgrounds, adding elements, and correcting complex group shots with AI precision. '
     'A 5500 mAh battery and seven-year Android OS update guarantee make it a phone worth keeping for the long term.',
     'GOOG-PX10PROXL',
     124999.00, 139999.00, 73000.00,
     45, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'google'),
     now(), now()),

    (gen_random_uuid(),
     'Google Pixel 10 Pro', 'pixel-10-pro',
     'Tensor G5, 6.3" LTPO OLED, class-leading photography, 7-year update guarantee.',
     'The Pixel 10 Pro delivers the full Tensor G5 experience in a more compact 6.3-inch body. '
     'The LTPO OLED display adapts from 1 Hz to 120 Hz for efficient, smooth scrolling. '
     'Camera performance remains class-leading, with real-time scene understanding powered entirely by on-device Gemini Nano.',
     'GOOG-PX10PRO',
     99999.00, 109999.00, 59000.00,
     60, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'google'),
     now(), now()),

    (gen_random_uuid(),
     'Google Pixel 10', 'pixel-10',
     'Tensor G5, 6.1" OLED, 7-year OS update guarantee, pure Android experience.',
     'The Pixel 10 brings the Tensor G5 chip''s AI capabilities to the standard model at a more accessible price. '
     'The 6.1-inch OLED panel is bright, accurate, and covered by Corning Gorilla Glass Victus 3. '
     'Seven years of guaranteed OS and security updates ensure this phone stays current well into the next decade.',
     'GOOG-PX10',
     69999.00, NULL, 41000.00,
     100, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'google'),
     now(), now()),

    (gen_random_uuid(),
     'Google Pixel 10a', 'pixel-10a',
     'Mid-range Tensor G4a, 48MP camera, stock Android, outstanding value.',
     'The Pixel 10a delivers a clean stock Android experience with the capable Tensor G4a chip at a highly competitive price. '
     'The 48MP main camera inherits Pixel computational photography, producing shots that punch well above its price class. '
     'A large 5000 mAh battery and five-year update commitment round out the excellent value proposition.',
     'GOOG-PX10A',
     39999.00, NULL, 23500.00,
     150, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'google'),
     now(), now()),

    (gen_random_uuid(),
     'Google Pixel Fold 3', 'pixel-fold-3',
     'Tensor G5, book-style foldable, 7.6" inner OLED, Google AI throughout.',
     'The Pixel Fold 3 refines Google''s take on the foldable smartphone with a slimmer profile and a brighter 7.6-inch inner OLED. '
     'Tensor G5 keeps on-device Gemini Nano AI running smoothly even with the demanding foldable form factor. '
     'The outer cover display is now large enough for most tasks, making the fold an enhancement rather than a necessity.',
     'GOOG-PXFOLD3',
     154999.00, 169999.00, 91000.00,
     20, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartphones'),
     (SELECT id FROM brands WHERE slug = 'google'),
     now(), now()),

-- ======================== LAPTOPS — APPLE (5) ==============================

    (gen_random_uuid(),
     'Apple MacBook Pro 16" M6 Max', 'macbook-pro-16-m6-max',
     '40-core GPU, on-device Apple Intelligence, 16" Mini-LED 120Hz — pro workstation performance.',
     'The MacBook Pro 16-inch with M6 Max is Apple''s most powerful laptop ever. '
     'The 40-core GPU handles demanding video editing, 3D rendering, and ML model training without breaking a sweat. '
     'The Mini-LED Liquid Retina XDR display at 120Hz covers P3 wide colour with extreme dynamic range, and on-device Apple Intelligence accelerates creative workflows throughout.',
     'AAPL-MBP16-M6MAX',
     329900.00, 359900.00, 195000.00,
     20, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple MacBook Pro 14" M6 Pro', 'macbook-pro-14-m6-pro',
     '20-core GPU, 22-hour battery, 14" Mini-LED XDR display — portable pro power.',
     'The MacBook Pro 14-inch M6 Pro offers an extraordinary balance of performance and portability. '
     'The 20-core GPU handles pro media workflows without the desk-bound size of the 16-inch, and the 22-hour battery life is genuinely all-day. '
     'The 14.2-inch Mini-LED Liquid Retina XDR display with ProMotion is the best laptop screen at this size.',
     'AAPL-MBP14-M6PRO',
     229900.00, 249900.00, 136000.00,
     30, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple MacBook Air 15" M5', 'macbook-air-15-m5',
     'Fanless M5 design, 18-hour battery, 15.3" Liquid Retina display — thin and silent.',
     'The MacBook Air 15-inch with M5 is the world''s best thin-and-light laptop for most users. '
     'The completely fanless design means silent operation under all everyday workloads. '
     'At 18 hours of battery life and just 1.51 kg, it is both the lightest and longest-lasting 15-inch laptop available.',
     'AAPL-MBA15-M5',
     134900.00, NULL, 79000.00,
     50, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple MacBook Air 13" M5', 'macbook-air-13-m5',
     'Entry MacBook Air with M5 chip, 18-hour battery, fanless and ultra-portable.',
     'The MacBook Air 13-inch with M5 is the perfect first Mac — impossibly thin, completely silent, and extraordinarily fast for its class. '
     'The 13.6-inch Liquid Retina display is sharp and accurate with support for 1 billion colours. '
     'At under 1.24 kg and 18 hours of battery, it slips into any bag and keeps going all day without a charger.',
     'AAPL-MBA13-M5',
     114900.00, NULL, 67000.00,
     70, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple MacBook Pro 14" M6', 'macbook-pro-14-m6-base',
     'Base M6 MacBook Pro, 10-core CPU and GPU, ProMotion XDR — entry pro tier.',
     'The base MacBook Pro 14-inch with M6 is the entry point to the Pro line with the full 14.2-inch Mini-LED XDR display and ProMotion at 120Hz. '
     'The 10-core CPU and 10-core GPU comfortably handle video editing, software development, and creative work. '
     'It offers a substantial step up from the MacBook Air for sustained pro workloads at a more accessible price.',
     'AAPL-MBP14-M6',
     169900.00, NULL, 100000.00,
     40, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

-- ======================== LAPTOPS — DELL (5) ================================

    (gen_random_uuid(),
     'Dell XPS 16 (2026)', 'xps-16-2026',
     'Intel Core Ultra 9 Panther Lake, RTX 5070, 4K+ OLED touch — peak XPS performance.',
     'The 2026 XPS 16 raises the bar for premium Windows laptops with Intel''s Panther Lake Core Ultra 9 processor. '
     'The RTX 5070 discrete GPU handles 4K creative workloads and demanding games at high settings. '
     'The stunning 4K+ OLED touchscreen with 120Hz refresh and factory calibration is among the finest laptop displays ever made.',
     'DELL-XPS16-2026',
     259990.00, 289990.00, 153000.00,
     15, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'dell'),
     now(), now()),

    (gen_random_uuid(),
     'Dell XPS 14 (2026)', 'xps-14-2026',
     'Intel Core Ultra 7, RTX 5060, 14.5" OLED — the compact premium Windows laptop.',
     'The XPS 14 delivers the premium Dell XPS experience in a more compact and portable chassis. '
     'The Core Ultra 7 processor and RTX 5060 provide ample headroom for video editing, 3D work, and content creation on the go. '
     'The 14.5-inch OLED panel with 2.8K resolution and P3 wide colour is vibrant and immersive at any brightness level.',
     'DELL-XPS14-2026',
     179990.00, 199990.00, 106000.00,
     25, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'dell'),
     now(), now()),

    (gen_random_uuid(),
     'Dell Alienware 16 Aurora', 'dell-alienware-16-aurora',
     'Core Ultra 9, RTX 5080, 240Hz QHD+ — the most powerful Alienware gaming laptop.',
     'The Alienware 16 Aurora is Dell''s ultimate gaming laptop, pairing the Intel Core Ultra 9 with the RTX 5080 for desktop-class gaming performance. '
     'The 240Hz QHD+ display delivers buttery-smooth, tear-free gameplay in the most demanding titles. '
     'The advanced Cryo-tech cooling system with dual fans and exhaust vents keeps thermals in check during extended gaming sessions.',
     'DELL-AW16-AURORA',
     289990.00, 319990.00, 171000.00,
     10, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'dell'),
     now(), now()),

    (gen_random_uuid(),
     'Dell Inspiron 15 Plus', 'dell-inspiron-15-plus',
     'Intel Core Ultra 5, integrated graphics, 15.6" FHD — dependable everyday laptop.',
     'The Inspiron 15 Plus is Dell''s reliable everyday laptop for students, home users, and light office work. '
     'The Intel Core Ultra 5 processor handles multitasking, Office applications, and media consumption with ease. '
     'A spacious 15.6-inch FHD display, comfortable keyboard, and large touchpad make it pleasant to use for extended work sessions.',
     'DELL-INS15P',
     79990.00, NULL, 47000.00,
     80, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'dell'),
     now(), now()),

    (gen_random_uuid(),
     'Dell Latitude 7450', 'dell-latitude-7450',
     'Core Ultra 7 vPro, MIL-STD-810H durability, 14" — business ultrabook built to last.',
     'The Latitude 7450 is a business ultrabook engineered for demanding corporate environments with Intel Core Ultra 7 vPro and MIL-STD-810H durability certification. '
     'Enterprise security features include a hardware TPM 2.0, optional fingerprint reader, and IR camera for Windows Hello facial recognition. '
     'Intel vPro platform enables remote management and zero-trust security policy enforcement across fleets.',
     'DELL-LAT7450',
     134990.00, NULL, 79000.00,
     35, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'dell'),
     now(), now()),

-- ======================== LAPTOPS — ASUS (5) ================================

    (gen_random_uuid(),
     'ASUS ROG Zephyrus G16 (2026)', 'rog-zephyrus-g16-2026',
     'Core Ultra 9, RTX 5080, 240Hz OLED — the slim gaming powerhouse redefined.',
     'The ROG Zephyrus G16 is the gold standard for slim gaming laptops, combining the Intel Core Ultra 9 with the RTX 5080 in a chassis under 19mm thin. '
     'The 240Hz OLED panel with 0.2ms response time is the fastest and most vivid display available in a gaming laptop. '
     'ROG''s Tri-Fan Technology and liquid metal thermal compound ensure the powerful components stay cool and fast even during marathon sessions.',
     'ASUS-ROGZG16-2026',
     269990.00, 299990.00, 159000.00,
     12, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'asus'),
     now(), now()),

    (gen_random_uuid(),
     'ASUS Zenbook Duo (2026)', 'zenbook-duo-2026',
     'Dual 14" OLED displays, Intel Core Ultra 7, foldable/detachable — desktop in a bag.',
     'The Zenbook Duo 2026 reimagines laptop productivity with two stacked 14-inch OLED displays, each running at 120Hz with PANTONE Validated colour accuracy. '
     'The innovative ErgoSense keyboard detaches magnetically, letting you use the laptop in four distinct modes. '
     'Intel Core Ultra 7 power and a premium aluminium chassis make this the most versatile laptop for creative professionals.',
     'ASUS-ZBD-2026',
     189990.00, 209990.00, 112000.00,
     20, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'asus'),
     now(), now()),

    (gen_random_uuid(),
     'ASUS ROG Ally 2', 'rog-ally-2',
     'Ryzen Z2 Extreme, 120Hz OLED handheld, Windows 11 — the best gaming handheld PC.',
     'The ROG Ally 2 is ASUS''s second-generation Windows gaming handheld, powered by AMD''s Ryzen Z2 Extreme processor with RDNA 4 integrated graphics. '
     'The 7-inch 120Hz OLED display with HDR delivers vivid, sharp visuals for both gaming and media. '
     'Full Windows 11 compatibility means access to every PC game store — Steam, Epic, Xbox Game Pass, and beyond.',
     'ASUS-ROGALLY2',
     64990.00, 74990.00, 38000.00,
     40, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'asus'),
     now(), now()),

    (gen_random_uuid(),
     'ASUS Vivobook S16', 'vivobook-s16',
     'Snapdragon X2 Elite, ARM Copilot+ laptop, 16" OLED — AI-native performance anywhere.',
     'The Vivobook S16 is ASUS''s flagship ARM-native Copilot+ laptop, powered by the Snapdragon X2 Elite for exceptional battery life and instant-on responsiveness. '
     'The 16-inch 3.2K OLED display at 120Hz offers incredible colour fidelity and contrast for creative and business users alike. '
     'All Microsoft Copilot+ AI features run natively and locally on the dedicated NPU, without cloud dependencies.',
     'ASUS-VBS16',
     94990.00, 109990.00, 56000.00,
     45, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'asus'),
     now(), now()),

    (gen_random_uuid(),
     'ASUS TUF Gaming A16', 'tuf-gaming-a16',
     'Ryzen AI 9, RTX 5060, 16" 165Hz — rugged budget gaming laptop.',
     'The TUF Gaming A16 is ASUS''s entry-point into serious gaming, built with MIL-SPEC-tested durability and powered by AMD''s Ryzen AI 9 with RTX 5060 graphics. '
     'The 16-inch 165Hz IPS display delivers smooth, fluid gaming at 1080p. '
     'Reinforced hinges, a spill-resistant keyboard, and a large battery make it ideal for students and on-the-go gamers.',
     'ASUS-TUFGA16',
     109990.00, 124990.00, 65000.00,
     35, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'laptops'),
     (SELECT id FROM brands WHERE slug = 'asus'),
     now(), now()),

-- ======================== SMARTWATCHES — APPLE (5) =========================

    (gen_random_uuid(),
     'Apple Watch Ultra 3', 'apple-watch-ultra-3',
     'Satellite connectivity, blood pressure sensing, titanium case — the adventure smartwatch.',
     'Apple Watch Ultra 3 is built for extreme athletes and adventurers with a rugged titanium case rated to 100m water resistance. '
     'Blood pressure sensing, blood glucose trending, and satellite emergency SOS work far beyond cellular range. '
     'The precision dual-frequency GPS and 72-hour extended battery mode make it the most capable GPS watch Apple has ever made.',
     'AAPL-AWU3',
     89900.00, 99900.00, 53000.00,
     30, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple Watch Series 11', 'apple-watch-series-11',
     'Hypertension notifications, ECG, watchOS 12, S11 chip — the all-round health watch.',
     'Apple Watch Series 11 introduces hypertension notifications — the first over-the-counter blood pressure monitoring feature cleared by global regulators. '
     'Combined with ECG, irregular rhythm notifications, and crash detection, it is the most comprehensive health monitor on any wrist. '
     'The S11 chip and watchOS 12 deliver faster performance and smarter health insights than any previous Apple Watch.',
     'AAPL-AWS11',
     45900.00, NULL, 27000.00,
     60, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple Watch SE 3', 'apple-watch-se-3',
     'Entry Apple Watch with essential health features, lightweight design, great value.',
     'The Apple Watch SE 3 is the most affordable way to experience Apple''s health and safety ecosystem. '
     'It tracks heart rate, detects irregular rhythms, monitors sleep, and includes crash detection and Emergency SOS. '
     'The lightweight aluminium case and redesigned back make it comfortable for all-day and all-night wear.',
     'AAPL-AWSE3',
     24900.00, NULL, 14700.00,
     100, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple Watch Ultra 3 (Titanium Trail Loop Edition)', 'apple-watch-ultra-3-titanium-trail-loop',
     'Satellite connectivity, blood pressure, special Titanium Trail Loop band — limited edition.',
     'The Apple Watch Ultra 3 Titanium Trail Loop Edition pairs the full Ultra 3 capabilities with an exclusive Titanium Trail Loop band designed for trail running and mountaineering. '
     'The band''s titanium hardware and textile construction are engineered to withstand abrasion, temperature extremes, and prolonged moisture exposure. '
     'Identical in core health, GPS, and satellite features to the standard Ultra 3 — this is the collector''s edition.',
     'AAPL-AWU3-TRAIL',
     94900.00, 99900.00, 56000.00,
     20, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple Watch Series 11 (Nike Edition)', 'apple-watch-series-11-nike',
     'Series 11 with exclusive Nike Run Club band, Nike watch faces, hypertension monitoring.',
     'The Apple Watch Series 11 Nike Edition comes with an exclusive Nike Sport Band and Nike Sport Loop alongside four Nike-exclusive watch faces. '
     'Deep Nike Run Club integration provides guided runs, pace coaching, and recovery recommendations. '
     'Hypertension notifications and the full Series 11 health suite make it the ideal companion for serious runners.',
     'AAPL-AWS11-NIKE',
     47900.00, NULL, 28000.00,
     40, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

-- ======================== SMARTWATCHES — SAMSUNG (5) =======================

    (gen_random_uuid(),
     'Samsung Galaxy Watch 8 Ultra', 'galaxy-watch-8-ultra',
     'Titanium body, dual-frequency GPS, antioxidant index sensor, premium health watch.',
     'The Galaxy Watch 8 Ultra is Samsung''s first premium-tier smartwatch with a titanium body and advanced dual-frequency GPS for centimetre-accurate location in complex urban and outdoor environments. '
     'The new antioxidant index sensor tracks oxidative stress levels, complementing the existing blood pressure, ECG, and body composition measurements. '
     'A large AMOLED display and 60-hour battery make it the most capable Galaxy Watch ever.',
     'SAMS-GW8U',
     59999.00, 64999.00, 35000.00,
     35, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Watch 8', 'galaxy-watch-8',
     'Antioxidant index sensor, One UI Watch 7, 40-hour battery — the mainstream Galaxy smartwatch.',
     'The Galaxy Watch 8 brings Samsung''s latest health sensor suite to the mainstream, including the new antioxidant index, blood pressure monitoring, and advanced sleep coaching. '
     'One UI Watch 7 introduces a smarter home integration layer and AI-powered energy score that synthesises all health metrics into a single daily readout. '
     'The circular 40mm AMOLED display is bright, always-on capable, and water-resistant to 5 ATM.',
     'SAMS-GW8',
     34999.00, NULL, 20500.00,
     70, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Watch 8 Classic', 'galaxy-watch-8-classic',
     'Physical rotating bezel, AMOLED display, ECG and BIA, dress-watch aesthetics.',
     'The Galaxy Watch 8 Classic is Samsung''s premium dress smartwatch with a stainless steel case and the satisfying physical rotating bezel for intuitive navigation. '
     'Full Galaxy Watch 8 health features — ECG, blood pressure, body composition via BIA, and antioxidant index — are built in. '
     'The classic circular design and interchangeable 22mm watch bands make it as at home in a boardroom as on a morning run.',
     'SAMS-GW8C',
     39999.00, 44999.00, 23500.00,
     50, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Watch FE 2', 'galaxy-watch-fe-2',
     'Budget fitness watch with heart rate, SpO2, 40-hour battery, Samsung ecosystem.',
     'The Galaxy Watch FE 2 is Samsung''s most accessible smartwatch, delivering essential fitness and health tracking at a budget-friendly price. '
     'Heart rate monitoring, blood oxygen (SpO2), stress tracking, and sleep analysis provide meaningful health insight. '
     'A 40-hour battery and IP68 water resistance make it a worry-free companion for everyday wear and light exercise.',
     'SAMS-GWFE2',
     17999.00, NULL, 10500.00,
     120, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Watch 8 (LTE)', 'galaxy-watch-8-lte',
     'Galaxy Watch 8 with LTE — stay connected independently of your phone.',
     'The Galaxy Watch 8 LTE variant adds independent cellular connectivity so you can make calls, stream music, and receive notifications even when your phone is not nearby. '
     'All Galaxy Watch 8 health features are identical — antioxidant index, blood pressure, ECG, and sleep coaching. '
     'An eSIM means setup is quick, and supported carriers span most major networks globally.',
     'SAMS-GW8-LTE',
     41999.00, NULL, 24700.00,
     55, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

-- ======================== SMARTWATCHES — GARMIN (5) ========================

    (gen_random_uuid(),
     'Garmin Fenix 9', 'garmin-fenix-9',
     'Solar charging, multi-band GPS, AMOLED display — the expedition-grade multisport watch.',
     'The Garmin Fenix 9 is the definitive expedition smartwatch, with solar-charging glass that extends battery life to over 90 days in smartwatch mode. '
     'Multi-band GPS with SatIQ technology locks to the fastest satellite constellation for sub-metre accuracy on demanding routes. '
     'The bright AMOLED touchscreen is readable even in direct sunlight, and Garmin''s sports tracking suite covers over 150 activities.',
     'GRMN-FNX9',
     89990.00, 99990.00, 53000.00,
     25, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'garmin'),
     now(), now()),

    (gen_random_uuid(),
     'Garmin Epix Pro 3', 'garmin-epix-pro-3',
     'AMOLED touchscreen, multi-band GPS, 31-day battery — the premium Garmin.',
     'The Garmin Epix Pro 3 combines the vivid always-on AMOLED touchscreen of the Epix with the full sports and health suite of the Fenix in a slightly slimmer case. '
     'Multi-band GPS, heart rate variability tracking, training load analysis, and advanced sleep monitoring are all included. '
     'Up to 31 days of battery life in smartwatch mode means weeks between charges even with intensive tracking enabled.',
     'GRMN-EPXPRO3',
     79990.00, 89990.00, 47000.00,
     30, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'garmin'),
     now(), now()),

    (gen_random_uuid(),
     'Garmin Venu 4', 'garmin-venu-4',
     'Health and fitness AMOLED watch, 16-day battery, body battery energy monitor.',
     'The Garmin Venu 4 is designed for health-conscious everyday users who want accurate fitness tracking in a stylish, wearable form factor. '
     'The bright AMOLED display displays comprehensive health data including Body Battery energy levels, HRV status, respiration rate, and SpO2. '
     'Up to 16 days of battery life in smartwatch mode makes it genuinely set-and-forget for most users.',
     'GRMN-VNU4',
     44990.00, NULL, 26500.00,
     50, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'garmin'),
     now(), now()),

    (gen_random_uuid(),
     'Garmin Forerunner 970', 'garmin-forerunner-970',
     'Running-focused multi-band GPS watch with HRV, training readiness, and race predictors.',
     'The Forerunner 970 is Garmin''s most advanced running watch, with multi-band GPS for precise pace and distance data on tracks and trails alike. '
     'HRV status, training readiness scores, race time predictors, and advanced running dynamics give serious runners the data to train smarter. '
     'On-wrist maps, incident detection, and LiveTrack sharing add safety features for solo outdoor runners.',
     'GRMN-FR970',
     54990.00, NULL, 32500.00,
     40, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'garmin'),
     now(), now()),

    (gen_random_uuid(),
     'Garmin Instinct 3', 'garmin-instinct-3',
     'Rugged solar watch, MIL-STD-810 durability, 50-day battery in solar mode.',
     'The Garmin Instinct 3 is built for rough-and-tumble use with a fibre-reinforced polymer case meeting MIL-STD-810 durability standards for shock, temperature, and altitude. '
     'Solar charging with the Power Glass lens delivers up to 50 days of battery in solar smartwatch mode. '
     'Multi-GNSS support, ABC sensors (altimeter, barometer, compass), and a monochrome transflective display ensure reliable navigation in any conditions.',
     'GRMN-INST3',
     39990.00, NULL, 23500.00,
     60, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'smartwatches'),
     (SELECT id FROM brands WHERE slug = 'garmin'),
     now(), now()),

-- ======================== AUDIO — SONY (5) ==================================

    (gen_random_uuid(),
     'Sony WH-1100XM7', 'wh-1100xm7',
     'Adaptive AI noise cancellation, 40-hour battery, LDAC — Sony''s flagship over-ear.',
     'The WH-1100XM7 leads the over-ear headphone market with Sony''s most advanced adaptive AI noise cancellation engine that analyses background noise 700 times per second. '
     'LDAC wireless codec delivers Hi-Res Audio Wireless at up to three times the data of standard Bluetooth. '
     'At 40 hours of battery with ANC on and multipoint connection to two devices simultaneously, it is the most complete travel headphone available.',
     'SONY-WH1100XM7',
     34990.00, 39990.00, 20500.00,
     60, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'sony'),
     now(), now()),

    (gen_random_uuid(),
     'Sony WF-1000XM6', 'wf-1000xm6',
     'Flagship earbuds with LDAC, adaptive ANC, and Integrated Processor V2.',
     'The WF-1000XM6 flagship earbuds combine Sony''s best noise cancellation with LDAC Hi-Res Audio Wireless for audiophile-grade listening without cables. '
     'The Integrated Processor V2 simultaneously manages ANC, transparency mode blending, and audio upscaling in real time. '
     'Speak-to-Chat pauses music automatically when you speak, and Quick Charge gives 3 hours of playback from just 3 minutes on the case.',
     'SONY-WF1000XM6',
     22990.00, NULL, 13500.00,
     80, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'sony'),
     now(), now()),

    (gen_random_uuid(),
     'Sony LinkBuds Fit', 'linkbuds-fit',
     'Open-ear comfort earbuds with Bluetooth 5.3, 360 Reality Audio, lightweight fit.',
     'The LinkBuds Fit are designed for all-day comfort with an open-ear design that lets in ambient sound naturally while still delivering a rich audio experience. '
     'At just 4.9g per earbud with an ergonomic fit ring, they stay securely in place during workouts without ear fatigue. '
     'Integrated microphone array handles calls clearly, and 360 Reality Audio support creates an immersive spatial sound stage.',
     'SONY-LBFIT',
     14990.00, NULL, 8800.00,
     100, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'sony'),
     now(), now()),

    (gen_random_uuid(),
     'Sony WH-CH720N', 'wh-ch720n',
     'Budget ANC over-ear headphones, 35-hour battery, lightweight design.',
     'The WH-CH720N makes active noise cancellation accessible at an entry-level price without sacrificing core audio quality. '
     'At 192g — one of the lightest ANC headphones available — it is comfortable for long listening sessions at a desk or on a commute. '
     'The 35-hour battery with ANC on and quick charge (3 hours of playback from a 10-minute charge) make it a reliable everyday companion.',
     'SONY-WHCH720N',
     7990.00, NULL, 4700.00,
     150, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'sony'),
     now(), now()),

    (gen_random_uuid(),
     'Sony INZONE H9 II', 'inzone-h9-ii',
     'Planar magnetic gaming headset, wireless, 360 Spatial Sound for Gaming — PS5 and PC.',
     'The INZONE H9 II is Sony''s premium gaming headset, now with planar magnetic drivers for improved detail and imaging accuracy in competitive gaming. '
     '360 Spatial Sound for Gaming uses the game audio to render positional cues with precision on both PC and PlayStation 5. '
     'A boomless beamforming microphone, low-latency 2.4GHz wireless connection, and 40-hour battery make it a top-tier choice for console and PC gamers.',
     'SONY-INZONEH9II',
     19990.00, NULL, 11700.00,
     50, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'sony'),
     now(), now()),

-- ======================== AUDIO — BOSE (5) ==================================

    (gen_random_uuid(),
     'Bose QuietComfort Ultra Headphones (2026)', 'quietcomfort-ultra-headphones-2026',
     'Immersive Audio v2, best-in-class ANC, premium over-ear comfort for long flights.',
     'The 2026 QuietComfort Ultra Headphones build on Bose''s legendary ANC heritage with the new Immersive Audio v2 mode that creates a convincing head-tracked spatial sound stage. '
     'CustomTune 2.0 calibrates both ANC and audio EQ to the unique shape of your ear canals within seconds. '
     'The plush memory foam earcups, foldable design, and USB-C charging make them the definitive long-haul travel headphone.',
     'BOSE-QCUH-2026',
     32900.00, 36900.00, 19400.00,
     55, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'bose'),
     now(), now()),

    (gen_random_uuid(),
     'Bose QuietComfort Ultra Earbuds (2026)', 'quietcomfort-ultra-earbuds-2026',
     'CustomTune 2.0, Immersive Audio, 9-hour battery — Bose''s flagship earbuds.',
     'The 2026 QuietComfort Ultra Earbuds deliver Bose''s best-ever noise cancellation in an earbud form factor with per-ear CustomTune 2.0 calibration. '
     'Immersive Audio mode with head tracking creates a spatial sound experience rivalling dedicated headphones. '
     'Nine hours of battery in the earbuds with 36 hours from the case and IPX4 water resistance round out a highly capable package.',
     'BOSE-QCUE-2026',
     24900.00, NULL, 14700.00,
     65, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'bose'),
     now(), now()),

    (gen_random_uuid(),
     'Bose SoundLink Max', 'soundlink-max',
     'Premium portable Bluetooth speaker, 20-hour battery, IP67, spacious room-filling sound.',
     'The SoundLink Max is Bose''s largest portable speaker, engineered to fill indoor and outdoor spaces with rich, natural sound from dual transducers and a passive radiator. '
     'IP67 protection means it handles rain, dust, and poolside splashes without complaint. '
     'Twenty hours of battery and a built-in power bank function for charging other devices make it the centre of any outdoor gathering.',
     'BOSE-SLMAX',
     18900.00, NULL, 11100.00,
     70, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'bose'),
     now(), now()),

    (gen_random_uuid(),
     'Bose Ultra Open Earbuds 2', 'bose-ultra-open-earbuds-2',
     'Open-ear clip-on design, 7.5-hour battery, fully transparent ambient sound.',
     'The Bose Ultra Open Earbuds 2 use a unique clip-on bangle design that rests on the outer ear without entering the ear canal, preserving full ambient awareness. '
     'The audio output is surprisingly rich and directional for an open design, with Bose audio processing compensating for the open form factor. '
     'At 7.5 hours per charge with 24 hours from the case and IPX4 rating, they are a comfortable all-day companion.',
     'BOSE-UOPEN2',
     19900.00, NULL, 11700.00,
     60, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'bose'),
     now(), now()),

    (gen_random_uuid(),
     'Bose SoundSport Free 2', 'bose-soundsport-free-2',
     'Budget sports earbuds, IPX4, 6-hour battery, secure StayHear Max fit.',
     'The SoundSport Free 2 brings Bose audio quality to the budget sports earbuds segment with IPX4 sweat and weather resistance. '
     'The StayHear Max ear tip design locks securely during intense workouts without causing discomfort over extended wear. '
     'Six hours of playback from the earbuds and a charging case that provides two additional full charges keeps the music going through the longest training blocks.',
     'BOSE-SSFREE2',
     9900.00, NULL, 5800.00,
     120, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'bose'),
     now(), now()),

-- ======================== AUDIO — APPLE (5) =================================

    (gen_random_uuid(),
     'Apple AirPods Pro 3', 'airpods-pro-3',
     'Heart-rate sensing, adaptive audio, H3 chip — the most capable AirPods ever.',
     'AirPods Pro 3 introduce continuous wrist-based heart-rate monitoring during workouts and resting periods without requiring an Apple Watch. '
     'The H3 chip brings adaptive audio that seamlessly blends noise cancellation and transparency based on your environment and activity. '
     'Clinical-grade hearing protection, Conversation Awareness, and Personalised Spatial Audio complete the most comprehensive earbud feature set Apple has released.',
     'AAPL-APP3',
     24900.00, 29900.00, 14700.00,
     90, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple AirPods 5', 'airpods-5',
     'USB-C, adaptive EQ, Personalised Spatial Audio — the everyday AirPods upgrade.',
     'AirPods 5 bring a refined open-ear design with USB-C charging and Personalised Spatial Audio to the standard AirPods lineup. '
     'Adaptive EQ tunes the sound output in real time to the acoustic properties of your ear canals for a consistently rich listening experience. '
     'The MagSafe-compatible case adds wireless charging convenience, and six hours of playback per charge is typical for daily commuting.',
     'AAPL-AP5',
     13900.00, NULL, 8200.00,
     120, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple AirPods Max 2', 'airpods-max-2',
     'Over-ear, lossless audio, H3 chip, custom 40mm dynamic driver — premium Apple audio.',
     'AirPods Max 2 deliver lossless audio over Lightning-free USB-C with a breathtaking custom 40mm dynamic driver developed exclusively by Apple. '
     'The H3 chip enables Personalised Spatial Audio with dynamic head tracking that transforms any stereo content into an immersive spatial experience. '
     'The anodised aluminium earcups, breathable knit mesh canopy headband, and 30-hour battery with ANC make them a serious audiophile option.',
     'AAPL-AMAX2',
     54900.00, NULL, 32500.00,
     30, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple AirPods Pro 3 (Hearing Health Edition)', 'airpods-pro-3-hearing-health',
     'Clinical-grade hearing aid mode, heart-rate sensing — FDA-cleared hearing support.',
     'The AirPods Pro 3 Hearing Health Edition takes the clinical hearing test and hearing aid features and delivers them as an FDA-cleared Class II medical device. '
     'The software-driven hearing aid mode adapts to your audiogram and amplifies speech frequencies precisely, matching the performance of dedicated hearing aids costing far more. '
     'All standard AirPods Pro 3 features — adaptive audio, heart-rate sensing, spatial audio — are included alongside the hearing health capabilities.',
     'AAPL-APP3-HH',
     26900.00, NULL, 15800.00,
     50, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple AirPods 5 (2026 Colours)', 'airpods-5-2026-colors',
     'AirPods 5 in the new 2026 colour range — same great audio, fresh new look.',
     'The AirPods 5 2026 Colours edition offers the full AirPods 5 feature set in a curated range of new hues introduced exclusively for the 2026 lineup. '
     'All specifications are identical to the standard AirPods 5 — USB-C, adaptive EQ, Personalised Spatial Audio, and MagSafe case. '
     'A great option for those who want to coordinate their AirPods with new iPhone and Apple Watch colour options.',
     'AAPL-AP5-2026',
     14900.00, NULL, 8800.00,
     100, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'audio'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

-- ======================== TABLETS — APPLE (5) ===============================

    (gen_random_uuid(),
     'Apple iPad Pro 13" M5', 'ipad-pro-13-m5',
     'Tandem OLED, M5 chip, Apple Pencil Pro 2, Thunderbolt 4 — the pro creative tablet.',
     'The iPad Pro 13-inch with M5 is the world''s most advanced tablet, powered by the M5 chip with a 12-core CPU and 20-core GPU. '
     'The stunning Tandem OLED display combines two OLED panels to achieve 1000 nits sustained brightness with perfect blacks and P3 wide colour. '
     'Apple Pencil Pro 2 support, Thunderbolt 4 with up to 6K external display output, and Apple Intelligence make it a genuine laptop replacement.',
     'AAPL-IPPR13-M5',
     129900.00, 144900.00, 76500.00,
     25, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple iPad Pro 11" M5', 'ipad-pro-11-m5',
     'Tandem OLED, M5 chip, Thunderbolt 4 — pro power in a compact form factor.',
     'The 11-inch iPad Pro with M5 delivers the full pro experience — Tandem OLED, Apple Pencil Pro 2, and Thunderbolt 4 — in a smaller, more portable chassis. '
     'The M5 chip handles video editing, 3D design, music production, and AI-powered creative tools without hesitation. '
     'At under 500g with Wi-Fi 7, it is the ideal compact creative workstation for professionals on the move.',
     'AAPL-IPPR11-M5',
     99900.00, NULL, 58900.00,
     35, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple iPad Air 13" M4', 'ipad-air-13-m4',
     'M4 chip, 13" Liquid Retina, Apple Pencil Pro, up to 1TB — the versatile mid-tier iPad.',
     'The iPad Air 13-inch with M4 hits the sweet spot between performance and value for students and creative professionals. '
     'The large 13-inch Liquid Retina display with P3 wide colour and True Tone is an excellent canvas for drawing, reading, and media. '
     'M4 performance, Apple Pencil Pro support, and up to 1TB of storage make it a capable laptop alternative for many users.',
     'AAPL-IPAIR13-M4',
     79900.00, NULL, 47000.00,
     50, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple iPad Air 11" M4', 'ipad-air-11-m4',
     'M4 chip, 11" Liquid Retina, Apple Pencil Pro — portable productivity tablet.',
     'The iPad Air 11-inch with M4 is the ideal portable productivity tablet for users who want serious performance without the iPad Pro price. '
     'The compact 11-inch Liquid Retina display with P3 colour and 500-nit brightness is sharp and accurate for creative work. '
     'USB-C with USB 3 speeds, Apple Pencil Pro compatibility, and optional 5G make it highly versatile for students and business users.',
     'AAPL-IPAIR11-M4',
     64900.00, NULL, 38200.00,
     70, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

    (gen_random_uuid(),
     'Apple iPad (11th Gen, 2026)', 'ipad-11th-gen-2026',
     'A18 chip, USB-C, 10.9" Liquid Retina — the best entry-level iPad ever made.',
     'The 11th-generation iPad brings the powerful A18 chip and Apple Intelligence to the most affordable iPad in the lineup. '
     'USB-C replaces Lightning for universal cable compatibility and faster data transfer. '
     'A 10.9-inch Liquid Retina display, a 12MP front and rear camera, and excellent battery life make it the perfect first tablet for any age.',
     'AAPL-IP11G-2026',
     34900.00, NULL, 20600.00,
     120, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'apple'),
     now(), now()),

-- ======================== TABLETS — SAMSUNG (5) ============================

    (gen_random_uuid(),
     'Samsung Galaxy Tab S11 Ultra', 'galaxy-tab-s11-ultra',
     '14.6" AMOLED, S Pen included, Snapdragon 8 Elite Gen 5 — Samsung''s largest flagship tablet.',
     'The Galaxy Tab S11 Ultra is the most powerful Android tablet Samsung has ever built, featuring a massive 14.6-inch Dynamic AMOLED 2X display at 120Hz. '
     'The included S Pen with 2.8ms latency makes note-taking and illustration feel remarkably close to paper. '
     'Snapdragon 8 Elite Gen 5, 12GB RAM, and DeX desktop mode transform it into a genuine laptop replacement for Android power users.',
     'SAMS-GTS11U',
     99999.00, 109999.00, 59000.00,
     20, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Tab S11+', 'galaxy-tab-s11-plus',
     '12.4" AMOLED 120Hz, Snapdragon 8 Elite Gen 5, S Pen compatible — premium Android tablet.',
     'The Galaxy Tab S11+ delivers the flagship Samsung tablet experience in a slightly more compact and lighter form than the Ultra. '
     'The 12.4-inch Dynamic AMOLED 2X display at 120Hz is vivid and sharp, and the Snapdragon 8 Elite Gen 5 ensures smooth performance in all apps and games. '
     'Compatible with the S Pen and Book Cover Keyboard for a productive 2-in-1 experience.',
     'SAMS-GTS11P',
     79999.00, 89999.00, 47000.00,
     30, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Tab S11', 'galaxy-tab-s11',
     '11" AMOLED 120Hz, Snapdragon 8 Elite Gen 5, slim and capable mid-size tablet.',
     'The Galaxy Tab S11 offers the core Samsung flagship tablet experience at a more accessible price point. '
     'The 11-inch Dynamic AMOLED 2X display at 120Hz delivers crisp, fluid visuals ideal for media consumption, creative work, and productivity. '
     'The Snapdragon 8 Elite Gen 5 inside handles anything users throw at it, from heavy gaming to multitasking in DeX mode.',
     'SAMS-GTS11',
     59999.00, NULL, 35300.00,
     45, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Tab S11 FE', 'galaxy-tab-s11-fe',
     'Fan Edition tablet with 10.9" display, 8000mAh battery, mid-range value.',
     'The Galaxy Tab S11 FE brings Samsung''s tablet design language and software ecosystem to a more budget-conscious audience. '
     'The 10.9-inch display, 8000 mAh battery, and solid mid-range performance from the Snapdragon 7s Gen 3 make it an excellent student and home-use tablet. '
     'S Pen compatibility and Samsung Knox security are retained even at this price point.',
     'SAMS-GTS11FE',
     34999.00, NULL, 20600.00,
     80, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

    (gen_random_uuid(),
     'Samsung Galaxy Tab A11', 'galaxy-tab-a11',
     'Budget 10.4" tablet, 7040mAh battery, MediaTek Helio G99, essential Android experience.',
     'The Galaxy Tab A11 is Samsung''s entry-level tablet designed for everyday use — web browsing, video streaming, reading, and light gaming. '
     'The 10.4-inch TFT display and 7040 mAh battery deliver a comfortable viewing experience that lasts a full day on a single charge. '
     'A lightweight build and strong software update commitment make it a reliable, long-lasting choice for budget-conscious buyers.',
     'SAMS-GTA11',
     17999.00, NULL, 10600.00,
     150, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'samsung'),
     now(), now()),

-- ======================== TABLETS — MICROSOFT (5) ==========================

    (gen_random_uuid(),
     'Microsoft Surface Pro 12', 'surface-pro-12',
     'Snapdragon X2 Elite or Intel Lunar Lake, 13" OLED, full Windows 11 — the 2-in-1 redefined.',
     'The Surface Pro 12 is Microsoft''s most advanced Surface Pro, available with either Snapdragon X2 Elite for always-connected ARM Copilot+ performance or Intel Lunar Lake for maximum x86 compatibility. '
     'The 13-inch OLED display with HDR and 120Hz ProMotion delivers a vivid, fluid touch and pen experience with the Surface Slim Pen 3. '
     'Full Windows 11 in a tablet form factor with LTE option and all-day battery makes it the ultimate business 2-in-1.',
     'MSFT-SFP12',
     119999.00, 129999.00, 70700.00,
     30, 'ACTIVE', TRUE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'microsoft'),
     now(), now()),

    (gen_random_uuid(),
     'Microsoft Surface Pro 12 (5G)', 'surface-pro-12-5g',
     'Always-connected 5G Surface Pro 12 with Snapdragon X2 Elite, 13" OLED, full Windows 11.',
     'The Surface Pro 12 5G variant adds integrated 5G sub-6GHz connectivity for always-on internet wherever cellular signals reach. '
     'The Snapdragon X2 Elite''s built-in 5G modem eliminates the need for a USB dongle or phone hotspot. '
     'Combined with the 13-inch OLED, Copilot+ AI features, and Surface Slim Pen 3 support, it is the ideal remote work tablet.',
     'MSFT-SFP12-5G',
     134999.00, NULL, 79500.00,
     20, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'microsoft'),
     now(), now()),

    (gen_random_uuid(),
     'Microsoft Surface Laptop Studio 3', 'surface-laptop-studio-3',
     'Convertible tablet-laptop hybrid, 14.4" PixelSense Flow, RTX 4060, creative powerhouse.',
     'The Surface Laptop Studio 3 is Microsoft''s most ambitious device — a convertible laptop that slides into a flat canvas mode for drawing and inking. '
     'The 14.4-inch PixelSense Flow display at 120Hz and RTX 4060 GPU make it the ideal workstation for digital artists, designers, and 3D professionals. '
     'Intel Core Ultra 9 performance with Copilot+ AI acceleration and a large haptic touchpad deliver a premium creative experience in any mode.',
     'MSFT-SFLS3',
     189999.00, NULL, 112000.00,
     15, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'microsoft'),
     now(), now()),

    (gen_random_uuid(),
     'Microsoft Surface Go 5', 'surface-go-5',
     'Compact budget Windows tablet, 10.5" PixelSense, Intel N250, lightweight and portable.',
     'The Surface Go 5 is Microsoft''s most compact and affordable Windows tablet, ideal for students, travellers, and light-duty business users. '
     'The 10.5-inch PixelSense touchscreen delivers sharp text and clear visuals for document work, note-taking, and media. '
     'Full Windows 11 in a 533g device with USB-C and optional LTE connectivity makes it genuinely pocketable productivity.',
     'MSFT-SFGO5',
     49999.00, NULL, 29400.00,
     60, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'microsoft'),
     now(), now()),

    (gen_random_uuid(),
     'Microsoft Surface Pro 12 (Business Edition)', 'surface-pro-12-business',
     'Intel vPro, OLED, Microsoft Intune ready — the enterprise Surface Pro 12.',
     'The Surface Pro 12 Business Edition is built for enterprise deployment with Intel vPro security enabling hardware-level threat protection and remote management. '
     'Microsoft Intune, Azure AD join, and Windows Autopilot support simplify zero-touch deployment across large device fleets. '
     'The 13-inch OLED display, Slim Pen 3 support, and same premium build as the consumer model ensure a top-tier user experience.',
     'MSFT-SFP12-BIZ',
     149999.00, NULL, 88000.00,
     25, 'ACTIVE', FALSE, 0.00, 0,
     (SELECT id FROM categories WHERE slug = 'tablets'),
     (SELECT id FROM brands WHERE slug = 'microsoft'),
     now(), now())

ON CONFLICT (slug) DO NOTHING;


-- ---------------------------------------------------------------------------
-- 4. PRODUCT IMAGES  (one primary placeholder image per product)
--    cloudinary_public_id is omitted → defaults to NULL (see V5 comment)
--    NOT EXISTS guard prevents duplicate primary images on re-run
-- ---------------------------------------------------------------------------
INSERT INTO product_images
    (public_id, product_id, image_url, alt_text, sort_order, is_primary, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.id,
    pi_data.image_url,
    pi_data.alt_text,
    1,
    TRUE,
    now(),
    now()
FROM (VALUES
    -- Smartphones – Apple
    ('iphone-18-pro',            'iPhone 18 Pro',                             'https://placehold.co/800x800?text=iPhone+18+Pro'),
    ('iphone-18',                'iPhone 18',                                 'https://placehold.co/800x800?text=iPhone+18'),
    ('iphone-18-air',            'iPhone 18 Air',                             'https://placehold.co/800x800?text=iPhone+18+Air'),
    ('iphone-17e',               'iPhone 17e',                                'https://placehold.co/800x800?text=iPhone+17e'),
    ('iphone-16-2026-refresh',   'iPhone 16 2026 Refresh',                   'https://placehold.co/800x800?text=iPhone+16'),
    -- Smartphones – Samsung
    ('galaxy-s27-ultra',         'Samsung Galaxy S27 Ultra',                  'https://placehold.co/800x800?text=Galaxy+S27+Ultra'),
    ('galaxy-s27',               'Samsung Galaxy S27',                        'https://placehold.co/800x800?text=Galaxy+S27'),
    ('galaxy-z-fold-7',          'Samsung Galaxy Z Fold 7',                   'https://placehold.co/800x800?text=Galaxy+Z+Fold+7'),
    ('galaxy-z-flip-7',          'Samsung Galaxy Z Flip 7',                   'https://placehold.co/800x800?text=Galaxy+Z+Flip+7'),
    ('galaxy-a57-5g',            'Samsung Galaxy A57 5G',                     'https://placehold.co/800x800?text=Galaxy+A57+5G'),
    -- Smartphones – Google
    ('pixel-10-pro-xl',          'Google Pixel 10 Pro XL',                    'https://placehold.co/800x800?text=Pixel+10+Pro+XL'),
    ('pixel-10-pro',             'Google Pixel 10 Pro',                       'https://placehold.co/800x800?text=Pixel+10+Pro'),
    ('pixel-10',                 'Google Pixel 10',                           'https://placehold.co/800x800?text=Pixel+10'),
    ('pixel-10a',                'Google Pixel 10a',                          'https://placehold.co/800x800?text=Pixel+10a'),
    ('pixel-fold-3',             'Google Pixel Fold 3',                       'https://placehold.co/800x800?text=Pixel+Fold+3'),
    -- Laptops – Apple
    ('macbook-pro-16-m6-max',    'MacBook Pro 16 M6 Max',                    'https://placehold.co/800x800?text=MacBook+Pro+16+M6+Max'),
    ('macbook-pro-14-m6-pro',    'MacBook Pro 14 M6 Pro',                    'https://placehold.co/800x800?text=MacBook+Pro+14+M6+Pro'),
    ('macbook-air-15-m5',        'MacBook Air 15 M5',                        'https://placehold.co/800x800?text=MacBook+Air+15+M5'),
    ('macbook-air-13-m5',        'MacBook Air 13 M5',                        'https://placehold.co/800x800?text=MacBook+Air+13+M5'),
    ('macbook-pro-14-m6-base',   'MacBook Pro 14 M6 Base',                   'https://placehold.co/800x800?text=MacBook+Pro+14+M6'),
    -- Laptops – Dell
    ('xps-16-2026',              'Dell XPS 16 2026',                          'https://placehold.co/800x800?text=Dell+XPS+16'),
    ('xps-14-2026',              'Dell XPS 14 2026',                          'https://placehold.co/800x800?text=Dell+XPS+14'),
    ('dell-alienware-16-aurora', 'Dell Alienware 16 Aurora',                  'https://placehold.co/800x800?text=Alienware+16+Aurora'),
    ('dell-inspiron-15-plus',    'Dell Inspiron 15 Plus',                     'https://placehold.co/800x800?text=Inspiron+15+Plus'),
    ('dell-latitude-7450',       'Dell Latitude 7450',                        'https://placehold.co/800x800?text=Latitude+7450'),
    -- Laptops – ASUS
    ('rog-zephyrus-g16-2026',    'ASUS ROG Zephyrus G16 2026',               'https://placehold.co/800x800?text=ROG+Zephyrus+G16'),
    ('zenbook-duo-2026',         'ASUS Zenbook Duo 2026',                     'https://placehold.co/800x800?text=Zenbook+Duo'),
    ('rog-ally-2',               'ASUS ROG Ally 2',                           'https://placehold.co/800x800?text=ROG+Ally+2'),
    ('vivobook-s16',             'ASUS Vivobook S16',                         'https://placehold.co/800x800?text=Vivobook+S16'),
    ('tuf-gaming-a16',           'ASUS TUF Gaming A16',                       'https://placehold.co/800x800?text=TUF+Gaming+A16'),
    -- Smartwatches – Apple
    ('apple-watch-ultra-3',                  'Apple Watch Ultra 3',                       'https://placehold.co/800x800?text=Watch+Ultra+3'),
    ('apple-watch-series-11',                'Apple Watch Series 11',                     'https://placehold.co/800x800?text=Watch+Series+11'),
    ('apple-watch-se-3',                     'Apple Watch SE 3',                          'https://placehold.co/800x800?text=Watch+SE+3'),
    ('apple-watch-ultra-3-titanium-trail-loop','Apple Watch Ultra 3 Titanium Trail Loop', 'https://placehold.co/800x800?text=Watch+Ultra+3+Trail'),
    ('apple-watch-series-11-nike',           'Apple Watch Series 11 Nike Edition',        'https://placehold.co/800x800?text=Watch+Series+11+Nike'),
    -- Smartwatches – Samsung
    ('galaxy-watch-8-ultra',     'Samsung Galaxy Watch 8 Ultra',              'https://placehold.co/800x800?text=Galaxy+Watch+8+Ultra'),
    ('galaxy-watch-8',           'Samsung Galaxy Watch 8',                    'https://placehold.co/800x800?text=Galaxy+Watch+8'),
    ('galaxy-watch-8-classic',   'Samsung Galaxy Watch 8 Classic',            'https://placehold.co/800x800?text=Galaxy+Watch+8+Classic'),
    ('galaxy-watch-fe-2',        'Samsung Galaxy Watch FE 2',                 'https://placehold.co/800x800?text=Galaxy+Watch+FE+2'),
    ('galaxy-watch-8-lte',       'Samsung Galaxy Watch 8 LTE',                'https://placehold.co/800x800?text=Galaxy+Watch+8+LTE'),
    -- Smartwatches – Garmin
    ('garmin-fenix-9',           'Garmin Fenix 9',                            'https://placehold.co/800x800?text=Garmin+Fenix+9'),
    ('garmin-epix-pro-3',        'Garmin Epix Pro 3',                         'https://placehold.co/800x800?text=Garmin+Epix+Pro+3'),
    ('garmin-venu-4',            'Garmin Venu 4',                             'https://placehold.co/800x800?text=Garmin+Venu+4'),
    ('garmin-forerunner-970',    'Garmin Forerunner 970',                     'https://placehold.co/800x800?text=Forerunner+970'),
    ('garmin-instinct-3',        'Garmin Instinct 3',                         'https://placehold.co/800x800?text=Garmin+Instinct+3'),
    -- Audio – Sony
    ('wh-1100xm7',               'Sony WH-1100XM7',                           'https://placehold.co/800x800?text=WH-1100XM7'),
    ('wf-1000xm6',               'Sony WF-1000XM6',                           'https://placehold.co/800x800?text=WF-1000XM6'),
    ('linkbuds-fit',             'Sony LinkBuds Fit',                         'https://placehold.co/800x800?text=LinkBuds+Fit'),
    ('wh-ch720n',                'Sony WH-CH720N',                            'https://placehold.co/800x800?text=WH-CH720N'),
    ('inzone-h9-ii',             'Sony INZONE H9 II',                         'https://placehold.co/800x800?text=INZONE+H9+II'),
    -- Audio – Bose
    ('quietcomfort-ultra-headphones-2026', 'Bose QuietComfort Ultra Headphones 2026', 'https://placehold.co/800x800?text=QC+Ultra+Headphones'),
    ('quietcomfort-ultra-earbuds-2026',    'Bose QuietComfort Ultra Earbuds 2026',    'https://placehold.co/800x800?text=QC+Ultra+Earbuds'),
    ('soundlink-max',            'Bose SoundLink Max',                        'https://placehold.co/800x800?text=SoundLink+Max'),
    ('bose-ultra-open-earbuds-2','Bose Ultra Open Earbuds 2',                 'https://placehold.co/800x800?text=Ultra+Open+Earbuds+2'),
    ('bose-soundsport-free-2',   'Bose SoundSport Free 2',                    'https://placehold.co/800x800?text=SoundSport+Free+2'),
    -- Audio – Apple
    ('airpods-pro-3',            'Apple AirPods Pro 3',                       'https://placehold.co/800x800?text=AirPods+Pro+3'),
    ('airpods-5',                'Apple AirPods 5',                           'https://placehold.co/800x800?text=AirPods+5'),
    ('airpods-max-2',            'Apple AirPods Max 2',                       'https://placehold.co/800x800?text=AirPods+Max+2'),
    ('airpods-pro-3-hearing-health','Apple AirPods Pro 3 Hearing Health',     'https://placehold.co/800x800?text=AirPods+Pro+3+HH'),
    ('airpods-5-2026-colors',    'Apple AirPods 5 2026 Colours',              'https://placehold.co/800x800?text=AirPods+5+2026'),
    -- Tablets – Apple
    ('ipad-pro-13-m5',           'Apple iPad Pro 13 M5',                      'https://placehold.co/800x800?text=iPad+Pro+13+M5'),
    ('ipad-pro-11-m5',           'Apple iPad Pro 11 M5',                      'https://placehold.co/800x800?text=iPad+Pro+11+M5'),
    ('ipad-air-13-m4',           'Apple iPad Air 13 M4',                      'https://placehold.co/800x800?text=iPad+Air+13+M4'),
    ('ipad-air-11-m4',           'Apple iPad Air 11 M4',                      'https://placehold.co/800x800?text=iPad+Air+11+M4'),
    ('ipad-11th-gen-2026',       'Apple iPad 11th Gen 2026',                  'https://placehold.co/800x800?text=iPad+11th+Gen'),
    -- Tablets – Samsung
    ('galaxy-tab-s11-ultra',     'Samsung Galaxy Tab S11 Ultra',              'https://placehold.co/800x800?text=Tab+S11+Ultra'),
    ('galaxy-tab-s11-plus',      'Samsung Galaxy Tab S11 Plus',               'https://placehold.co/800x800?text=Tab+S11+Plus'),
    ('galaxy-tab-s11',           'Samsung Galaxy Tab S11',                    'https://placehold.co/800x800?text=Galaxy+Tab+S11'),
    ('galaxy-tab-s11-fe',        'Samsung Galaxy Tab S11 FE',                 'https://placehold.co/800x800?text=Tab+S11+FE'),
    ('galaxy-tab-a11',           'Samsung Galaxy Tab A11',                    'https://placehold.co/800x800?text=Galaxy+Tab+A11'),
    -- Tablets – Microsoft
    ('surface-pro-12',           'Microsoft Surface Pro 12',                  'https://placehold.co/800x800?text=Surface+Pro+12'),
    ('surface-pro-12-5g',        'Microsoft Surface Pro 12 5G',               'https://placehold.co/800x800?text=Surface+Pro+12+5G'),
    ('surface-laptop-studio-3',  'Microsoft Surface Laptop Studio 3',         'https://placehold.co/800x800?text=Surface+Laptop+Studio+3'),
    ('surface-go-5',             'Microsoft Surface Go 5',                    'https://placehold.co/800x800?text=Surface+Go+5'),
    ('surface-pro-12-business',  'Microsoft Surface Pro 12 Business',         'https://placehold.co/800x800?text=Surface+Pro+12+Biz')
) AS pi_data(slug, alt_text, image_url)
JOIN products p ON p.slug = pi_data.slug
WHERE NOT EXISTS (
    SELECT 1
    FROM   product_images existing
    WHERE  existing.product_id = p.id
    AND    existing.is_primary  = TRUE
);


-- ---------------------------------------------------------------------------
-- 5. PRODUCT SPECIFICATIONS  (3 key specs per product, 225 rows total)
--    Unique constraint: uk_product_specifications_product_name (product_id, name)
-- ---------------------------------------------------------------------------
INSERT INTO product_specifications
    (public_id, product_id, name, value, sort_order, created_at, updated_at)
SELECT
    gen_random_uuid(),
    p.id,
    ps.spec_name,
    ps.spec_value,
    ps.sort_order,
    now(),
    now()
FROM (VALUES
    -- ── Smartphones – Apple ──────────────────────────────────────────────────
    ('iphone-18-pro',          'Display',       '6.9" ProMotion LTPO OLED 120Hz',    1),
    ('iphone-18-pro',          'Processor',     'A20 Bionic',                         2),
    ('iphone-18-pro',          'Camera',        '200MP main + periscope telephoto',   3),

    ('iphone-18',              'Display',       '6.3" OLED',                          1),
    ('iphone-18',              'Processor',     'A19',                                2),
    ('iphone-18',              'Camera',        '48MP main with Smart HDR 6',         3),

    ('iphone-18-air',          'Display',       '6.1" OLED',                          1),
    ('iphone-18-air',          'Thickness',     '5.5 mm',                             2),
    ('iphone-18-air',          'Processor',     'A19 Pro',                            3),

    ('iphone-17e',             'Display',       '6.1" LCD Liquid Retina',             1),
    ('iphone-17e',             'Processor',     'A18',                                2),
    ('iphone-17e',             'Camera',        '48MP main',                          3),

    ('iphone-16-2026-refresh', 'Display',       '6.1" OLED',                          1),
    ('iphone-16-2026-refresh', 'Processor',     'A18',                                2),
    ('iphone-16-2026-refresh', 'Connectivity',  'USB-C 3.2',                          3),

    -- ── Smartphones – Samsung ───────────────────────────────────────────────
    ('galaxy-s27-ultra',       'Display',       '6.9" 2K Dynamic AMOLED 165Hz',       1),
    ('galaxy-s27-ultra',       'Processor',     'Snapdragon 8 Elite Gen 5',            2),
    ('galaxy-s27-ultra',       'Camera',        '200MP quad-camera array',             3),

    ('galaxy-s27',             'Display',       '6.2" Dynamic AMOLED',                1),
    ('galaxy-s27',             'Processor',     'Exynos 2600',                        2),
    ('galaxy-s27',             'AI',            'Circular photo AI editing',           3),

    ('galaxy-z-fold-7',        'Inner display', '8" foldable AMOLED',                 1),
    ('galaxy-z-fold-7',        'Outer display', '6.3" cover AMOLED',                  2),
    ('galaxy-z-fold-7',        'Processor',     'Snapdragon 8 Elite Gen 5',            3),

    ('galaxy-z-flip-7',        'Cover screen',  '4.1" Super AMOLED',                  1),
    ('galaxy-z-flip-7',        'Inner display', '6.7" FHD+ AMOLED 120Hz',             2),
    ('galaxy-z-flip-7',        'Form factor',   'Clamshell foldable',                 3),

    ('galaxy-a57-5g',          'Camera',        '108MP main with OIS',                1),
    ('galaxy-a57-5g',          'Battery',       '6000 mAh with 45W fast charging',   2),
    ('galaxy-a57-5g',          'Network',       '5G sub-6GHz',                        3),

    -- ── Smartphones – Google ────────────────────────────────────────────────
    ('pixel-10-pro-xl',        'Processor',     'Tensor G5',                          1),
    ('pixel-10-pro-xl',        'AI',            'Gemini Nano on-device',              2),
    ('pixel-10-pro-xl',        'Camera',        'Magic Editor v3 with AI reimagining',3),

    ('pixel-10-pro',           'Display',       '6.3" LTPO OLED 1-120Hz',             1),
    ('pixel-10-pro',           'Processor',     'Tensor G5',                          2),
    ('pixel-10-pro',           'Updates',       '7-year Android OS guarantee',        3),

    ('pixel-10',               'Display',       '6.1" OLED',                          1),
    ('pixel-10',               'Processor',     'Tensor G5',                          2),
    ('pixel-10',               'Updates',       '7-year Android OS guarantee',        3),

    ('pixel-10a',              'Processor',     'Tensor G4a',                         1),
    ('pixel-10a',              'Battery',       '5000 mAh',                           2),
    ('pixel-10a',              'Updates',       '5-year Android OS guarantee',        3),

    ('pixel-fold-3',           'Inner display', '7.6" OLED',                          1),
    ('pixel-fold-3',           'Processor',     'Tensor G5',                          2),
    ('pixel-fold-3',           'AI',            'Gemini Nano on-device',              3),

    -- ── Laptops – Apple ─────────────────────────────────────────────────────
    ('macbook-pro-16-m6-max',  'Chip',          'Apple M6 Max',                       1),
    ('macbook-pro-16-m6-max',  'GPU',           '40-core',                            2),
    ('macbook-pro-16-m6-max',  'Display',       '16.2" Mini-LED Liquid Retina XDR 120Hz', 3),

    ('macbook-pro-14-m6-pro',  'Chip',          'Apple M6 Pro',                       1),
    ('macbook-pro-14-m6-pro',  'GPU',           '20-core',                            2),
    ('macbook-pro-14-m6-pro',  'Battery',       'Up to 22 hours',                    3),

    ('macbook-air-15-m5',      'Chip',          'Apple M5',                           1),
    ('macbook-air-15-m5',      'Cooling',       'Fanless',                            2),
    ('macbook-air-15-m5',      'Battery',       'Up to 18 hours',                    3),

    ('macbook-air-13-m5',      'Chip',          'Apple M5',                           1),
    ('macbook-air-13-m5',      'Weight',        '1.24 kg',                            2),
    ('macbook-air-13-m5',      'Battery',       'Up to 18 hours',                    3),

    ('macbook-pro-14-m6-base', 'Chip',          'Apple M6',                           1),
    ('macbook-pro-14-m6-base', 'CPU',           '10-core',                            2),
    ('macbook-pro-14-m6-base', 'GPU',           '10-core',                            3),

    -- ── Laptops – Dell ──────────────────────────────────────────────────────
    ('xps-16-2026',            'Processor',     'Intel Core Ultra 9 (Panther Lake)',  1),
    ('xps-16-2026',            'GPU',           'NVIDIA RTX 5070',                   2),
    ('xps-16-2026',            'Display',       '16.3" 4K+ OLED touch 120Hz',        3),

    ('xps-14-2026',            'Processor',     'Intel Core Ultra 7',                1),
    ('xps-14-2026',            'GPU',           'NVIDIA RTX 5060',                   2),
    ('xps-14-2026',            'Display',       '14.5" 2.8K OLED 120Hz',             3),

    ('dell-alienware-16-aurora','Processor',    'Intel Core Ultra 9',                1),
    ('dell-alienware-16-aurora','GPU',          'NVIDIA RTX 5080',                   2),
    ('dell-alienware-16-aurora','Display',      '16" QHD+ 240Hz',                   3),

    ('dell-inspiron-15-plus',   'Processor',    'Intel Core Ultra 5',                1),
    ('dell-inspiron-15-plus',   'Display',      '15.6" FHD IPS',                     2),
    ('dell-inspiron-15-plus',   'RAM',          '16GB LPDDR5',                       3),

    ('dell-latitude-7450',      'Processor',    'Intel Core Ultra 7 vPro',           1),
    ('dell-latitude-7450',      'Durability',   'MIL-STD-810H certified',            2),
    ('dell-latitude-7450',      'Security',     'TPM 2.0, IR camera, fingerprint',   3),

    -- ── Laptops – ASUS ──────────────────────────────────────────────────────
    ('rog-zephyrus-g16-2026',  'Processor',     'Intel Core Ultra 9',                1),
    ('rog-zephyrus-g16-2026',  'GPU',           'NVIDIA RTX 5080',                   2),
    ('rog-zephyrus-g16-2026',  'Display',       '16" OLED 240Hz 0.2ms',              3),

    ('zenbook-duo-2026',       'Display',       'Dual 14" OLED 120Hz',                1),
    ('zenbook-duo-2026',       'Processor',     'Intel Core Ultra 7',                2),
    ('zenbook-duo-2026',       'Form factor',   'Detachable dual-screen',            3),

    ('rog-ally-2',             'Processor',     'AMD Ryzen Z2 Extreme',              1),
    ('rog-ally-2',             'Display',       '7" OLED 120Hz HDR',                  2),
    ('rog-ally-2',             'OS',            'Windows 11',                         3),

    ('vivobook-s16',           'Processor',     'Snapdragon X2 Elite',               1),
    ('vivobook-s16',           'Display',       '16" 3.2K OLED 120Hz',               2),
    ('vivobook-s16',           'AI',            'Copilot+ with dedicated NPU',       3),

    ('tuf-gaming-a16',         'Processor',     'AMD Ryzen AI 9',                    1),
    ('tuf-gaming-a16',         'GPU',           'NVIDIA RTX 5060',                   2),
    ('tuf-gaming-a16',         'Display',       '16" FHD 165Hz IPS',                  3),

    -- ── Smartwatches – Apple ────────────────────────────────────────────────
    ('apple-watch-ultra-3',                    'Case',             'Titanium, 100m water resistance',    1),
    ('apple-watch-ultra-3',                    'Health',           'Blood pressure, ECG, SpO2',          2),
    ('apple-watch-ultra-3',                    'GPS',              'Precision dual-frequency multi-band',3),

    ('apple-watch-series-11',                  'Health',           'Hypertension notifications, ECG',    1),
    ('apple-watch-series-11',                  'Chip',             'S11',                                2),
    ('apple-watch-series-11',                  'OS',               'watchOS 12',                         3),

    ('apple-watch-se-3',                       'Health',           'Heart rate, SpO2, crash detection',  1),
    ('apple-watch-se-3',                       'Case',             'Aluminium, IP6X dust / 50m water',  2),
    ('apple-watch-se-3',                       'Battery',          'Up to 18 hours',                    3),

    ('apple-watch-ultra-3-titanium-trail-loop','Case',             'Titanium, 100m water resistance',    1),
    ('apple-watch-ultra-3-titanium-trail-loop','Band',             'Titanium Trail Loop — limited',      2),
    ('apple-watch-ultra-3-titanium-trail-loop','GPS',              'Precision dual-frequency multi-band',3),

    ('apple-watch-series-11-nike',             'Edition',          'Nike Run Club exclusive',            1),
    ('apple-watch-series-11-nike',             'Health',           'Hypertension notifications, ECG',    2),
    ('apple-watch-series-11-nike',             'Extras',           '4 Nike-exclusive watch faces',       3),

    -- ── Smartwatches – Samsung ───────────────────────────────────────────────
    ('galaxy-watch-8-ultra',   'Case',          'Titanium',                           1),
    ('galaxy-watch-8-ultra',   'GPS',           'Dual-frequency multi-band',          2),
    ('galaxy-watch-8-ultra',   'Health',        'Antioxidant index, BP, ECG, BIA',    3),

    ('galaxy-watch-8',         'Health',        'Antioxidant index, BP, ECG, SpO2',   1),
    ('galaxy-watch-8',         'OS',            'One UI Watch 7',                     2),
    ('galaxy-watch-8',         'Battery',       'Up to 40 hours',                    3),

    ('galaxy-watch-8-classic', 'Bezel',         'Physical rotating stainless bezel',  1),
    ('galaxy-watch-8-classic', 'Health',        'ECG, BIA, blood pressure',           2),
    ('galaxy-watch-8-classic', 'Case',          'Stainless steel, 5 ATM + IP68',      3),

    ('galaxy-watch-fe-2',      'Health',        'Heart rate, SpO2, stress',           1),
    ('galaxy-watch-fe-2',      'Battery',       'Up to 40 hours',                    2),
    ('galaxy-watch-fe-2',      'Protection',    'IP68',                               3),

    ('galaxy-watch-8-lte',     'Connectivity',  'LTE + eSIM',                         1),
    ('galaxy-watch-8-lte',     'Health',        'Antioxidant index, BP, ECG, SpO2',   2),
    ('galaxy-watch-8-lte',     'OS',            'One UI Watch 7',                     3),

    -- ── Smartwatches – Garmin ───────────────────────────────────────────────
    ('garmin-fenix-9',         'Power',         'Solar charging glass',               1),
    ('garmin-fenix-9',         'GPS',           'Multi-band SatIQ',                   2),
    ('garmin-fenix-9',         'Battery',       'Up to 90 days smartwatch (solar)',   3),

    ('garmin-epix-pro-3',      'Display',       'Always-on AMOLED touchscreen',       1),
    ('garmin-epix-pro-3',      'GPS',           'Multi-band',                         2),
    ('garmin-epix-pro-3',      'Battery',       'Up to 31 days smartwatch',          3),

    ('garmin-venu-4',          'Display',       'AMOLED',                             1),
    ('garmin-venu-4',          'Health',        'Body Battery, HRV, SpO2, stress',   2),
    ('garmin-venu-4',          'Battery',       'Up to 16 days smartwatch',          3),

    ('garmin-forerunner-970',  'GPS',           'Multi-band SatIQ',                   1),
    ('garmin-forerunner-970',  'Health',        'HRV status, training readiness',     2),
    ('garmin-forerunner-970',  'Features',      'On-wrist maps, incident detection',  3),

    ('garmin-instinct-3',      'Durability',    'MIL-STD-810 certified',             1),
    ('garmin-instinct-3',      'Power',         'Solar Power Glass',                 2),
    ('garmin-instinct-3',      'Battery',       'Up to 50 days (solar mode)',         3),

    -- ── Audio – Sony ────────────────────────────────────────────────────────
    ('wh-1100xm7',             'ANC',           'Adaptive AI noise cancellation',     1),
    ('wh-1100xm7',             'Battery',       '40 hours with ANC',                 2),
    ('wh-1100xm7',             'Codec',         'LDAC Hi-Res Wireless',              3),

    ('wf-1000xm6',             'Type',          'In-ear true wireless',               1),
    ('wf-1000xm6',             'Codec',         'LDAC Hi-Res Wireless',              2),
    ('wf-1000xm6',             'ANC',           'Active noise cancellation',          3),

    ('linkbuds-fit',           'Type',          'Open-ear true wireless',             1),
    ('linkbuds-fit',           'Weight',        '4.9g per earbud',                   2),
    ('linkbuds-fit',           'Connectivity',  'Bluetooth 5.3',                     3),

    ('wh-ch720n',              'Type',          'Over-ear wireless',                  1),
    ('wh-ch720n',              'Battery',       '35 hours with ANC',                 2),
    ('wh-ch720n',              'Weight',        '192g',                               3),

    ('inzone-h9-ii',           'Driver',        'Planar magnetic',                    1),
    ('inzone-h9-ii',           'Wireless',      '2.4GHz low-latency',                2),
    ('inzone-h9-ii',           'Compatibility', 'PC and PlayStation 5',              3),

    -- ── Audio – Bose ────────────────────────────────────────────────────────
    ('quietcomfort-ultra-headphones-2026','Type',     'Over-ear wireless ANC',        1),
    ('quietcomfort-ultra-headphones-2026','ANC',      'CustomTune 2.0 adaptive ANC',  2),
    ('quietcomfort-ultra-headphones-2026','Spatial',  'Immersive Audio v2',           3),

    ('quietcomfort-ultra-earbuds-2026',  'ANC',      'CustomTune 2.0 per-ear calib.', 1),
    ('quietcomfort-ultra-earbuds-2026',  'Battery',  '9 hours per charge',           2),
    ('quietcomfort-ultra-earbuds-2026',  'Spatial',  'Immersive Audio head-tracked',  3),

    ('soundlink-max',          'Type',          'Portable Bluetooth speaker',         1),
    ('soundlink-max',          'Battery',       '20 hours',                          2),
    ('soundlink-max',          'Protection',    'IP67 dust and water resistance',    3),

    ('bose-ultra-open-earbuds-2','Type',        'Open-ear clip-on earbuds',           1),
    ('bose-ultra-open-earbuds-2','Battery',     '7.5 hours per charge',              2),
    ('bose-ultra-open-earbuds-2','Protection',  'IPX4 sweat resistant',              3),

    ('bose-soundsport-free-2', 'Type',          'Sports true wireless earbuds',       1),
    ('bose-soundsport-free-2', 'Battery',       '6 hours per charge',                2),
    ('bose-soundsport-free-2', 'Protection',    'IPX4 sweat and weather resistant',  3),

    -- ── Audio – Apple ───────────────────────────────────────────────────────
    ('airpods-pro-3',          'Chip',          'H3',                                1),
    ('airpods-pro-3',          'Health',        'Continuous heart-rate sensing',      2),
    ('airpods-pro-3',          'Audio',         'Adaptive Audio + Spatial Audio',     3),

    ('airpods-5',              'Charging',      'USB-C + MagSafe wireless',          1),
    ('airpods-5',              'Audio',         'Adaptive EQ + Personalised Spatial', 2),
    ('airpods-5',              'Battery',       '6 hours per charge',                3),

    ('airpods-max-2',          'Driver',        'Custom 40mm dynamic',                1),
    ('airpods-max-2',          'Audio',         'Lossless + Spatial Audio',           2),
    ('airpods-max-2',          'Battery',       'Up to 30 hours with ANC',           3),

    ('airpods-pro-3-hearing-health','Chip',     'H3',                                1),
    ('airpods-pro-3-hearing-health','Health',   'FDA-cleared hearing aid mode',       2),
    ('airpods-pro-3-hearing-health','Audio',    'Adaptive Audio + heart-rate sensing',3),

    ('airpods-5-2026-colors',  'Charging',      'USB-C + MagSafe wireless',          1),
    ('airpods-5-2026-colors',  'Audio',         'Adaptive EQ + Personalised Spatial', 2),
    ('airpods-5-2026-colors',  'Colours',       '2026 exclusive colour range',        3),

    -- ── Tablets – Apple ─────────────────────────────────────────────────────
    ('ipad-pro-13-m5',         'Chip',          'Apple M5 (12-core CPU, 20-core GPU)',1),
    ('ipad-pro-13-m5',         'Display',       '13" Tandem OLED 120Hz ProMotion',   2),
    ('ipad-pro-13-m5',         'Connectivity',  'Thunderbolt 4, Wi-Fi 7',            3),

    ('ipad-pro-11-m5',         'Chip',          'Apple M5',                           1),
    ('ipad-pro-11-m5',         'Display',       '11" Tandem OLED 120Hz',             2),
    ('ipad-pro-11-m5',         'Connectivity',  'Thunderbolt 4, Wi-Fi 7',            3),

    ('ipad-air-13-m4',         'Chip',          'Apple M4',                           1),
    ('ipad-air-13-m4',         'Display',       '13" Liquid Retina P3 True Tone',    2),
    ('ipad-air-13-m4',         'Storage',       'Up to 1TB',                         3),

    ('ipad-air-11-m4',         'Chip',          'Apple M4',                           1),
    ('ipad-air-11-m4',         'Display',       '11" Liquid Retina P3',              2),
    ('ipad-air-11-m4',         'Connectivity',  'USB-C USB 3, Wi-Fi 6E',             3),

    ('ipad-11th-gen-2026',     'Chip',          'Apple A18',                          1),
    ('ipad-11th-gen-2026',     'Display',       '10.9" Liquid Retina 500 nits',       2),
    ('ipad-11th-gen-2026',     'Connectivity',  'USB-C, Wi-Fi 6',                    3),

    -- ── Tablets – Samsung ───────────────────────────────────────────────────
    ('galaxy-tab-s11-ultra',   'Display',       '14.6" Dynamic AMOLED 2X 120Hz',     1),
    ('galaxy-tab-s11-ultra',   'Processor',     'Snapdragon 8 Elite Gen 5',           2),
    ('galaxy-tab-s11-ultra',   'Accessories',   'S Pen included',                    3),

    ('galaxy-tab-s11-plus',    'Display',       '12.4" Dynamic AMOLED 2X 120Hz',     1),
    ('galaxy-tab-s11-plus',    'Processor',     'Snapdragon 8 Elite Gen 5',           2),
    ('galaxy-tab-s11-plus',    'Battery',       '10,090 mAh',                        3),

    ('galaxy-tab-s11',         'Display',       '11" Dynamic AMOLED 2X 120Hz',       1),
    ('galaxy-tab-s11',         'Processor',     'Snapdragon 8 Elite Gen 5',           2),
    ('galaxy-tab-s11',         'Battery',       '8,400 mAh',                         3),

    ('galaxy-tab-s11-fe',      'Display',       '10.9" LCD 90Hz',                    1),
    ('galaxy-tab-s11-fe',      'Processor',     'Snapdragon 7s Gen 3',               2),
    ('galaxy-tab-s11-fe',      'Battery',       '8,000 mAh with 45W charging',       3),

    ('galaxy-tab-a11',         'Display',       '10.4" TFT LCD',                     1),
    ('galaxy-tab-a11',         'Processor',     'MediaTek Helio G99',                2),
    ('galaxy-tab-a11',         'Battery',       '7,040 mAh',                         3),

    -- ── Tablets – Microsoft ─────────────────────────────────────────────────
    ('surface-pro-12',         'Processor',     'Snapdragon X2 Elite / Intel Lunar Lake',1),
    ('surface-pro-12',         'Display',       '13" OLED 120Hz ProMotion',          2),
    ('surface-pro-12',         'OS',            'Full Windows 11',                    3),

    ('surface-pro-12-5g',      'Connectivity',  '5G sub-6GHz integrated',            1),
    ('surface-pro-12-5g',      'Processor',     'Snapdragon X2 Elite',               2),
    ('surface-pro-12-5g',      'Display',       '13" OLED 120Hz',                    3),

    ('surface-laptop-studio-3','Processor',     'Intel Core Ultra 9',                1),
    ('surface-laptop-studio-3','GPU',           'NVIDIA RTX 4060',                   2),
    ('surface-laptop-studio-3','Display',       '14.4" PixelSense Flow 120Hz',       3),

    ('surface-go-5',           'Processor',     'Intel N250',                         1),
    ('surface-go-5',           'Display',       '10.5" PixelSense 1920x1280',        2),
    ('surface-go-5',           'Weight',        '533g',                               3),

    ('surface-pro-12-business','Security',      'Intel vPro hardware-level protection',1),
    ('surface-pro-12-business','Management',    'Microsoft Intune + Autopilot ready', 2),
    ('surface-pro-12-business','Display',       '13" OLED 120Hz ProMotion',          3)

) AS ps(slug, spec_name, spec_value, sort_order)
JOIN products p ON p.slug = ps.slug
ON CONFLICT ON CONSTRAINT uk_product_specifications_product_name DO NOTHING;
