const MAX_POKEMON = 999;
const RENDER_BATCH_SIZE = 40;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");
const closeButton = document.querySelector(".search-close-icon");
const sortButton = document.querySelector(".sort-wrap");
const filterWrapper = document.querySelector(".sort-wrapper .filter-wrapper");

let allPokemons = [];
let renderJobId = 0;

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
  .then((response) => response.json())
  .then((data) => {
    allPokemons = data.results;
    displayPokemons(allPokemons);
  })
  .catch((error) => {
    console.error("Failed to fetch pokemon list:", error);
    notFoundMessage.textContent = "Unable to load Pokemon right now";
    notFoundMessage.style.display = "block";
  });

function displayPokemons(pokemon) {
  listWrapper.innerHTML = "";
  renderJobId += 1;
  const currentRenderJob = renderJobId;
  let startIndex = 0;

  function renderBatch() {
    if (currentRenderJob !== renderJobId) {
      return;
    }

    const fragment = document.createDocumentFragment();
    const batch = pokemon.slice(startIndex, startIndex + RENDER_BATCH_SIZE);

    batch.forEach((pokemon) => {
      fragment.appendChild(createPokemonCard(pokemon));
    });

    listWrapper.appendChild(fragment);
    startIndex += RENDER_BATCH_SIZE;

    if (startIndex < pokemon.length) {
      requestAnimationFrame(renderBatch);
    }
  }

  renderBatch();
}

function createPokemonCard(pokemon) {
  const pokemonID = pokemon.url.split("/")[6];
  const listItem = document.createElement("button");
  listItem.className = "list-item";
  listItem.type = "button";
  listItem.innerHTML = `
      <div class="number-wrap">
          <p class="caption-fonts">#${String(pokemonID).padStart(3, "0")}</p>
      </div>
      <div class="img-wrap">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonID}.png"
            alt="${pokemon.name}"
            loading="lazy"
            decoding="async"
          />
      </div>
      <div class="name-wrap">
          <p class="body3-fonts">${pokemon.name}</p>
      </div>
  `;

  listItem.addEventListener("click", () => {
    window.location.href = `./detail.html?id=${pokemonID}`;
  });

  return listItem;
}

searchInput.addEventListener("input", handleSearch);
numberFilter.addEventListener("change", handleSearch);
nameFilter.addEventListener("change", handleSearch);
closeButton.addEventListener("click", clearSearch);
sortButton.addEventListener("click", toggleSortPanel);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".sort-wrapper")) {
    filterWrapper.classList.remove("filter-wrapper-open");
  }
});

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  let filteredPokemons;

  closeButton.classList.toggle(
    "search-close-icon-visible",
    searchTerm.length > 0
  );

  if (numberFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else {
    filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
  }

  displayPokemons(filteredPokemons);
  notFoundMessage.style.display = filteredPokemons.length === 0 ? "block" : "none";
}

function clearSearch() {
  searchInput.value = "";
  closeButton.classList.remove("search-close-icon-visible");
  displayPokemons(allPokemons);
  notFoundMessage.style.display = "none";
}

function toggleSortPanel() {
  filterWrapper.classList.toggle("filter-wrapper-open");
}
