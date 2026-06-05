import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Importando as páginas
import Home from './assets/pages/Home';
import Sobre from './assets/pages/Sobre';

export default function App() {
  // Estado para controlar se o menu mobile está aberto ou fechado
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <BrowserRouter>
      {/* Barra de detalhe superior */}
      <div style={{ width: '100%', height: '7px', background: '#A61C5D' }}></div>

      {/* HEADER ORIGINAL E BONITO */}
      <header style={{ backgroundColor: 'white', padding: '15px 0', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative' }}>
        <div className="container d-flex justify-content-between align-items-center">
          
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h2 style={{ color: '#A61C5D', fontWeight: 'bold', margin: 0 }}>AdoPet</h2>
          </Link>

          <div className="d-flex align-items-center gap-3">
            {/* Links do menu (Usando classes do Bootstrap para esconder no mobile e mostrar no PC) */}
            <div className={`${menuAberto ? 'd-flex flex-column position-absolute end-0 bg-white p-4 shadow rounded' : 'd-none d-md-flex'} gap-3`} style={{ top: '100%', zIndex: 1000 }}>
              <Link to="/" className="text-decoration-none fw-bold" style={{ color: '#A61C5D' }} onClick={() => setMenuAberto(false)}>Início</Link>
              <Link to="/pets" className="text-decoration-none text-dark fw-semibold" onClick={() => setMenuAberto(false)}>Encontrar um Pet</Link>
              <Link to="/sobre" className="text-decoration-none text-dark fw-semibold" onClick={() => setMenuAberto(false)}>Sobre Nós</Link>
              <Link to="/doacoes" className="text-decoration-none text-dark fw-semibold" onClick={() => setMenuAberto(false)}>Doações</Link>
              <Link to="/agendamento" className="text-decoration-none text-dark fw-semibold" onClick={() => setMenuAberto(false)}>Agendar Visita</Link>
            </div>

            {/* Botão Hamburger (Só aparece no mobile) */}
            <button 
              className="btn d-md-none" 
              style={{ backgroundColor: '#A61C5D', color: 'white', borderRadius: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setMenuAberto(!menuAberto)}
            >
              <i className={`bi ${menuAberto ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* ROTAS */}
      <main style={{ minHeight: '80vh' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#212529', color: 'white', padding: '60px 0 20px 0' }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h4 className="fw-bold" style={{ color: '#ffd801' }}>4PatasFortaleza</h4>
              <p style={{ fontSize: '14px', color: '#bbb', marginTop: '15px' }}>
                Fundação dedicada a garantir que cães e gatos encontrem um lar seguro, carinhoso e cheio de amor. Adote e transforme uma vida!
              </p>
            </div>

            <div className="col-md-4">
              <h5 className="fw-bold mb-3">Acesso Rápido</h5>
              <ul className="list-unstyled" style={{ lineHeight: 2 }}>
                <li><Link to="/pets" className="text-decoration-none text-light">Encontrar um Pet</Link></li>
                <li><Link to="/sobre" className="text-decoration-none text-light">Sobre Nós</Link></li>
                <li><Link to="/doacoes" className="text-decoration-none text-light">Doações</Link></li>
              </ul>
            </div>

            <div className="col-md-4">
              <h5 className="fw-bold mb-3">Redes Sociais</h5>
              <div className="d-flex gap-3">
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="text-light fs-4"><i className="bi bi-facebook"></i></a>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="text-light fs-4"><i className="bi bi-instagram"></i></a>
                <a href="https://web.whatsapp.com/" target="_blank" rel="noreferrer" className="text-light fs-4"><i className="bi bi-whatsapp"></i></a>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: '#444', marginTop: '40px', marginBottom: '20px' }} />

          <div className="text-center" style={{ color: '#777', fontSize: '13px' }}>
            &copy; {new Date().getFullYear()} 4PatasFortaleza. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </BrowserRouter>
  );
}