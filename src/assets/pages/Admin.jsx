import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ROSA = '#A61C5D';
const AMARELO = '#ffd801';
const CINZA = '#f0f2f5';

// ── Helpers de localStorage (mesmos do auth.js) ──────────────────────────────
const DB = {
  getPets:    () => JSON.parse(localStorage.getItem('adoPet_pets') || '[]'),
  savePets:   (p) => localStorage.setItem('adoPet_pets', JSON.stringify(p)),
  getUsers:   () => JSON.parse(localStorage.getItem('adoPet_users') || '[]'),
  getSols:    () => JSON.parse(localStorage.getItem('adoPet_solicitacoes') || '[]'),
  saveSols:   (s) => localStorage.setItem('adoPet_solicitacoes', JSON.stringify(s)),
  getSession: () => JSON.parse(localStorage.getItem('adoPet_session') || 'null'),
};

const statusColor = { disponivel: { bg: '#e6ffee', color: '#008833' }, reservado: { bg: '#fff5e6', color: '#cc7700' }, adotado: { bg: '#e6f0ff', color: '#004499' } };
const solColor    = { pendente: { bg: '#fff5e6', color: '#cc7700' }, aprovado: { bg: '#e6ffee', color: '#008833' }, rejeitado: { bg: '#ffe6e6', color: '#cc0000' } };

const cardStyle = { background: 'white', borderRadius: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '24px' };
const thStyle = { padding: '12px 16px', fontWeight: 700, fontSize: '13px', color: '#888', background: '#fafafa', borderBottom: '1px solid #f0f0f0', textAlign: 'left' };
const tdStyle = { padding: '12px 16px', fontSize: '13px', color: '#444', borderBottom: '1px solid #f8f8f8' };
const inputStyle = { borderRadius: '10px', border: '1.5px solid #e0e0e0', padding: '9px 13px', fontSize: '14px', width: '100%', outline: 'none' };
const btnRosa = { background: ROSA, color: 'white', border: 'none', borderRadius: '10px', padding: '9px 18px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' };

