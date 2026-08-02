const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const sortSelect = document.querySelector("#sortSelect");

const comparisonBody = document.querySelector("#comparisonBody");
const cardList = document.querySelector("#cardList");
const resultMessage = document.querySelector("#resultMessage");

const productCount = document.querySelector("#productCount");
const hemaWinCount = document.querySelector("#hemaWinCount");
const rtMartWinCount = document.querySelector("#rtMartWinCount");

let products = [];

function formatPrice(price) {
  if (typeof price !== "number") {
    return "가격 없음";
  }

  return `¥${price.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
}

function getWinner(product) {
  const hemaPrice = product.hemaPrice;
  const rtMartPrice = product.rtMartPrice;

  if (
    typeof hemaPrice !== "number" ||
    typeof rtMartPrice !== "number"
  ) {
    return {
      store: "비교 불가",
      className: "same-badge"
    };
  }

  if (hemaPrice < rtMartPrice) {
    return {
      store: "허마",
      className: ""
    };
  }

  if (rtMartPrice < hemaPrice) {
    return {
      store: "다룬파",
      className: ""
    };
  }

  return {
    store: "동일 가격",
    className: "same-badge"
  };
}

function getDifference(product) {
  if (
    typeof product.hemaPrice !== "number" ||
    typeof product.rtMartPrice !== "number"
  ) {
    return null;
  }

  return Math.abs(product.hemaPrice - product.rtMartPrice);
}

function createCategoryOptions() {
  const categories = [
    ...new Set(products.map((product) => product.category))
  ].sort((a, b) => a.localeCompare(b, "ko"));

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;

    categorySelect.appendChild(option);
  });
}

function getFilteredProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value;
  const selectedSort = sortSelect.value;

  const filteredProducts = products.filter((product) => {
    const matchesKeyword =
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.size.toLowerCase().includes(keyword);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesKeyword && matchesCategory;
  });

  filteredProducts.sort((a, b) => {
    if (selectedSort === "low") {
      const aLowest = Math.min(a.hemaPrice, a.rtMartPrice);
      const bLowest = Math.min(b.hemaPrice, b.rtMartPrice);

      return aLowest - bLowest;
    }

    if (selectedSort === "difference") {
      return getDifference(b) - getDifference(a);
    }

    return a.name.localeCompare(b.name, "ko");
  });

  return filteredProducts;
}

function updateSummary(filteredProducts) {
  let hemaWins = 0;
  let rtMartWins = 0;

  filteredProducts.forEach((product) => {
    if (product.hemaPrice < product.rtMartPrice) {
      hemaWins += 1;
    }

    if (product.rtMartPrice < product.hemaPrice) {
      rtMartWins += 1;
    }
  });

  productCount.textContent = `${filteredProducts.length}개`;
  hemaWinCount.textContent = `${hemaWins}개`;
  rtMartWinCount.textContent = `${rtMartWins}개`;
}

function renderTable(filteredProducts) {
  if (filteredProducts.length === 0) {
    comparisonBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-message">
          검색 결과가 없습니다.
        </td>
      </tr>
    `;

    return;
  }

  comparisonBody.innerHTML = filteredProducts
    .map((product) => {
      const winner = getWinner(product);
      const difference = getDifference(product);

      return `
        <tr>
          <td>
            <div class="product-name">${product.name}</div>
            <span class="category">${product.category}</span>
          </td>

          <td>${product.size}</td>

          <td>
            <span class="price hema-price">
              ${formatPrice(product.hemaPrice)}
            </span>
          </td>

          <td>
            <span class="price rtmart-price">
              ${formatPrice(product.rtMartPrice)}
            </span>
          </td>

          <td>
            <span class="winner-badge ${winner.className}">
              ${winner.store}
            </span>
          </td>

          <td>
            <span class="difference">
              ${
                difference === null
                  ? "비교 불가"
                  : formatPrice(difference)
              }
            </span>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderCards(filteredProducts) {
  if (filteredProducts.length === 0) {
    cardList.innerHTML = `
      <p class="empty-message">검색 결과가 없습니다.</p>
    `;

    return;
  }

  cardList.innerHTML = filteredProducts
    .map((product) => {
      const winner = getWinner(product);
      const difference = getDifference(product);

      return `
        <article class="product-card">
          <h3>${product.name}</h3>

          <p class="product-info">
            ${product.category} · ${product.size}
          </p>

          <div class="mobile-price-grid">
            <div class="mobile-price-box hema-box">
              <span>허마</span>
              <strong>${formatPrice(product.hemaPrice)}</strong>
            </div>

            <div class="mobile-price-box rtmart-box">
              <span>다룬파</span>
              <strong>${formatPrice(product.rtMartPrice)}</strong>
            </div>
          </div>

          <div class="mobile-result">
            <span class="winner-badge ${winner.className}">
              최저가: ${winner.store}
            </span>

            <span class="mobile-difference">
              차이 ${
                difference === null
                  ? "비교 불가"
                  : formatPrice(difference)
              }
            </span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();

  resultMessage.textContent =
    `총 ${filteredProducts.length}개 상품을 표시하고 있습니다.`;

  updateSummary(filteredProducts);
  renderTable(filteredProducts);
  renderCards(filteredProducts);
}

async function loadProducts() {
  try {
    const response = await fetch("./products.json");

    if (!response.ok) {
      throw new Error(
        `상품 정보를 불러오지 못했습니다. 오류 코드: ${response.status}`
      );
    }

    products = await response.json();

    createCategoryOptions();
    renderProducts();
  } catch (error) {
    console.error(error);

    resultMessage.textContent =
      "상품 정보를 불러오지 못했습니다.";

    comparisonBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-message">
          products.json 파일의 위치와 내용을 확인해 주세요.
        </td>
      </tr>
    `;

    cardList.innerHTML = `
      <p class="empty-message">
        products.json 파일의 위치와 내용을 확인해 주세요.
      </p>
    `;
  }
}

searchInput.addEventListener("input", renderProducts);
categorySelect.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

loadProducts();
