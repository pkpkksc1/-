const productList = document.querySelector("#productList");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");

let products = [];

async function loadProducts() {
  try {
    const response = await fetch("./products.json");

    if (!response.ok) {
      throw new Error("상품 정보를 불러오지 못했습니다.");
    }

    products = await response.json();
    renderProducts();
  } catch (error) {
    productList.innerHTML = `<p>${error.message}</p>`;
  }
}

function renderProducts() {
  const keyword = searchInput.value.trim().toLowerCase();

  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(keyword)
    )
    .map((product) => ({
      ...product,
      totalPrice: product.price + product.shipping
    }))
    .sort((a, b) => {
      return sortSelect.value === "low"
        ? a.totalPrice - b.totalPrice
        : b.totalPrice - a.totalPrice;
    });

  if (filteredProducts.length === 0) {
    productList.innerHTML = "<p>검색 결과가 없습니다.</p>";
    return;
  }

  productList.innerHTML = filteredProducts
    .map(
      (product, index) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}">

          <div>
            <span class="rank">${index + 1}위</span>
            <h2>${product.name}</h2>
            <p>${product.store}</p>
            <p>상품 가격: ${product.price.toLocaleString()}원</p>
            <p>배송비: ${product.shipping.toLocaleString()}원</p>
            <strong>
              최종 가격: ${product.totalPrice.toLocaleString()}원
            </strong>
            <a
              href="${product.url}"
              target="_blank"
              rel="noopener noreferrer"
            >
              구매하러 가기
            </a>
          </div>
        </article>
      `
    )
    .join("");
}

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

loadProducts();
