import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';

type Ticket = { id: string; numero: string; tipo: string; status: string; dataEmissao: string; guiche?: string; attendant?: string; first?: string; second?: string; start?: string; end?: string };
type Call = { id: string; numero: string; tipo: string; guiche: string; repeat: boolean };
type Session = { token: string; name: string; manager: boolean };
type PublicData = { open: boolean; calls: Call[]; demo: boolean };
type Config = { users: { name: string; login: string; manager: boolean }[]; desks: string[] };

const names: Record<string, string> = { SP: 'Prioritária', SE: 'Retirada de exames', SG: 'Geral' };
const descriptions: Record<string, string> = {
  SP: 'Atendimento prioritário, conforme os critérios legais.',
  SE: 'Para retirar resultados e exames já realizados.',
  SG: 'Para os demais atendimentos do laboratório.',
};
const fmt = (value?: string) => value ? new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Recife' }) : '—';
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Recife' }).format(new Date());
const isActive = (status: string) => ['CHAMADA', 'CHAMADA_NOVAMENTE', 'EM_ATENDIMENTO'].includes(status);

function App() {
  const [page, setPage] = useState('Totem');
  const [session, setSession] = useState<Session | null>(null);
  const [pub, setPub] = useState<PublicData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [desks, setDesks] = useState<string[]>([]);
  const [desk, setDesk] = useState('Guichê 1');
  const [issued, setIssued] = useState<Ticket | null>(null);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [audio, setAudio] = useState(false);
  const [period, setPeriod] = useState(today());
  const [report, setReport] = useState<Ticket[] | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const heard = useRef(new Set<string>());

  const api = useCallback(async <T,>(path: string, body?: object): Promise<T> => {
    const response = await fetch(`/api/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a operação.');
    return data as T;
  }, [session]);

  const refresh = useCallback(async () => {
    try {
      const publicData = await api<PublicData>('public');
      setPub(publicData);
      setOffline(false);
      if (session) {
        const staff = await api<{ tickets: Ticket[]; desks: string[] }>('staff');
        setTickets(staff.tickets);
        setDesks(staff.desks);
        setDesk(current => staff.desks.includes(current) ? current : (staff.desks[0] || 'Guichê 1'));
      }
    } catch {
      setOffline(true);
    }
  }, [api, session]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!pub || page !== 'Painel' || !audio || !('speechSynthesis' in window)) return;
    for (const call of [...pub.calls].reverse()) {
      if (heard.current.has(call.id)) continue;
      heard.current.add(call.id);
      const message = new SpeechSynthesisUtterance(`${call.repeat ? 'Última chamada. ' : ''}Senha ${names[call.tipo] || call.tipo}, ${call.numero.slice(-3).split('').join(' ')}, ${call.guiche}`);
      message.lang = 'pt-BR';
      window.speechSynthesis.speak(message);
    }
  }, [pub, page, audio]);

  async function run(task: () => Promise<unknown>) {
    setBusy(true);
    setError('');
    try { await task(); await refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Ocorreu um erro inesperado.'); }
    finally { setBusy(false); }
  }

  const waiting = tickets.filter(ticket => ticket.status === 'AGUARDANDO');
  const current = tickets.find(ticket => ticket.guiche === desk && isActive(ticket.status));
  const countByType = (type: string) => waiting.filter(ticket => ticket.tipo === type).length;
  const action = (ticket: Ticket, actionName: string) => run(() => api('action', { id: ticket.id, action: actionName }));
  const loadConfig = async () => setConfig(await api<Config>('config'));
  const navigate = (target: string) => {
    setPage(target);
    setError('');
    if (target === 'Cadastros') void run(loadConfig);
  };
  const logout = () => run(async () => {
    await api('logout', {});
    setSession(null); setTickets([]); setReport(null); setConfig(null); setPage('Totem');
  });

  const issueTicket = (type: string) => run(async () => {
    setIssued(await api<Ticket>('issue', { tipo: type }));
  });

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ['Senha', 'Tipo', 'Status', 'Emissão', 'Atendente', 'Guichê', 'Primeira chamada', 'Segunda chamada', 'Início', 'Fim'],
      ...report.map(ticket => [ticket.numero, ticket.tipo, ticket.status, ticket.dataEmissao, ticket.attendant, ticket.guiche, ticket.first, ticket.second, ticket.start, ticket.end]),
    ];
    const blob = new Blob(['\uFEFF' + rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `relatorio-${period}.csv`; anchor.click();
    URL.revokeObjectURL(url);
  };

  const pageLinks = ['Totem', 'Painel', 'Atendente', ...(session?.manager ? ['Relatórios', 'Cadastros'] : [])];

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={event => { event.preventDefault(); navigate('Totem'); }} aria-label="nassauTickets, início">
          <span className="brand-mark">N</span>
          <span className="brand-copy"><strong>nassauTickets</strong><small>Laboratório de Análises Clínicas</small></span>
        </a>
        <div className={`connection ${offline ? 'is-offline' : pub?.open ? 'is-open' : 'is-closed'}`}>
          <span className="connection-dot" />
          {offline ? 'Sem conexão' : pub?.open ? 'Atendimento aberto' : 'Fora do expediente'}
        </div>
      </header>

      <nav className="main-nav" aria-label="Navegação principal">
        <div className="nav-links">
          {pageLinks.map(link => <button key={link} className={page === link ? 'nav-link active' : 'nav-link'} onClick={() => navigate(link)}>{link}</button>)}
        </div>
        {session && <button className="logout-button" onClick={() => void logout()} disabled={busy}>Sair da conta <span>{session.name}</span></button>}
      </nav>

      {pub?.demo && <div className="notice notice-info">Modo demonstração ativo: horário liberado para testes.</div>}
      {offline && <div className="notice notice-warning" role="alert"><strong>Conexão indisponível.</strong> Não foi possível atualizar os dados. Verifique se o servidor está ligado.</div>}
      {error && <div className="notice notice-error" role="alert">{error}</div>}

      <main>
        {page === 'Totem' && (
          <section className="page-content kiosk-page">
            {!issued ? <>
              <div className="welcome-block">
                <span className="eyebrow">AUTOATENDIMENTO</span>
                <h1>Olá! Seja bem-vindo(a).</h1>
                <p>Para começar, escolha abaixo o motivo da sua visita. Vamos gerar uma senha para você.</p>
              </div>
              <div className="step-heading"><span>1</span><div><h2>Qual atendimento você precisa?</h2><p>Toque em uma das opções para retirar sua senha.</p></div></div>
              <div className="ticket-options">
                {(['SP', 'SE', 'SG'] as const).map(type => (
                  <button className={`ticket-option option-${type.toLowerCase()}`} key={type} disabled={busy || offline || !pub?.open} onClick={() => void issueTicket(type)}>
                    <span className="option-code">{type}</span>
                    <span className="option-text"><strong>{names[type]}</strong><small>{descriptions[type]}</small></span>
                    <span className="option-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
              {!pub?.open && !pub?.demo && <div className="closed-message"><strong>Atendimento encerrado no momento.</strong><span>Nosso horário de funcionamento é das 7h às 17h.</span></div>}
              <p className="privacy-note"><span aria-hidden="true">ⓘ</span> Não é necessário informar seus dados pessoais para emitir uma senha.</p>
            </> : (
              <div className="ticket-receipt" aria-live="polite">
                <div className="receipt-check">✓</div>
                <span className="eyebrow">SENHA EMITIDA COM SUCESSO</span>
                <h1>Sua senha é</h1>
                <div className="receipt-number">{issued.numero}</div>
                <div className="receipt-details"><span>Tipo de atendimento</span><strong>{names[issued.tipo] || issued.tipo}</strong><span>Horário de emissão</span><strong>{fmt(issued.dataEmissao)}</strong></div>
                <p>Agora, aguarde sua senha aparecer no painel de chamadas. Quando ela for chamada, dirija-se ao guichê indicado.</p>
                <button className="button-primary receipt-button" onClick={() => setIssued(null)}>Concluir</button>
                <small className="receipt-reminder">Guarde ou memorize o número da sua senha.</small>
              </div>
            )}
          </section>
        )}

        {page === 'Painel' && (
          <section className="page-content">
            <div className="section-heading">
              <div><span className="eyebrow">ACOMPANHAMENTO</span><h1>Painel de chamadas</h1><p>Acompanhe as senhas chamadas e confira o guichê de atendimento.</p></div>
              <button className={`button-secondary ${audio ? 'audio-enabled' : ''}`} onClick={() => {
                setAudio(true);
                if ('speechSynthesis' in window) { const message = new SpeechSynthesisUtterance('Áudio de chamadas ativado.'); message.lang = 'pt-BR'; speechSynthesis.speak(message); }
              }}>{audio ? '✓ Áudio ativado' : 'Ativar áudio das chamadas'}</button>
            </div>
            <div className="call-board" aria-live="polite">
              <div className="current-call-label"><span className="pulse-dot" /> ÚLTIMA SENHA CHAMADA</div>
              {pub?.calls[0] ? <div className="current-call">
                <div><span className="call-type">{names[pub.calls[0].tipo] || pub.calls[0].tipo}{pub.calls[0].repeat ? ' · ÚLTIMA CHAMADA' : ''}</span><strong>{pub.calls[0].numero}</strong></div>
                <div className="call-desk"><small>DIRIJA-SE AO</small><strong>{pub.calls[0].guiche}</strong></div>
              </div> : <div className="empty-calls"><strong>Nenhuma chamada até agora</strong><span>Assim que uma senha for chamada, ela aparecerá aqui.</span></div>}
            </div>
            <div className="history-heading"><h2>Chamadas anteriores</h2><span>Até 4 chamadas anteriores</span></div>
            <div className="call-history">
              {pub?.calls.slice(1, 5).map((call, index) => <div className="history-row" key={call.id}><span className="history-index">{String(index + 2).padStart(2, '0')}</span><strong>{call.numero}</strong><span>{names[call.tipo] || call.tipo}</span><b>{call.guiche}</b></div>)}
              {(!pub?.calls.length || pub.calls.length === 1) && <p className="muted-empty">As chamadas anteriores serão exibidas aqui.</p>}
            </div>
          </section>
        )}

        {page === 'Atendente' && (!session ? (
          <section className="page-content login-layout">
            <div className="login-intro"><span className="eyebrow">ÁREA RESTRITA</span><h1>Acesso da equipe</h1><p>Entre com suas credenciais para gerenciar a fila e realizar os atendimentos.</p><div className="login-illustration" aria-hidden="true">✦</div></div>
            <form className="form-card login-form" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void run(async () => setSession(await api<Session>('login', { login: form.get('login'), password: form.get('password') }))); }}>
              <h2>Entrar no sistema</h2>
              <label>Usuário<input name="login" autoComplete="username" placeholder="Digite seu usuário" required /></label>
              <label>Senha<input name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" required /></label>
              <button className="button-primary" disabled={busy || offline}>{busy ? 'Entrando…' : 'Entrar'}</button>
              <small>O acesso é exclusivo para atendentes e gestores autorizados.</small>
            </form>
          </section>
        ) : (
          <section className="page-content">
            <div className="section-heading"><div><span className="eyebrow">OPERAÇÃO</span><h1>Estação de atendimento</h1><p>Organize a fila e conduza cada atendimento pelo guichê selecionado.</p></div><span className="user-chip">● {session.name}</span></div>
            <div className="queue-summary">
              {(['SP', 'SE', 'SG'] as const).map(type => <article className={`queue-card queue-${type.toLowerCase()}`} key={type}><span>{type}</span><small>{names[type]}</small><strong>{countByType(type)}</strong><em>aguardando</em></article>)}
            </div>
            <div className="desk-toolbar"><label>Seu guichê<select value={desk} onChange={event => setDesk(event.target.value)}>{desks.map(item => <option key={item} value={item}>{item}</option>)}</select></label><div className="waiting-total"><strong>{waiting.length}</strong><span>senhas na fila</span></div></div>
            {!current ? <div className="next-ticket-card"><div><span className="eyebrow">PRÓXIMA ETAPA</span><h2>Pronto para chamar?</h2><p>Ao chamar, o sistema selecionará a próxima senha respeitando as prioridades definidas.</p></div><button className="button-primary call-next-button" disabled={busy || offline || !waiting.length || !pub?.open} onClick={() => void run(() => api('next', { desk }))}>{busy ? 'Processando…' : '↗ Chamar próxima senha'}</button></div> : (
              <div className="active-ticket-card">
                <div className="active-ticket-top"><div><span className="eyebrow">ATENDIMENTO EM ANDAMENTO</span><h2>{current.numero}</h2><p>{names[current.tipo] || current.tipo} · {desk}</p></div><span className={`state-pill state-${current.status.toLowerCase()}`}>{current.status.replaceAll('_', ' ')}</span></div>
                <div className="active-ticket-actions">
                  {current.status === 'CHAMADA' && <button className="button-secondary" disabled={busy || offline} onClick={() => void action(current, 'repeat')}>↻ Chamar novamente</button>}
                  {['CHAMADA', 'CHAMADA_NOVAMENTE'].includes(current.status) && <button className="button-primary" disabled={busy || offline} onClick={() => void action(current, 'start')}>Iniciar atendimento</button>}
                  {current.status === 'CHAMADA_NOVAMENTE' && <button className="button-danger" disabled={busy || offline} onClick={() => void action(current, 'absent')}>Não compareceu</button>}
                  {current.status === 'EM_ATENDIMENTO' && <button className="button-primary" disabled={busy || offline} onClick={() => void action(current, 'finish')}>✓ Finalizar atendimento</button>}
                </div>
              </div>
            )}
            <div className="queue-footnote">As chamadas são atualizadas automaticamente. O sistema impede que o mesmo guichê ou atendente receba outra senha enquanto estiver ocupado.</div>
          </section>
        ))}

        {page === 'Relatórios' && session?.manager && (
          <section className="page-content">
            <div className="section-heading"><div><span className="eyebrow">GESTÃO</span><h1>Relatórios e auditoria</h1><p>Consulte indicadores diários ou mensais e exporte os registros.</p></div></div>
            <form className="report-filter" onSubmit={event => { event.preventDefault(); void run(async () => setReport(await api<Ticket[]>('report', { period }))); }}>
              <label>Período <input value={period} onChange={event => setPeriod(event.target.value)} required pattern="[0-9]{4}-[0-9]{2}(-[0-9]{2})?" placeholder="AAAA-MM ou AAAA-MM-DD" /></label>
              <button className="button-primary" disabled={busy || offline}>Consultar período</button>
            </form>
            {report && <>
              <div className="report-metrics">
                <article><span>Total de senhas emitidas</span><strong>{report.length}</strong></article>
                <article><span>Atendimentos concluídos</span><strong>{report.filter(ticket => ticket.status === 'ATENDIDA').length}</strong></article>
                <article><span>Não compareceram</span><strong>{report.filter(ticket => ticket.status === 'NÃO_COMPARECEU').length}</strong></article>
              </div>
              <h2 className="subsection-title">Indicadores por tipo de senha</h2>
              <div className="type-report">{(['SP', 'SE', 'SG'] as const).map(type => {
                const all = report.filter(ticket => ticket.tipo === type);
                const done = all.filter(ticket => ticket.start && ticket.end);
                const average = done.length ? done.reduce((sum, ticket) => sum + (Date.parse(ticket.end!) - Date.parse(ticket.start!)) / 60000, 0) / done.length : null;
                return <article key={type}><span>{type}</span><strong>{names[type]}</strong><small>{all.length} emitidas · {all.filter(ticket => ticket.status === 'ATENDIDA').length} atendidas</small><b>{average === null ? '—' : `${average.toFixed(1)} min`}</b><small>tempo médio de atendimento</small></article>;
              })}</div>
              <div className="table-heading"><h2>Detalhamento e auditoria</h2><button className="button-secondary" onClick={exportCsv}>↓ Exportar CSV</button></div>
              <div className="table-wrap"><table><thead><tr>{['Senha', 'Tipo', 'Estado', 'Emissão', 'Atendente', 'Guichê', '1ª chamada', '2ª chamada', 'Início', 'Fim'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{report.map(ticket => <tr key={ticket.id}><td><strong>{ticket.numero}</strong></td><td>{ticket.tipo}</td><td>{ticket.status.replaceAll('_', ' ')}</td><td>{fmt(ticket.dataEmissao)}</td><td>{ticket.attendant || '—'}</td><td>{ticket.guiche || '—'}</td><td>{fmt(ticket.first)}</td><td>{fmt(ticket.second)}</td><td>{fmt(ticket.start)}</td><td>{fmt(ticket.end)}</td></tr>)}</tbody></table></div>
            </>}
          </section>
        )}

        {page === 'Cadastros' && session?.manager && (
          <section className="page-content">
            <div className="section-heading"><div><span className="eyebrow">ADMINISTRAÇÃO</span><h1>Cadastros do sistema</h1><p>Gerencie os acessos da equipe e os guichês disponíveis.</p></div></div>
            <div className="management-grid">
              <div className="management-card"><h2>Novo atendente</h2><p>Crie um acesso para um membro da equipe.</p><form onSubmit={event => { event.preventDefault(); const form = event.currentTarget; void run(async () => { await api('users', Object.fromEntries(new FormData(form))); form.reset(); await loadConfig(); }); }}>
                <label>Nome completo<input name="name" placeholder="Nome do atendente" required /></label><label>Usuário<input name="login" placeholder="Login de acesso" required /></label><label>Senha<input name="password" type="password" minLength={8} placeholder="Mínimo de 8 caracteres" required /></label><button className="button-primary" disabled={busy || offline}>Cadastrar atendente</button>
              </form><div className="registered-list"><h3>Equipe cadastrada</h3>{config?.users.map(user => <div key={user.login}><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.login}</small></span><em>{user.manager ? 'Gestor' : 'Atendente'}</em></div>)}</div></div>
              <div className="management-card"><h2>Novo guichê</h2><p>Adicione um ponto de atendimento ao laboratório.</p><form onSubmit={event => { event.preventDefault(); const form = event.currentTarget; void run(async () => { await api('desks', Object.fromEntries(new FormData(form))); form.reset(); await loadConfig(); }); }}>
                <label>Identificação do guichê<input name="name" placeholder="Ex.: Guichê 3" required /></label><button className="button-primary" disabled={busy || offline}>Cadastrar guichê</button>
              </form><div className="registered-list"><h3>Guichês disponíveis</h3>{config?.desks.map(item => <div key={item}><span className="desk-icon">▣</span><span><strong>{item}</strong><small>Ponto de atendimento</small></span><em>Ativo</em></div>)}</div></div>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer"><strong>nassauTickets</strong><span>Sistema de Controle de Atendimento · Projeto acadêmico UNINASSAU</span><span>Expediente: 07h às 17h</span></footer>
    </div>
  );
}

export default App;