function Badge({ status, map }) {
  const s = (map || statusColor)[status] || { bg: '#eee', color: '#555' };
  return <span style={{ background: s.bg, color: s.color, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>{status}</span>;
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ aba, setAba, sessao, onSair }) {
  const navs = [
    { key: 'dashboard',    icon: 'bi-speedometer2',     label: 'Dashboard' },
    { key: 'pets',         icon: 'bi-heart',            label: 'Gerenciar Pets' },
    { key: 'cadastrar',    icon: 'bi-plus-circle',      label: 'Cadastrar Pet' },
    { key: 'solicitacoes', icon: 'bi-clipboard2-check', label: 'Solicitações' },
    { key: 'usuarios',     icon: 'bi-people',           label: 'Usuários' },
  ];
  return (
    <div style={{ width: '240px', background: `linear-gradient(160deg,#7b1042,${ROSA})`, minHeight: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(166,28,93,0.18)' }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: '20px' }}>🐾 AdoPet</div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', display: 'block', marginTop: '4px' }}>Painel Administrativo</span>
      </div>
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {navs.map(n => (
          <div key={n.key} onClick={() => setAba(n.key)} style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 20px',
            color: aba === n.key ? 'white' : 'rgba(255,255,255,0.75)', fontSize: '14px', fontWeight: aba === n.key ? 700 : 500,
            cursor: 'pointer', borderLeft: `3px solid ${aba === n.key ? AMARELO : 'transparent'}`,
            background: aba === n.key ? 'rgba(255,255,255,0.15)' : 'transparent', transition: 'all 0.2s',
          }}>
            <i className={`bi ${n.icon}`} style={{ fontSize: '18px', width: '22px' }}></i>
            {n.label}
          </div>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        <div style={{ color: 'white', fontSize: '13px' }}>
          <span style={{ fontWeight: 600 }}>{sessao?.nome}</span>
          <small style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', display: 'block' }}>{sessao?.email}</small>
        </div>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '10px', textDecoration: 'none' }}>
          <i className="bi bi-house"></i> Ver Site
        </Link>
        <div onClick={onSair} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginTop: '6px', cursor: 'pointer' }}>
          <i className="bi bi-box-arrow-right"></i> Sair
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ pets, users, sols, setAba }) {
  const stats = [
    { val: pets.length,                             label: 'Total de Pets',   icon: 'bi-heart-fill',      bg: '#fff0f5', color: ROSA },
    { val: pets.filter(p => p.status==='disponivel').length, label: 'Disponíveis', icon: 'bi-check-circle-fill', bg: '#e6ffee', color: '#22c55e' },
    { val: pets.filter(p => p.status==='reservado').length,  label: 'Reservados',  icon: 'bi-clock-fill',        bg: '#fff8e6', color: '#f59e0b' },
    { val: users.filter(u => u.role !== 'admin').length,     label: 'Usuários',    icon: 'bi-people-fill',       bg: '#e6f0ff', color: '#3b82f6' },
  ];
  return (
    <>
      <div className="row g-3 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="col-md-3 col-6">
            <div style={{ background: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: s.color, flexShrink: 0 }}>
                <i className={`bi ${s.icon}`}></i>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#222', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="row g-3">
        <div className="col-md-6">
          <div style={cardStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}>Pets Recentes</h5>
              <button onClick={() => setAba('pets')} style={btnRosa}>Ver Todos</button>
            </div>
            <div style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={thStyle}>Nome</th><th style={thStyle}>Tipo</th><th style={thStyle}>Status</th></tr></thead>
                <tbody>
                  {pets.slice(-5).reverse().map(p => (
                    <tr key={p.id}><td style={tdStyle}>{p.nome}</td><td style={tdStyle}>{p.tipo}</td><td style={tdStyle}><Badge status={p.status} /></td></tr>
                  ))}
                  {!pets.length && <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#ccc' }}>Nenhum pet cadastrado</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div style={cardStyle}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}>Solicitações Recentes</h5>
              <button onClick={() => setAba('solicitacoes')} style={btnRosa}>Ver Todas</button>
            </div>
            <div style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={thStyle}>Protocolo</th><th style={thStyle}>Pet</th><th style={thStyle}>Status</th></tr></thead>
                <tbody>
                  {sols.slice(-5).reverse().map(s => (
                    <tr key={s.protocolo}><td style={tdStyle}>{s.protocolo}</td><td style={tdStyle}>{s.petNome}</td><td style={tdStyle}><Badge status={s.status} map={solColor} /></td></tr>
                  ))}
                  {!sols.length && <tr><td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: '#ccc' }}>Nenhuma solicitação</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── GERENCIAR PETS ───────────────────────────────────────────────────────────
function GerenciarPets({ pets, onRefresh, setAba }) {
  const [busca, setBusca] = useState('');
  function deletar(id) {
    if (!window.confirm('Remover este pet?')) return;
    DB.savePets(DB.getPets().filter(p => p.id !== id));
    onRefresh();
  }
  function alterarStatus(id, status) {
    const ps = DB.getPets().map(p => p.id === id ? { ...p, status } : p);
    DB.savePets(ps); onRefresh();
  }
  const filtrados = pets.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));
  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className={`bi bi-heart me-2`} style={{ color: ROSA }}></i>Todos os Pets</h5>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input type="text" placeholder="🔍 Buscar por nome..." value={busca} onChange={e => setBusca(e.target.value)} style={{ ...inputStyle, width: '200px', padding: '7px 12px' }} />
          <button onClick={() => setAba('cadastrar')} style={btnRosa}><i className="bi bi-plus-lg me-1"></i>Novo Pet</button>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['ID','Pet','Tipo','Idade','Porte','Local','Status','Ações'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {filtrados.map(p => (
              <tr key={p.id}>
                <td style={tdStyle}><span style={{ color: '#aaa', fontFamily: 'monospace' }}>#{p.id}</span></td>
                <td style={tdStyle}><strong>{p.nome}</strong></td>
                <td style={tdStyle}>{p.tipo === 'cachorro' ? '🐶' : '🐱'} {p.tipo}</td>
                <td style={tdStyle}>{p.idade}</td>
                <td style={tdStyle}>{p.porte}</td>
                <td style={tdStyle}>{p.localizacao}</td>
                <td style={tdStyle}><Badge status={p.status} /></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select value={p.status} onChange={e => alterarStatus(p.id, e.target.value)}
                      style={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '4px 8px', cursor: 'pointer' }}>
                      <option value="disponivel">Disponível</option>
                      <option value="reservado">Reservado</option>
                      <option value="adotado">Adotado</option>
                    </select>
                    <button onClick={() => deletar(p.id)} title="Remover" style={{ background: '#fff0f0', color: '#cc0000', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '14px' }}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filtrados.length && <tr><td colSpan={8} style={{ ...tdStyle, textAlign: 'center', color: '#ccc', padding: '32px' }}>Nenhum pet encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── CADASTRAR PET ─────────────────────────────────────────────────────────────
function CadastrarPet({ onRefresh, setAba }) {
  const [form, setForm] = useState({ nome: '', tipo: 'cachorro', sexo: 'Macho', idade: '', porte: 'medio', localizacao: 'Fortaleza', descricao: '', foto: '', status: 'disponivel', vacinado: false, castrado: false });
  const [alerta, setAlerta] = useState(null);

  function salvar() {
    if (!form.nome || !form.idade) { setAlerta({ msg: 'Preencha o nome e a idade do pet.', tipo: 'danger' }); return; }
    const pets = DB.getPets();
    const novoId = Math.max(0, ...pets.map(p => Number(p.id))) + 1;
    const novoPet = { ...form, id: novoId, foto: form.foto || '/assets/images/cachorro1.jpg', criadoEm: new Date().toISOString().split('T')[0] };
    DB.savePets([...pets, novoPet]);
    setAlerta({ msg: `✅ Pet <strong>${form.nome}</strong> cadastrado com sucesso!`, tipo: 'success' });
    setForm({ nome: '', tipo: 'cachorro', sexo: 'Macho', idade: '', porte: 'medio', localizacao: 'Fortaleza', descricao: '', foto: '', status: 'disponivel', vacinado: false, castrado: false });
    onRefresh();
    setTimeout(() => setAba('pets'), 1500);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-plus-circle me-2" style={{ color: ROSA }}></i>Cadastrar Novo Pet</h5>
      </div>
      <div style={{ padding: '24px' }}>
        {alerta && <div className={`alert alert-${alerta.tipo}`} style={{ borderRadius: '10px', fontSize: '14px', marginBottom: '16px' }} dangerouslySetInnerHTML={{ __html: alerta.msg }} />}
        <div className="row g-3">
          {[
            { label: 'Nome do Pet *', name: 'nome', type: 'text', placeholder: 'Ex: Bolinha', col: 6 },
            { label: 'Idade *', name: 'idade', type: 'text', placeholder: 'Ex: 2 anos / 4 meses', col: 4 },
            { label: 'URL da Foto', name: 'foto', type: 'text', placeholder: 'https://... ou caminho relativo', col: 6 },
          ].map(f => (
            <div key={f.name} className={`col-md-${f.col}`}>
              <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>{f.label}</label>
              <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} style={inputStyle} />
            </div>
          ))}
          {[
            { label: 'Espécie *', name: 'tipo', options: [['cachorro','Cachorro'],['gato','Gato']], col: 3 },
            { label: 'Sexo *', name: 'sexo', options: [['Macho','Macho'],['Fêmea','Fêmea']], col: 3 },
            { label: 'Porte *', name: 'porte', options: [['pequeno','Pequeno'],['medio','Médio'],['grande','Grande']], col: 4 },
            { label: 'Localização *', name: 'localizacao', options: [['Fortaleza','Fortaleza'],['Caucaia','Caucaia'],['Eusébio','Eusébio'],['Maracanaú','Maracanaú']], col: 4 },
            { label: 'Status', name: 'status', options: [['disponivel','Disponível'],['reservado','Reservado'],['adotado','Adotado']], col: 4 },
          ].map(f => (
            <div key={f.name} className={`col-md-${f.col}`}>
              <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>{f.label}</label>
              <select name={f.name} value={form[f.name]} onChange={handleChange} style={inputStyle}>
                {f.options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
              </select>
            </div>
          ))}
          <div className="col-12">
            <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Descrição</label>
            <textarea name="descricao" rows={3} value={form.descricao} onChange={handleChange} placeholder="Personalidade, história, comportamento..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div className="col-12 d-flex gap-4">
            {[['vacinado','Vacinado'],['castrado','Castrado']].map(([name, label]) => (
              <div key={name} className="form-check">
                <input type="checkbox" className="form-check-input" name={name} checked={form[name]} onChange={handleChange} id={name} />
                <label className="form-check-label" htmlFor={name} style={{ fontSize: '14px' }}>{label}</label>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button onClick={salvar} style={btnRosa}><i className="bi bi-floppy me-2"></i>Salvar Pet</button>
          <button onClick={() => setForm({ nome: '', tipo: 'cachorro', sexo: 'Macho', idade: '', porte: 'medio', localizacao: 'Fortaleza', descricao: '', foto: '', status: 'disponivel', vacinado: false, castrado: false })}
            className="btn btn-outline-secondary" style={{ borderRadius: '10px' }}>Limpar</button>
        </div>
      </div>
    </div>
  );
}

// ── SOLICITAÇÕES ─────────────────────────────────────────────────────────────
function Solicitacoes({ sols, onRefresh }) {
  const [filtro, setFiltro] = useState('todas');
  const filtrados = filtro === 'todas' ? sols : sols.filter(s => s.status === filtro);

  function mudarStatus(protocolo, status) {
    const ss = DB.getSols().map(s => s.protocolo === protocolo ? { ...s, status } : s);
    DB.saveSols(ss); onRefresh();
  }

  const tabs = [['todas','Todas'],['pendente','Pendentes'],['aprovado','Aprovadas'],['rejeitado','Rejeitadas']];
  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-clipboard2-check me-2" style={{ color: ROSA }}></i>Solicitações de Adoção</h5>
        <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '4px', gap: '2px' }}>
          {tabs.map(([key, label]) => (
            <div key={key} onClick={() => setFiltro(key)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              background: filtro === key ? ROSA : 'transparent', color: filtro === key ? 'white' : '#888',
            }}>{label}</div>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        {!filtrados.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            <i className="bi bi-inbox" style={{ fontSize: '40px' }}></i>
            <p className="mt-2">Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Protocolo','Solicitante','Pet','Data','Status','Ações'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {filtrados.map(s => (
                <tr key={s.protocolo}>
                  <td style={tdStyle}><span style={{ fontFamily: 'monospace', color: ROSA }}>{s.protocolo}</span></td>
                  <td style={tdStyle}>{s.nome}<div style={{ fontSize: '11px', color: '#aaa' }}>{s.email}</div></td>
                  <td style={tdStyle}>{s.petNome}</td>
                  <td style={tdStyle}>{s.data}</td>
                  <td style={tdStyle}><Badge status={s.status} map={solColor} /></td>
                  <td style={tdStyle}>
                    {s.status === 'pendente' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => mudarStatus(s.protocolo, 'aprovado')} style={{ background: '#e6ffee', color: '#008833', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✓ Aprovar</button>
                        <button onClick={() => mudarStatus(s.protocolo, 'rejeitado')} style={{ background: '#ffe6e6', color: '#cc0000', border: 'none', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✕ Rejeitar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── USUÁRIOS ─────────────────────────────────────────────────────────────────
function Usuarios({ users }) {
  return (
    <div style={cardStyle}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h5 style={{ margin: 0, fontWeight: 700, color: '#333' }}><i className="bi bi-people me-2" style={{ color: ROSA }}></i>Usuários Cadastrados</h5>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Nome','E-mail','Papel','Cadastro'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={tdStyle}><strong>{u.nome}</strong></td>
                <td style={tdStyle}>{u.email}</td>
                <td style={tdStyle}><Badge status={u.role} map={{ admin: { bg: '#fff0f5', color: ROSA }, visitante: { bg: '#f0f0f0', color: '#555' } }} /></td>
                <td style={tdStyle}>{u.criadoEm}</td>
              </tr>
            ))}
            {!users.length && <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#ccc', padding: '32px' }}>Nenhum usuário.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const [aba, setAba] = useState('dashboard');
  const [sessao, setSessao] = useState(null);
  const [pets, setPets] = useState([]);
  const [users, setUsers] = useState([]);
  const [sols, setSols] = useState([]);

  const refresh = useCallback(() => {
    setPets(DB.getPets());
    setUsers(DB.getUsers());
    setSols(DB.getSols());
  }, []);

  useEffect(() => {
    const s = DB.getSession();
    if (!s || s.role !== 'admin') { navigate('/login'); return; }
    setSessao(s);
    refresh();
  }, []);

  function sair() {
    localStorage.removeItem('adoPet_session');
    navigate('/login');
  }

  const abaTitle = { dashboard: 'Dashboard', pets: 'Gerenciar Pets', cadastrar: 'Cadastrar Pet', solicitacoes: 'Solicitações', usuarios: 'Usuários' };

  return (
    <div style={{ background: CINZA, minHeight: '100vh', display: 'flex' }}>
      <Sidebar aba={aba} setAba={setAba} sessao={sessao} onSair={sair} />
      <div style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
        {/* Topbar */}
        <div style={{ background: 'white', padding: '14px 28px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 90, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h4 style={{ margin: 0, color: '#333', fontWeight: 700, fontSize: '18px' }}>{abaTitle[aba]}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'rgba(166,28,93,0.1)', color: ROSA, borderRadius: '20px', padding: '8px 14px', fontSize: '13px' }}>
              <i className="bi bi-shield-check me-1"></i>Admin
            </span>
            <button onClick={sair} className="btn btn-sm" style={{ borderRadius: '10px', border: '1.5px solid #e0e0e0', fontSize: '13px' }}>
              <i className="bi bi-box-arrow-right me-1"></i>Sair
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: '28px' }}>
          {aba === 'dashboard'    && <Dashboard pets={pets} users={users} sols={sols} setAba={setAba} />}
          {aba === 'pets'         && <GerenciarPets pets={pets} onRefresh={refresh} setAba={setAba} />}
          {aba === 'cadastrar'    && <CadastrarPet onRefresh={refresh} setAba={setAba} />}
          {aba === 'solicitacoes' && <Solicitacoes sols={sols} onRefresh={refresh} />}
          {aba === 'usuarios'     && <Usuarios users={users} />}
        </div>
      </div>
    </div>
  );
}