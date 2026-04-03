/** 
 * Sa1MyShop Zenith v3.5.3 - MASTER BRANDING & IMAGE STABILITY
 */

// 1. GLOBAL HANDLER BOOTSTRAP (Defined EARLY for reliability)
window.handleLogin = () => {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    if (window.store.login(u, p)) {
        window.showNotify('PROTOCOL INIT', `Session key for ${u} verified.`, 'success');
        window.render();
    } else { window.showNotify('ACCESS DENIED', 'Identity verification failure.', 'error'); }
};

window.handleRegister = () => {
    const u = document.getElementById('reg-username').value;
    const p = document.getElementById('reg-password').value;
    const r = document.getElementById('reg-role').value;
    if (window.store.register(u, p, r)) {
        window.showNotify('IDENTITY CREATED', 'Logon using new credentials.', 'success');
        window.toggleAuth(false);
    } else { window.showNotify('ID TAKEN', 'Username already exists.', 'error'); }
};

window.toggleAuth = (reg) => {
    document.getElementById('login-form').classList.toggle('hidden', reg);
    document.getElementById('register-form').classList.toggle('hidden', !reg);
};

window.switchTab = (tab) => {
    window.store.currentTab = tab;
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.id === `nav-${tab}`));
    window.render();
};

window.openProduct = (id) => {
    window.store.activeProductId = id;
    window.store.currentTab = 'detail';
    window.render();
};

window.handleAddToCart = (id) => {
    const p = window.store.products.find(item => item.id == id);
    if (p) {
        window.store.cart.push({ ...p, cartEntryId: Math.random().toString(36).substr(2, 9) });
        window.store.save();
        window.showNotify('ГОТОВО', 'Товар добавлен в корзину.', 'success');
        window.render();
    }
};

window.toggleCart = () => {
    document.getElementById('cart-drawer').classList.toggle('open');
    window.renderCart();
};

window.handleCheckout = () => {
    if (!window.store.cart.length) return;
    const order = { id: 'TX-' + Math.random().toString(36).substr(2, 6).toUpperCase(), total: window.store.cart.reduce((s, i) => s + i.price, 0) };
    window.store.orders.unshift(order);
    window.store.cart = [];
    window.store.save();
    window.showNotify('ЗАКАЗ ОФОРМЛЕН', `Ваш заказ ${order.id} принят.`, 'success');
    window.toggleCart();
    window.render();
};

window.handleLogout = () => {
    sessionStorage.clear();
    window.location.reload();
};

window.handleSearch = () => {
    window.store.searchQuery = document.getElementById('search-bar').value;
    if (window.store.currentTab === 'shop') window.renderShop();
};

window.handleDelete = (id) => {
    if (confirm('CONFIRM PURGE FROM ARCHIVE?')) {
        window.store.products = window.store.products.filter(p => p.id != id);
        window.store.save();
        window.showNotify('PURGE COMPLETE', 'Asset removed from all system records.', 'success');
        window.render();
    }
};

window.handleVerify = (id, status) => {
    const p = window.store.products.find(x => x.id == id);
    if (p) p.status = status;
    window.store.save();
    window.showNotify('ACCESS GRANTED', 'Product visible in archive.', 'success');
    window.render();
};

window.removeFromCart = (entryId) => {
    window.store.cart = window.store.cart.filter(i => i.cartEntryId !== entryId);
    window.store.save();
    window.renderCart();
    window.render();
};

window.showNotify = (t, m, type = 'success') => {
    const o = document.createElement('div'); o.className = 'notify-overlay';
    o.innerHTML = `<div class="notify-card">
        <div class="notify-icon">${type === 'success' ? '⚡' : '⚠️'}</div>
        <h2 style="margin-bottom:0.5rem;">${t}</h2><p style="color:var(--wb-text-light); margin-bottom:2rem;">${m}</p>
        <button class="btn btn-wb" style="width:100%; border-radius:12px;" onclick="this.closest('.notify-overlay').remove()">DISMISS</button>
    </div>`;
    document.body.appendChild(o);
};

// 2. CORE CLASS & DATA (Zenith 50-Item Logic)
class WildMarketStore {
    constructor() {
        // Force cleanup for version 3.5.3 (Branding Update)
        const version = localStorage.getItem('wm_version');
        if (version !== '3.5.3') { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('wm_version', '3.5.3'); }

        this.products = JSON.parse(localStorage.getItem('wm_products')) || this.seedProducts();
        this.users = JSON.parse(localStorage.getItem('wm_users')) || [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
            { id: 2, username: 'seller', password: 'secret', role: 'seller', bio: 'Authorized Partner.' },
            { id: 3, username: 'buyer', password: 'password', role: 'buyer' }
        ];
        this.currentUser = JSON.parse(sessionStorage.getItem('wm_session')) || null;
        this.cart = JSON.parse(localStorage.getItem('wm_cart')) || [];
        this.orders = JSON.parse(localStorage.getItem('wm_orders')) || [];
        this.currentTab = 'shop';
        this.activeProductId = null;
        this.searchQuery = '';
    }

