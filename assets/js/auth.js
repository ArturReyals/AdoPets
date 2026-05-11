/**
 * AdoPet – auth.js
 * Módulo de autenticação e persistência via localStorage
 * Em produção: substituir por chamadas à API com JWT/sessão PHP
 */

const Auth = (() => {

    // ── Chaves do localStorage ──────────────────────────────────
    const KEYS = {
        users:      'adoPet_users',
        session:    'adoPet_session',
        pets:       'adoPet_pets',
        solicitacoes: 'adoPet_solicitacoes',
    };

    // ── Usuários e pets padrão (seed) ───────────────────────────
    const SEED_ADMIN = {
        id: 'adm-001',
        nome: 'Administrador',
        email: 'admin@adopet.com',
        senha: 'admin123',
        role: 'admin',
        criadoEm: '2026-01-01'
    };

    const SEED_PETS = [
        { id:1, nome:'Bolinha', tipo:'cachorro', sexo:'Macho', idade:'3 anos', porte:'medio', localizacao:'Fortaleza', descricao:'Bolinha é um cão dócil e brincalhão. Adora crianças e convive bem com outros animais.', vacinado:true, castrado:false, foto:'../assets/images/cachorro1.jpg', status:'disponivel', criadoEm:'2026-01-15' },
        { id:2, nome:'Mia',     tipo:'gato',    sexo:'Fêmea', idade:'1 ano',   porte:'pequeno', localizacao:'Fortaleza', descricao:'Mia é uma gatinha carinhosa e curiosa. Adapta-se bem a apartamentos.',              vacinado:true, castrado:true,  foto:'../assets/images/gato1.jpeg', status:'disponivel', criadoEm:'2026-01-20' },
        { id:3, nome:'Thor',    tipo:'cachorro', sexo:'Macho', idade:'4 meses', porte:'grande',  localizacao:'Caucaia',  descricao:'Thor ainda é filhote, cheio de energia! Será um cão de grande porte.',                vacinado:true, castrado:false, foto:'../assets/images/cachorro2.jpg', status:'disponivel', criadoEm:'2026-02-03' },
        { id:4, nome:'Luna',    tipo:'gato',    sexo:'Fêmea', idade:'2 meses', porte:'pequeno', localizacao:'Eusébio',  descricao:'Luna é muito doce e gentil. Aprendeu a usar a caixinha rapidinho.',                   vacinado:false, castrado:false, foto:'../assets/images/gato2.jpg',  status:'reservado',  criadoEm:'2026-02-10' },
        { id:5, nome:'Rex',     tipo:'cachorro', sexo:'Macho', idade:'5 anos',  porte:'grande',  localizacao:'Maracanaú', descricao:'Rex é leal e tranquilo. Foi resgatado de maus-tratos e adora carinho.',              vacinado:true, castrado:true,  foto:'../assets/images/cachorro1.jpg', status:'disponivel', criadoEm:'2026-03-01' },
        { id:6, nome:'Mel',     tipo:'gato',    sexo:'Fêmea', idade:'3 anos',  porte:'pequeno', localizacao:'Fortaleza', descricao:'Mel é independente mas carinhosa. Adora observar pássaros pela janela.',              vacinado:true, castrado:true,  foto:'../assets/images/gato2.jpg',  status:'disponivel', criadoEm:'2026-03-15' },
    ];

    // ── Inicialização ────────────────────────────────────────────
    function init() {
        // Seed admin
        let users = getUsers();
        if (!users.find(u => u.role === 'admin')) {
            users.push(SEED_ADMIN);
            saveUsers(users);
        }
        // Seed pets — garante que os pets originais sempre existam,
        // sem apagar animais cadastrados pelo admin.
        const petsExistentes = JSON.parse(localStorage.getItem(KEYS.pets) || '[]');
        const idsExistentes  = new Set(petsExistentes.map(p => Number(p.id)));
        let alterou = false;
        for (const seedPet of SEED_PETS) {
            if (!idsExistentes.has(Number(seedPet.id))) {
                petsExistentes.push(seedPet); // push no final para não reordenar pets novos
                alterou = true;
            }
        }
        if (alterou || !localStorage.getItem(KEYS.pets)) {
            localStorage.setItem(KEYS.pets, JSON.stringify(petsExistentes));
        }
        // Seed solicitações
        if (!localStorage.getItem(KEYS.solicitacoes)) {
            localStorage.setItem(KEYS.solicitacoes, JSON.stringify([]));
        }
    }

    // ── Usuários ─────────────────────────────────────────────────
    function getUsers() {
        return JSON.parse(localStorage.getItem(KEYS.users) || '[]');
    }
    function saveUsers(users) {
        localStorage.setItem(KEYS.users, JSON.stringify(users));
    }
    function getUserById(id) {
        return getUsers().find(u => u.id === id) || null;
    }

    // ── Cadastro ─────────────────────────────────────────────────
    function cadastrar({ nome, email, senha, telefone, cpf }) {
        const users = getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { ok: false, msg: 'Este e-mail já está cadastrado.' };
        }
        const novoUser = {
            id: 'usr-' + Date.now(),
            nome, email, senha, telefone: telefone || '', cpf: cpf || '',
            role: 'visitante',
            criadoEm: new Date().toISOString().split('T')[0]
        };
        users.push(novoUser);
        saveUsers(users);
        return { ok: true, user: novoUser };
    }

    // ── Login ────────────────────────────────────────────────────
    function login(email, senha) {
        const users = getUsers();
        const user = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
        );
        if (!user) return { ok: false, msg: 'E-mail ou senha incorretos.' };
        const session = { id: user.id, nome: user.nome, email: user.email, role: user.role };
        localStorage.setItem(KEYS.session, JSON.stringify(session));
        return { ok: true, user: session };
    }

    // ── Sessão ───────────────────────────────────────────────────
    function getSession() {
        return JSON.parse(localStorage.getItem(KEYS.session) || 'null');
    }
    function isLoggedIn() { return !!getSession(); }
    function isAdmin()    { const s = getSession(); return s && s.role === 'admin'; }
    function logout()     { localStorage.removeItem(KEYS.session); }

    // ── Pets ─────────────────────────────────────────────────────
    function getPets() {
        return JSON.parse(localStorage.getItem(KEYS.pets) || '[]');
    }
    function savePets(pets) {
        localStorage.setItem(KEYS.pets, JSON.stringify(pets));
    }
    function addPet(pet) {
        const pets = getPets();
        const maxId = pets.reduce((m, p) => Math.max(m, Number(p.id)), 0);
        const novoPet = { ...pet, id: maxId + 1, criadoEm: new Date().toISOString().split('T')[0] };
        pets.push(novoPet);
        savePets(pets);
        return novoPet;
    }
    function updatePet(id, data) {
        const pets = getPets();
        const idx = pets.findIndex(p => p.id === id);
        if (idx === -1) return false;
        pets[idx] = { ...pets[idx], ...data };
        savePets(pets);
        return true;
    }
    function deletePet(id) {
        const pets = getPets().filter(p => p.id !== id);
        savePets(pets);
    }

    // ── Solicitações de adoção ────────────────────────────────────
    function getSolicitacoes() {
        return JSON.parse(localStorage.getItem(KEYS.solicitacoes) || '[]');
    }
    function addSolicitacao(sol) {
        const list = getSolicitacoes();
        const nova = { ...sol, id: 'SOL-' + Date.now(), status: 'pendente', criadoEm: new Date().toISOString() };
        list.push(nova);
        localStorage.setItem(KEYS.solicitacoes, JSON.stringify(list));
        return nova;
    }
    function updateSolicitacao(id, status) {
        const list = getSolicitacoes();
        const idx = list.findIndex(s => s.id === id);
        if (idx !== -1) { list[idx].status = status; localStorage.setItem(KEYS.solicitacoes, JSON.stringify(list)); }
    }

    // ── Proteção de rota ─────────────────────────────────────────
    function requireLogin(redirectTo = 'login.html') {
        if (!isLoggedIn()) { window.location.href = redirectTo; return false; }
        return true;
    }
    function requireAdmin(redirectTo = 'login.html') {
        if (!isAdmin()) { window.location.href = redirectTo; return false; }
        return true;
    }

    // ── Header dinâmico ─────────────────────────────────────────
    function renderHeaderUser() {
        const session = getSession();
        const btns = document.querySelectorAll('.btn-login-header');
        btns.forEach(el => {
            if (session) {
                const isAdm = session.role === 'admin';
                el.innerHTML = isAdm
                    ? `<div class="dropdown">
                        <button class="btn dropdown-toggle" style="background:var(--rosa);color:white;border-radius:36px;font-size:13px;padding:8px 14px;" data-bs-toggle="dropdown">
                            <i class="bi bi-shield-lock me-1"></i>${session.nome.split(' ')[0]}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" style="border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
                            <li><a class="dropdown-item" href="${_adminPath(el)}admin.html"><i class="bi bi-speedometer2 me-2" style="color:var(--rosa);"></i>Painel Admin</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="Auth.logout();window.location.reload();"><i class="bi bi-box-arrow-right me-2"></i>Sair</a></li>
                        </ul>
                       </div>`
                    : `<div class="dropdown">
                        <button class="btn dropdown-toggle" style="background:var(--rosa);color:white;border-radius:36px;font-size:13px;padding:8px 14px;" data-bs-toggle="dropdown">
                            <i class="bi bi-person-fill me-1"></i>${session.nome.split(' ')[0]}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end" style="border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
                            <li><span class="dropdown-item-text text-muted" style="font-size:12px;">${session.email}</span></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="Auth.logout();window.location.reload();"><i class="bi bi-box-arrow-right me-2"></i>Sair</a></li>
                        </ul>
                       </div>`;
            } else {
                el.innerHTML = `<a href="${_loginPath(el)}" class="btn" style="background:var(--rosa);color:white;border-radius:36px;display:flex;align-items:center;justify-content:center;width:44px;height:44px;" title="Entrar"><i class="bi bi-person fs-4"></i></a>`;
            }
        });
    }

    function _adminPath(el) {
        // Resolve caminho relativo baseado na página atual
        return window.location.pathname.includes('/pages/') ? './' : './pages/';
    }
    function _loginPath(el) {
        return window.location.pathname.includes('/pages/') ? './login.html' : './pages/login.html';
    }

    init();

    return {
        cadastrar, login, logout,
        getSession, isLoggedIn, isAdmin,
        getUsers, getUserById,
        getPets, addPet, updatePet, deletePet,
        getSolicitacoes, addSolicitacao, updateSolicitacao,
        requireLogin, requireAdmin,
        renderHeaderUser,
    };
})();
