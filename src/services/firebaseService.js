// src/services/firebaseService.js
// Camada de serviço: toda comunicação com Firebase fica aqui.
// As páginas importam daqui — se um dia trocar de banco, só muda este arquivo.

import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  setDoc, query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { auth, db, storage } from '../firebase';

// ─── PETS ────────────────────────────────────────────────────────────────────

/** Retorna todos os pets */
export async function getPets() {
  const snap = await getDocs(collection(db, 'pets'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Retorna um pet pelo ID */
export async function getPetById(id) {
  const snap = await getDoc(doc(db, 'pets', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Cria um novo pet */
export async function addPet(petData) {
  const docRef = await addDoc(collection(db, 'pets'), {
    ...petData,
    criadoEm: serverTimestamp(),
  });
  return docRef.id;
}

/** Atualiza um pet existente */
export async function updatePet(id, petData) {
  await updateDoc(doc(db, 'pets', id), { ...petData, atualizadoEm: serverTimestamp() });
}

/** Remove um pet */
export async function deletePet(id) {
  await deleteDoc(doc(db, 'pets', id));
}

// ─── UPLOAD DE IMAGEM ────────────────────────────────────────────────────────

/**
 * Faz upload de uma imagem para o Firebase Storage e retorna a URL pública.
 * @param {File} file  Arquivo selecionado pelo <input type="file">
 * @param {string} folder  Pasta no Storage (ex: "pets")
 */
export async function uploadImagem(file, folder = 'pets') {
  const nomeArquivo = `${folder}/${Date.now()}_${file.name}`;
  const storageRef  = ref(storage, nomeArquivo);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ─── SOLICITAÇÕES DE ADOÇÃO ──────────────────────────────────────────────────

/** Retorna todas as solicitações */
export async function getSolicitacoes() {
  const snap = await getDocs(
    query(collection(db, 'solicitacoes'), orderBy('criadoEm', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Cria uma nova solicitação */
export async function addSolicitacao(dados) {
  return await addDoc(collection(db, 'solicitacoes'), {
    ...dados,
    status: 'pendente',
    protocolo: 'ADOC-' + Date.now().toString().slice(-6),
    criadoEm: serverTimestamp(),
  });
}

/** Atualiza status de uma solicitação (pendente/aprovado/rejeitado) */
export async function updateSolicitacao(id, novoStatus) {
  await updateDoc(doc(db, 'solicitacoes', id), {
    status: novoStatus,
    atualizadoEm: serverTimestamp(),
  });
}

// ─── AUTENTICAÇÃO ────────────────────────────────────────────────────────────

/**
 * Cadastra novo usuário com email/senha e salva perfil no Firestore.
 */
export async function cadastrarUsuario({ nome, email, senha, telefone, cpf }) {
  const cred = await createUserWithEmailAndPassword(auth, email, senha);
  const uid  = cred.user.uid;

  // Salva perfil no Firestore (role padrão: visitante)
  await setDoc(doc(db, 'usuarios', uid), {
    nome,
    email,
    telefone: telefone || '',
    cpf:      cpf      || '',
    role:     'visitante',
    criadoEm: serverTimestamp(),
  });

  return { uid, nome, email, role: 'visitante' };
}

/**
 * Faz login com email/senha e retorna o perfil do Firestore.
 */
export async function loginUsuario(email, senha) {
  const cred    = await signInWithEmailAndPassword(auth, email, senha);
  const uid     = cred.user.uid;
  const perfil  = await getDoc(doc(db, 'usuarios', uid));

  if (!perfil.exists()) throw new Error('Perfil não encontrado.');
  return { uid, ...perfil.data() };
}

/**
 * Faz logout.
 */
export async function logoutUsuario() {
  await signOut(auth);
}

/**
 * Observa mudanças de autenticação.
 * Chame onAuthStateChanged(callback) nos componentes que precisam saber
 * se o usuário está logado.
 *
 * Retorna o unsubscribe para limpar no useEffect.
 *
 * Exemplo de uso:
 *   useEffect(() => {
 *     const unsub = escutarAuth(usuario => setUsuario(usuario));
 *     return unsub;
 *   }, []);
 */
export function escutarAuth(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) { callback(null); return; }
    try {
      const snap = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
      callback(snap.exists() ? { uid: firebaseUser.uid, ...snap.data() } : null);
    } catch {
      callback(null);
    }
  });
}

/**
 * Retorna o perfil do usuário logado (sem observer).
 * Útil para carregar uma vez no mount.
 */
export async function getUsuarioLogado() {
  const user = auth.currentUser;
  if (!user) return null;
  const snap = await getDoc(doc(db, 'usuarios', user.uid));
  return snap.exists() ? { uid: user.uid, ...snap.data() } : null;
}

// ─── USUÁRIOS (admin) ────────────────────────────────────────────────────────

/** Lista todos os usuários cadastrados */
export async function getUsuarios() {
  const snap = await getDocs(collection(db, 'usuarios'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Seed dos pets iniciais no Firestore (chame uma vez do Admin) */
export async function seedPets() {
  const SEED = [
    { nome:'Bolinha', tipo:'cachorro', sexo:'Macho', idade:'3 anos',  porte:'medio',   localizacao:'Fortaleza', descricao:'Bolinha é um cão dócil e brincalhão.', vacinado:true,  castrado:false, foto:'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=60', status:'disponivel' },
    { nome:'Mia',     tipo:'gato',    sexo:'Fêmea', idade:'1 ano',   porte:'pequeno', localizacao:'Fortaleza', descricao:'Mia é uma gatinha carinhosa e curiosa.',           vacinado:true,  castrado:true,  foto:'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=60', status:'disponivel' },
    { nome:'Thor',    tipo:'cachorro', sexo:'Macho', idade:'4 meses', porte:'grande',  localizacao:'Caucaia',  descricao:'Thor ainda é filhote, cheio de energia!',          vacinado:true,  castrado:false, foto:'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=60', status:'disponivel' },
    { nome:'Luna',    tipo:'gato',    sexo:'Fêmea', idade:'2 meses', porte:'pequeno', localizacao:'Eusébio',  descricao:'Luna é muito doce e gentil.',                       vacinado:false, castrado:false, foto:'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=60', status:'reservado'  },
    { nome:'Rex',     tipo:'cachorro', sexo:'Macho', idade:'5 anos',  porte:'grande',  localizacao:'Maracanaú',descricao:'Rex é leal e tranquilo. Adora carinho.',            vacinado:true,  castrado:true,  foto:'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=60', status:'disponivel' },
    { nome:'Mel',     tipo:'gato',    sexo:'Fêmea', idade:'3 anos',  porte:'pequeno', localizacao:'Fortaleza', descricao:'Mel é independente mas carinhosa.',                vacinado:true,  castrado:true,  foto:'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=60', status:'disponivel' },
  ];
  for (const pet of SEED) {
    await addDoc(collection(db, 'pets'), { ...pet, criadoEm: serverTimestamp() });
  }
}