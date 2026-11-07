/**
 * Authentic data for MRDĀ café in Ahmedabad
 * Sourced directly from verified menu books and brand assets in the archive
 */

export interface MenuItem {
  name: string;
  price: number | string;
  description?: string;
  tag?: 'Caffeinated' | 'Non-Caffeinated' | 'Vegan' | 'Vegetarian' | 'Specialty';
}

export interface MenuCategory {
  id: string;
  code: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
}

export const CAFE_DETAILS = {
  name: 'MRDĀ',
  tagline: 'A quiet place for good conversations',
  sanskrit: 'मृदा',
  pronunciation: 'mri-dā',
  meaning: 'Earth; clay; soil.',
  etymologyDescription:
    'Also used to denote that which is grounded, natural, and of the earth, especially in contexts relating to material, craft, or sustenance derived from the soil.',
  address: '6th Floor, Claywalls, Zydus Hospital Road, Opposite Verantes, Thaltej, Ahmedabad, Gujarat 380059, India',
  city: 'Ahmedabad',
  state: 'Gujarat',
  postalCode: '380059',
  country: 'India',
  hours: 'Mon - Sun | 8:00 AM - 10:00 PM',
  email: 'hello@atmrda.com',
  website: 'www.atmrda.com',
  instagram: 'at.mrda',
  instagramUrl: 'https://www.instagram.com/at.mrda/',
  phone: '+91 87996 00369',
  googleMapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=MRDA%2C%206th%20Floor%2C%20Claywalls%2C%20Zydus%20Hospital%20Road%2C%20Opposite%20Verantes%2C%20Thaltej%2C%20Ahmedabad%2C%20Gujarat%20380059%2C%20India',
};

export const HERO_SLIDES = [
  {
    id: 1,
    title: 'The Courtyard',
    image: '/MDRA/images/cafe/cafe-2.jpg',
    fallback: '/MDRA/featured/ref_hero.jpg',
    caption: 'COFFEE / FOOD / PEOPLE / PERSPECTIVE',
    description: 'Terrazzo tables and breeze blocks bathed in morning sun.',
  },
  {
    id: 2,
    title: 'The Inner Room',
    image: '/MDRA/images/cafe/cafe-1.jpg',
    fallback: '/MDRA/featured/ref_visitus.jpg',
    caption: 'SUNLIGHT / SHADOW / SLOW MORNINGS',
    description: 'Natural light spilling through handcrafted wooden pivot frames.',
  },
  {
    id: 3,
    title: 'The Listening Nook',
    image: '/MDRA/images/cafe/cafe-6.jpg',
    fallback: '/MDRA/images/cafe/cafe-3.jpg',
    caption: 'VINYL / ARCHITECTURE / SILENCE',
    description: 'A cozy alcove with vinyl records, art volumes, and stone textures.',
  },
];

export const SPACE_GALLERY = [
  {
    title: 'Sunlit Courtyard',
    subtitle: 'Open-air terrazzo sanctuary',
    image: '/MDRA/images/cafe/cafe-2.jpg',
    category: 'Architecture',
  },
  {
    title: 'The Colonnade Walk',
    subtitle: 'Shadows across terracotta tiles',
    image: '/MDRA/images/cafe/cafe-9.jpg',
    category: 'Perspective',
  },
  {
    title: 'The Brew Bar',
    subtitle: 'Sandstone counter & vintage patina domes',
    image: '/MDRA/images/cafe/cafe-3.jpg',
    category: 'Craft',
  },
  {
    title: 'Rooftop Amphitheatre',
    subtitle: 'Stepped seating looking toward the trees',
    image: '/MDRA/images/cafe/cafe-4.jpg',
    category: 'Gathering',
  },
  {
    title: 'Handcrafted Ceramics',
    subtitle: 'Earthy cups marked with the MRDĀ starburst',
    image: '/MDRA/images/cafe/cafe-5.jpg',
    category: 'Material',
  },
  {
    title: 'Communal Table',
    subtitle: 'Where conversations unfold',
    image: '/MDRA/images/cafe/cafe-8.jpg',
    category: 'Community',
  },
];

