import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ROSA = '#A61C5D';
const AMARELO = '#ffd801';

function maskTel(v) { return v.replace(/\D/g,'').replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2').slice(0,16); }
function maskCpf(v) { return v.replace(/\D/g,'').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2').slice(0,14); }

// ── Auth helpers (espelha o auth.js original com localStorage) ──────────────
const AUTH = {
  getUsers: () => JSON.parse(localStorage.getItem('adoPet_users') || '[]'),
  saveUsers: (users) => localStorage.setItem('adoPet_users', JSON.stringify(users)),
  getSession: () => JSON.parse(localStorage.getItem('adoPet_session') || 'null'),
  setSession: (s) => localStorage.setItem('adoPet_session', JSON.stringify(s)),
  initAdmin: () => {
    const users = AUTH.getUsers();
    if (!users.find(u => u.role === 'admin')) {
      users.push({ id: 'adm-001', nome: 'Administrador', email: 'admin@adopet.com', senha: 'admin123', role: 'admin', criadoEm: '2026-01-01' });
      AUTH.saveUsers(users);
    }
  },
  login: (email, senha) => {
    const user = AUTH.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
    if (!user) return { ok: false, msg: 'E-mail ou senha incorretos.' };
    AUTH.setSession({ id: user.id, nome: user.nome, email: user.email, role: user.role });
    return { ok: true, user };
  },
  cadastrar: ({ nome, email, senha, telefone, cpf }) => {
    const users = AUTH.getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, msg: 'Este e-mail já está cadastrado.' };
    const novoUser = { id: 'usr-' + Date.now(), nome, email, senha, telefone: telefone || '', cpf: cpf || '', role: 'visitante', criadoEm: new Date().toISOString().split('T')[0] };
    users.push(novoUser);
    AUTH.saveUsers(users);
    return { ok: true, user: novoUser };
  },
};

export default function Login() {
  const navigate = useNavigate();
  const [aba, setAba] = useState('entrar'); // 'entrar' | 'cadastrar'
  const [modoAdm, setModoAdm] = useState(false);
  const [alerta, setAlerta] = useState(null); // { msg, tipo }
  const [senhaVis, setSenhaVis] = useState(false);
  const [senhaVis2, setSenhaVis2] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });
  const [cadForm, setCadForm] = useState({ nome: '', email: '', tel: '', cpf: '', senha: '', confSenha: '', termo: false });

  useEffect(() => {
    AUTH.initAdmin();
    // Redireciona se já logado
    const sessao = AUTH.getSession();
    if (sessao) navigate(sessao.role === 'admin' ? '/admin' : '/');
  }, []);

  function mostrarAlerta(msg, tipo = 'danger') { setAlerta({ msg, tipo }); }
  function esconderAlerta() { setAlerta(null); }

  function handleLogin() {
    const { email, senha } = loginForm;
    if (!email || !senha) { mostrarAlerta('Preencha e-mail e senha.'); return; }
    const res = AUTH.login(email, senha);
    if (!res.ok) { mostrarAlerta(res.msg); return; }
    if (modoAdm && res.user.role !== 'admin') {
      localStorage.removeItem('adoPet_session');
      mostrarAlerta('Esta conta não possui permissão de administrador.');
      return;
    }
    mostrarAlerta(`✅ Bem-vindo(a), <strong>${res.user.nome.split(' ')[0]}</strong>! Redirecionando...`, 'success');
    setTimeout(() => navigate(res.user.role === 'admin' ? '/admin' : '/'), 1200);
  }

  function handleCadastro() {
    const { nome, email, senha, confSenha, termo, tel, cpf } = cadForm;
    if (!nome || !email || !senha || !confSenha) { mostrarAlerta('Preencha todos os campos obrigatórios.'); return; }
    if (senha.length < 6) { mostrarAlerta('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (senha !== confSenha) { mostrarAlerta('As senhas não coincidem.'); return; }
    if (!termo) { mostrarAlerta('Aceite os termos de uso para continuar.'); return; }
    const res = AUTH.cadastrar({ nome, email, senha, telefone: tel, cpf });
    if (!res.ok) { mostrarAlerta(res.msg); return; }
    AUTH.login(email, senha);
    mostrarAlerta('🎉 Conta criada com sucesso! Redirecionando...', 'success');
    setTimeout(() => navigate('/'), 1400);
  }

  const inputStyle = { borderRadius: '12px', border: '1.5px solid #e0e0e0', padding: '12px 14px', fontSize: '14px', width: '100%', outline: 'none' };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
      <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 12px 40px rgba(0,0,0,0.09)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>

        {/* Banner */}
        <div style={{ background: AMARELO, padding: '28px 30px 70px', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ color: ROSA, fontWeight: 800, fontSize: '1.6rem', margin: 0 }}>🐾 AdoPet</h2>
          <p style={{ color: ROSA, fontSize: '14px', margin: '6px 0 0', opacity: 0.85 }}>
            Faça login ou crie sua conta para ajudar nossos pets!
          </p>
          {/* Avatar */}
          <div style={{
            width: '76px', height: '76px', background: 'white', borderRadius: '50%',
            border: `4px solid ${AMARELO}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '32px', color: ROSA,
            margin: '0 auto', position: 'absolute', bottom: '-38px', left: '50%',
            transform: 'translateX(-50%)', boxShadow: '0 4px 16px rgba(166,28,93,0.15)',
          }}>
            <i className={aba === 'entrar' ? 'bi bi-person' : 'bi bi-person-plus'}></i>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '56px 30px 36px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '12px', padding: '4px', marginBottom: '28px' }}>
            {['entrar', 'cadastrar'].map(tab => (
              <div key={tab} onClick={() => { setAba(tab); esconderAlerta(); }} style={{
                flex: 1, textAlign: 'center', padding: '9px', borderRadius: '10px',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                background: aba === tab ? ROSA : 'transparent',
                color: aba === tab ? 'white' : '#888',
                boxShadow: aba === tab ? '0 2px 10px rgba(166,28,93,0.25)' : 'none',
                transition: 'all 0.3s',
              }}>
                {tab === 'entrar' ? 'Entrar' : 'Criar Conta'}
              </div>
            ))}
          </div>

          {/* Alerta */}
          {alerta && (
            <div className={`alert alert-${alerta.tipo}`} style={{ fontSize: '13px', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}
              dangerouslySetInnerHTML={{ __html: alerta.msg }} />
          )}

          {/* ── LOGIN ── */}
          {aba === 'entrar' && (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>E-mail</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e0e0e0', borderRight: 'none', background: 'white' }}>
                    <i className="bi bi-envelope" style={{ color: '#aaa' }}></i>
                  </span>
                  <input type="email" className="form-control" value={loginForm.email}
                    onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="seu@email.com"
                    style={{ borderRadius: '0 12px 12px 0', border: '1.5px solid #e0e0e0', borderLeft: 'none', fontSize: '14px' }} />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold" style={{ fontSize: '14px' }}>Senha</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e0e0e0', borderRight: 'none', background: 'white' }}>
                    <i className="bi bi-lock" style={{ color: '#aaa' }}></i>
                  </span>
                  <input type={senhaVis ? 'text' : 'password'} className="form-control" value={loginForm.senha}
                    onChange={e => setLoginForm(f => ({ ...f, senha: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Sua senha"
                    style={{ border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRight: 'none', borderRadius: 0, fontSize: '14px' }} />
                  <button type="button" onClick={() => setSenhaVis(v => !v)}
                    style={{ border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRadius: '0 12px 12px 0', background: 'white', cursor: 'pointer', padding: '0 12px' }}>
                    <i className={`bi ${senhaVis ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: '#888' }}></i>
                  </button>
                </div>
              </div>

              {/* Toggle Administrador */}
              <div className="mb-4">
                <div onClick={() => setModoAdm(v => !v)} style={{
                  border: `2px solid ${modoAdm ? ROSA : '#eee'}`, borderRadius: '12px',
                  padding: '11px 14px', cursor: 'pointer', background: modoAdm ? '#fff5f9' : 'white',
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
                }}>
                  <div style={{
                    width: '22px', height: '22px', border: `2px solid ${modoAdm ? ROSA : '#ccc'}`,
                    borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: modoAdm ? ROSA : 'white', flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {modoAdm && <i className="bi bi-check-lg" style={{ fontSize: '13px', color: 'white' }}></i>}
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#333', display: 'block' }}>Sou Administrador</strong>
                    <span style={{ fontSize: '12px', color: '#888' }}>Acesso ao painel de gerenciamento da ONG.</span>
                  </div>
                  <i className="bi bi-shield-lock ms-auto" style={{ color: modoAdm ? ROSA : '#ccc', fontSize: '20px' }}></i>
                </div>
              </div>

              <button onClick={handleLogin} style={{ background: ROSA, color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, padding: '13px', fontSize: '15px', width: '100%', cursor: 'pointer', transition: 'all 0.3s' }}>
                <i className="bi bi-box-arrow-in-right me-2"></i>Entrar
              </button>

              <div className="text-center mt-4" style={{ background: '#f9f9f9', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#aaa' }}>
                <strong>Credenciais de teste:</strong><br />Admin: admin@adopet.com / admin123
              </div>
            </>
          )}

          {/* ── CADASTRO ── */}
          {aba === 'cadastrar' && (
            <>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Nome Completo *</label>
                  <input type="text" className="form-control" value={cadForm.nome} onChange={e => setCadForm(f => ({ ...f, nome: e.target.value }))} placeholder="Seu nome completo" style={{ ...inputStyle }} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>E-mail *</label>
                  <input type="email" className="form-control" value={cadForm.email} onChange={e => setCadForm(f => ({ ...f, email: e.target.value }))} placeholder="seu@email.com" style={{ ...inputStyle }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Telefone</label>
                  <input type="text" className="form-control" value={cadForm.tel} onChange={e => setCadForm(f => ({ ...f, tel: maskTel(e.target.value) }))} placeholder="(85) 9 9999-9999" style={{ ...inputStyle }} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>CPF</label>
                  <input type="text" className="form-control" value={cadForm.cpf} onChange={e => setCadForm(f => ({ ...f, cpf: maskCpf(e.target.value) }))} placeholder="000.000.000-00" style={{ ...inputStyle }} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Senha *</label>
                  <div className="input-group">
                    <input type={senhaVis ? 'text' : 'password'} className="form-control" value={cadForm.senha} onChange={e => setCadForm(f => ({ ...f, senha: e.target.value }))} placeholder="Mínimo 6 caracteres"
                      style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e0e0e0', borderRight: 'none', fontSize: '14px' }} />
                    <button type="button" onClick={() => setSenhaVis(v => !v)}
                      style={{ border: '1.5px solid #e0e0e0', borderLeft: 'none', borderRadius: '0 12px 12px 0', background: 'white', cursor: 'pointer', padding: '0 12px' }}>
                      <i className={`bi ${senhaVis ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: '#888' }}></i>
                    </button>
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Confirmar Senha *</label>
                  <input type={senhaVis2 ? 'text' : 'password'} className="form-control" value={cadForm.confSenha}
                    onChange={e => setCadForm(f => ({ ...f, confSenha: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleCadastro()}
                    placeholder="Repita a senha"
                    style={{ ...inputStyle }} />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="cadTermo" checked={cadForm.termo} onChange={e => setCadForm(f => ({ ...f, termo: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="cadTermo" style={{ fontSize: '13px' }}>
                      Li e aceito os <a href="#" style={{ color: ROSA }}>termos de uso</a>.
                    </label>
                  </div>
                </div>
              </div>

              <button onClick={handleCadastro} style={{ background: ROSA, color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, padding: '13px', fontSize: '15px', width: '100%', cursor: 'pointer', marginTop: '16px', transition: 'all 0.3s' }}>
                <i className="bi bi-person-plus me-2"></i>Criar Minha Conta
              </button>

              <div className="text-center mt-3" style={{ fontSize: '14px', color: '#888' }}>
                Já tem conta?{' '}
                <span onClick={() => { setAba('entrar'); esconderAlerta(); }} style={{ color: ROSA, fontWeight: 600, cursor: 'pointer' }}>
                  Entrar aqui
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}