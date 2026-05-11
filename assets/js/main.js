// ===========================
// MENU DESLIZANTE
// ===========================
const btnMenu = document.getElementById('btnMenuToggle');
const containerBotoes = document.getElementById('botoesOcultos');
const iconeMenu = document.getElementById('iconeMenu');

if (btnMenu) {
    btnMenu.addEventListener('click', function () {
        containerBotoes.classList.toggle('mostrar');
        if (containerBotoes.classList.contains('mostrar')) {
            iconeMenu.classList.replace('bi-list', 'bi-x-lg');
        } else {
            iconeMenu.classList.replace('bi-x-lg', 'bi-list');
        }
    });
}

// ===========================
// FILTROS CLICÁVEIS
// ===========================

// Estado atual dos filtros
const filtros = {
    tipo: null,
    idade: null,
    porte: null,
    localizacao: null
};

// Opções disponíveis por filtro
const opcoesFiltros = {
    tipo: [
        { valor: 'cachorro', label: 'Cachorro' },
        { valor: 'gato',     label: 'Gato' }
    ],
    idade: [
        { valor: 'filhote', label: 'Filhote' },
        { valor: 'adulto',  label: 'Adulto' }
    ],
    porte: [
        { valor: 'pequeno', label: 'Pequeno' },
        { valor: 'medio',   label: 'Médio' },
        { valor: 'grande',  label: 'Grande' }
    ],
    localizacao: [
        { valor: 'fortaleza', label: 'Fortaleza' },
        { valor: 'caucaia',   label: 'Caucaia' },
        { valor: 'eusebio',   label: 'Eusébio' },
        { valor: 'maracanau', label: 'Maracanaú' }
    ]
};

// Placeholders exibidos quando nenhuma opção está selecionada
const placeholders = {
    tipo:        'Cachorro/Gato',
    idade:       'Filhote/Adulto',
    porte:       'Pequeno/Médio/Grande',
    localizacao: 'Cidade/Estado'
};

/**
 * Abre/fecha o dropdown de um filtro.
 * Fecha todos os outros antes de abrir o solicitado.
 */
function toggleDropdown(chave) {
    const dropdown = document.getElementById('dropdown-' + chave);
    const estaAberto = dropdown.classList.contains('aberto');

    // Fecha todos os dropdowns
    document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('aberto'));

    if (!estaAberto) {
        dropdown.classList.add('aberto');
    }
}

/**
 * Seleciona (ou deseleciona) uma opção em um filtro.
 */
function selecionarOpcao(chave, valor) {
    // Toggle: clicar na opção já selecionada limpa o filtro
    filtros[chave] = filtros[chave] === valor ? null : valor;

    // Atualiza o texto exibido no bloco do filtro
    const spanValor = document.getElementById('valor-' + chave);
    if (filtros[chave]) {
        const opcao = opcoesFiltros[chave].find(o => o.valor === filtros[chave]);
        spanValor.textContent = opcao ? opcao.label : placeholders[chave];
        spanValor.style.color = '#A61C5D';
        spanValor.style.fontWeight = '600';
    } else {
        spanValor.textContent = placeholders[chave];
        spanValor.style.color = '';
        spanValor.style.fontWeight = '';
    }

    // Atualiza a marcação visual dentro do dropdown
    document.querySelectorAll(`#dropdown-${chave} .filter-option`).forEach(el => {
        el.classList.toggle('selecionado', el.dataset.valor === filtros[chave]);
    });

    // Fecha o dropdown após seleção
    document.getElementById('dropdown-' + chave).classList.remove('aberto');
}

/**
 * Fecha todos os dropdowns quando o usuário clica fora deles.
 */
document.addEventListener('click', function (e) {
    if (!e.target.closest('.filter-block')) {
        document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('aberto'));
    }
});

/**
 * Coleta os filtros ativos e exibe no console (ponto de integração futura).
 */
function buscarPets() {
    const filtrosAtivos = Object.fromEntries(
        Object.entries(filtros).filter(([, v]) => v !== null)
    );
    console.log('Buscando pets com filtros:', filtrosAtivos);
    // TODO: chamar API ou redirecionar para página de resultados
    // Ex: window.location.href = `pages/pets.html?tipo=${filtros.tipo || ''}...`
    alert(`Buscando pets!\n${JSON.stringify(filtrosAtivos, null, 2)}`);
}
