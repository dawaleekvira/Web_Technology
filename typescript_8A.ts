
interface Product {
    id: number;
    name: string;
    price: number;
}

const products: Product[] = [
    { id: 1, name: "Notebook", price: 40 },
    { id: 2, name: "Pen", price: 10 },
    { id: 3, name: "Bag", price: 500 },
    { id: 4, name: "Water Bottle", price: 150 }
];

let cart: Product[] = [];

const productList = document.getElementById("product-list");
const cartList = document.getElementById("cart-list");
const totalPriceEl = document.getElementById("total-price");

if (!productList || !cartList || !totalPriceEl) {
    throw new Error("Required HTML elements not found.");
}

function displayProducts(): void {
    if (!productList) {
        throw new Error("Product list element not found.");
    }

    productList.innerHTML = products.map((product: Product) => `
        <div class="product-card">
            <h3>${product.name}</h3>
            <p>Price: ₹${product.price}</p>
            <button data-id="${product.id}">Add to Cart</button>
        </div>
    `).join("");
}

function addToCart(id: number): void {
    const item = products.find((p: Product) => p.id === id);

    if (item) {
        cart.push(item);
        displayCart();
    }
}

function removeFromCart(id: number): void {
    const index = cart.findIndex((item: Product) => item.id === id);

    if (index !== -1) {
        cart.splice(index, 1);
        displayCart();
    }
}

function calculateTotal(): number {
    return cart.reduce(
        (sum: number, item: Product): number => sum + item.price,
        0
    );
}

function displayCart(): void {
    cartList!.innerHTML = cart.map((item: Product) => `
        <li>
            ${item.name} - ₹${item.price}
            <button data-id="${item.id}">Remove</button>
        </li>
    `).join("");

    totalPriceEl!.textContent = String(calculateTotal());
}

productList.addEventListener("click", (event: MouseEvent): void => {
    const target = event.target;

    if (target instanceof HTMLButtonElement) {
        addToCart(Number(target.dataset.id));
    }
});

cartList.addEventListener("click", (event: MouseEvent): void => {
    const target = event.target;

    if (target instanceof HTMLButtonElement) {
        removeFromCart(Number(target.dataset.id));
    }
});

displayProducts();
displayCart();
export {};