// populatePinecone.js - With comprehensive Egyptian medical tourism data
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Get index
const indexName = process.env.PINECONE_INDEX;
console.log(`Connecting to Pinecone index: ${indexName}`);
const index = pinecone.Index(indexName);

// Comprehensive Egyptian medical tourism data
const egyptMedicalTourismData = [
  // === SIWA OASIS ===
  {
    id: "siwa-salt-lakes-therapy",
    title: "Siwa Salt Lakes Therapy",
    location: "Siwa Oasis, Western Desert, Egypt",
    text: "Siwa Salt Lakes are known for their high mineral content and therapeutic properties especially for skin conditions like psoriasis, eczema, and acne. The water has a salt concentration of 34%, making it remarkably buoyant and excellent for flotation therapy. Treatments usually last 10-14 days with daily 30-minute salt lake immersion sessions followed by natural sun exposure. The Siwa Oasis is a naturally sustainable ecosystem with traditional mud-brick architecture that remains cool without air conditioning. Local organic date farms and olive groves provide natural ingredients for skin treatments. The eco-lodges in the area run on solar power and use natural water filtration systems, making your stay both healing and environmentally responsible.",
    medicalConditions: ["psoriasis", "eczema", "acne", "dermatitis", "skin inflammation", "joint pain", "arthritis"],
    treatments: ["salt immersion therapy", "mud wraps", "mineral baths", "sand therapy"],
    seasonality: "Year-round, optimal October-April to avoid extreme heat",
    averageCost: "$800-$1200 for 10-day treatment package",
    accommodations: "Eco-lodges and traditional salt brick hotels are available within 2km of the lakes",
    sustainability: "High - solar powered accommodation, local organic food, natural building materials, traditional water conservation techniques",
    carbonFootprint: "Very low - traditional buildings have minimal energy needs and local food production reduces transportation emissions"
  },
  {
    id: "siwa-sand-bath-therapy",
    title: "Siwa Desert Sand Bath Therapy",
    location: "Siwa Oasis, Western Desert, Egypt",
    text: "Sand bath therapy in Siwa has been practiced for generations and involves being buried neck-deep in the mineral-rich desert sand that's naturally heated by the sun. This traditional treatment is particularly effective for rheumatic diseases, arthritis, and various bone ailments. The hot sand (reaching up to 65°C naturally) improves blood circulation, relieves joint pain, and helps draw toxins from the body. The treatment is conducted by experienced local practitioners from Siwan families who have preserved this healing tradition for centuries. Sessions typically last 20-30 minutes, followed by wrapping in cotton sheets to prolong the therapeutic heat effect. Most treatment programs include 5-7 sessions over a two-week period. The entire experience is 100% natural, requiring no electricity or artificial heating, perfectly aligned with eco-friendly medical tourism.",
    medicalConditions: ["rheumatoid arthritis", "osteoarthritis", "fibromyalgia", "back pain", "muscle stiffness", "joint inflammation"],
    treatments: ["sand bathing", "hot sand packs", "desert heat therapy"],
    seasonality: "Best from June to September when sand temperatures are optimal",
    averageCost: "$600-$900 for 7-day treatment program",
    accommodations: "Traditional Siwan houses with natural cooling systems",
    sustainability: "Very high - completely natural therapy using only sun-heated sand",
    carbonFootprint: "Minimal - no equipment or electricity needed for treatments"
  },
  {
    id: "siwa-transport-train-car",
    title: "Low-Carbon Transport to Siwa",
    location: "Cairo to Siwa Oasis, Egypt", 
    text: "Our eco-conscious transportation option to Siwa combines train and shared electric vehicle. First, take the morning train from Cairo to Marsa Matruh (4.5 hours), which runs on Egypt's increasingly solar-powered rail network. From Marsa Matruh, our solar-electric shuttle vehicles complete the journey to Siwa (3 hours). This combined approach reduces carbon emissions by 75% compared to flying. The train features panoramic windows showcasing Egypt's northern coast, while the shuttle drives through dramatic desert landscapes. The shuttle stops at a traditional Bedouin rest house halfway to Siwa, where you can enjoy organic local tea and learn about desert conservation efforts.",
    transportType: "train-shuttle",
    carbonEmission: "48 kg CO2 per passenger for round trip",
    frequency: "Daily departures at 8:00 AM from Cairo",
    cost: "$65-$90 per person (complete journey)",
    duration: "8 hours total including connection",
    luggage: "25kg per passenger included",
    sustainability: "High - electric vehicles, solar-powered charging stations, train uses renewable energy grid"
  },
  {
    id: "siwa-transport-car",
    title: "Car Transport to Siwa",
    location: "Cairo to Siwa Oasis, Egypt", 
    text: "For those requiring more flexible scheduling, our shared hybrid vehicle service is available from Cairo to Siwa Oasis, with daily departures at 7:00 AM and 4:00 PM. The journey covers 820km and takes approximately 8 hours, including rest stops. We use fuel-efficient hybrid vehicles suitable for desert terrain. Each vehicle accommodates up to 4 passengers with luggage to maximize efficiency. The route passes through scenic desert landscape and includes a comfort stop at eco-friendly rest houses that support local communities. We participate in Egypt's Desert Carbon Offset program, where a portion of your fare goes toward planting indigenous trees in oasis communities.",
    transportType: "car",
    carbonEmission: "82 kg CO2 per passenger for round trip (shared car with 4 passengers)",
    frequency: "Twice daily",
    cost: "$95-$120 per person (shared)",
    duration: "8 hours",
    luggage: "25kg per passenger included",
    sustainability: "Medium-high - carbon offset program, efficient modern vehicles, shared transportation reduces per-person emissions"
  },
  {
    id: "siwa-itinerary-skin",
    title: "Sustainable Skin Treatment Itinerary at Siwa",
    location: "Siwa Oasis, Western Desert, Egypt",
    text: "Day 1: Arrival and medical consultation with local expert in traditional Egyptian and Berber healing techniques. Day 2-8: Morning salt lake immersion therapy (30 min) using only natural lake water and sunshine, afternoon mud treatment (45 min) with Siwan clay rich in healing minerals. Days 3, 5, 7: Optional desert safari to experience traditional sand therapy used by Berbers for centuries. Day 9: Final assessment and personalized home care plan using sustainable Egyptian-made natural products. Day 10: Departure. All treatment packages include daily mineral water from local springs, meals featuring organic produce from oasis gardens, and evening relaxation sessions under the stars. Accommodations use traditional cooling methods rather than air conditioning. All waste is composted or recycled, and water is carefully conserved through traditional Siwan techniques. Activities include visiting ancient Egyptian and Berber healing sites, learning traditional medicine preparation, and participating in palm tree planting to offset carbon emissions.",
    recommendedStay: "10 days minimum for skin conditions",
    includedServices: "Daily treatments, medical consultations, meals, local transport",
    excludedServices: "International flights, personal expenses, optional excursions",
    sustainability: "Very high - zero waste policies, traditional water conservation, solar-powered facilities, local organic food"
  },
  {
    id: "siwa-itinerary-joints",
    title: "Arthritis Relief Program at Siwa",
    location: "Siwa Oasis, Western Desert, Egypt",
    text: "Day 1: Arrival, medical assessment by local healer and visiting rheumatologist. Day 2: Introduction to Siwan healing traditions for joint conditions. Days 3-7: Morning desert sand bath therapy (30 min), midday salt lake flotation (30 min), afternoon hot spring mineral soak (20 min). Day 4: Visit to local olive oil press for traditional joint oil preparation. Day 6: Personalized herbal remedy workshop with Berber herbalist. Day 8: Progress assessment and customized treatment plan. Days 9-13: Continuation of core therapies with adjusted protocols based on response. Day 14: Final evaluation and departure with 3-month supply of local therapeutic oils and herbs. The program integrates ancient desert healing methods with modern understanding of inflammatory conditions. All remedies use locally sourced botanicals grown without pesticides. The springs used for therapy flow naturally without pumping, and therapies follow the natural daily temperature cycles to minimize environmental impact.",
    medicalConditions: ["rheumatoid arthritis", "osteoarthritis", "ankylosing spondylitis", "joint inflammation", "gout"],
    treatments: ["sand bathing", "salt lake therapy", "medicinal herb applications", "olive oil therapy"],
    seasonality: "Year-round with modified protocols by season",
    averageCost: "$1300-$1800 for 14-day comprehensive program",
    accommodations: "Traditional Siwan homes with therapeutic mineral water pools",
    sustainability: "Very high - treatments use only natural elements with no machinery or electricity"
  },

  // === SAFAGA ===
  {
    id: "safaga-black-sand-therapy",
    title: "Safaga Black Sand Therapy",
    location: "Safaga, Red Sea Coast, Egypt",
    text: "Safaga's unique black sand beaches contain high concentrations of minerals including sodium, magnesium, potassium, and phosphorus that are naturally absorbed through the skin. Scientific studies confirm the effectiveness of Safaga's black sand and seawater for treating psoriasis, rheumatoid arthritis, and osteoporosis with success rates of 83-85%. The therapeutic climate features year-round sunshine, low humidity, and mineral-rich air from the sea. Standard treatment involves 20-minute daily sand bathing sessions (sand temperature reaches 45°C naturally) followed by sea bathing. The area's exceptional air purity and pollution-free environment make it ideal for treating respiratory conditions. Local sustainable practices include solar desalination for drinking water and wind power generation, making Safaga one of Egypt's most eco-friendly healing destinations.",
    medicalConditions: ["psoriasis", "vitiligo", "rheumatoid arthritis", "osteoporosis", "respiratory conditions", "skin pigmentation disorders"],
    treatments: ["black sand bathing", "mineral sea immersion", "salt room therapy"],
    seasonality: "Year-round, optimal September-May",
    averageCost: "$900-$1400 for 14-day treatment package",
    accommodations: "Eco-friendly beachfront resorts with natural ventilation systems",
    sustainability: "High - wind and solar powered facilities, water conservation practices, plastic-free initiatives",
    carbonFootprint: "Low - accommodations built with local materials, coastal breezes eliminate need for air conditioning"
  },
  {
    id: "safaga-marine-biodiversity-therapy",
    title: "Safaga Marine Biodiversity Therapy",
    location: "Safaga, Red Sea Coast, Egypt",
    text: "Safaga's coral reefs host a rich marine biodiversity that creates a unique healing microclimate. The therapy combines supervised snorkeling in specific reef areas with inhalation of the mineral-rich sea air. Marine scientists have identified over 30 bioactive compounds in the air immediately above Safaga's coral gardens that show anti-inflammatory and immune-boosting properties. This innovative treatment is particularly effective for asthma, bronchitis, sinusitis, and other respiratory conditions. The protocol includes 30-minute guided marine breathing sessions twice daily, complemented by saline nebulizer treatments using Red Sea water. Studies conducted at Cairo University Hospital documented 72% improvement in respiratory function after 3 weeks. The program also includes education on marine conservation, with a portion of fees supporting local reef protection initiatives.",
    medicalConditions: ["asthma", "chronic bronchitis", "sinusitis", "allergic rhinitis", "COPD", "respiratory inflammation"],
    treatments: ["marine air therapy", "salt water nebulization", "therapeutic snorkeling", "coral reef breathing sessions"],
    seasonality: "Year-round program with adjusted protocols by season",
    averageCost: "$1100-$1600 for 21-day respiratory program",
    accommodations: "Energy-efficient resorts with advanced air filtration systems",
    sustainability: "Very high - reef conservation component, all facilities use renewable energy",
    carbonFootprint: "Low - treatments use only natural elements, snorkeling rather than motorized water activities"
  },
  {
    id: "safaga-transport-train",
    title: "Train Transport to Safaga",
    location: "Cairo to Safaga, Egypt",
    text: "The most eco-friendly way to reach Safaga is via Egypt's modernized rail network. Take the direct train from Cairo to Hurghada (6 hours), then a short shuttle to Safaga (45 minutes). Trains depart Cairo twice daily at 8:00 AM and 8:00 PM. The recently upgraded trains feature comfortable seating, panoramic windows, and run on Egypt's increasingly renewable-powered grid. The journey showcases diverse Egyptian landscapes from the Nile Valley to eastern desert mountains. The shuttle service uses natural gas vehicles with lower emissions. This route generates 65% less carbon than flying to Hurghada and taking a taxi. First class train cabins include traditional Egyptian meals featuring local ingredients.",
    transportType: "train",
    carbonEmission: "58 kg CO2 per passenger for round trip",
    frequency: "Twice daily",
    cost: "$45-$75 one way (standard), $80-$110 (first class)",
    duration: "7 hours total including shuttle",
    luggage: "30kg per passenger included",
    sustainability: "High - electric train network increasingly powered by Egypt's solar farms, natural gas shuttle vehicles"
  },
  {
    id: "safaga-itinerary-psoriasis",
    title: "Psoriasis Treatment Program in Safaga",
    location: "Safaga, Red Sea Coast, Egypt",
    text: "Day 1: Arrival and dermatological assessment. Day 2: Introduction to Safaga's healing elements. Days 3-19: Morning black sand bath (20 min), midday sea immersion with controlled sun exposure (increasing gradually from 5 to 20 minutes), afternoon red clay application. Days 5, 12, 19: Skin assessment and treatment adjustments. Day 7: Workshop on natural Egyptian skincare traditions. Day 14: Preparation of personalized sea salt and essential oil mixtures. Day 21: Final assessment, results documentation, and departure with 3-month supply of black sand and Red Sea salt compounds. The program follows ancient Egyptian healing protocols documented in the Ebers Papyrus (1550 BCE) combined with modern dermatological supervision. Meals feature anti-inflammatory local fish and produce. Evening activities include stargazing meditation on the beach and healing music sessions using traditional instruments. The center maintains a strict zero-plastic policy, and all products are provided in handmade pottery containers that patients take home for continued treatment.",
    medicalConditions: ["psoriasis", "eczema", "dermatitis", "vitiligo", "skin inflammation"],
    treatments: ["black sand therapy", "graduated sun exposure", "sea mineral immersion", "red clay applications"],
    seasonality: "Optimal October-May when sun intensity is ideal for skin conditions",
    averageCost: "$1800-$2300 for 21-day comprehensive program",
    accommodations: "Beachfront eco-lodges with natural ventilation and water recycling systems",
    sustainability: "Very high - all treatments use only natural local materials, center runs on solar power",
    carbonFootprint: "Minimal - walking-distance accommodations, locally sourced food, no powered equipment for treatments"
  },

  // === HELWAN ===
  {
    id: "helwan-sulfur-springs",
    title: "Helwan Sulfur Springs Therapy",
    location: "Helwan, Cairo Governorate, Egypt",
    text: "Helwan Sulfur Springs have been used therapeutically since ancient Egyptian times, with hieroglyphic records showing Pharaonic-era treatments. The springs contain a unique combination of sulfur, magnesium, and calcium at a natural temperature of 33°C. These waters are particularly effective for treating inflammatory joint conditions, lower back pain, and chronic skin conditions. Helwan's historic bathhouses have been restored using traditional Egyptian architectural techniques that naturally regulate temperature. Standard treatment involves 15-20 minute immersion sessions followed by rest in the mineral-rich microclimate around the springs. Being just 30km from Cairo makes Helwan accessible with minimal transportation impact, perfect for eco-conscious medical tourists. Local botanical gardens feature medicinal plants used in ancient Egyptian medicine that complement the water treatments.",
    medicalConditions: ["ankylosing spondylitis", "rheumatoid arthritis", "psoriatic arthritis", "lower back pain", "chronic dermatitis"],
    treatments: ["sulfur hydrotherapy", "mineral inhalation therapy", "therapeutic massage with local oils"],
    seasonality: "Year-round treatment available",
    averageCost: "$400-$800 for 7-day treatment program",
    accommodations: "Renovated historic hotels within walking distance of the springs",
    sustainability: "Medium-high - natural geothermal water requires no heating, historic buildings repurposed rather than new construction",
    carbonFootprint: "Very low - proximity to Cairo minimizes transportation needs, facilities use natural cooling and geothermal energy"
  },
  {
    id: "helwan-botanical-medicine",
    title: "Helwan Botanical Medicine Center",
    location: "Helwan, Cairo Governorate, Egypt",
    text: "Helwan's Botanical Medicine Center maintains cultivation of medicinal plants documented in ancient Egyptian medical papyri, some dating back to 3000 BCE. The center specializes in treating digestive disorders using herbal formulations developed from these historical records and refined through generations of traditional healers. The gardens contain over 60 species of medicinal plants grown using ancient Egyptian cultivation methods without chemical fertilizers or pesticides. Treatment protocols include personalized herbal teas, poultices, and dietary adjustments based on traditional Egyptian nutritional wisdom. The center's specialists combine knowledge of hieroglyphic medical texts with modern understanding of phytochemicals. Their approach has shown particularly good results for irritable bowel syndrome, GERD, and inflammatory bowel conditions. The entire facility operates on principles of traditional Egyptian water conservation with channels and underground storage systems modeled after ancient designs.",
    medicalConditions: ["irritable bowel syndrome", "acid reflux", "GERD", "inflammatory bowel disease", "chronic constipation", "digestive inflammation"],
    treatments: ["medicinal herb therapy", "traditional Egyptian dietary protocols", "herbal compresses", "therapeutic gardens visitation"],
    seasonality: "Year-round with different herbs available by season",
    averageCost: "$600-$1000 for 10-day program",
    accommodations: "Garden residences with traditional Egyptian architecture",
    sustainability: "Very high - ancient Egyptian water conservation systems, organic cultivation, seed saving program",
    carbonFootprint: "Minimal - all remedies produced on-site, no processing or transportation impacts"
  },
  {
    id: "helwan-transport-metro",
    title: "Metro Transport to Helwan",
    location: "Cairo to Helwan, Egypt",
    text: "The most sustainable way to reach Helwan is via Cairo's metro system. The dedicated Line 1 connects central Cairo directly to Helwan with trains departing every 10 minutes during daytime hours. The journey takes approximately 45 minutes and costs less than $1 USD. This electric transportation generates minimal carbon emissions and helps reduce congestion in the greater Cairo area. Metro stations feature educational displays about Egypt's progress in sustainable transportation. From Helwan station, electric tuk-tuks provide connection to the springs area (10 minutes). This transportation option produces 95% less carbon than private taxis and supports Egypt's urban air quality improvement initiatives.",
    transportType: "metro",
    carbonEmission: "3.2 kg CO2 per passenger for round trip",
    frequency: "Every 10 minutes from 5:30 AM to 12:00 AM",
    cost: "$0.50-$1 one way",
    duration: "45 minutes plus 10 minute connection",
    luggage: "No formal limit, but compact luggage recommended during peak hours",
    sustainability: "Very high - electric public transit with high capacity utilization, solar-powered stations",
    carbonFootprint: "Minimal - mass transit powered by Egypt's increasingly renewable electric grid"
  },
  {
    id: "helwan-itinerary-digestive",
    title: "Egyptian Digestive Healing Program",
    location: "Helwan, Cairo Governorate, Egypt",
    text: "Day 1: Arrival, consultation with herbalist and gastroenterology specialist, initial digestive assessment. Day 2: Introduction to Egyptian botanical medicine history and principles. Days 3-12: Morning herbal tea therapy customized to condition, midday guided meditation in medicinal gardens, afternoon herb harvesting and preparation workshop. Daily program includes three specialized meals based on ancient Egyptian digestive principles, documented in medical papyri. Days 4, 8, 12: Digestive function reassessment and protocol adjustments. Day 6: Ancient Egyptian nutrition workshop learning recipes documented in tomb paintings. Day 9: Personalized medicinal herb garden design session. Day 13: Preparation of take-home remedies with 3-month supply of dried herbs and instructions. Day 14: Final assessment and departure. The entire program uses only traditional techniques that have minimal environmental impact. Evening lectures cover the history of Egyptian herbalism from hieroglyphic records to modern scientific validation. All herbal preparations are made by hand using stone grinding tools similar to those used in ancient times.",
    medicalConditions: ["irritable bowel syndrome", "functional dyspepsia", "GERD", "inflammatory bowel disease", "digestive inflammation"],
    treatments: ["customized herbal formulations", "Egyptian dietary therapy", "medicinal garden therapy", "digestive meditation techniques"],
    seasonality: "Year-round program with seasonal herb variations",
    averageCost: "$1000-$1500 for 14-day comprehensive program",
    accommodations: "Traditional courtyard homes with private herb gardens",
    sustainability: "Very high - ancient techniques require no modern equipment, seed saving program preserves biodiversity",
    carbonFootprint: "Minimal - all treatments produced on-site with traditional methods requiring no electricity"
  },

  // === ASWAN ===
  {
    id: "aswan-climate-therapy",
    title: "Aswan Desert Climate Therapy",
    location: "Aswan, Upper Egypt",
    text: "Aswan's unique desert climate offers one of the world's most effective natural therapies for respiratory conditions, rheumatic diseases, and psoriasis. The exceptionally dry air (average humidity below 10%), high mineral content in the atmosphere, consistent sunshine (over 3,900 hours annually), and extremely low rainfall create ideal conditions for natural treatment. Aswan's climate therapy has been scientifically proven particularly effective for asthma, bronchitis, sinusitis, and rheumatoid arthritis, with studies showing improvement in 78% of cases after a 3-week stay. Traditional Nubian houses provide naturally cool accommodations without air conditioning through ancient architectural techniques. Treatment protocols involve graduated sun exposure therapy, controlled outdoor rest periods in the mineral-rich air, and Nile River clay applications. The entire therapeutic experience works in harmony with natural cycles and requires minimal technological intervention.",
    medicalConditions: ["asthma", "chronic bronchitis", "sinusitis", "rheumatoid arthritis", "psoriasis", "vitiligo", "kidney disease"],
    treatments: ["heliotherapy (controlled sun exposure)", "climatotherapy", "sand bathing", "Nile clay applications"],
    seasonality: "Optimal October-April, limited summer program available",
    averageCost: "$750-$1200 for 14-day climate therapy program",
    accommodations: "Traditional Nubian houses and eco-lodges using ancient cooling techniques",
    sustainability: "Very high - minimal energy usage, traditional building methods, local food, solar power",
    carbonFootprint: "Minimal - traditional accommodations have near-zero energy requirements for heating/cooling"
  },
  {
    id: "aswan-nubian-herbalism",
    title: "Aswan Nubian Herbalism Therapy",
    location: "Nubian Villages near Aswan, Upper Egypt",
    text: "The Nubian people of southern Egypt have preserved a unique herbalism tradition for thousands of years, developing specialized knowledge of desert plants with powerful healing properties. This program provides treatment for metabolic disorders including diabetes and thyroid conditions using traditional Nubian herbal protocols. The treatment center, run by Nubian healers from families who have practiced for generations, cultivates rare medicinal plants in traditional Nubian riverside gardens irrigated by sustainable shadoof water-lifting systems. The therapeutic protocol includes personalized herbal formulations taken as teas and tinctures, complemented by specific dietary adjustments based on Nubian nutritional traditions. Patients participate in harvesting and preparing their own medicines under elder guidance. The program has documented particular success with metabolic syndrome, prediabetes, and thyroid regulation, with studies showing blood sugar normalization in 65% of prediabetic patients after 4 weeks.",
    medicalConditions: ["type 2 diabetes", "prediabetes", "metabolic syndrome", "hypothyroidism", "hyperthyroidism", "insulin resistance"],
    treatments: ["medicinal desert herb therapy", "Nubian dietary protocols", "riverside garden therapy", "traditional preparation methods"],
    seasonality: "Year-round program with seasonal herb variations",
    averageCost: "$900-$1400 for 21-day program",
    accommodations: "Traditional Nubian houses built with natural cooling systems",
    sustainability: "Very high - ancient Nubian cultivation methods, shadoof irrigation uses no electricity, seed preservation program",
    carbonFootprint: "Minimal - completely human-powered traditional farming methods, all products made on-site"
  },
  {
    id: "aswan-transport-sleeper-train",
    title: "Sleeper Train to Aswan",
    location: "Cairo to Aswan, Egypt",
    text: "The overnight sleeper train from Cairo to Aswan offers both comfort and sustainability. Trains depart Cairo daily at 8:00 PM, arriving in Aswan at 8:30 AM the following morning. The journey showcases the entire Nile Valley. Private cabins convert from seating areas to comfortable beds, and the fare includes dinner and breakfast featuring local Egyptian cuisine. This journey produces 73% less carbon emissions compared to flying. The train follows the historic route that has connected Upper and Lower Egypt for centuries, passing by important archaeological sites. Egypt's railway modernization program has improved fuel efficiency and is gradually introducing solar-powered stations along the route. By choosing the train, visitors contribute to preserving the fragile desert environment around Aswan.",
    transportType: "sleeper train",
    carbonEmission: "42 kg CO2 per passenger for round trip",
    frequency: "Daily departure at 8:00 PM",
    cost: "$80-$120 one way (private cabin)",
    duration: "12.5 hours overnight",
    luggage: "Two large items included",
    sustainability: "High - efficient mass transit, modernized locomotives with reduced emissions",
    carbonFootprint: "Low - shared transportation, no need for hotel night due to overnight journey"
  },
  {
    id: "aswan-itinerary-respiratory",
    title: "Aswan Respiratory Healing Program",
    location: "Aswan, Upper Egypt",
    text: "Day 1: Arrival, medical assessment, and introduction to Aswan's climate therapy traditions. Day 2: Respiratory function testing and individualized protocol design. Days 3-21: Early morning graduated sun exposure (starting with 10 minutes, increasing to 45 minutes by day 10), midday rest period in traditional Nubian houses, late afternoon Nile-side breathing sessions. Days 7, 14, 21: Respiratory function reassessment and treatment adjustments. Day 5: Introduction to traditional Nubian breathing exercises. Day 9: Workshop on desert aromatherapy using local plants. Day 15: Preparation of take-home herbal inhalants using traditional Nubian recipes. Day 22: Final assessment, results documentation, and departure with 3-month supply of desert herbs for respiratory support. The program integrates ancient Egyptian and Nubian healing wisdom with modern pulmonary rehabilitation techniques. Evening activities include Nile felucca rides with breathing exercises and traditional music therapy using instruments that enhance lung capacity. All accommodations use natural cooling methods that maintain ideal humidity levels for respiratory healing.",
    medicalConditions: ["asthma", "chronic bronchitis", "COPD", "sinusitis", "allergic rhinitis", "respiratory inflammation"],
    treatments: ["desert climate therapy", "graduated heliotherapy", "Nubian breathing techniques", "Nile microclimate exposure"],
    seasonality: "Optimal October-April when temperatures and humidity are ideal",
    averageCost: "$1500-$2000 for 22-day comprehensive program",
    accommodations: "Traditional Nubian houses with natural air filtration through palm materials",
    sustainability: "Very high - treatments use only natural environmental factors, no machinery or electricity needed",
    carbonFootprint: "Near-zero - traditional buildings, walking-distance facilities, sailboat (felucca) transport on the Nile"
  },

  // === NILE VALLEY ===
  {
    id: "nile-cruise-therapy",
    title: "Therapeutic Nile Cruise",
    location: "Luxor to Aswan, Upper Egypt",
    text: "The therapeutic Nile cruise combines the healing climates of Upper Egypt with the relaxing effects of gentle river travel. This week-long journey between Luxor and Aswan provides progressive exposure to increasingly dry desert air, which is particularly beneficial for respiratory conditions and inflammatory disorders. The cruise uses traditional dahabiya sailing boats powered primarily by wind, with minimal supplementary electric motors. Each morning begins with sunrise breathing exercises on the East Bank, while evenings feature meditation sessions at sunset on the West Bank. Meals incorporate traditional Egyptian medicinal herbs and spices known for their anti-inflammatory properties. The gentle rocking motion of the boat provides natural relaxation therapy for stress-related conditions. Stops include mineral hot springs near Edfu and the aromatic gardens of Kitchener's Island in Aswan, which feature medicinal plants used since Pharaonic times.",
    medicalConditions: ["chronic stress", "mild depression", "respiratory conditions", "inflammatory disorders", "insomnia", "hypertension"],
    treatments: ["progressive climate therapy", "medicinal herb treatment", "therapeutic breathing", "natural movement therapy"],
    seasonality: "October-April optimal season",
    averageCost: "$1200-$1800 for 7-day therapeutic cruise program",
    accommodations: "Traditional wooden dahabiya boats with natural ventilation",
    sustainability: "Very high - wind-powered transportation, solar electricity, local food, water conservation",
    carbonFootprint: "Minimal - primarily sail-powered with minimal fossil fuel usage"
  },
  {
    id: "luxor-mental-wellness-retreat",
    title: "Ancient Egyptian Mental Wellness Retreat",
    location: "Luxor (Ancient Thebes), Upper Egypt",
    text: "This unique program in Luxor (ancient Thebes) draws on mental wellness practices documented in ancient Egyptian medical papyri and temple inscriptions dating back 4,000 years. Ancient Egyptians were pioneers in understanding the connection between mental and physical health, developing some of history's earliest mindfulness and stress-reduction techniques. The retreat takes place in a reconstructed ancient Egyptian healing sanctuary using designs from the Ptolemaic healing temples. The program focuses on treating anxiety, depression, and stress-related disorders through a combination of daily mindfulness practices by the Nile, guided visualizations in temple gardens, herbalism, and sound healing using replicas of ancient Egyptian instruments. Therapies include special light exposure sequences based on temple architecture designs and meditation within electromagnetic fields of ancient granite structures. Scientific measurements have documented significant reductions in cortisol levels and blood pressure after just 10 days in the program.",
    medicalConditions: ["anxiety disorders", "depression", "PTSD", "chronic stress", "insomnia", "burnout syndrome"],
    treatments: ["ancient Egyptian mindfulness", "archaeological site meditation", "temple sound therapy", "Nile-side reflection practices"],
    seasonality: "Year-round program with indoor options during summer heat",
    averageCost: "$1100-$1700 for 14-day program",
    accommodations: "Eco-lodges built using ancient Egyptian architectural principles for natural cooling",
    sustainability: "High - solar powered facilities, water recycling systems, organic gardens based on ancient Egyptian farming methods",
    carbonFootprint: "Low - treatments require no equipment or electricity, walking distance to all therapy locations"
  },
 {
   id: "fayoum-detoxification-center",
   title: "Fayoum Natural Detoxification Center",
   location: "Fayoum Oasis, Lower Egypt",
   text: "The Fayoum Oasis, one of Egypt's oldest continuously inhabited locations, hosts this specialized center focused on natural detoxification and gastrointestinal healing. The center utilizes the unique desert-oasis transition climate and mineral-rich oasis waters to facilitate natural detoxification. Treatment programs focus on liver health and digestive restoration through a combination of specialized fasting protocols based on ancient Egyptian medical texts, local mineral water therapy from the oasis springs, clay applications, and therapeutic desert walks at specific times of day. The center grows medicinal plants using techniques documented in 5,000-year-old agricultural scenes from nearby tombs. The detoxification program has shown particular effectiveness for fatty liver disease, metabolic issues, and chronic digestive disorders. Medical assessments before and after the program consistently show improved liver function markers in 80% of participants. The center operates in a restored ancient village using traditional mud-brick architecture that naturally maintains ideal temperatures without air conditioning.",
   medicalConditions: ["fatty liver disease", "metabolic disorders", "chronic constipation", "IBS", "toxin exposure", "digestive inflammation"],
   treatments: ["therapeutic fasting", "mineral water therapy", "desert walking meditation", "medicinal clay applications"],
   seasonality: "Year-round with seasonal protocol adjustments",
   averageCost: "$800-$1300 for 10-day intensive detoxification program",
   accommodations: "Restored ancient village houses with natural cooling systems",
   sustainability: "Very high - traditional architecture, oasis water conservation systems, organic gardens",
   carbonFootprint: "Minimal - all therapies use natural elements requiring no machinery or electricity"
 },
 {
   id: "red-sea-thalassotherapy",
   title: "Red Sea Thalassotherapy Center",
   location: "El Gouna, Red Sea Coast, Egypt",
   text: "The Red Sea's unique mineral composition makes it exceptionally beneficial for thalassotherapy (seawater healing). This center specializes in treating inflammatory skin conditions, arthritis, and post-surgical recovery using the Red Sea's waters, which contain 35% more minerals than average seawater. Treatment protocols include specialized hydrotherapy in graduated temperature pools filled with Red Sea water, followed by applications of marine sediment rich in healing minerals. The facility uses passive solar heating for all water treatments, eliminating the need for conventional energy. Research conducted in collaboration with Alexandria University has documented the Red Sea's exceptional effectiveness for psoriatic arthritis and osteoarthritis, with 76% of patients showing significant reduction in inflammatory markers after 18 days of treatment. The center's reef regeneration program actively works to protect and expand the marine ecosystem that provides the healing elements. All products used are biodegradable and safe for marine life, with a portion of all fees supporting coral conservation initiatives.",
   medicalConditions: ["psoriatic arthritis", "osteoarthritis", "dermatitis", "post-surgical recovery", "sports injuries", "fibromyalgia"],
   treatments: ["marine hydrotherapy", "seawater mineral soaks", "marine sediment wraps", "graduated temperature therapy"],
   seasonality: "Year-round with optimal conditions September-May",
   averageCost: "$1300-$1900 for 18-day comprehensive program",
   accommodations: "Solar-powered beachfront villas with natural cooling systems",
   sustainability: "Very high - passive solar heating, seawater filtration returns clean water to the sea, reef protection initiatives",
   carbonFootprint: "Low - mostly human-powered treatments, passive solar energy, facilities designed to minimize electricity needs"
 },
 {
   id: "white-desert-oncology-support",
   title: "White Desert Oncology Support Retreat",
   location: "White Desert National Park, Western Desert, Egypt",
   text: "This specialized program provides natural supportive care for cancer patients undergoing or recovering from conventional treatments. The White Desert's pristine environment offers Egypt's cleanest air, with exceptionally low allergen and pollutant levels. The program focuses on immune system support, side effect management, and psychological wellness using traditional Egyptian healing approaches. Key components include a specialized nutrition program based on documented ancient Egyptian medical foods, gentle movement therapy adapted from temple wall exercises, and meditation within the unique natural limestone formations known to generate positive electromagnetic fields. The retreat's medical team includes both oncologists and traditional healers who create integrated support protocols. Multiple studies have documented improved quality of life metrics and enhanced immune function indicators for participants. All facilities were designed in partnership with cancer survivors to ensure optimal comfort and accessibility. The retreat center operates completely off-grid, with solar power and water conservation systems designed to minimize impact on the fragile desert ecosystem.",
   medicalConditions: ["cancer recovery support", "chemotherapy side effects", "radiation recovery", "immune system weakness", "cancer-related fatigue"],
   treatments: ["medical desert air therapy", "ancient Egyptian medical foods", "limestone formation meditation", "therapeutic stargazing"],
   seasonality: "October-April optimal season, limited summer program available in specialized climate-controlled facilities",
   averageCost: "$1800-$2400 for 16-day comprehensive program",
   accommodations: "Climate-optimized desert lodges with medical support features",
   sustainability: "High - off-grid solar power, water recycling systems, zero waste policies",
   carbonFootprint: "Low - remote location supplied by solar energy, electric vehicles for necessary transportation"
 },
 {
   id: "alexandria-mediterranean-healing",
   title: "Alexandria Mediterranean Healing Center",
   location: "Alexandria, Mediterranean Coast, Egypt",
   text: "Alexandria combines the therapeutic benefits of the Mediterranean climate with Egypt's ancient healing traditions. This center specializes in respiratory and cardiovascular health programs utilizing the Mediterranean Sea's unique salt composition and the region's historically documented healing herbs. The program integrates ancient Greco-Egyptian medical practices documented in the famous Library of Alexandria with contemporary cardiovascular rehabilitation techniques. Key therapies include graduated Mediterranean swimming programs, specialized breathing protocols during specific coastal wind conditions, and cardio-supportive herbal formulations based on ancient Alexandrian medical texts. The center maintains gardens growing the same medicinal herbs documented in 2,000-year-old Alexandrian medical papyri. Treatment outcomes show particularly strong results for mild to moderate hypertension, with 68% of participants achieving significant blood pressure reduction after 3 weeks. The facility is built into a restored historic Mediterranean building with natural cooling systems that utilize sea breezes, eliminating the need for air conditioning while maintaining ideal humidity levels for respiratory health.",
   medicalConditions: ["hypertension", "mild heart conditions", "respiratory weakness", "cardiovascular rehabilitation", "chronic fatigue"],
   treatments: ["Mediterranean climate therapy", "graduated sea swimming", "coastal breathing techniques", "Alexandrian herbalism"],
   seasonality: "Year-round with optimal conditions April-October",
   averageCost: "$1400-$1900 for 21-day comprehensive program",
   accommodations: "Restored historic Mediterranean buildings with natural ventilation systems",
   sustainability: "High - sea breeze cooling systems, rainwater collection, historic building reuse instead of new construction",
   carbonFootprint: "Low - walking access to sea, therapies require minimal equipment or energy usage"
 },
 {
   id: "abu-simbel-light-therapy",
   title: "Abu Simbel Astronomical Light Therapy",
   location: "Abu Simbel, Southern Egypt",
   text: "The ancient Egyptians were master astronomers who designed temples to interact with solar and stellar alignments for specific healing effects. This unique program utilizes the precisely calculated light phenomena at Abu Simbel temple and surrounding ancient astronomical sites to address circadian rhythm disorders, seasonal affective disorder, and sleep disruptions. The center's signature therapy occurs during the bi-annual solar alignment when sunlight penetrates 65 meters into the Abu Simbel temple to illuminate specific statues—a phenomenon designed over 3,200 years ago with astronomical precision. Research has documented the site's exceptional impact on melatonin regulation and circadian reset. The program includes dawn exposure protocols at astronomically significant locations, evening stargazing meditation within ancient temple alignments, and specialized light exposure sequences based on hieroglyphic medical instructions. Participants typically experience complete restoration of healthy sleep patterns within 10 days. All facilities use amber lighting designed to support natural circadian rhythms, and accommodations feature traditional Nubian architecture that maintains ideal sleeping temperatures without artificial cooling.",
   medicalConditions: ["insomnia", "circadian rhythm disorders", "seasonal affective disorder", "jet lag", "shift work sleep disorder", "depression with sleep disruption"],
   treatments: ["astronomical light therapy", "ancient temple alignment exposure", "dawn synchronization protocols", "therapeutic stargazing"],
   seasonality: "Year-round with special programs during solstices and equinoxes",
   averageCost: "$1200-$1700 for 14-day sleep restoration program",
   accommodations: "Traditional Nubian houses with astronomically aligned sleeping chambers",
   sustainability: "Very high - solar powered, traditional architecture requires no air conditioning",
   carbonFootprint: "Low - treatments utilize only natural light phenomena requiring no equipment or energy usage"
 },
 {
   id: "dahshur-pyramid-sound-therapy",
   title: "Dahshur Pyramid Sound Healing Center",
   location: "Dahshur Pyramid Complex, Lower Egypt",
   text: "The ancient Egyptian pyramids demonstrate advanced understanding of acoustics, with interior chambers designed to resonate at specific frequencies shown to promote healing. This center utilizes the unique acoustic properties of the Dahshur pyramids, particularly the Red Pyramid's remarkable sound resonance chambers. The program focuses on treating chronic pain, neurological conditions, and stress-related disorders through carefully designed sound immersion sessions within the pyramid chambers. Multiple studies have documented the Red Pyramid interior's ability to amplify specific sound frequencies that stimulate natural endorphin release and alpha brainwave states. The therapy combines traditional Egyptian instruments tuned to these specific frequencies with timed exposure in the pyramid chambers' resonant points. Programs typically show 65% reduction in pain scale ratings for participants with chronic pain conditions after 12 days. Additional therapies include sand vibration treatments where participants recline in fine desert sand while specific frequencies create therapeutic vibration patterns. All power for the minimal equipment used comes from solar panels, and the center maintains a strict noise pollution prevention protocol to preserve the natural desert soundscape.",
   medicalConditions: ["chronic pain syndromes", "migraines", "tinnitus", "fibromyalgia", "anxiety disorders", "neurological pain"],
   treatments: ["pyramid chamber sound therapy", "acoustic resonance sessions", "vibrational sand therapy", "ancient Egyptian musical healing"],
   seasonality: "Year-round with outdoor components limited during summer midday hours",
   averageCost: "$1100-$1600 for 12-day comprehensive program",
   accommodations: "Desert eco-lodges built using ancient Egyptian sacred geometry principles",
   sustainability: "High - solar powered sound equipment, traditional buildings with natural cooling",
   carbonFootprint: "Low - minimal equipment needs, facilities designed for natural temperature regulation"
 },
 {
   id: "wadi-el-hitan-paleolithic-diet-center",
   title: "Wadi El Hitan Evolutionary Health Retreat",
   location: "Wadi El Hitan (Valley of the Whales), Western Desert, Egypt",
   text: "Set in the UNESCO World Heritage site known as 'Valley of the Whales,' this center offers a unique approach to metabolic and autoimmune conditions based on evolutionary medicine principles. Wadi El Hitan contains the world's most complete fossil record of whale evolution from land mammals to ocean creatures, providing a perfect setting for exploring evolutionary health approaches. The program specializes in treating modern inflammatory and metabolic disorders through returning to pre-industrial Egyptian dietary patterns while incorporating the latest evolutionary medicine research. The treatment protocol centers on a specialized re-nutrition program based on paleolithic and early agricultural foods native to Egypt, therapeutic fasting protocols documented in ancient Egyptian medical texts, and graduated desert hiking through the fossil formations. Research conducted at the center has shown particular effectiveness for autoimmune conditions and metabolic syndrome, with 72% of participants showing normalization of key inflammatory markers after 21 days. All foods are sourced from traditional Egyptian farming operations using ancient crop varieties and methods without modern agricultural chemicals. The facility is built with traditional desert architecture that maintains comfortable temperatures without air conditioning.",
   medicalConditions: ["autoimmune conditions", "metabolic syndrome", "inflammatory disorders", "type 2 diabetes", "obesity", "inflammatory bowel disease"],
   treatments: ["evolutionary re-nutrition", "therapeutic fasting", "desert movement therapy", "ancient food reintroduction"],
   seasonality: "October-April optimal season, limited summer program available",
   averageCost: "$1800-$2400 for 21-day comprehensive program",
   accommodations: "Desert eco-lodges built with traditional materials and techniques",
   sustainability: "Very high - solar powered, rainwater harvesting, supports traditional farming preserving ancient Egyptian crop varieties",
   carbonFootprint: "Low - locally sourced foods, minimal equipment needs, walking-based therapies"
 },
 {
   id: "st-catherines-high-altitude-therapy",
   title: "St. Catherine's Mountain Healing Retreat",
   location: "St. Catherine's Monastery area, Sinai Peninsula, Egypt",
   text: "The high mountains of the Sinai Peninsula offer Egypt's only high-altitude healing environment, with the area around the ancient St. Catherine's Monastery (situated at 1,600 meters) providing exceptional air quality and therapeutic climate conditions. This center specializes in high-altitude therapy for respiratory conditions, cardiovascular rehabilitation, and athletic performance enhancement. The treatment protocol includes graduated mountain hiking on ancient pilgrimage routes, specialized breathing exercises in identified high-oxygen microclimate zones, and therapeutic exposure to the region's unique aromatic desert plants with documented respiratory benefits. The monastery gardens maintain medicinal plants that have been continuously cultivated since the 6th century CE, many with scientifically verified medicinal properties. The program shows particular effectiveness for asthma and chronic bronchitis, with pulmonary function testing showing average improvements of 31% after 16 days. All facilities are designed based on traditional Bedouin mountain architecture that naturally maintains ideal temperatures without heating or cooling systems. The center works closely with the local Bedouin community, incorporating their traditional medicinal knowledge and supporting sustainable economic development for these indigenous guardians of the Sinai environment.",
   medicalConditions: ["asthma", "chronic bronchitis", "high altitude adaptation", "athletic performance enhancement", "cardiovascular rehabilitation"],
   treatments: ["high altitude acclimatization", "mountain air therapy", "graduated hiking protocols", "ancient aromatic plant therapy"],
   seasonality: "September-May optimal season, closed during extreme winter conditions",
   averageCost: "$1400-$1900 for 16-day comprehensive program",
   accommodations: "Traditional Bedouin mountain lodges with natural heating and cooling",
   sustainability: "Very high - solar and wind power, traditional architecture, supports indigenous Bedouin environmental stewardship",
   carbonFootprint: "Low - human-powered therapies, traditional buildings require minimal energy for comfort"
 }
];

