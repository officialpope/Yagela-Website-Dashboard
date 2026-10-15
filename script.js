/* =========================================
   YAGELA COLLECTION HUB
   SCRIPT.JS
========================================= */


/* PRELOADER */

window.addEventListener("load", function () {

    const preloader = document.getElementById("preloader");

    setTimeout(() => {

        preloader.style.opacity = "0";

        preloader.style.visibility = "hidden";

    }, 700);

});


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn = document.getElementById("menuBtn");

const navLinks = document.getElementById("navLinks");


menuBtn.addEventListener("click", function () {

    const isOpen = navLinks.classList.toggle("active");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");

});


document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", function () {

        navLinks.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Open navigation menu");

    });

});


/* =========================================
   DARK / LIGHT MODE
========================================= */

const themeToggle = document.getElementById("themeToggle");


themeToggle.addEventListener("click", function () {

    const darkMode = document.body.classList.toggle("dark-mode");
    updateThemeControl(darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");

});


/* LOAD SAVED THEME */

function updateThemeControl(darkMode) {
    const icon = themeToggle.querySelector("i");
    icon.classList.toggle("fa-sun", darkMode);
    icon.classList.toggle("fa-moon", !darkMode);
    themeToggle.setAttribute("aria-pressed", String(darkMode));
    themeToggle.setAttribute("aria-label", darkMode ? "Switch to light theme" : "Switch to dark theme");
}

const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialDarkMode = savedTheme ? savedTheme === "dark" : prefersDark;
document.body.classList.toggle("dark-mode", initialDarkMode);
updateThemeControl(initialDarkMode);

/* =========================================
   SEARCH PRODUCTS
========================================= */

const searchToggle = document.querySelector(".search-toggle");

const searchOverlay = document.getElementById("searchOverlay");

const closeSearch = document.getElementById("closeSearch");

const searchInput = document.getElementById("searchInput");


searchToggle.addEventListener("click", function () {

    searchOverlay.classList.add("active");
    searchOverlay.setAttribute("aria-hidden", "false");
    searchToggle.setAttribute("aria-expanded", "true");

    searchInput.focus();

});


closeSearch.addEventListener("click", function () {

    searchOverlay.classList.remove("active");
    searchOverlay.setAttribute("aria-hidden", "true");
    searchToggle.setAttribute("aria-expanded", "false");

});

searchOverlay.addEventListener("click", function (event) {
    if (event.target === searchOverlay) {
        searchOverlay.classList.remove("active");
        searchOverlay.setAttribute("aria-hidden", "true");
        searchToggle.setAttribute("aria-expanded", "false");
    }
});

let activeFilter = "all";
let activeSearch = "";

function applyProductFilters() {
    document.querySelectorAll(".product-card").forEach(product => {
        const categoryMatches = activeFilter === "all" || product.dataset.category === activeFilter;
        const productText = `${product.querySelector("h3")?.textContent || ""} ${product.querySelector(".product-category")?.textContent || ""}`.toLowerCase();
        const searchMatches = productText.includes(activeSearch);
        product.style.display = categoryMatches && searchMatches ? "" : "none";
    });
}

searchInput.addEventListener("input", function () {
    activeSearch = this.value.trim().toLowerCase();
    applyProductFilters();
});

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && activeSearch) {
        event.preventDefault();
        searchOverlay.classList.remove("active");
        searchOverlay.setAttribute("aria-hidden", "true");
        searchToggle.setAttribute("aria-expanded", "false");
        document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    }
});


/* =========================================
   PRODUCT FILTERING
========================================= */

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.classList.contains("active")));
});

filterButtons.forEach(button => {

    button.addEventListener("click", function () {


        filterButtons.forEach(btn => {

            const isActive = btn === this;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));

        });

        const filter = this.dataset.filter;


        activeFilter = filter;
        applyProductFilters();

    });

});


/* =========================================
   CATEGORY CLICK FILTER
========================================= */

const categoryCards = document.querySelectorAll(".category-card");


