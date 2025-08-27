// neuCrudUtils.js - replacement (drop this in, replace old file)

let debug_mode = true;
let list_of_all_products = [];
let list_of_categories = [];
let carouselIntervals = [];
let selected_product_id = NaN;

async function fetchJSON(url, options = {}) {
  /**
   * A helper function that gets a url and and option to apply it on 
   * Also logs every error that may happen
   */
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText} ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error("fetchJSON error:", err);
    return null;
  }
}

async function get_products(product_id = "", by_slug = "") {
  /** Product fetcher:
  *   no args > list of all products
  *   product_id > single product 
  *   by_slug > single product
  */
  const base = "https://api.escuelajs.co/api/v1/products";
  let request;
  if (product_id) request = `${base}/${product_id}`;
  else if (by_slug) request = `${base}/slug/${by_slug}`;
  else request = `${base}`;
  return await fetchJSON(request);
}

async function get_product_categories() {
  /**Fetches the cats */
  return await fetchJSON("https://api.escuelajs.co/api/v1/categories");
}

/** Clear previously created carousel intervals and set new ones */
function set_up_Carousel() {
  // clear old intervals
  carouselIntervals.forEach(id => clearInterval(id));
  carouselIntervals = [];

  const Carousels = document.getElementsByClassName("Carousel");
  for (let Carousel of Carousels) {
    const kids = Array.from(Carousel.children);
    if (kids.length === 0) continue;

    // Set initial classes (first item large, others small + grayscale)
    kids.forEach((kid, idx) => {
      kid.classList.remove("w-4/6", "w-1/6", "grayscale-90");
      if (idx === 0) kid.classList.add("w-4/6");
      else kid.classList.add("w-1/6", "grayscale-90");
    });

    let i = 1;
    const id = setInterval(() => {
      if (i >= kids.length) i = 0;
      kids.forEach(k => {
        k.classList.remove("w-4/6", "w-1/6");
        k.classList.add("w-1/6", "grayscale-90");
      });
      if (kids[i]) {
        kids[i].classList.remove("grayscale-90", "w-1/6");
        kids[i].classList.add("w-4/6");
      }
      i++;
    }, 4000);

    carouselIntervals.push(id);
  }
}

function escapeForRegex(s = "") {
  /**Prevents regex from breaking by escaping its special chars */
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderProducts(products, highlightQuery = "") {
  /**
   * Builds the HTML for products 
   * - If a highlightQuery is given, then it tries to highlight that
   */
  if (!Array.isArray(products)) return "";
  const q = highlightQuery ? highlightQuery.toLowerCase() : "";
  return products.map(p => {
    const imgs = Array.isArray(p.images) ? p.images : [];
    const imagesHtml = imgs
      .map(img => `<div class='overflow-hidden transition-all duration-500 ease-in-out'><img src="${img}" alt="" onerror="this.onerror=null; this.src='../images/baseballCap1.jpg';" class='object-cover h-full w-fit transition-all duration-500 ease-in-out'></div>`)
      .join("") +
      `<div class='overflow-hidden transition-all duration-500 ease-in-out'><img src="../images/baseballCap1.jpg" alt="" class='object-cover h-full w-fit transition-all duration-500 ease-in-out'></div>`.repeat(Math.max(0, 3 - imgs.length));

    const title = p.title || "";
    const displayTitle = q ? title.replace(new RegExp(`(${escapeForRegex(q)})`, "ig"), `<span style="color:black; font-weight:bold;">$1</span>`) : title;
    const desc = String(p.description || "").substring(0, 40);
    const cat = p.category?.name || "";
    const priceDisplay = `${p.price}000`;

    return `
      <div class="card w-[32%] h-80 border-2 border-solid border-black hover:shadow-2xl hover:cursor-pointer" onclick="show_product_details(this)">
        <div class="Carousel h-52 w-full flex gap-2 overflow-hidden">${imagesHtml}</div>
        <div class="px-2">${displayTitle}</div>
        <div class="px-2">${cat}</div>
        <div class="px-2">${desc}...</div>
        <div class="px-2 text-2xl font-extrabold">${priceDisplay} &#65020;</div>
        <div class="product_id px-2 hidden">${p.id}</div>
      </div>
    `;
  }).join("");
}

function display_all_products(products = null) {
  /**Renders products in the section and also checks if section is there
   * also if product is given it will only render that otherwise tries to
   * render all products
   */
  const section = document.querySelector("section");
  if (!section) {
    if (debug_mode) console.warn("display_all_products: <section> not found");
    return;
  }
  const items = products || list_of_all_products;
  if (!Array.isArray(items) || items.length === 0) {
    section.innerHTML = `<div class="p-4">محصولی یافت نشد.</div>`;
    return;
  }
  section.innerHTML = renderProducts(items);
  // initialize Carousels after DOM update
  set_up_Carousel();
}

/** Search helpers */
function searchProducts_by_title(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return list_of_all_products.filter(prod => prod.title && prod.title.toLowerCase().includes(q));
}
function searchProducts_by_id(id = "") {
  return list_of_all_products.find(prod => prod.id === id) || null;
}


async function deleteProducts(id) {
  /** Delete a product based on its id and update the local list */
  try {
    const res = await fetch(`https://api.escuelajs.co/api/v1/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Delete failed: ${res.status} ${text}`);
    }
    // remove product from in memory storage and re renders the HTML
    list_of_all_products = list_of_all_products.filter(p => p.id !== id);
    display_all_products();
    return res;
  } catch (err) {
    console.error("deleteProducts:", err);
    throw err;
  }
}

