export const getFurnitureSuggestions = (residents) => {
  if (!residents || residents.length === 0) return [];

  // Flatten all favorites from residents
  const allFavorites = residents.flatMap(r => r.favorites);

  // Count frequencies of each favorite
  const favoriteCounts = allFavorites.reduce((acc, fav) => {
    acc[fav] = (acc[fav] || 0) + 1;
    return acc;
  }, {});

  // Identify shared favorites (count > 1)
  const sharedFavorites = Object.entries(favoriteCounts)
    .filter(([_, count]) => count > 1)
    .map(([fav, _]) => fav);

  // Curated mapping of items based on favorites
  // This is a simplified static catalog just to demonstrate the logic requested
  const catalog = [
    { name: 'Plain bed', favorites: ['Soft stuff', 'Healing'] },
    { name: 'Gaming fridge', favorites: ['Electronics', 'Containers', 'Looks like food'] },
    { name: 'Antique chest', favorites: ['Wooden stuff', 'Containers', 'Luxury'] },
    { name: 'Polygonal Shelf', favorites: ['Strange stuff', 'Blocky stuff', 'Containers'] },
    { name: 'Push cart', favorites: ['Gatherings', 'Noisy stuff', 'Containers'] },
    { name: 'Poké Ball table', favorites: ['Round stuff', 'Symbols', 'Play spaces'] },
    { name: 'Cute table', favorites: ['Cute stuff', 'Colorful stuff'] },
    { name: 'Resort table', favorites: ['Ocean vibes', 'Nice breezes'] },
    { name: 'Stone table', favorites: ['Stone stuff', 'Hard stuff', 'Cleanliness'] },
    { name: 'Berry table', favorites: ['Sweet flavors', 'Looks like food'] },
    { name: 'Simple cushion', favorites: ['Soft stuff', 'Fabric', 'Cleanliness'] },
    { name: 'Straw stool', favorites: ['Lots of nature', 'Dry flavors'] },
    { name: 'Log table', favorites: ['Lots of nature', 'Wooden stuff'] },
    { name: 'Wall-mounted table', favorites: ['Wooden stuff', 'Cleanliness'] },
    { name: 'Pokémon Center counter', favorites: ['Healing', 'Cleanliness', 'Symbols'] },
    { name: 'Industrial desk', favorites: ['Metal stuff', 'Hard stuff'] },
    { name: 'Iron rack', favorites: ['Metal stuff', 'Containers'] },
    { name: 'Exhibition stand', favorites: ['Watching stuff', 'Shiny stuff'] },
    { name: 'Garden table', favorites: ['Lots of nature', 'Pretty flowers'] },
    { name: 'Food counter', favorites: ['Looks like food', 'Spicy flavors', 'Gatherings'] },
    { name: 'Plain stool', favorites: ['Wooden stuff'] },
    { name: 'Chic table', favorites: ['Luxury', 'Cleanliness'] }
  ];

  // Score items based on how many resident favorites they satisfy
  const scoredCatalog = catalog.map(item => {
    const satisfiedFavorites = item.favorites.filter(fav => allFavorites.includes(fav));

    // De-duplicate satisfied favorites so we know exactly which distinct favorites are met
    const distinctSatisfied = [...new Set(satisfiedFavorites)];

    // Count how many total resident favorites are met (can be > 1 for a single favorite type if shared)
    let totalScore = 0;
    let sharedHits = 0;

    distinctSatisfied.forEach(fav => {
      totalScore += favoriteCounts[fav];
      if (favoriteCounts[fav] > 1) {
        sharedHits++;
      }
    });

    return {
      ...item,
      satisfiedFavorites: distinctSatisfied,
      score: totalScore,
      sharedHits
    };
  });

  // Filter out items that score 0
  const relevantItems = scoredCatalog.filter(item => item.score > 0);

  // Sort by score (descending), then by number of shared hits, then by name
  return relevantItems.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.sharedHits !== a.sharedHits) return b.sharedHits - a.sharedHits;
    return a.name.localeCompare(b.name);
  });
};
