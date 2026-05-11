# AdoPet – Estrutura do Projeto

```
AdoPet/
│
├── index.html                  ← Página inicial (Home)
│
├── assets/
│   ├── css/
│   │   └── style.css           ← Todos os estilos do projeto
│   ├── js/
│   │   └── main.js             ← Toda a lógica JS (menu, filtros)
│   └── images/                 ← Imagens e logo
│       ├── aaa.png
│       ├── cachorro1.jpg
│       ├── cachorro2.jpg
│       ├── gato1.jpeg
│       └── gato2.jpg
│
└── pages/                      ← Páginas futuras
    ├── pets.html               ← (a criar) Lista de todos os pets
    ├── sobre.html              ← (a criar) Sobre a organização
    └── doacoes.html            ← (a criar) Página de doações
```

## Como adicionar novas páginas

Cada nova página deve incluir no `<head>`:
```html
<link rel="stylesheet" href="../assets/css/style.css">
```
E antes do `</body>`:
```html
<script src="../assets/js/main.js"></script>
```

> Atenção: páginas dentro de `/pages/` usam `../` para subir um nível.

## Filtros da Search Bar

Os filtros são gerenciados em `main.js`. Para adicionar novas opções
(ex: nova cidade), basta incluir no array correspondente dentro de `opcoesFiltros`
e adicionar o `.filter-option` no HTML.
