const MAX_POKEMONS = 999;
const leftArrow = document.querySelector("#leftArrow");
const rightArrow = document.querySelector("#rightArrow");
const detailMain = document.querySelector(".detail-main");
const nameElement = document.querySelector(".name");
const idElement = document.querySelector(".pokemon-id-wrap .body2-fonts");
const imageElement = document.querySelector(".detail-img-wrapper img");
const typeWrapper = document.querySelector(".power-wrapper");
const weightElement = document.querySelector(".weight");
const heightElement = document.querySelector(".height");
const moveWrapper = document.querySelector(".pokemon-detail.move");
const descriptionElement = document.querySelector(".pokemon-description");
const statsWrapper = document.querySelector(".stats-wrapper");

let currentPokemonId = null;
let activeStyleTag = null;

const typeColors = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

document.addEventListener("DOMContentLoaded", () => {
  const pokemonID = new URLSearchParams(window.location.search).get("id");
  const id = parseInt(pokemonID, 10);

  if (Number.isNaN(id) || id < 1 || id > MAX_POKEMONS) {
    window.location.href = "./index.html";
    return;
  }

  currentPokemonId = id;
  loadPokemon(id);
});

async function loadPokemon(id) {
  try {
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const speciesResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${id}`
    );

    const pokemon = await pokemonResponse.json();
    const pokemonSpecies = await speciesResponse.json();

    if (currentPokemonId !== id) {
      return;
    }

    renderPokemon(pokemon, pokemonSpecies);
    updateButtons(id);
    window.history.pushState({}, "", `./detail.html?id=${id}`);
  } catch (error) {
    console.error("An error occured while fetching Pokemon data:", error);
  }
}

function renderPokemon(pokemon, pokemonSpecies) {
  const pokemonName = capitalizeFirstLetter(pokemon.name);

  document.title = pokemonName;
  nameElement.textContent = pokemonName;
  idElement.textContent = `#${String(pokemon.id).padStart(3, "0")}`;

  imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  imageElement.alt = pokemonName;

  renderTypes(pokemon.types);
  weightElement.textContent = `${pokemon.weight / 10} kg`;
  heightElement.textContent = `${pokemon.height / 10} m`;
  renderMoves(pokemon.abilities);
  descriptionElement.textContent = getEnglishFlavorText(pokemonSpecies);
  renderStats(pokemon.stats);
  updateTheme(pokemon.types[0].type.name);
}

function renderTypes(types) {
  typeWrapper.innerHTML = "";

  types.forEach((item) => {
    const typeTag = document.createElement("p");
    typeTag.className = `body3-fonts type ${item.type.name}`;
    typeTag.textContent = item.type.name;
    typeWrapper.appendChild(typeTag);
  });
}

function renderMoves(abilities) {
  moveWrapper.innerHTML = "";

  abilities.slice(0, 2).forEach((item) => {
    const moveText = document.createElement("p");
    moveText.className = "body3-fonts";
    moveText.textContent = capitalizeFirstLetter(item.ability.name.replace("-", " "));
    moveWrapper.appendChild(moveText);
  });
}

function renderStats(stats) {
  const statNameMapping = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: "SPD",
  };

  statsWrapper.innerHTML = "";

  stats.forEach((item) => {
    const statRow = document.createElement("div");
    statRow.className = "stats-wrap";

    const statLabel = document.createElement("p");
    statLabel.className = "body3-fonts stats";
    statLabel.textContent = statNameMapping[item.stat.name];

    const statValue = document.createElement("p");
    statValue.className = "body3-fonts";
    statValue.textContent = String(item.base_stat).padStart(3, "0");

    const progressBar = document.createElement("progress");
    progressBar.className = "progress-bar";
    progressBar.value = Math.min(item.base_stat, 100);
    progressBar.max = 100;

    statRow.appendChild(statLabel);
    statRow.appendChild(statValue);
    statRow.appendChild(progressBar);
    statsWrapper.appendChild(statRow);
  });
}

function updateTheme(typeName) {
  const color = typeColors[typeName];

  if (!color) {
    return;
  }

  detailMain.style.backgroundColor = color;

  document.querySelectorAll(".power-wrapper > p").forEach((item) => {
    item.style.backgroundColor = color;
  });

  document.querySelectorAll(".stats-wrap .stats").forEach((item) => {
    item.style.color = color;
  });

  if (activeStyleTag) {
    activeStyleTag.remove();
  }

  activeStyleTag = document.createElement("style");
  activeStyleTag.textContent = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
      background-color: rgba(${hexToRgb(color)}, 0.24);
    }

    .stats-wrap .progress-bar::-webkit-progress-value {
      background-color: ${color};
    }

    .stats-wrap .progress-bar::-moz-progress-bar {
      background-color: ${color};
    }
  `;

  document.head.appendChild(activeStyleTag);
}

function updateButtons(id) {
  leftArrow.classList.toggle("hidden", id === 1);
  rightArrow.classList.toggle("hidden", id === MAX_POKEMONS);
  leftArrow.disabled = id === 1;
  rightArrow.disabled = id === MAX_POKEMONS;

  leftArrow.onclick = () => {
    if (id > 1) {
      currentPokemonId = id - 1;
      loadPokemon(id - 1);
    }
  };

  rightArrow.onclick = () => {
    if (id < MAX_POKEMONS) {
      currentPokemonId = id + 1;
      loadPokemon(id + 1);
    }
  };
}

function getEnglishFlavorText(pokemonSpecies) {
  for (const entry of pokemonSpecies.flavor_text_entries) {
    if (entry.language.name === "en") {
      return entry.flavor_text.replace(/\f/g, " ");
    }
  }

  return "No description available.";
}

function capitalizeFirstLetter(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function hexToRgb(hexColor) {
  return [
    parseInt(hexColor.slice(1, 3), 16),
    parseInt(hexColor.slice(3, 5), 16),
    parseInt(hexColor.slice(5, 7), 16),
  ].join(", ");
}