function change_to_jalalie_time(isoDate) {
  try {
    if (typeof moment !== "undefined" && typeof moment.loadPersian === "function") {
      moment.loadPersian({ usePersianDigits: true });
      return moment(isoDate).format("jYYYY/jMM/jDD HH:mm:ss");
    }
    const d = new Date(isoDate);
    return d.toLocaleString("fa-IR");
  } catch (e) {
    return isoDate;
  }
}

/** Create / update helpers — update in memory storage after success */
async function createProduct(title, price, description, category_id, images) {
  try {
    const res = await fetch("https://api.escuelajs.co/api/v1/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, price, description, categoryId: category_id, images })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Create failed: ${res.status} ${text}`);
    }
    const data = await res.json();
    list_of_all_products.unshift(data);
    display_all_products();
    return data;
  } catch (err) {
    console.error("createProduct:", err);
    throw err;
  }
}

async function updateProduct(product_to_update_id, title) {
  try {
    const res = await fetch(`https://api.escuelajs.co/api/v1/products/${product_to_update_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Update failed: ${res.status} ${text}`);
    }
    const updated = await res.json();
    const idx = list_of_all_products.findIndex(p => p.id === updated.id);
    if (idx !== -1) list_of_all_products[idx] = updated;
    display_all_products();
    return updated;
  } catch (err) {
    console.error("updateProduct:", err);
    throw err;
  }
}

function show_notification(text) {
  /** notification UI */
  const product_notification = document.getElementById("product_notification");
  if (!product_notification) return;
  product_notification.innerHTML = `<span class="text-white pr-2">${text}</span>`;
  product_notification.classList.remove("hidden");
  product_notification.classList.add("flex");
  setTimeout(() => {
    product_notification.classList.add("hidden");
    product_notification.classList.remove("flex");
  }, 3000);
}


async function add_product_by_form() {
  /** Form submit handler for Add Product */
  const title_element = document.getElementById("add_product_title");
  const price_element = document.getElementById("add_product_price");
  const desc_element = document.getElementById("add_product_description");
  const category_element = document.getElementById("add_product_category");

  if (!title_element || !price_element || !desc_element || !category_element) {
    alert("فرمی پیدا نشد");
    return;
  }

  const title = title_element.value.trim();
  const price = parseInt(price_element.value, 10);
  const description = desc_element.value.trim();
  const category = parseInt(category_element.value, 10);

  title_element.classList.remove("border-red-500");
  price_element.classList.remove("border-red-500");
  desc_element.classList.remove("border-red-500");
  category_element.classList.remove("border-red-500");

  let hasError = false;
  if (!title) { title_element.classList.add("border-red-500"); hasError = true; }
  if (!price || price <= 0) { price_element.classList.add("border-red-500"); hasError = true; }
  if (!description) { desc_element.classList.add("border-red-500"); hasError = true; }
  if (!category || category <= 0) { category_element.classList.add("border-red-500"); hasError = true; }

  if (hasError) {
    show_notification("لطفاً همه فیلدها را به‌درستی پر کنید");
    return;
  }

  try {
    await createProduct(title, price, description, category, ["https://placehold.co/600x400"]);
    show_notification("محصول با موفقیت اضافه شد");
    title_element.value = "";
    price_element.value = "0";
    desc_element.value = "";
    category_element.value = "0";
    close_add_product_dialog();
  } catch (err) {
    alert("خطا در ایجاد محصول: " + err.message);
  }
}

function close_add_product_dialog() {
  const add_product_dialog = document.getElementById("add_product_dialog");
  if (!add_product_dialog) return;
  add_product_dialog.classList.add("hidden");
  add_product_dialog.classList.remove("block");
}
function open_add_product_dialog() {
  const add_product_dialog = document.getElementById("add_product_dialog");
  if (!add_product_dialog) return;
  add_product_dialog.classList.remove("hidden");
  add_product_dialog.classList.add("block");
}
function close_product_details_dialog() {
  const product_details = document.getElementById("product_details");
  if (!product_details) return;
  product_details.classList.add("hidden");
  product_details.classList.remove("block");
}
function open_product_details_dialog() {
  close_add_product_dialog();
  const product_details = document.getElementById("product_details");
  if (!product_details) return;
  product_details.classList.remove("hidden");
  product_details.classList.add("block");
}

/** Debounce helper for search input */
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), wait);
  };
};
const handleInput = debounce(() => getSearchText(), 400);