categoryCards.forEach(card => {

    card.addEventListener("click", function () {

        const category = this.dataset.category;

        activeFilter = category;
        filterButtons.forEach(button => {
            const isActive = button.dataset.filter === category;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
        applyProductFilters();

        document.getElementById("shop")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

});


/* =========================================
   SHOPPING CART
========================================= */

let cart = JSON.parse(localStorage.getItem("yagelaCart")) || [];


const cartButton = document.getElementById("cartButton");

const cartSidebar = document.getElementById("cartSidebar");

const closeCart = document.getElementById("closeCart");

const cartOverlay = document.getElementById("cartOverlay");

const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");

const cartTotal = document.getElementById("cartTotal");


/* OPEN CART */

cartButton.addEventListener("click", openCart);


function openCart() {

    cartSidebar.classList.add("active");

    cartOverlay.classList.add("active");
    cartButton.setAttribute("aria-expanded", "true");
    cartSidebar.setAttribute("aria-hidden", "false");

}


/* CLOSE CART */

closeCart.addEventListener("click", closeCartFunction);

cartOverlay.addEventListener("click", closeCartFunction);


function closeCartFunction() {

    cartSidebar.classList.remove("active");

    cartOverlay.classList.remove("active");
    cartButton.setAttribute("aria-expanded", "false");
    cartSidebar.setAttribute("aria-hidden", "true");

}


/* ADD TO CART */

document.querySelectorAll(".add-cart")
    .forEach(button => {


        button.addEventListener("click", function () {

            if (this.dataset.inquiry === "true") {
                const message = encodeURIComponent(`Hello YAGELA COLLECTION HUB, please share the current price for ${this.dataset.name}.`);
                window.open(`https://wa.me/233244114452?text=${message}`, "_blank", "noopener,noreferrer");
                return;
            }

            const name = this.dataset.name;

            const price = Number(this.dataset.price);


            const existingItem = cart.find(item => {

                return item.name === name;

            });


            if (existingItem) {

                existingItem.quantity += 1;

            } else {

                cart.push({

                    name: name,

                    price: price,

                    quantity: 1

                });

            }


            saveCart();

            updateCart();

            openCart();

        });

    });


/* SAVE CART */

function saveCart() {

    localStorage.setItem(
        "yagelaCart",
        JSON.stringify(cart)
    );

}


/* UPDATE CART */

function escapeCartText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);
}

function updateCart() {

    const storedCart = JSON.parse(localStorage.getItem("yagelaCart") || "[]");
    cart = Array.isArray(storedCart) ? storedCart : [];

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <i class="fa-solid fa-cart-shopping"></i>

                <p>Your cart is empty.</p>

            </div>

        `;

    } else {


        cart.forEach((item, index) => {


            const cartItem = document.createElement("div");


            cartItem.classList.add("cart-item");

            const safeName = escapeCartText(item.name);
            const price = Number(item.price);
            const quantity = Number(item.quantity);

            cartItem.innerHTML = `

                <div class="cart-item-details">

                    <h4>${safeName}</h4>

                    <p>GH₵ ${(price * quantity).toFixed(2)}</p>

                    <div class="cart-quantity" aria-label="Quantity">
                        <button type="button" class="quantity-btn" data-cart-action="decrease"
                            data-index="${index}" aria-label="Decrease quantity of ${safeName}">−</button>
                        <span>${quantity}</span>
                        <button type="button" class="quantity-btn" data-cart-action="increase"
                            data-index="${index}" aria-label="Increase quantity of ${safeName}">+</button>
                    </div>

                </div>

                <button
                    class="remove-item"
                    type="button"
                    data-cart-action="remove"
                    data-index="${index}"
                    aria-label="Remove ${safeName} from cart"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            `;


            cartItems.appendChild(cartItem);

        });

    }


    /* CART COUNT */

    const totalItems = cart.reduce((total, item) => {

        return total + item.quantity;

    }, 0);


    cartCount.textContent = totalItems;


    /* CART TOTAL */

    const totalPrice = cart.reduce((total, item) => {

        return total + (item.price * item.quantity);

    }, 0);


    cartTotal.textContent =

        `GH₵ ${totalPrice.toFixed(2)}`;

}


cartItems.addEventListener("click", function (event) {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const index = Number(button.dataset.index);
    if (!Number.isInteger(index) || !cart[index]) return;

    if (button.dataset.cartAction === "remove") {
        removeItem(index);
        return;
    }

    const change = button.dataset.cartAction === "increase" ? 1 : -1;
    const quantity = Number(cart[index].quantity) + change;

    if (quantity < 1) {
        removeItem(index);
        return;
    }

    cart[index].quantity = quantity;
    saveCart();
    updateCart();
});


/* REMOVE ITEM */

function removeItem(index) {

    cart.splice(index, 1);

    saveCart();

    updateCart();

}


/* =========================================
   PAYMENT CHECKOUT
========================================= */

const checkoutBtn = document.getElementById("checkoutBtn");
const paymentModal = document.getElementById("paymentModal");
const closePayment = document.getElementById("closePayment");
const paymentForm = document.getElementById("paymentForm");
const paymentTotal = document.getElementById("paymentTotal");
const paymentInstructions = document.getElementById("paymentInstructions");
const paymentMethods = document.querySelectorAll(".payment-method");

const API_BASE_URL = "/api";

const paymentDetails = {
    momo: {
        title: "Mobile Money",
        content: "MTN, Telecel & AirtelTigo: <strong>0244114452</strong><br>Payment name: <strong>YAGELA COLLECTION</strong>"
    },
    card: {
        title: "Visa Card",
        content: "Visa card payments are available through WhatsApp. We never ask for your PIN or full card details."
    },
    transfer: {
        title: "Bank Transfer",
        content: "Account name: <strong>YAGELA COLLECTION</strong><br>Bank: <strong>CAL Bank</strong><br>Account number: <strong>14400004555556</strong>"
    }
};

let selectedPaymentMethod = "momo";

function updatePaymentInstructions(method) {
    selectedPaymentMethod = method;
    const details = paymentDetails[method];

    paymentMethods.forEach(button => {
        const isSelected = button.dataset.method === method;
        button.classList.toggle("active", isSelected);
        button.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    paymentInstructions.innerHTML = `<strong>${details.title}</strong><p>${details.content}</p>`;
}

checkoutBtn.addEventListener("click", function () {
    if (cart.length === 0) {
        alert("Your shopping cart is empty.");
        return;
    }

    paymentTotal.textContent = cartTotal.textContent;
    updatePaymentInstructions(selectedPaymentMethod);
    paymentModal.classList.add("active");
    paymentModal.setAttribute("aria-hidden", "false");
});

paymentMethods.forEach(button => {
    button.addEventListener("click", function () {
        updatePaymentInstructions(this.dataset.method);
    });
});

function closePaymentModal() {
    paymentModal.classList.remove("active");
    paymentModal.setAttribute("aria-hidden", "true");
}

closePayment.addEventListener("click", closePaymentModal);

paymentModal.addEventListener("click", function (event) {
    if (event.target === paymentModal) closePaymentModal();
});

paymentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(paymentForm);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let message = "Hello YAGELA COLLECTION HUB!\n\nI would like to place an order:\n\n";

    cart.forEach(item => {
        message += `${item.name}\nQuantity: ${item.quantity}\nPrice: GH₵ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    message += `Total Order: GH₵ ${total.toFixed(2)}\n\n` +
        `Payment method: ${paymentDetails[selectedPaymentMethod].title}\n` +
        `Customer: ${formData.get("customerName")}\n` +
        `Phone: ${formData.get("customerPhone")}\n` +
        `Delivery address: ${formData.get("deliveryAddress")}`;

    try {
        await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer: {
                    name: formData.get("customerName"),
                    phone: formData.get("customerPhone"),
                    address: formData.get("deliveryAddress")
                },
                items: cart,
                paymentMethod: selectedPaymentMethod
            })
        });
    } catch (error) {
        console.warn("Order API unavailable; continuing with WhatsApp checkout.", error);
    }

    const whatsappNumber = "233244114452";
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
    closePaymentModal();
});


