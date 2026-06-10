const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const admin = require('firebase-admin'); // Importa o SDK do Firebase
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Inicializa o cliente do Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Inicializa o Firebase Admin com a sua chave baixada
const serviceAccount = require('./firebase-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://adopets-16d30-default-rtdb.firebaseio.com/"
});

// Conexão com o banco Realtime Database
const db = admin.database();

app.use(cors());
app.use(express.json());

// Função utilitária para geração de protocolos únicos
function gerarProtocolo(prefixo, tamanho = 4) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < tamanho; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return `${prefixo}-${codigo}`;
}

app.get('/', (req, res) => {
    res.send('Servidor do AdoPets rodando com sucesso e conectado ao Realtime Database!');
});

// RF04 e RF08.1: Rota para Listar Pets do Realtime Database (com filtros em tempo real)
app.get('/api/pets', async (req, res) => {
    try {
        const { tipo, idade, porte, localizacao } = req.query;
        
        // Busca todos os nós dentro de 'pets'
        const snapshot = await db.ref('pets').once('value');
        const dados = snapshot.val();
        
        let pets = [];
        if (dados) {
            // Transforma o objeto do Firebase em um Array legível para o React
            pets = Object.keys(dados).map(key => ({
                id: key,
                ...dados[key]
            }));
        }

        // Aplica os filtros na listagem em tempo real (caso sejam passados na URL)
        if (tipo) pets = pets.filter(p => p.especie.toLowerCase() === tipo.toLowerCase());
        if (idade) pets = pets.filter(p => p.idade.toLowerCase() === idade.toLowerCase());
        if (porte) pets = pets.filter(p => p.porte.toLowerCase() === porte.toLowerCase());
        if (localizacao) pets = pets.filter(p => p.localizacao.toLowerCase() === localizacao.toLowerCase());

        res.json(pets);
    } catch (error) {
        console.error('Erro ao listar pets do Firebase:', error);
        res.status(500).json({ error: 'Erro ao listar os pets no banco de dados.' });
    }
});

// RF05: Rota para Cadastrar um Novo Pet direto no Realtime Database
app.post('/api/pets', async (req, res) => {
    try {
        const { nome, especie, sexo, idade, porte, localizacao, descricao, urlFoto, vacinado, castrado } = req.body;

        if (!nome || !especie || !sexo || !idade || !porte || !localizacao || !urlFoto) {
            return res.status(400).json({ error: 'Campos obrigatórios do pet estão ausentes.' });
        }

        const novoPet = {
            nome,
            especie: especie.toLowerCase(),
            sexo: sexo.toLowerCase(),
            idade: idade.toLowerCase(),
            porte: porte.toLowerCase(),
            localizacao,
            descricao: descricao || '',
            urlFoto,
            status: 'disponível',
            vacinado: vacinado || false,
            castrado: castrado || false,
            dataCadastro: new Date().toISOString()
        };

        // Salva na referência 'pets' gerando uma chave única hash
        const novoPetRef = db.ref('pets').push();
        await novoPetRef.set(novoPet);
        
        console.log('Pet gravado no Realtime Database com ID:', novoPetRef.key);

        res.status(201).json({ message: 'Pet cadastrado com sucesso!', id: novoPetRef.key, pet: novoPet });
    } catch (error) {
        console.error('Erro ao cadastrar pet no Firebase:', error);
        res.status(500).json({ error: 'Erro interno ao cadastrar o pet no banco.' });
    }
});

// RF09: Rota para Enviar uma Solicitação de Adoção para o Realtime Database
app.post('/api/adocoes', async (req, res) => {
    try {
        const { petId, petNome, adotanteNome, adotanteEmail, adotanteTelefone, adotanteCpf, mensagemMotivacao } = req.body;

        if (!petId || !petNome || !adotanteNome || !adotanteEmail || !adotanteTelefone || !adotanteCpf) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios do adotante e do pet devem ser informados.' });
        }

        const protocoloAdoacao = gerarProtocolo('#ADOP', 4);

        const novaSolicitacao = {
            protocolo: protocoloAdoacao,
            petId,
            petNome,
            adotanteNome,
            adotanteEmail,
            adotanteTelefone,
            adotanteCpf,
            mensagemMotivacao: mensagemMotivacao || '',
            status: 'Em Análise',
            dataSolicitacao: new Date().toISOString()
        };

        // Grava no nó 'solicitacoes_adoacao'
        await db.ref('solicitacoes_adoacao').push().set(novaSolicitacao);
        console.log('Solicitação de adoção gravada no Firebase:', protocoloAdoacao);

        res.status(201).json({
            message: 'Solicitação de adoção enviada com sucesso!',
            protocolo: protocoloAdoacao,
            statusAtual: 'Em Análise'
        });
    } catch (error) {
        console.error('Erro ao processar adoção no Firebase:', error);
        res.status(500).json({ error: 'Erro interno ao processar a solicitação de adoção.' });
    }
});