    seedProducts() {
        const categories = ['Electronics', 'Home', 'Fashion', 'Sports', 'Beauty'];
        const sellers = ['AlphaTech', 'VibeHome', 'PulseStyle', 'ActiveFit', 'PureBeauty'];
        let list = [];
        for (let i = 0; i < 50; i++) {
            const cat = categories[i % 5];
            const p_id = i + 1;
            list.push({
                id: p_id, 
                name: `${cat} Elite Model ${p_id}`, 
                category: cat, 
                price: 2500 + (i * 750),
                // Using 100% reliable PicSum seeds linked to ID
                image: `https://picsum.photos/seed/sa1_${p_id}/600/800`,
                status: 'approved', 
                seller: sellers[i % 5], 
                rating: 4.8, 
                reviews: [
                    { user: "Alex J.", rating: 5, text: "Incredible quality for Sa1MyShop!" },
                    { user: "M. Rose", rating: 4, text: "Excellent delivery and item." }
                ],
                longDesc: `A flagship offering from Sa1MyShop. This model represents the peak of modern ${cat} utility.`,
                specs: { Build: 'Premium', Warranty: '2 Year', Vendor: sellers[i%5] }
            });
        }
        return list;
    }

    save() {
        localStorage.setItem('wm_products', JSON.stringify(this.products));
        localStorage.setItem('wm_users', JSON.stringify(this.users));
        localStorage.setItem('wm_cart', JSON.stringify(this.cart));
        localStorage.setItem('wm_orders', JSON.stringify(this.orders));
    }

    login(u, p) {
        const user = this.users.find(x => x.username === u && x.password === p);
        if (user) { this.currentUser = user; sessionStorage.setItem('wm_session', JSON.stringify(user)); return true; }
        return false;
    }

    register(u, p, r) {
        if (this.users.some(x => x.username === u)) return false;
        this.users.push({ id: Date.now(), username: u, password: p, role: r });
        this.save();
        return true;
    }
}

window.store = new WildMarketStore();

// 3. RENDER ENGINE
window.render = () => {
    const authS = document.getElementById('auth-section');
    const appS = document.getElementById('app-section');
    if (!window.store.currentUser) { authS.classList.remove('hidden'); appS.classList.add('hidden'); return; }
    authS.classList.add('hidden'); appS.classList.remove('hidden');
    document.getElementById('nav-seller').classList.toggle('hidden', window.store.currentUser.role !== 'seller');
    document.getElementById('nav-admin').classList.toggle('hidden', window.store.currentUser.role !== 'admin');
    document.getElementById('role-banner').innerText = `SECURE SESSION: ${window.store.currentUser.username.toUpperCase()} | ROLE: ${window.store.currentUser.role.toUpperCase()}`;
    
    switch(window.store.currentTab) {
        case 'shop': window.renderShop(); break;
        case 'seller': window.renderSellerHub(); break;
        case 'admin': window.renderAdminHub(); break;
        case 'detail': window.renderProductDetail(window.store.activeProductId); break;
    }
    document.getElementById('cart-count').innerText = window.store.cart.length;
};

window.renderShop = () => {
    const main = document.getElementById('main-view');
    const filtered = window.store.products.filter(p => p.status === 'approved' && p.name.toLowerCase().includes(window.store.searchQuery.toLowerCase()));
    main.innerHTML = `<div class="grid">${filtered.map(p => `
        <div class="product-card" onclick="window.openProduct(${p.id})">
            <img src="${p.image}">
            <div class="product-info">
                <div class="product-price">${p.price.toLocaleString()} ₽</div>
                <div class="product-name">${p.name}</div>
            </div>
        </div>
    `).join('')}</div>`;
};

window.renderProductDetail = (id) => {
    const p = window.store.products.find(x => x.id == id);
    if (!p) { window.switchTab('shop'); return; }
    document.getElementById('main-view').innerHTML = `
        <button class="btn" onclick="window.switchTab('shop')">← BACK</button>
        <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:4rem; margin-top:2rem;">
            <img src="${p.image}" style="width:100%; border-radius:20px;">
            <div>
                <h1>${p.name}</h1>
                <div style="font-size:2rem; font-weight:900; color:var(--wb-purple); margin:1rem 0;">${p.price.toLocaleString()} ₽</div>
                <p>${p.longDesc}</p>
                <button class="btn btn-wb" style="width:100%; margin-top:2rem;" onclick="window.handleAddToCart(${p.id})">В КОРЗИНУ</button>
            </div>
        </div>`;
};

