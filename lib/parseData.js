const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function parseData() {
  const filePath = path.join(process.cwd(), 'reference', 'Pokopia.csv');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

  const headers = parseCSVLine(lines[0]);

  const pokemonList = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const pokemon = {};
    headers.forEach((header, index) => {
      pokemon[header.trim()] = values[index] ? values[index].trim() : '';
    });

    // Normalize data
    const normalized = {
      number: pokemon['Number'],
      name: pokemon['Name'],
      primaryLocation: pokemon['Primary Location'],
      specialties: [pokemon['Specialty 1'], pokemon['Specialty 2']].filter(Boolean),
      idealHabitat: pokemon['Ideal Habitat'],
      favorites: [
        pokemon['Favorite 1'],
        pokemon['Favorite 2'],
        pokemon['Favorite 3'],
        pokemon['Favorite 4'],
        pokemon['Favorite 5'],
        pokemon['Favorite 6']
      ].filter(Boolean),
      habitats: []
    };

    // Parse habitats
    for (let i = 1; i <= 3; i++) {
      const habName = pokemon[`Habitat ${i}`];
      if (habName) {
        normalized.habitats.push({
          name: habName,
          areas: {
            'Withered Wastelands': pokemon[`Habitat ${i} Withered Wastelands`] === 'Yes',
            'Bleak Beach': pokemon[`Habitat ${i} Bleak Beach`] === 'Yes',
            'Rocky Ridges': pokemon[`Habitat ${i} Rocky Ridges`] === 'Yes',
            'Sparkling Skylands': pokemon[`Habitat ${i} Sparkling Skylands`] === 'Yes',
            'Palette Town': pokemon[`Habitat ${i} Palette Town`] === 'Yes'
          },
          rarity: pokemon[`Habitat ${i} Rarity`],
          time: pokemon[`Habitat ${i} Time`] || '',
          weather: pokemon[`Habitat ${i} Weather`] || ''
        });
      }
    }

    return normalized;
  });

  return pokemonList;
}

module.exports = { parseData };