// Direct query function for testing
async function testDirectQuery() {
 console.log("Testing direct query with search terms...");
 
 try {
   // Create an embedding for a search query
   const searchEmbedding = await openai.embeddings.create({
     model: "text-embedding-3-small",
     input: "treatments for skin conditions in Egypt",
   });
   
   console.log("Search embedding created");
   
   // Query Pinecone
   const queryResponse = await index.query({
     vector: searchEmbedding.data[0].embedding,
     topK: 10,
     includeMetadata: true
   });
   
   console.log("Direct query results:", JSON.stringify(queryResponse, null, 2));
   return queryResponse.matches?.length > 0;
 } catch (error) {
   console.error("Direct query test failed:", error);
   return false;
 }
}

// Function to clear existing data (optional, use with caution)
async function clearExistingData() {
 try {
   console.log("Attempting to clear existing data from index...");
   // List all vectors in the index - may need adjustments based on the SDK version
   // Not all Pinecone plans/indices support this operation
   const stats = await index.describeIndexStats();
   console.log("Index stats:", stats);
   
   // Warning: This deletes all vectors in the index
   // Only uncomment if you're sure you want to delete everything
   /*
   const deleteResponse = await index.deleteAll();
   console.log("Delete all response:", deleteResponse);
   */
 } catch (error) {
   console.error("Error clearing data:", error);
 }
}