/* =========================================
   COMMENT FORM
========================================= */

const commentForm = document.getElementById("commentForm");

const commentsList = document.getElementById("commentsList");

const commentStorageKey = "yagelaComments";

const defaultComments = [

    {
        name: "Happy Customer",
        rating: 5,
        message: "Great customer service and quality products. I will definitely order again."
    },

    {
        name: "Verified Customer",
        rating: 5,
        message: "My order arrived on time and the product quality was excellent."
    }

];

let comments = JSON.parse(localStorage.getItem(commentStorageKey)) || defaultComments;

function renderComments() {

    if (!commentsList) return;

    commentsList.innerHTML = comments.map(comment => {

        const stars = "★".repeat(comment.rating) + "☆".repeat(5 - comment.rating);

        return `

            <article class="comment-item">
                <div class="comment-header">
                    <h4>${escapeCartText(comment.name)}</h4>
                    <span>${stars}</span>
                </div>
                <p>${escapeCartText(comment.message)}</p>
            </article>

        `;

    }).join("");

}

if (commentForm) {

    renderComments();

    commentForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("commentName").value.trim();
        const rating = Number(document.getElementById("commentRating").value);
        const message = document.getElementById("commentMessage").value.trim();

        if (!name || !message) return;

        comments.unshift({
            name,
            rating,
            message
        });

        localStorage.setItem(commentStorageKey, JSON.stringify(comments));

        renderComments();

        commentForm.reset();

    });

}