export const POURED_MENU: MenuCategory[] = [
  {
    id: 'signatures',
    code: '01',
    title: 'SIGNATURES',
    subtitle: 'Crafted at Mrda, made to remember. What we’ve shaped from scratch where flavour, story, and intent meet.',
    items: [
      { name: 'Orange Jalapeno (The OJ)', price: 360, description: 'Malta orange concentrate, fresh jalapeno, Thai basil & lemon' },
      { name: 'Garden Puff', price: 360, description: 'Fresh cucumber, housemade rosemary cordial, smoked dried rosemary' },
      { name: 'Dal Stock Xchange', price: 390, description: 'If you figure it out, pls let us know' },
      { name: 'Bees & Beans', price: 390, description: 'Single origin espresso, raw unprocessed ajwain honey, tonic water' },
      { name: 'Purple Sea', price: 390, description: 'Steeped lavender buds infused with butterfly pea flowers, macerated pineapple, 100% dairy cream cloud, orange zest' },
      { name: 'Bloody Jasmine', price: 390, description: 'Steeped Jasmine Pearl Tea, fermented Falsa juice, lemon zest, raw & unprocessed Himalayan forest honey, dairy cream cloud' },
      { name: 'Penicillin', price: 390, description: 'Single origin espresso, ginger honey potion, organic raw sugar, housemade soda' },
      { name: 'Espresso Sour', price: 390, description: 'Single origin espresso, housemade mix spice syrup, raw & unprocessed Himalayan forest honey' },
      { name: 'Sun & Soil', price: 390, description: 'Macerated pineapple, housemade fermented pineapple vinegar, coconut water, coconut cream' },
      { name: 'Tonic Mischief', price: 390, description: 'Single origin espresso, rosemary cordial' },
      { name: 'Soul Kaaphi', price: 430, description: 'Inspired by solkadhi, a drink for your soul' },
      { name: 'London Fog', price: 430, description: 'Steeped earl grey tea, organic milk, housemade vanilla bean syrup finished with dried lavender buds' },
      { name: 'Amber Blossom', price: 430, description: 'Lavender tea, raw & unprocessed Himalayan forest honey, organic rock sugar, Italian lemon' },
      { name: 'Oatcino', price: 430, description: 'Single origin espresso, organic coconut sugar & oatmilk' },
    ],
  },
  {
    id: 'slow-brewed',
    code: '02',
    title: 'SLOW BREWED',
    subtitle: 'Built slow, steeped deep. For those who enjoy process in every pour & balance.',
    items: [
      { name: 'Classic Cold Brew', price: 260, description: '18-hour cold steeped single-origin roast' },
      { name: 'Ginger Ajwain Cold Brew', price: 290, description: 'Infused with fresh crushed ginger and carom seeds' },
      { name: 'Cinnamon Honey Cold Brew', price: 290, description: 'Warm Ceylon cinnamon bark with wild forest honey' },
      { name: 'Berry Tissane Cold Brew', price: 330, description: 'Wild berries, hibiscus notes & slow brew' },
      { name: 'Coconut Cold Brew', price: 330, description: 'Layered with tender coconut water' },
      { name: 'Pineapple Cold Brew', price: 330, description: 'Fermented pineapple nectar' },
      { name: 'Experimental Cold Brew', price: 330, description: 'Seasonal fermentation batch — ask your barista' },
      { name: 'V60 Pour Over (Indian Beans)', price: 360, description: 'Precision filtered single estate beans' },
      { name: 'V60 Pour Over (International Beans)', price: 490, description: 'Rotating world micro-lots' },
      { name: 'French Press', price: '360 / 490', description: 'Full-bodied immersion brew' },
      { name: 'UFO Dripper', price: '360 / 490', description: 'Even flat-bottom thermal extraction' },
      { name: 'Vietnamese Phin Filter', price: '360 / 490', description: 'Slow-drip intense extraction' },
      { name: 'Chemex', price: '360 / 490', description: 'Clean, tea-like aromatic cup' },
    ],
  },
  {
    id: 'grounded',
    code: '03',
    title: 'GROUNDED & SHIFTED',
    subtitle: 'We use double-shot single origin espresso for all our drinks.',
    items: [
      { name: 'Ristretto', price: 190, description: 'Short, concentrated single origin extraction' },
      { name: 'Espresso (Hot / Iced)', price: '190 / 210', description: 'Double shot' },
      { name: 'Americano (Hot / Iced)', price: '210 / 230', description: 'Espresso over hot water or ice' },
      { name: 'Cortado (Hot / Iced)', price: '230 / 250', description: 'Equal parts espresso and warm textured milk' },
      { name: 'Cappuccino', price: 260, description: 'Velvety microfoam over double espresso' },
      { name: 'Café Latte (Hot / Iced)', price: '260 / 280', description: 'Smooth, comforting classic' },
      { name: 'Flat White', price: 260, description: 'Thin layer of microfoam, rich double shot' },
      { name: 'Spanish Latte (Hot / Iced)', price: '360 / 390', description: 'Sweetened condensed milk, espresso, fresh milk' },
      { name: 'Vietnamese Shakeratto', price: 360, description: 'Shaken with ice, condensed milk and double espresso' },
      { name: 'Fennel Honey Cortado', price: 360, description: 'Spiced fennel nectar with honey' },
      { name: 'Café Solice', price: 390, description: 'House botanical preparation' },
      { name: 'Affogato', price: 390, description: 'Double espresso poured over artisanal vanilla gelato' },
      { name: 'Mocha (Hot / Iced)', price: '430 / 460', description: '70% dark single origin chocolate' },
    ],
  },
  {
    id: 'matcha-tea',
    code: '04',
    title: 'MATCHA, HOJICHA & TEAS',
    subtitle: 'Ceremonial grade Matcha sourced from Kagoshima. Roasted green teas and fine loose leaves.',
    items: [
      { name: 'Usucha (Matcha)', price: 460, description: 'Traditional thin ceremonial whisked tea' },
      { name: 'Koicha (Matcha)', price: 490, description: 'Rich, thick ceremonial whisked tea' },
      { name: 'Matcha Latte (Hot / Iced)', price: '510 / 530', description: 'Kagoshima matcha whisked with oat or whole milk' },
      { name: 'Matcha Gran', price: 530, description: 'Citrus, tonic and emerald matcha' },
      { name: 'Coconut Matcha Cooler', price: 590, description: 'Tender coconut water, coconut foam, ceremonial matcha' },
      { name: 'Iced Hojicha Latte', price: 360, description: 'Deep smoky aroma & caramelised undertones' },
      { name: 'Sesame Hojicha', price: 390, description: 'Toasted black sesame emulsion with roasted green tea' },
      { name: 'Miso Caramel Hojicha', price: 430, description: 'Savoury sweet miso with roasted tea' },
      { name: 'Earl Grey / Jasmine Pearls', price: '260 / 330', description: 'Second brew is always on the house' },
      { name: 'Nilgiri Platinum Needles', price: 330, description: 'Hand-plucked silver tips' },
    ],
  },
];