window.handleNewListing = () => {
    const o = document.createElement('div'); o.className = 'notify-overlay';
    o.innerHTML = `
        <div class="notify-card" style="text-align:left; max-width:440px;">
            <h2 style="margin-bottom:1.5rem;">НОВЫЙ ТОВАР</h2>
            <input type="text" id="new-p-name" class="input-field" placeholder="Название товара">
            <input type="number" id="new-p-price" class="input-field" placeholder="Цена (₽)">
            <select id="new-p-cat" class="input-field" style="margin-bottom:1rem;">
                <option value="Electronics">Electronics</option>
                <option value="Home">Home</option>
                <option value="Fashion">Fashion</option>
                <option value="Sports">Sports</option>
                <option value="Beauty">Beauty</option>
            </select>
            <div style="display:flex; gap:1rem; margin-top:2rem;">
                <button class="btn" style="flex:1; border:1px solid #ddd;" onclick="this.closest('.notify-overlay').remove()">ОТМЕНА</button>
                <button class="btn btn-wb" style="flex:1;" onclick="window.submitNewListing()">СОЗДАТЬ</button>
            </div>
        </div>`;
    document.body.appendChild(o);
};

window.submitNewListing = () => {
    const name = document.getElementById('new-p-name').value;
    const price = parseInt(document.getElementById('new-p-price').value);
    const cat = document.getElementById('new-p-cat').value;
    if (name && !isNaN(price)) {
        const id = Date.now();
        window.store.products.unshift({
            id, name, price, category: cat, status: 'pending',
            seller: window.store.currentUser.username,
            image: `https://picsum.photos/seed/sa1_${id}/600/800`,
            longDesc: 'Ожидает проверки модератором Sa1MyShop.',
            specs: { Build: 'Premium' }, reviews: [], rating: 0
        });
        window.store.save();
        document.querySelector('.notify-overlay').remove();
        window.showNotify('ГОТОВО', 'Заявка на товар отправлена модератору.', 'success');
        window.render();
    } else {
        alert('Пожалуйста, заполните все поля корректно.');
    }
};

window.renderSellerHub = () => {
    const main = document.getElementById('main-view');
    const myItems = window.store.products.filter(p => p.seller === window.store.currentUser.username);
    main.innerHTML = `
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
            <h1>Sa1 Кабинет</h1>
            <button class="btn btn-wb" onclick="window.handleNewListing()">+ НОВЫЙ ТОВАР</button>
        </div>
        <div class="grid">
            ${myItems.map(p => `
                <div class="product-card" style="cursor: default;">
                    <img src="${p.image}" style="height: 150px; opacity: 0.8;">
                    <div class="product-info">
                        <h4>${p.name.toUpperCase()}</h4>
                        <div style="display:flex; gap: 0.5rem; margin-top: 1rem;">
                            <span class="btn" style="flex:1; font-size: 0.7rem; padding: 0.3rem; border: 1px solid #ddd; text-align:center;">${p.status.toUpperCase()}</span>
                            <button class="btn" style="flex:1; font-size: 0.7rem; color: #ef4444; border: 1px solid #fee2e2;" onclick="window.handleDelete(${p.id})">УДАЛИТЬ</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

window.renderAdminHub = () => {
    const main = document.getElementById('main-view');
    main.innerHTML = `
        <h1 style="margin-bottom: 3rem;">Sa1 Модератор</h1>
        <div class="grid">
            ${window.store.products.map(p => `
                <div class="product-card" style="cursor: default;">
                    <img src="${p.image}" style="height: 120px; opacity:0.8;">
                    <div class="product-info">
                        <h4 style="font-size: 0.85rem;">${p.name}</h4>
                        <p style="font-size: 0.7rem; color: var(--wb-text-light);">SELLER: ${p.seller}</p>
                        <div style="display:flex; gap: 0.5rem; margin-top: 1rem;">
                            ${p.status === 'pending' ? `<button class="btn btn-wb" style="flex:1; font-size: 0.6rem;" onclick="window.handleVerify(${p.id}, 'approved')">ОДОБРИТЬ</button>` : ''}
                            <button class="btn" style="flex:1; font-size: 0.6rem; color: red;" onclick="window.handleDelete(${p.id})">УДАЛИТЬ</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};
window.renderCart = () => {
    const list = document.getElementById('cart-list');
    list.innerHTML = window.store.cart.map(i => `
        <div style="display:flex; justify-content:space-between; padding:1rem 0; border-bottom:1px solid #eee;">
            <img src="${i.image}" style="width:40px; height:40px;">
            <div>${i.name}</div>
            <button onclick="window.removeFromCart('${i.cartEntryId}')">✕</button>
        </div>`).join('');
    document.getElementById('cart-total').innerText = `${window.store.cart.reduce((s,x)=>s+x.price,0).toLocaleString()} ₽`;
};

// 4. BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.render();
        const indicator = document.getElementById('health-indicator');
        indicator.innerText = 'Sa1MyShop ONLINE v3.5.3';
        indicator.style.background = '#22c55e';
    } catch(e) { console.error('Bootstrap Critical Error:', e); }
});
