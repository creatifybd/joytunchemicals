import { careCategories, companyDetails } from './catalogue.js'
export const SITE_URL = 'https://www.joytunchemicals.com'
export const LOCATION = 'Kanchpur, Sonargaon, Narayanganj, Bangladesh.'
export const defaultSite = {
  revision: 0,
  brand: { name: 'Joytun Chemical Industries OPC', shortName: 'Joytun', subtitle: 'CHEMICAL INDUSTRIES OPC', logo: '/images/brand/joytun-logo.png', favicon: '/images/brand/joytun-logo.png', announcement: 'Thoughtful care for everyday living.', footerText: 'A little care makes a difference.\nFor your home. For your everyday.', footerNote: 'Home & personal care, made in Bangladesh.', email: companyDetails.email, phone: companyDetails.phone, location: LOCATION },
  media: {heroImage:'/images/lifestyle/family-home.webp',heroAlt:'A family sharing a relaxed moment at home',storyImage:'/images/lifestyle/hand-washing.webp',storyAlt:'Hands being washed with soap at a clean basin',aboutImage:'/images/lifestyle/family-home.webp',aboutAlt:'Family life at home',contactImage:'/images/lifestyle/hand-washing.webp',contactAlt:'Everyday hand care',showLifestyleImages:true},
  navigation: [{label:'Home',url:'/'},{label:'Our products',url:'/products'},{label:'Our story',url:'/about'},{label:'Contact',url:'/contact'}],
  appearance: { ink:'#24382e', green:'#637b43', lime:'#dce7bf', paper:'#ffffff', headingFont:'Metropolis', bodyFont:'Metropolis', motion:true, radius:12 },
  home: { sectionOrder:['hero','story','categories','featured','ritual','brands','partner'], eyebrow:'HOME & PERSONAL CARE', title:'A little care.\nA better everyday.', accent:'', description:'From freshly washed hands to a home that feels like you. Discover everyday essentials from Joytun, made in Bangladesh.', button:'Explore our collection', buttonUrl:'/products', note:'YOUR HOME. YOUR PEOPLE. OUR CARE.', collectionsTitle:'For all the things\nyou call home.', collectionsText:'Fresh clothes. Clean dishes. Little hand-washing rituals. Find the right care for every part of your day.', featuredTitle:'Good care starts here.', featured:['nolive-apple-green-pump','vix-orange-bottle','aro-detergent','mr-glasso-spray'], ritualTitle:'Make room for\na little freshness.', ritualText:'A familiar fragrance. A freshly washed pair of hands. Sometimes, it’s the smallest moments that make the day feel better.', ritualDetail:'Meet n’Olive in Apple Green, Lavender, Ocean Blue and Gold Fresh. Find your favourite pump bottle and its matching refill.', ritualImages:['nolive-lavender-refill','nolive-lavender-pump'], ritualLink:'/products?category=hand', ritualButton:'Discover n’Olive', storyTitle:'From Bangladesh,\nwith care.', storyText:'We’re Joytun Chemical Industries OPC. Our home and personal care collection brings together the essentials that belong in everyday life, from the laundry room to the kitchen sink.', showBrands:true, showCategories:true, showFeatured:true, showRitual:true, showStory:true },
  slides: [
    {name:'The n’Olive collection',category:'hand',caption:'A refreshing moment, just for you.',color:'#e8eed8',word:'feel good.',images:['nolive-lavender-pump','nolive-apple-green-pump','nolive-ocean-blue-pump']},
    {name:'The Vix collection',category:'kitchen',caption:'Fresh care for the heart of your home.',color:'#f5ead1',word:'shine on.',images:['vix-lemon-refill','vix-orange-bottle','vix-lemon-bottle']},
    {name:'The laundry collection',category:'laundry',caption:'A fresh start for the clothes you love.',color:'#e5e8f3',word:'fresh start.',images:['sharo-detergent','aro-detergent','rio-detergent']}
  ],
  categories: careCategories.map(c=>({...c,status:'active'})),
  products: { eyebrow:'THE JOYTUN COLLECTION',title:'Everyday care.\nFind your kind.',description:'Explore thoughtful essentials for your home, your hands and everything in between.',note:'Something for every part of your day.',usage:'Follow the directions and precautions printed on the packaging. Keep cleaning products out of children’s reach. Do not mix cleaning products. Contact our team if you need more product information.' },
  about: { eyebrow:'THIS IS JOYTUN',title:'Rooted in Bangladesh.\nPart of your everyday.',intro:'We believe care belongs in the everyday. In the clothes you reach for, the meals you share, and the places you call your own.',artTitle:'care comes\nin many forms.',images:['aro-detergent','nolive-apple-green-pump','vix-orange-bottle','layzen-lemon'],storyTitle:'A home feels better\nwith a little care.',lead:'Joytun Chemical Industries OPC is a Bangladesh-based home and personal care company.',paragraph1:'Our collection brings together laundry detergents, hand washes, dish-care essentials, floor cleaners, glass cleaners and toilet care. Different products, with a place in the same everyday routine.',paragraph2:'From Kanchpur, Sonargaon, Narayanganj, Bangladesh, we’re building a family of products around the needs of everyday living.',brandsTitle:'Meet the names\nbehind the care.',purposeTitle:'Everyday essentials.\nA shared purpose.',showBrands:true,showPurpose:true },
  values: [{title:'Care that fits your life.',text:'Build a routine around the products, fragrances and formats that work for your home.'},{title:'More ways to choose.',text:'Discover individual brands for different care needs, with bottle, pouch, spray and bar formats across the collection.'},{title:'Closer to our communities.',text:'Based in Bangladesh, we welcome conversations with retailers and distribution partners who share our interest in everyday care.'}],
  contact: { eyebrow:'GOOD CONVERSATIONS START HERE',title:'Let’s talk\neveryday care.',description:'Questions about a product? A new partnership in mind? We’d love to hear from you.',locationLabel:'Our location',note:'From your home to your business, we’re here to help you find the right care.',formTitle:'How can we help?',faqTitle:'Before you ask.' },
  faqs: [{question:'How can I order Joytun products?',answer:'Open a product in our collection and select “Enquire about this product”. Share your contact details and quantity. Our team will discuss availability and order arrangements with you.'},{question:'Can I become a distribution partner?',answer:'Yes, we welcome distribution and retail enquiries. Select “Distribution partnership” in the form and tell us your business name and area. Our team will discuss the next steps with you.'},{question:'Where can I find product usage information?',answer:'Please refer to the directions and precautions on each product label. If you need more information about a particular product, contact us with the product name and variant.'}],
  partner: { enabled:true,eyebrow:'GROW WITH JOYTUN',title:'Good things happen\nwhen we care together.',description:'Bring the Joytun collection to your customers. Let’s talk about retail, distribution and business enquiries.',button:'Let’s work together',url:'/contact?subject=Distribution' },
  seo: { home:{title:'Home & Personal Care | Joytun Chemical Industries OPC',description:'Explore Joytun home and personal care products, including detergents, hand wash and household cleaners. Made in Kanchpur, Sonargaon, Narayanganj, Bangladesh.'},products:{title:'Our Products | Joytun Home & Personal Care',description:'Discover Aro, Sharo, Rio, n’Olive, Vix, Layzen, Mr. Glasso and T-Flush. Browse Joytun products by care category, fragrance and pack format.'},about:{title:'Our Story | Joytun Chemical Industries OPC',description:'Meet Joytun Chemical Industries OPC, a home and personal care company in Kanchpur, Sonargaon, Narayanganj, Bangladesh.'},contact:{title:'Contact & Distribution | Joytun Chemical Industries OPC',description:'Contact Joytun for product, retail, wholesale and distribution enquiries. Located in Kanchpur, Sonargaon, Narayanganj, Bangladesh.'},image:'/images/brand/joytun-logo.png',indexable:true }
}
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v)
export function mergeSite(saved={}) {
  const merge=(base,value)=>Object.fromEntries(Object.entries(base).map(([k,v])=>[k,plain(v)?merge(v,plain(value?.[k])?value[k]:{}):value?.[k]??v]))
  const site=merge(defaultSite,saved)
  // The company has one approved location. Never revive legacy office addresses.
  site.brand.location=LOCATION
  return site
}
export function safeUrl(value,fallback='/') {
  if(typeof value!=='string')return fallback
  if(/^\/(?!\/)/.test(value)||/^https:\/\/[^\s]+$/i.test(value))return value
  return fallback
}
export const productUrl=p=>`/products/${encodeURIComponent(p.slug||p.id)}`
export function resolveProductImage(value,products=[]) {
  const p=products.find(p=>(p.slug===value||p.id===value)&&p.status==='active')
  if(p)return p.images?.[0]||p.img
  return safeUrl(value,'')
}
export function validateSite(site){
  if(!site.brand.name.trim()||!site.brand.email.includes('@'))return 'Enter a company name and valid email.'
  if(site.home.sectionOrder.length!==7||new Set(site.home.sectionOrder).size!==7||site.home.sectionOrder.some(k=>!defaultSite.home.sectionOrder.includes(k)))return 'Keep each homepage section exactly once in the section order.'
  if(!site.navigation.length)return 'Keep at least one navigation link.'
  const ids=site.categories.map(c=>c.id)
  if(ids.some(id=>!/^[-a-z0-9]+$/.test(id))||new Set(ids).size!==ids.length)return 'Category IDs must be unique lowercase letters, numbers or hyphens.'
  if(site.slides.some(s=>!s.name||!s.images.length))return 'Each hero collection needs a name and at least one product.'
  for(const [key,color]of Object.entries(site.appearance))if(['ink','green','lime','paper'].includes(key)&&!/^#[a-f\d]{6}$/i.test(color))return 'Use six-digit hex theme colors.'
  return null
}
