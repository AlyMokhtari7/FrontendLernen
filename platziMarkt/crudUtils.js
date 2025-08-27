let debug_mode = true;
let list_of_all_products = [];
window.onload = function() {get_products().then(data => list_of_all_products.push(data)); display_all_products(); };

function get_products(product_id = "", by_slug = "") {
  const request = `https://api.escuelajs.co/api/v1/products/${product_id}${by_slug !== "" ? "slug/" : ""}${by_slug}`;
  return fetch(request)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

function get_product_categories() {
  const request = `https://api.escuelajs.co/api/v1/categories`;
  return fetch(request)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}


function set_up_Carousel() {
  const Carousels = document.getElementsByClassName('Carousel');
    for (let Carousel of Carousels) {
      const kids = Carousel.children;
      let i = 0;
      setInterval(() => {
        if (i === kids.length) i = 0;
        for (let kid of kids) {
          kid.classList.remove('w-4/6');
          kid.classList.remove('w-1/6');
          kid.classList.add('w-1/6');
          kid.classList.add('grayscale-90');
        }
        kids[i].classList.remove('grayscale-90');
        kids[i].classList.remove('w-1/6');
        kids[i].classList.remove('w-4/6');
        kids[i].classList.add('w-4/6');
        i++;
      },4000)
    }
}

function searchProducts_by_title(query, callback) {
  console.log(list_of_all_products);
  list_of_all_products.filter((products) => {
    query = query.toLowerCase();
    const matches = products.filter((product) =>
      product.title.toLowerCase().includes(query)
    );
    matches.forEach(callback);
  });
}

function searchProducts_by_id(id = "") {
  return list_of_all_products.filter((products) => {
    for (let product of products) {
      if (product.id === id) {
        console.log(product);
        return product;
      }
    }
  });
}

function deleteProducts(id) {
  fetch(`https://api.escuelajs.co/api/v1/products/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.statusText)
    .catch((err) => console.log(err));
}

function change_to_jalalie_time(isoDate) {
  moment.loadPersian({ usePersianDigits: true }); // Optional

  const shamsiDate = moment(isoDate).format("jYYYY/jMM/jDD HH:mm:ss");
  return shamsiDate;
}

function createProduct(title, price, description, category_id, images) {
  console.log(
    "Sending payload:",
    JSON.stringify({
      title: title,
      price: parseFloat(price),
      description: description,
      categoryId: parseInt(category_id),
      images: images,
    })
  );

  return fetch("https://api.escuelajs.co/api/v1/products/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      price: price,
      description: description,
      categoryId: category_id,
      images: images,
    }),
  });
}

function updateProduct(product_to_update_id, title) {
  console.log(
    `https://api.escuelajs.co/api/v1/products/${product_to_update_id}`
  );
  fetch(`https://api.escuelajs.co/api/v1/products/${product_to_update_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
    }),
  })
    .then((res) => console.log(res.statusText))
    .catch((err) => console.log(err));
}

function display_all_products() {
  let section = document.getElementsByTagName("section");
    for (product in list_of_all_products[0]){
      console.log(product);
      section[0].innerHTML = product
      .map(
        (p) => `
            <div class="card w-[32%] h-80 border-2 border-solid border-black hover:shadow-2xl hover:cursor-pointer" onclick="show_product_details(this)">
              <div class="Carousel h-52 w-full flex gap-2 overflow-hidden">`+
                p.images.map(img => {
                  return `<div class='overflow-hidden transition-all duration-500 ease-in-out'><img src="${img}" alt="" onerror="this.onerror=null; this.src='../images/baseballCap1.jpg';" class='object-cover h-full w-fit transition-all duration-500 ease-in-out'></div>`
                }).join('')
                + `<div class='overflow-hidden transition-all duration-500 ease-in-out'><img src="../images/baseballCap1.jpg" alt="" class='object-cover h-full w-fit transition-all duration-500 ease-in-out'></div>`.repeat(3-p.images.length) 
              +`</div>
              <div class="px-2">${p.title}</div>
              <div class="px-2">${p.category.name}</div>
              <div class="px-2">${String(p.description).substring(1, 40)}...</div>
              <div class="px-2 text-2xl font-extrabold">${p.price}000 &#65020;</div>
              <div class="product_id px-2 hidden">${p.id}</div>
            </div>`
      )
      .join("");
  }
}



function getSearchText() {
  let section = document.getElementsByTagName("section");
  const search_box_value = document.getElementById("searchBox").value;

  if (search_box_value !== "") {
    section[0].innerHTML = "";

    searchProducts_by_title(search_box_value, (product) => {
      const query = search_box_value.toLowerCase();
      const title = product.title;
      const titleHighlighted = title.replace(
        new RegExp(`(${query})`, "ig"),
        `<span style="color:black; font-weight:bold;">$1</span>`
      );

      section[0].innerHTML += `
        <div class="card w-[32%] h-80 border-2 border-solid border-black hover:shadow-2xl hover:cursor-pointer" onclick="show_product_details(this)">
          <div class="image w-full h-52 overflow-hidden"><img src="${product.images[0]}" alt="" onerror="this.onerror=null; this.src='../images/baseballCap1.jpg';"></div>
          <div class="px-2">${titleHighlighted}</div>
          <div class="px-2">${product.category.name}</div>
          <div class="px-2">${String(product.description).substring(1, 40)}...</div>
          <div class="px-2 text-2xl font-extrabold">${product.price}000 &#65020;</div>
          <div class="product_id px-2 hidden">${product.id}</div>
        </div>
      `;
    });
  } else {
    get_products().then((products) => {
      section[0].innerHTML = products
        .map(
          (p) => `
          <div class="card w-[32%] h-80 border-2 border-solid border-black hover:shadow-2xl hover:cursor-pointer" onclick="show_product_details(this)">
              <div class="image w-full h-52 overflow-hidden"><img src="${p.images[0]}" alt="" onerror="this.onerror=null; this.src='../images/baseballCap1.jpg';"></div>
              <div class="px-2">${p.title}</div>
              <div class="px-2">${p.category.name}</div>
              <div class="px-2">${String(p.description).substring(1, 40)}...</div>
              <div class="px-2 text-2xl font-extrabold">${p.price}000 &#65020;</div>
              <div class="product_id px-2 hidden">${p.id}</div>
          </div>
        `
        )
        .join("");
    });
  }
}

function refresh_page_after_long_time() {
  const refresh_banner = document.getElementById("refresh_banner");
  display_all_products();
  refresh_banner.classList.add("hidden");
  refresh_banner.classList.remove("flex");
  setTimeout(function () {
    const refresh_banner = document.getElementById("refresh_banner");
    console.log(`refresh counter`);
    refresh_banner.classList.remove("hidden");
    refresh_banner.classList.add("flex");
  }, 10000);
}

setTimeout(function () {
  const refresh_banner = document.getElementById("refresh_banner");
  console.log(`refresh counter`);
  refresh_banner.classList.remove("hidden");
  refresh_banner.classList.add("flex");
}, 10000); // Executes every 1 second

function show_notification(text) {
  const product_notification = document.getElementById("product_notification");
  product_notification.innerHTML = `<span class="text-white pr-2">${text}</span>`;
  product_notification.classList.remove("hidden");
  product_notification.classList.add("flex");
  setTimeout(() => {
    const product_notification = document.getElementById(
      "product_notification"
    );
    product_notification.classList.add("hidden");
    product_notification.classList.remove("flex");
  }, 3000);
}
function add_product_by_form() {
  const title_element = document.getElementById("add_product_title");
  const price_element = document.getElementById("add_product_price");
  const desc_element = document.getElementById("add_product_description");
  const category_element = document.getElementById("add_product_category");

  const title = title_element.value.trim();
  const price = parseInt(price_element.value);
  const description = desc_element.value.trim();
  const category = parseInt(category_element.value);

  // Clear previous error borders
  [title_element, price_element, desc_element, category_element].forEach((el) =>
    el.classList.remove("border-red-500")
  );

  let hasError = false;

  if (!title) {
    title_element.classList.add("border-red-500");
    hasError = true;
  }

  if (!price && price <= 0) {
    price_element.classList.add("border-red-500");
    hasError = true;
  }

  if (!description) {
    desc_element.classList.add("border-red-500");
    hasError = true;
  }

  if (category <= 0) {
    category_element.classList.add("border-red-500");
    hasError = true;
  }

  if (hasError) {
    show_notification("لطفاً همه فیلدها را به‌درستی پر کنید");
    return; // Don't proceed
  }

  // All fields are valid – submit
  createProduct(title, price, description, category, [
    "https://placehold.co/600x400",
  ])
    .then((res) => {
      res
        .json()
        .then((data) => {
          console.log("Status:", res.status);
          console.log("Response:", data);
          if (res.status === 201) {
            show_notification("محصول با موفقیت اضافه شد");
          } else {
            alert(`Error ${res.status}: ${JSON.stringify(data)}`);
          }
        })
        .catch((err) => {
          console.error("Failed to parse JSON:", err);
        });
    })
    .catch((err) => {
      console.error("Network error:", err);
    });

  // Clear the form
  title_element.value = "";
  price_element.value = "";
  desc_element.value = "";
  category_element.value = 0;
}

function close_add_product_dialog() {
  const add_product_dialog = document.getElementById("add_product_dialog");
  add_product_dialog.classList.add("hidden");
  add_product_dialog.classList.remove("block");
}

function open_add_product_dialog() {
  const add_product_dialog = document.getElementById("add_product_dialog");
  add_product_dialog.classList.remove("hidden");
  add_product_dialog.classList.add("block");
}

function close_product_details_dialog() {
  const product_details = document.getElementById("product_details");
  product_details.classList.add("hidden");
  product_details.classList.remove("block");
}

function open_product_details_dialog() {
  close_add_product_dialog();
  const product_details = document.getElementById("product_details");
  product_details.classList.remove("hidden");
  product_details.classList.add("block");
}

const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, wait);
  };
};

const handleInput = debounce((event) => {
  getSearchText(event);
}, 400);

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchBox");
  if (input) {
    input.addEventListener("input", handleInput);
  }
});

function get_selected_product(id) {
  searchProducts_by_id(id).then((selected_product) => {
    const product_details_expo = document.getElementById(
      "product_details_expo"
    );

    if (!selected_product) {
      product_details_expo.innerHTML = `
      <div class="text-red-600 p-4 font-bold">
         Product not found. ${id}
      </div>`;
      return;
    }

    product_details_expo.innerHTML = `
      <div class="card w-5/6 m-auto border-2 border-solid border-black">
        <div class="image w-full h-52 overflow-hidden"><img src="${selected_product.images[0]}" alt="" onerror="this.onerror=null; this.src='../images/baseballCap1.jpg';"></div>
        <div class="px-2">تام: ${selected_product.title}</div>
        <div class="px-2">دسته‌بندی: ${selected_product.category.name}</div>
        <div class="px-2 text-justify mb-2">توضیحات: ${selected_product.description}</div><hr>
        <div class="px-2">اضافه شده در: ${change_to_jalalie_time(selected_product.creationAt)}</div>
        <div class="px-2 text-2xl font-extrabold">قیمت: ${selected_product.price}000 &#65020;</div>
      </div>
    `;
  });
}

let selected_product_id = NaN;

function show_product_details(e) {
  open_product_details_dialog();
  selected_product_id = e.querySelector(".product_id").innerText;
  get_selected_product(parseInt(selected_product_id));
}

function remove_product() {
  deleteProducts(parseInt(selected_product_id));
  show_notification("محصول حذف شد");
}


function filter() {
  const minPriceRange = parseInt(document.getElementById("minPriceRange").value); 
  const maxPriceRange = parseInt(document.getElementById("maxPriceRange").value); 
  const inputs = document.getElementById("cat_filter").getElementsByTagName("input");
  const checked_inputs = [];
  for(var i = 0; i < inputs.length; i++) {
    if(inputs[i].type == "checkbox" && inputs[i].checked) {
        checked_inputs.push(parseInt(String(inputs[i].id).substring(4,)));
        console.log(inputs[i].id); 
    }  
  }
  console.log(checked_inputs);

  let section = document.getElementsByTagName("section");
  get_products().then((products) => {
    console.log(products);
    section[0].innerHTML = products
      .filter((p) => p.price <= maxPriceRange && p.price >= minPriceRange && checked_inputs.includes(p.category.id))
      .map(
        (p) =>  `
        <div class="card w-[32%] h-80 border-2 border-solid border-black hover:shadow-2xl hover:cursor-pointer" onclick="show_product_details(this)">
            <div class="image w-full h-52 overflow-hidden"><img src="${p.images[0]}" alt="" onerror="this.onerror=null; this.src='../images/baseballCap1.jpg';"></div>
            <div class="px-2">${p.title}</div>
            <div class="px-2">${p.category.name}</div>
            <div class="px-2">${String(p.description).substring(1, 40)}...</div>
            <div class="px-2 text-2xl font-extrabold">${p.price}000 &#65020;</div>
            <div class="product_id px-2 hidden">${p.id}</div>
        </div>`
      )
      .join("");
  });
}