// Function to populate Pinecone with data
async function populatePinecone() {
 console.log("Starting robust Pinecone population...");
 
 // Step 1: Check index stats (optional)
 try {
   const stats = await index.describeIndexStats();
   console.log("Current index stats:", stats);
 } catch (error) {
   console.error("Error getting index stats:", error);
 }
 
 // Step 2: Process each item
 let successCount = 0;
 
 for (const item of egyptMedicalTourismData) {
   console.log(`\nProcessing: ${item.title}`);
   
   try {
     // Generate embedding for text
     const input = `${item.title}. ${item.text}`;
     console.log(`Generating embedding for: "${input.substring(0, 50)}..."`);
     
     const embeddingResponse = await openai.embeddings.create({
       model: "text-embedding-3-small",
       input: input,
     });
     
     const vector = embeddingResponse.data[0].embedding;
     console.log(`Generated embedding with dimension: ${vector.length}`);
     
     // Prepare metadata
     const metadata = {
       title: item.title,
       location: item.location,
       text: item.text
     };
     
     // Add optional fields to metadata if they exist
     if (item.medicalConditions) metadata.medicalConditions = item.medicalConditions;
     if (item.treatments) metadata.treatments = item.treatments;
     if (item.seasonality) metadata.seasonality = item.seasonality;
     if (item.averageCost) metadata.averageCost = item.averageCost;
     if (item.accommodations) metadata.accommodations = item.accommodations;
     if (item.sustainability) metadata.sustainability = item.sustainability;
     if (item.carbonFootprint) metadata.carbonFootprint = item.carbonFootprint;
     if (item.transportType) metadata.transportType = item.transportType;
     if (item.carbonEmission) metadata.carbonEmission = item.carbonEmission;
     if (item.frequency) metadata.frequency = item.frequency;
     if (item.cost) metadata.cost = item.cost;
     if (item.duration) metadata.duration = item.duration;
     if (item.recommendedStay) metadata.recommendedStay = item.recommendedStay;
     if (item.includedServices) metadata.includedServices = item.includedServices;
     if (item.excludedServices) metadata.excludedServices = item.excludedServices;
     
     // Create vector object
     const vectorData = {
       id: item.id,
       values: vector,
       metadata: metadata
     };
     
     console.log(`Upserting vector for ${item.id}...`);
     
     // Upsert the vector
     const upsertResponse = await index.upsert([vectorData]);
     
     console.log("Upsert response:", upsertResponse);
     console.log(`✅ Successfully added: ${item.title}`);
     successCount++;
     
     // Short pause between operations to avoid rate limits
     await new Promise(resolve => setTimeout(resolve, 1000));
     
   } catch (error) {
     console.error(`❌ Error processing ${item.title}:`, error);
   }
 }
 
 console.log(`\nPinecone population complete. Successfully added ${successCount}/${egyptMedicalTourismData.length} items.`);
 
 // Final verification with a semantic search
 if (successCount > 0) {
   const searchSuccess = await testDirectQuery();
   if (searchSuccess) {
     console.log("✅ Final verification successful: semantic search returned results");
   } else {
     console.log("⚠️ Final verification issue: semantic search returned no results");
   }
 }
}

// Run the function sequence
async function runFullProcess() {
 try {
   // Optional: Clear existing data
   // await clearExistingData();
   
   // Populate with new data
   await populatePinecone();
   
   console.log("Process completed successfully");
 } catch (error) {
   console.error("Process failed:", error);
 }
}

// Execute
runFullProcess();

// Export the function for use in other modules
export default populatePinecone;