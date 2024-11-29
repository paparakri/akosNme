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
    if (genresLower.some(g => ['techno', 'house', 'deep house', 'edm'].includes(g))) scores[0] += 2;
    
    // Image 1: Modern dance/Top 40 (Geometric neon & crowd)
    if (genresLower.some(g => ['greek pop', 'mainstream', 'laika'].includes(g))) scores[1] += 2;
    
    // Image 2: Retro/Disco (Disco balls and dancing)
    if (genresLower.some(g => ['greek rock', 'rebetiko modern'].includes(g))) scores[2] += 2;
    
    // Image 3: Lounge/Mixed (Indoor garden lounge)
    if (genresLower.some(g => ['house', 'deep house', 'greek pop'].includes(g))) scores[3] += 2;
    
    // Image 4: VIP/Hip-hop (Luxury booth setup)
    if (genresLower.some(g => ['greek hip-hop', 'hip-hop', 'mainstream'].includes(g))) scores[4] += 2;
    
    // Image 5: Live Music/Rock (Concert venue)
    if (genresLower.some(g => ['greek rock', 'live music', 'rebetiko modern'].includes(g))) scores[5] += 2;
    
    // Image 6: Upscale Lounge (Crystal chandeliers)
    if (genresLower.some(g => ['laika', 'greek pop', 'house'].includes(g))) scores[6] += 2;
  }

  if (club.features) {
    const featuresLower = club.features.map(f => f.toLowerCase());
    
    // Underground/warehouse features
    if (featuresLower.some(f => ['dj booth', 'dance floor'].some(feat => f.includes(feat.toLowerCase())))) scores[0] += 1.5;
    
    // Modern club features
    if (featuresLower.some(f => ['dance floor', 'security service'].some(feat => f.includes(feat.toLowerCase())))) scores[1] += 1.5;
    
    // Retro features
    if (featuresLower.some(f => ['dance floor', 'stage'].some(feat => f.includes(feat.toLowerCase())))) scores[2] += 1.5;
    
    // Outdoor/Garden features
    if (featuresLower.some(f => ['outdoor space', 'rooftop garden', 'smoking area'].some(feat => f.includes(feat.toLowerCase())))) scores[3] += 1.5;
    
    // VIP/Bottle service features
    if (featuresLower.some(f => ['vip area', 'private booths'].some(feat => f.includes(feat.toLowerCase())))) scores[4] += 2;
    
    // Live music features
    if (featuresLower.some(f => ['live music', 'stage'].some(feat => f.includes(feat.toLowerCase())))) scores[5] += 2;
    
    // Upscale lounge features
    if (featuresLower.some(f => ['vip area', 'private booths', 'cocktail bar'].some(feat => f.includes(feat.toLowerCase())))) scores[6] += 1.5;
  }

  // Price range scoring (adjusted for our 1-5 scale)
  if (club.formattedPrice) {
    // High-end (Images 4, 6)
    if (club.formattedPrice >= 75) {
      scores[4] += 1.5;
      scores[6] += 1.5;
    }
    // Mid-range (Images 2, 3)
    else if (club.formattedPrice >= 40) {
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

  // Capacity scoring (adjusted for Greek venue sizes)
  if (club.capacity) {
    // Large venues (Images 0, 1, 5)
    if (club.capacity > 600) {
      scores[0] += 1;
      scores[1] += 1;
      scores[5] += 1;
    }
    // Medium venues (Images 2, 3)
    else if (club.capacity > 300) {
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
    if (['smart', 'elegant'].some(code => dressCodeLower.includes(code))) {
      scores[4] += 1.5;
      scores[6] += 1.5;
    }
    // Smart/Smart Casual (Images 2, 3)
    else if (['smart casual'].some(code => dressCodeLower.includes(code))) {
      scores[2] += 1;
      scores[3] += 1;
    }
    // Casual (Images 0, 1, 5)
    else if (dressCodeLower.includes('dressy')) {
      scores[0] += 1;
      scores[1] += 1;
      scores[5] += 1;
    }
  }

  return scores.indexOf(Math.max(...scores));
};