function getSearchText() {
  const section = document.getElementsByTagName("section")[0];
  const searchBox = document.getElementById("searchBox");
  if (!searchBox || !section) return;
  const query = searchBox.value.trim();
  if (!query) {
    display_all_products();
    return;
  }
  const matches = searchProducts_by_title(query);
  if (matches.length === 0) {
    section.innerHTML = `<div class="p-4">محصولی یافت نشد.</div>`;
    return;
  }
  section.innerHTML = renderProducts(matches, query);
  set_up_Carousel();
}

function get_selected_product(id) {
  const selected_product = searchProducts_by_id(id);
  const product_details_expo = document.getElementById("product_details_expo");
  if (!product_details_expo) return;
  if (!selected_product) {
    product_details_expo.innerHTML = `<div class="text-red-600 p-4 font-bold">Product not found. ${id}</div>`;
    return;
  }
  product_details_expo.innerHTML = `
    <div class="card w-5/6 m-auto border-2 border-solid border-black">
      <div class="image w-full h-52 overflow-hidden"><img src="${selected_product.images?.[0] || '../images/baseballCap1.jpg'}" alt="" onerror="this.onerror=null; this.src='../images/baseballCap1.jpg';"></div>
      <div class="px-2">نام: ${selected_product.title}</div>
      <div class="px-2">دسته‌بندی: ${selected_product.category?.name || ''}</div>
      <div class="px-2 text-justify mb-2">توضیحات: ${selected_product.description}</div><hr>
      <div class="px-2">اضافه شده در: ${change_to_jalalie_time(selected_product.creationAt)}</div>
      <div class="px-2 text-2xl font-extrabold">قیمت: ${selected_product.price}000 &#65020;</div>
    </div>
  `;
}

function show_product_details(e) {
  open_product_details_dialog();
  selected_product_id = e.querySelector(".product_id")?.innerText;
  if (!selected_product_id) return;
  get_selected_product(parseInt(selected_product_id, 10));
}

/** Remove product (calls deleteProducts) */
async function remove_product() {
  if (!selected_product_id) {
    show_notification("هیچ محصولی انتخاب نشده است");
    return;
  }
  try {
    await deleteProducts(parseInt(selected_product_id, 10));
    show_notification("محصول حذف شد");
    close_product_details_dialog();
  } catch (err) {
    show_notification("حذف محصول ناموفق بود");
  }
}

/** Filter products using API */
async function filterServerSide() {
  const minPrice = parseInt(document.getElementById("minPriceRange")?.value || 0, 10);
  const maxPrice = parseInt(document.getElementById("maxPriceRange")?.value || 50, 10);
  const inputs = document.getElementById("cat_filter")?.getElementsByTagName("input") || [];
  const selectedCats = [];

  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i];
    if (inp.type === "checkbox" && inp.checked) {
      const id = parseInt(String(inp.id).split("_")[1], 10);
      if (!isNaN(id)) selectedCats.push(id);
    }
  }

  const params = new URLSearchParams();
  params.append("price_min", minPrice);
  params.append("price_max", maxPrice);

  if (selectedCats.length > 0) {
    params.append("categoryId", selectedCats[0]);
  }

  const url = `https://api.escuelajs.co/api/v1/products/?${params.toString()}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    console.error("API didn't work :/", resp.statusText);
    return;
  }
  const products = await resp.json();
  display_all_products(products);
}


/** Initialization of DOM */
document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("searchBox");
  if (searchInput) searchInput.addEventListener("input", handleInput);

  const minRange = document.getElementById("minPriceRange");
  const maxRange = document.getElementById("maxPriceRange");
  if (minRange && minRange.nextElementSibling) minRange.nextElementSibling.value = minRange.value + "000";
  if (maxRange && maxRange.nextElementSibling) maxRange.nextElementSibling.value = maxRange.value + "000";
  if (minRange) minRange.addEventListener("input", () => { if (minRange.nextElementSibling) minRange.nextElementSibling.value = minRange.value + "000"; });
  if (maxRange) maxRange.addEventListener("input", () => { if (maxRange.nextElementSibling) maxRange.nextElementSibling.value = maxRange.value + "000"; });

  // fetch data (only once)
  const products = await get_products();
  if (products) {
    list_of_all_products = Array.isArray(products) ? products : [products];
  } else {
    list_of_all_products = [];
  }

  const categories = await get_product_categories();
  list_of_categories = Array.isArray(categories) ? categories : [];

  // populate filters and add-product select
  const catFilter = document.getElementById("cat_filter");
  if (catFilter && list_of_categories.length) {
    catFilter.innerHTML = list_of_categories.map(c => `<span class="flex justify-end gap-2"><label for="cat_${c.id}">${c.name}</label><input type="checkbox" id="cat_${c.id}" name="${c.name}" value="${c.id}"></span>`).join("");
  }

  const addProductSelect = document.getElementById("add_product_category");
  if (addProductSelect && list_of_categories.length) {
    addProductSelect.innerHTML = `<option value="0">--دسته را انتخاب کنید--</option>` + list_of_categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  }

  // initial render
  display_all_products();
});