export const PLATED_MENU: MenuCategory[] = [
  {
    id: 'daybreak',
    code: '01',
    title: 'DAYBREAK & FRENCH TOASTS',
    subtitle: 'For those who greet the morning with warmth, comfort, and something made slow.',
    items: [
      { name: 'Milk Oats', price: 330, description: 'Rolled oats in wild forest honey milk, topped with banana, frozen berry jam, seeds & coconut' },
      { name: 'Tadka Buttermilk Oats', price: 330, description: 'Ghee tempered buttermilk soaked oats with chia seeds, coriander & pomegranate pearls' },
      { name: 'Anda Bun', price: 360, description: 'Soft bun with egg (Sunnyside / Omelette), aam kasundi, chilli guava butter, roasted sweet potato & slaw' },
      { name: 'Paneer Bhurji Toast', price: 360, description: 'Paneer with peppers, aam kasundi & chilli guava butter with side of toasted sourdough, roasted sweet potato & slaw' },
      { name: 'Tofu Togarashi Chilla', price: 360, description: 'Togarashi spiced silken tofu, organic besan, house pom molasses, pickled veggie ribbons, chilli oil & green cashew cream' },
      { name: 'Moringa Smoothie Bowl', price: 390, description: 'Moringa, pineapple, green apple, banana, coconut cream and spinach' },
      { name: 'Carrot Cake Smoothie Bowl', price: 390, description: 'Carrot juice, dates, banana, vanilla, cinnamon and walnuts' },
      { name: 'Honey Nutmeg French Toast', price: 490, description: 'Wild forest honey, mascarpone cream & nutmeg' },
      { name: 'Strawberry French Toast', price: 490, description: 'House strawberry jam, mascarpone cream' },
      { name: 'Kesar Keri French Toast', price: 530, description: 'Kesar mango compote with mascarpone cream' },
    ],
  },
  {
    id: 'salads-tapas',
    code: '02',
    title: 'SALADS & TAPAS PLATES',
    subtitle: 'Every plate is built around seasonal produce, with enough weight to stand on its own.',
    items: [
      { name: 'Soil & Season Salad', price: 430, description: "Chef-curated fruits of the season, inspired by the earth's freshest offerings" },
      { name: 'Crispy Black Rice Salad', price: 460, description: 'Locally sourced crisped black rice, coconut cream dressing, veggies, roasted peanuts & sweet potato shreds' },
      { name: 'Leafy Salad', price: 430, description: 'Romaine, tomatoes, cucumber, parmesan, aam kasundi dressing' },
      { name: 'Black Bean Tacos', price: 330, description: 'Single-origin black beans, fresh tomato salsa & sour cream in a soft shell corn taco' },
      { name: 'Enoki Mushroom Taco', price: 330, description: 'Enoki, chilli tomato salsa & sour cream in a soft shell corn taco' },
      { name: 'Cold Tofu', price: 330, description: 'Silken tofu, cucumber, spring onion with house peanut sauce & chilli oil' },
      { name: 'Ross Omlette / Tofu', price: 330, description: 'Creamy Goan inspired coconut curry with swirled omelette served with sourdough slice' },
    ],
  },
  {
    id: 'kneaded-gathered',
    code: '03',
    title: 'KNEADED & GATHERED',
    subtitle: 'Freshly baked, torn by hand, and best enjoyed warm with butter, stories, or silence.',
    items: [
      { name: 'BANH MI Tofu', price: 530, description: 'Silken tofu banh mi with pickled veggies, coriander, roasted peanuts, and house sauces' },
      { name: 'BANH MI Mushroom', price: 530, description: 'Marinated shiitake mushroom banh mi with sesame miso, pickled veggies, fresh coriander & peanuts' },
      { name: 'Kimchi Cheese Grilled Sandwich', price: 490, description: 'House-made kimchi, cheddar & mozzarella grilled to perfection in country sourdough' },
      { name: 'Thecha Cheese Grilled Sandwich', price: 490, description: 'House-made thecha, cheddar & mozzarella grilled to perfection in country sourdough' },
      { name: 'Tadka Dahi Shokupan', price: 430, description: 'Toasted shokupan, tadka dahi, spring onion, crunchy garlic' },
      { name: 'Ricotta Platter', price: 490, description: 'Creamy ricotta with house-fermented berries, mustard honey, orange zest & sourdough crackers' },
      { name: 'Artisanal Butter Board', price: 430, description: 'Country sourdough bread with house artisanal butters (herbed butter, cashew miso butter, cacao berry butter)' },
      { name: 'Hummus and Pita', price: 430, description: 'Creamy hummus + olive chimichurri with freshly baked pita, pickled veggies and chilli' },
      { name: 'Rustic Fries', price: 330, description: 'Choice of classic salt & pepper or house blend masala with fermented mango chilli creamcheese' },
    ],
  },
  {
    id: 'sweet-ends',
    code: '04',
    title: 'SWEET ENDS',
    subtitle: 'Slow-made treats to close the meal gently with comfort, craft, and a little wonder.',
    items: [
      { name: 'Tiramisu', price: 530, description: 'Espresso-soaked ladyfingers layered with mascarpone cream & cocoa dust' },
      { name: 'Black Rice Kheer', price: 390, description: 'Slow-cooked black rice in coconut milk topped with kesar keri compote' },
      { name: 'Olive Oil Cake (110 gms)', price: 390, description: 'Fluffy semolina cake made with fragrant olive oil' },
      { name: 'Basque Cheesecake', price: 490, description: 'Creamy cheesecake with vanilla bean and a caramelised crust' },
      { name: 'Burnt Proso Miso Cookie', price: 290, description: 'Frozen berry compote, mascarpone cheese and burnt proso miso cookie' },
      { name: 'Coconut Panna Cotta', price: 290, description: 'Coconut milk & cream set with vanilla bean & raw sugar, topped with house-fermented mulberries' },
      { name: 'Diplomat Caffeine Toast', price: 450, description: 'Baked shokupan drizzled with espresso syrup topped with espresso diplomat' },
      { name: 'Honey Butter Toast', price: 450, description: 'Wild forest honey butter baked shokupan with mascarpone cream' },
    ],
  },
];

export const EVENTS_DATA = [
  {
    id: 'cupping',
    title: 'Single-Origin Coffee Cupping',
    type: 'Tasting & Sensory',
    cadence: 'Alternate Saturdays, 10:00 AM',
    description: 'A guided sensory exploration of 5 micro-lots from Chikmagalur, Araku Valley, and Ethiopia. Learn fragrance, aroma, acidity, and mouthfeel with our head roaster.',
    spots: '10 spots per session',
  },
  {
    id: 'manual-brew',
    title: 'The Art of Manual Brewing',
    type: 'Hands-on Workshop',
    cadence: 'Monthly, Sunday 4:00 PM',
    description: 'Demystifying the V60, Chemex, and Aeropress. Grind geometry, water temperatures, pouring rhythm, and extraction yields for brewing extraordinary coffee at home.',
    spots: '8 spots per session',
  },
  {
    id: 'conversations',
    title: 'Claywalls Salon: Stories from the Soil',
    type: 'Community & Dialogue',
    cadence: 'Third Thursday of the Month, 7:00 PM',
    description: 'An intimate evening gathering at the communal table featuring local ceramists, architects, botanists, and storytellers sharing work inspired by the Ahmedabad earth.',
    spots: 'Open seating',
  },
];