// RF11: Rota para Agendamento de Visitas Presenciais no Realtime Database
app.post('/api/agendamentos', async (req, res) => {
    try {
        const { nomeCompleto, cpf, email, telefone, motivoVisita, dataSelecionada, horarioSelecionado } = req.body;
        if (!nomeCompleto || !cpf || !email || !telefone || !motivoVisita || !dataSelecionada || !horarioSelecionado) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios do agendamento devem ser preenchidos.' });
        }

        const protocoloAgendamento = gerarProtocolo('#AGD', 4);
        const novoAgendamento = {
            protocolo: protocoloAgendamento,
            nomeCompleto,
            cpf,
            email,
            telefone,
            motivoVisita,
            dataSelecionada,
            horarioSelecionado,
            status: 'Enviado',
            dataCriacao: new Date().toISOString()
        };

        // Grava no nó 'agendamentos'
        await db.ref('agendamentos').push().set(novoAgendamento);
        console.log('Agendamento gravado no Firebase:', protocoloAgendamento);

        res.status(201).json({ message: 'Agendamento enviado para análise!', protocolo: protocoloAgendamento, statusAtual: 'Enviado' });
    } catch (error) {
        console.error('Erro ao salvar agendamento no Firebase:', error);
        res.status(500).json({ error: 'Erro interno ao processar o agendamento.' });
    }
});

// RF12: Rota para Doações Financeiras no Realtime Database
app.post('/api/doacoes', async (req, res) => {
    try {
        const { valor, metodoPagamento, anonimo, nome, email, dadosCartao } = req.body;

        if (!valor || valor < 5.00) {
            return res.status(400).json({ error: 'O valor mínimo para doação é de R$ 5,00.' });
        }

        const metodosValidos = ['PIX', 'CREDITO', 'DEBITO'];
        if (!metodoPagamento || !metodosValidos.includes(metodoPagamento.toUpperCase())) {
            return res.status(400).json({ error: 'Método de pagamento inválido.' });
        }

        if (!anonimo && (!nome || !email)) {
            return res.status(400).json({ error: 'Para doações não-anônimas, nome e e-mail são obrigatórios.' });
        }

        if (metodoPagamento.toUpperCase() === 'CREDITO' || metodoPagamento.toUpperCase() === 'DEBITO') {
            if (!dadosCartao || !dadosCartao.numero || dadosCartao.numero.length !== 16) {
                return res.status(400).json({ error: 'Dados do cartão inválidos ou número não possui 16 dígitos.' });
            }
        }

        const protocoloDoacao = gerarProtocolo('#DOA', 5); 
        const novaDoacao = {
            protocolo: protocoloDoacao,
            valor,
            metodoPagamento: metodoPagamento.toUpperCase(),
            anonimo: anonimo || false,
            nome: anonimo ? 'Anônimo' : nome,
            email: anonimo ? 'N/A' : email,
            dataCriacao: new Date().toISOString()
        };

        // Grava no nó 'doacoes'
        await db.ref('doacoes').push().set(novaDoacao);
        console.log('Doação gravada no Firebase:', protocoloDoacao);

        let impactoGerado = `Sua doação de R$ ${valor} ajudará na compra de ração e cuidados gerais.`;
        if (valor >= 100) impactoGerado = `Sua doação vai garantir vacinação e vermífugo para até 2 pets!`;

        res.status(200).json({
            message: 'Doação simulada com sucesso!',
            protocolo: protocoloDoacao,
            valor: valor,
            metodoUtilizado: metodoPagamento.toUpperCase(),
            impacto: impactoGerado
        });
    } catch (error) {
        console.error('Erro ao salvar doação no Firebase:', error);
        res.status(500).json({ error: 'Erro interno ao processar a doação.' });
    }
});

// RF07.1: Rota do Assistente de Compatibilidade com IA
app.post('/api/compatibilidade', async (req, res) => {
    try {
        const { estiloVida, moradia, rotina, experiencia } = req.body;
        if (!estiloVida || !moradia || !rotina) {
            return res.status(400).json({ error: 'Por favor, preencha todas as informações do perfil.' });
        }

        const promptSystem = `
            Você é o assistente inteligente da plataforma de adoção AdoPets, que atua em Fortaleza e região metropolitana.
            Sua tarefa é analisar o perfil de um potencial adotante e sugerir o perfil de pet ideal (se cachorro ou gato, qual porte, nível de energia e temperamento).
            
            Perfil do Adotante:
            - Tipo de moradia: ${moradia}
            - Estilo de vida/Hobbies: ${estiloVida}
            - Rotina/Tempo disponível: ${rotina}
            - Experiência prévia com animais: ${experiencia || 'Não informado'}
            
            Gere uma resposta acolhedora, objetiva e direta em formato JSON, contendo exatamente estas três chaves:
            {
              "perfilIdeal": "Descreva brevemente a espécie (cachorro/gato), porte e nível de energia recomendados.",
              "justificativa": "Explique o porquê dessa escolha com base na rotina e moradia dele.",
              "dicaAdicional": "Dê uma dica rápida de adaptação para esse perfil de pet."
            }
            Retorne APENAS o objeto JSON puro, sem formatações de markdown como '\`\`\`json'.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptSystem,
        });

        const jsonResposta = JSON.parse(response.text.trim());
        res.json(jsonResposta);
    } catch (error) {
        console.error('Erro ao chamar o Gemini:', error);
        res.status(500).json({ error: 'Erro interno ao processar a compatibilidade com a IA.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});