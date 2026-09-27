let allProducts = [];
let currentCart = [];

// 1. Definition Map for Multi-Sourced Store Designs
const apiSources = [
    {
        name: "⚡ FakeStore Web Service (Classic Apparel)",
        type: "fetch",
        url: "https://fakestoreapi.com",
        parser: (data) => data.filter(p => p.category.includes("clothing")).map(p => ({
            id: `fs-${p.id}`,
            title: p.title,
            price: p.price,
            category: p.category.toUpperCase(),
            image: p.image
        }))
    },
    {
        name: "⚡ Escuela Public API (Premium Contemporary)",
        type: "fetch",
        url: "https://escuelajs.co",
        parser: (data) => data.filter(p => p.category?.name.toLowerCase().includes('clot') || p.category?.name.toLowerCase().includes('shoe')).map(p => ({
            id: `pz-${p.id}`,
            title: p.title,
            price: p.price,
            category: "DESIGNER LINE",
            image: p.images ? p.images.replace(/[\[\]"]/g, "") : "https://unsplash.com"
        }))
    },
    {
        name: "💎 Minimalist Studio Vault (Stable Local System)",
        type: "local",
        data: [
            { id: "mn-1", title: "Linen Oversized Blazer", price: 110.00, category: "MINIMALIST LUXURY", image: "https://unsplash.com" },
            { id: "mn-2", title: "Tailored Crisp Summer Trouser", price: 85.00, category: "MINIMALIST LUXURY", image: "https://unsplash.com" },
            { id: "mn-3", title: "Ribbed Organic Knit Maxi Dress", price: 95.00, category: "MINIMALIST LUXURY", image: "https://unsplash.com" },
            { id: "mn-4", title: "Raw Hem Utility Jacket", price: 125.00, category: "MINIMALIST LUXURY", image: "https://unsplash.com" }
        ]
    },
    {
        name: "🔥 Streetwear Hype Archive (Stable Local System)",
        type: "local",
        data: [
            { id: "st-1", title: "Heavyweight Boxy Drop-Shoulder Hoodie", price: 78.00, category: "STREETWEAR", image: "https://unsplash.com" },
            { id: "st-2", title: "Relaxed Fit Denim Skate Cargo", price: 69.99, category: "STREETWEAR", image: "https://unsplash.com" },
            { id: "st-3", title: "Distressed Graphic Vintage Washed Tee", price: 34.50, category: "STREETWEAR", image: "https://unsplash.com" },
            { id: "st-4", title: "Colorblock Technical Track Jacket", price: 88.00, category: "STREETWEAR", image: "https://unsplash.com" }
        ]
    }
];

// 2. Lifecycle Ignition Event Handler
document.addEventListener("DOMContentLoaded", () => {
    triggerEngineRotation();
});

// 3. Selection System Implementation Loop
function triggerEngineRotation() {
    const randomIndex = Math.floor(Math.random() * apiSources.length);
    const activeStore = apiSources[randomIndex];
    
    document.getElementById('store-subtitle').innerText = `Active Store Mode: ${activeStore.name}`;

    if (activeStore.type === "local") {
        allProducts = activeStore.data;
        displayInterface();
    } else {
        fetch(activeStore.url)
            .then(res => {
                if(!res.ok) throw new Error("API Server Throttled");
                return res.json();
            })
            .then(data => {
                allProducts = activeStore.parser(data);
                if(allProducts.length === 0) throw new Error("Dataset Parse Integrity Fault");
                displayInterface();
            })
            .catch(err => {
                console.warn(`"${activeStore.name}" experienced connection faults. Initializing hard recovery failover vault...`, err);
                const backupVault = apiSources[2]; // Fall back to minimal design vaults
                allProducts = backupVault.data;
                document.getElementById('store-subtitle').innerText = `Active Store Mode: ${backupVault.name} (Failover Redirect)`;
                displayInterface();
            });
    }
}

function displayInterface() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('product-grid').classList.remove('hidden');
    renderProductCards();
}

// 4. UI Grid Generator Function
function renderProductCards() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    allProducts.forEach(item => {
        grid.innerHTML += `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition duration-300">
                <div class="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img src="${item.image}" alt="${item.title}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition duration-500" onerror="this.src='https://unsplash.com'">
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <span class="text-[9px] uppercase font-bold tracking-widest text-indigo-600 mb-1">${item.category}</span>
                    <h3 class="text-xs font-semibold text-gray-800 line-clamp-2 mb-2 flex-grow">${item.title}</h3>
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <span class="text-sm font-black text-gray-900">$${item.price.toFixed(2)}</span>
                        <button onclick="addBagItem('${item.id}')" class="bg-gray-900 text-white text-[10px] font-bold py-2 px-3 rounded-xl hover:bg-indigo-600 transition shadow-sm">
                            Add To Bag
                        </button>
                    </div>
                </div>
            </div>`;
    });
    if(window.lucide) lucide.createIcons();
}

// 5. Shared Cart Lifecycle Logic Engine
function toggleCart() {
    document.getElementById('cart-drawer').classList.toggle('hidden');
}

function addBagItem(id) {
    const product = allProducts.find(p => p.id === id);
    if(!product) return;
    
    const existing = currentCart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        currentCart.push({ ...product, quantity: 1 });
    }
    synchronizeCartUI();
}

function adjustQuantity(id, delta) {
    const match = currentCart.find(item => item.id === id);
    if (match) {
        match.quantity += delta;
        if (match.quantity <= 0) currentCart = currentCart.filter(i => i.id !== id);
    }
    synchronizeCartUI();
}

function synchronizeCartUI() {
    const sumCount = currentCart.reduce((acc, i) => acc + i.quantity, 0);
    const badge = document.getElementById('cart-count');
    badge.innerText = sumCount;
    sumCount > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');

    const sumCash = currentCart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    document.getElementById('cart-total').innerText = `$${sumCash.toFixed(2)}`;

    const itemsWrapper = document.getElementById('cart-items');
    if (currentCart.length === 0) {
        itemsWrapper.innerHTML = `
            <div class="text-center py-20 text-gray-400">
                <i data-lucide="shopping-bag" class="w-10 h-10 mx-auto mb-2 opacity-30"></i>
                <p class="text-xs">Your shopping bag is completely empty.</p>
            </div>`;
    } else {
        itemsWrapper.innerHTML = currentCart.map(item => `
            <div class="flex items-center justify-between gap-4 py-4 border-b border-gray-50">
                <img src="${item.image}" class="w-11 h-14 object-cover rounded-md bg-gray-100 shadow-inner">
                <div class="flex-grow">
                    <h4 class="text-xs font-bold text-gray-800 line-clamp-1">${item.title}</h4>
                    <p class="text-xs font-semibold text-gray-400 mt-0.5">$${item.price.toFixed(2)}</p>
                </div>
                <div class="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden text-[11px]">
                    <button onclick="adjustQuantity('${item.id}', -1)" class="px-2 py-0.5 text-gray-400 font-bold">-</button>
                    <span class="px-2 font-black text-gray-700">${item.quantity}</span>
                    <button onclick="adjustQuantity('${item.id}', 1)" class="px-2 py-0.5 text-gray-400 font-bold">+</button>
                </div>
            </div>`).join('');
    }
    if(window.lucide) lucide.createIcons();
}

function checkout() {
    if (currentCart.length === 0) return;
    alert("Checkout complete! Transaction simulated seamlessly within current randomized interface layer.");
    currentCart = [];
    synchronizeCartUI();
    toggleCart();
}
