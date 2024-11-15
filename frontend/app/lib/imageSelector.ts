interface Club {
    genres?: string[];
    features?: string[];
    formattedPrice?: number;
    capacity?: number;
    dressCode?: string;
    description?: string;
}
  
export const getDefaultClubImage = (club: Club): number => {
    const scores = new Array(7).fill(0);
    
    if (club.genres) {
      const genresLower = club.genres.map(g => g.toLowerCase());
      
      // Image 0: Underground techno/electronic (Industrial space with lasers)
      if (genresLower.some(g => ['techno', 'electronic', 'edm', 'minimal'].includes(g))) scores[0] += 2;
      
      // Image 1: Modern dance/Top 40 (Geometric neon & crowd)
      if (genresLower.some(g => ['dance', 'pop', 'top 40', 'house'].includes(g))) scores[1] += 2;
      
      // Image 2: Retro/Disco (Disco balls and dancing)
      if (genresLower.some(g => ['disco', 'retro', '80s', 'funk'].includes(g))) scores[2] += 2;
      
      // Image 3: Lounge/Mixed (Indoor garden lounge)
      if (genresLower.some(g => ['lounge', 'chill', 'ambient'].includes(g))) scores[3] += 2;
      
      // Image 4: VIP/Hip-hop (Luxury booth setup)
      if (genresLower.some(g => ['hip hop', 'r&b', 'rap'].includes(g))) scores[4] += 2;
      
      // Image 5: Live Music/Rock (Concert venue)
      if (genresLower.some(g => ['rock', 'live music', 'indie', 'alternative'].includes(g))) scores[5] += 2;
      
      // Image 6: Upscale Lounge (Crystal chandeliers)
      if (genresLower.some(g => ['jazz', 'lounge', 'soul'].includes(g))) scores[6] += 2;
    }
  
    if (club.features) {
      const featuresLower = club.features.map(f => f.toLowerCase());
      
      // Underground/warehouse features
      if (featuresLower.some(f => f.includes('underground') || f.includes('warehouse'))) scores[0] += 1.5;
      
      // Modern club features
      if (featuresLower.some(f => ['led screens', 'light show', 'dance floor'].some(feat => f.includes(feat)))) scores[1] += 1.5;
      
      // Retro features
      if (featuresLower.some(f => f.includes('disco') || f.includes('dance floor'))) scores[2] += 1.5;
      
      // Outdoor/Garden features
      if (featuresLower.some(f => ['outdoor', 'garden', 'terrace'].some(feat => f.includes(feat)))) scores[3] += 1.5;
      
      // VIP/Bottle service features
      if (featuresLower.some(f => ['vip', 'bottle service', 'private booths'].some(feat => f.includes(feat)))) scores[4] += 2;
      
      // Live music features
      if (featuresLower.some(f => ['stage', 'live music', 'concert'].some(feat => f.includes(feat)))) scores[5] += 2;
      
      // Upscale lounge features
      if (featuresLower.some(f => ['lounge', 'cocktail bar', 'fine dining'].some(feat => f.includes(feat)))) scores[6] += 1.5;
    }
  
    // Price range scoring
    if (club.formattedPrice) {
      // High-end (Images 4, 6)
      if (club.formattedPrice >= 4) {
        scores[4] += 1.5;
        scores[6] += 1.5;
      }
      // Mid-range (Images 2, 3)
      else if (club.formattedPrice === 3) {
        scores[2] += 1;
        scores[3] += 1;
      }
      // Budget-friendly (Images 0, 1, 5)
      else {
        scores[0] += 1;
        scores[1] += 1;
        scores[5] += 1;
      }
    }
  
    // Capacity scoring
    if (club.capacity) {
      // Large venues (Images 0, 1, 5)
      if (club.capacity > 500) {
        scores[0] += 1;
        scores[1] += 1;
        scores[5] += 1;
      }
      // Medium venues (Images 2, 3)
      else if (club.capacity > 200) {
        scores[2] += 1;
        scores[3] += 1;
      }
      // Intimate venues (Images 4, 6)
      else {
        scores[4] += 1.5;
        scores[6] += 1.5;
      }
    }
  
    // Dress code scoring
    if (club.dressCode) {
      const dressCodeLower = club.dressCode.toLowerCase();
      
      // Formal/Upscale (Images 4, 6)
      if (['formal', 'elegant', 'black tie'].some(code => dressCodeLower.includes(code))) {
        scores[4] += 1.5;
        scores[6] += 1.5;
      }
      // Smart/Smart Casual (Images 2, 3)
      else if (['smart', 'business'].some(code => dressCodeLower.includes(code))) {
        scores[2] += 1;
        scores[3] += 1;
      }
      // Casual (Images 0, 1, 5)
      else if (['casual', 'relaxed'].some(code => dressCodeLower.includes(code))) {
        scores[0] += 1;
        scores[1] += 1;
        scores[5] += 1;
      }
    }
  
    console.log("!!!!!!!!!!!!!!!!!!! score: ", scores.indexOf(Math.max(...scores)));

    return scores.indexOf(Math.max(...scores));
};