/* =========================================
   FAQ ACCORDION
========================================= */

const faqItems = document.querySelectorAll(".faq-item");


faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");


    question.addEventListener("click", function () {


        faqItems.forEach(otherItem => {

            if (otherItem !== item) {

                otherItem.classList.remove("active");
                otherItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");

            }

        });


        item.classList.toggle("active");
        question.setAttribute("aria-expanded", String(item.classList.contains("active")));

    });

});


/* =========================================
   SCROLL TO TOP
========================================= */

const scrollTop = document.getElementById("scrollTop");


window.addEventListener("scroll", function () {


    if (window.scrollY > 500) {

        scrollTop.classList.add("show");

    } else {

        scrollTop.classList.remove("show");

    }

});


scrollTop.addEventListener("click", function () {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});


/* =========================================
   CUSTOMER ACCOUNT BUTTON
========================================= */

const accountBtn = document.querySelector(".account-btn");


accountBtn.addEventListener("click", function () {


    alert(

        "Customer Account System\n\n" +

        "The current website is ready for the frontend design. " +

        "To create real customer registration, login, order history " +

        "and admin accounts, connect the website to a backend such as Firebase, Supabase, Node.js or PHP/MySQL."

    );

});

window.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    searchOverlay.classList.remove("active");
    searchOverlay.setAttribute("aria-hidden", "true");
    searchToggle.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open navigation menu");
    closeCartFunction();
    closePaymentModal();
});

// NEWSLETTER FORM

const newsletterForm = document.getElementById("newsletterForm");
const newsletterMessage = document.getElementById("newsletterMessage");

newsletterForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const formData = new FormData(newsletterForm);

    fetch(`${API_BASE_URL}/newsletter`, {
        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },

        body: new URLSearchParams(formData).toString()

    })

    .then(function (response) {
        if (!response.ok) {
            throw new Error("Newsletter subscription failed.");
        }

        newsletterMessage.textContent =
            "Subscribed, thank you!";

        newsletterMessage.style.color = "white";

        newsletterForm.reset();

    })

    .catch(function (error) {

        newsletterMessage.textContent =
            "Something went wrong. Please try again.";

        newsletterMessage.style.color = "red";

        console.error(error);

    });

});

/* =========================================
   INITIALIZE CART
========================================= */

updateCart();