/* Loads active Supabase products while retaining the static catalog as fallback. */
(function () {
    const isConfigured = window.supabase
        && window.YAGELA_SUPABASE_URL
        && window.YAGELA_SUPABASE_ANON_KEY
        && !window.YAGELA_SUPABASE_URL.includes("YOUR-PROJECT")
        && !window.YAGELA_SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");

    if (!isConfigured) return;

    const db = window.supabase.createClient(
        window.YAGELA_SUPABASE_URL,
        window.YAGELA_SUPABASE_ANON_KEY
    );

    const categoryLabels = {
        personal: "Personal Care",
        home: "Household",
        fashion: "Fashion",
        ppe: "Engineering PPE",
        fragrance: "Fragrance",
        juice: "Fresh Juice"
    };

    const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[character]);

    document.addEventListener("DOMContentLoaded", async () => {
        const grid = document.getElementById("productGrid");
        if (!grid) return;

        const { data, error } = await db
            .from("products")
            .select("id,name,category,price,image_url,badge,description,active,sort_order")
            .eq("active", true)
            .order("sort_order")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Unable to load the Supabase catalog; using the static catalog.", error);
            return;
        }
        if (!data?.length) return;

        grid.innerHTML = data.map(product => {
            const price = Number(product.price);
            const isInquiry = price === 0 && /price on request/i.test(product.description || "");
            const name = escapeHtml(product.name);
            const description = product.description
                ? `<p class="small-text">${escapeHtml(product.description)}</p>`
                : "";
            const badge = product.badge
                ? `<span class="product-badge ${String(product.badge).toLowerCase() === "sale" ? "sale" : ""}">${escapeHtml(product.badge)}</span>`
                : "";
            const category = escapeHtml(categoryLabels[product.category] || product.category);
            const priceText = isInquiry ? "Price on request" : `GH₵ ${price.toFixed(2)}`;
            const buttonText = isInquiry ? "Ask about pricing" : "Add to Cart";
            const inquiryAttribute = isInquiry ? ' data-inquiry="true"' : "";

            return `
                <div class="product-card" data-category="${escapeHtml(product.category)}" data-product-id="${escapeHtml(product.id)}">
                    <div class="product-image">
                        <img src="${escapeHtml(product.image_url || "assets/collect.jpg")}" alt="${name}" loading="lazy" decoding="async">
                        ${badge}
                    </div>
                    <div class="product-info">
                        <span class="product-category">${category}</span>
                        <h3>${name}</h3>
                        ${description}
                        <div class="product-price">${priceText}</div>
                        <button class="add-cart" data-name="${name}" data-price="${Number.isFinite(price) ? price : 0}" data-product-id="${escapeHtml(product.id)}"${inquiryAttribute}>
                            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
                            ${buttonText}
                        </button>
                    </div>
                </div>
            `;
        }).join("");

        if (typeof window.applyProductFilters === "function") {
            window.applyProductFilters();
        }

        grid.addEventListener("click", event => {
            const button = event.target.closest(".add-cart");
            if (!button) return;

            if (button.dataset.inquiry === "true") {
                const message = encodeURIComponent(
                    `Hello YAGELA COLLECTION HUB, please share the current price for ${button.dataset.name}.`
                );
                window.open(`https://wa.me/233244114452?text=${message}`, "_blank", "noopener,noreferrer");
                return;
            }

            const cart = JSON.parse(localStorage.getItem("yagelaCart") || "[]");
            const item = cart.find(cartItem =>
                cartItem.productId === button.dataset.productId
                || (!cartItem.productId && cartItem.name === button.dataset.name)
            );

            if (item) {
                item.quantity += 1;
            } else {
                cart.push({
                    name: button.dataset.name,
                    price: Number(button.dataset.price),
                    quantity: 1,
                    productId: button.dataset.productId
                });
            }

            localStorage.setItem("yagelaCart", JSON.stringify(cart));
            if (typeof window.updateCart === "function") window.updateCart();

            const cartButton = document.getElementById("cartButton");
            if (cartButton) cartButton.click();
        });
    });
})();
