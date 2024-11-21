// Função para formatar a data no formato brasileiro
const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-'); // Divide a data no formato ISO (yyyy-mm-dd)
    return `${dia}/${mes}/${ano.slice(2)}`; // Retorna no formato dd/mm/aa
};

// Funções para manipular o LocalStorage
const getProcedimentos = () => JSON.parse(localStorage.getItem('procedimentos')) || [];
const setProcedimentos = (data) => localStorage.setItem('procedimentos', JSON.stringify(data));

// Atualizar Resumo de Pendências
const atualizarResumo = () => {
    const procedimentos = getProcedimentos();
    const pendentes = procedimentos.filter((p) => p.status === 'Pendente').length;
    const pagos = procedimentos.filter((p) => p.status === 'Pago').length;
    const resumoElem = document.getElementById('resumo-pendencias');
    if (resumoElem) {
        resumoElem.innerText = `Resumo: ${pendentes} Pendentes | ${pagos} Pagos`;
    }
};

// Função para renderizar a tabela com base no filtro
const renderTabela = (filtros = {}) => {
    const statusFiltro = document.getElementById('filtro-status')?.value || 'Todos'; // Obter o status selecionado
    let procedimentos = getProcedimentos();

    // Filtrar pelo status, se não for "Todos"
    if (statusFiltro !== 'Todos') {
        procedimentos = procedimentos.filter((p) => p.status === statusFiltro);
    }

    // Filtrar pelos outros campos
    if (filtros.nome) {
        procedimentos = procedimentos.filter((p) => p.nome.toLowerCase().includes(filtros.nome.toLowerCase()));
    }
    if (filtros.local) {
        procedimentos = procedimentos.filter((p) => p.local.toLowerCase().includes(filtros.local.toLowerCase()));
    }
    if (filtros.procedimento) {
        procedimentos = procedimentos.filter((p) => p.procedimento.toLowerCase().includes(filtros.procedimento.toLowerCase()));
    }

    // Ordenar procedimentos por data (ordem cronológica)
    procedimentos = procedimentos.sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA; // Ordem decrescente (mais recente primeiro)
    });

    const tabela = document.getElementById('tabela-procedimentos');
    if (tabela) {
        tabela.innerHTML = '';
        procedimentos.forEach((proc) => {
            const classe = proc.status === 'Pago' ? 'linha-paga' : ''; // Classe condicional
            tabela.innerHTML += `
                <tr class="${classe}">
                    <td>${formatarData(proc.data)}</td>
                    <td>${capitalizeWords(proc.nome)}</td>
                    <td>${proc.procedimento}</td>
                    <td>${proc.local}</td>
                    <td>${proc.status}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="alterarStatus(${proc.id})">Alterar Status</button>
                        <button class="btn btn-sm btn-danger" onclick="removerProcedimento(${proc.id})">Remover</button>
                    </td>
                </tr>
            `;
        });
    }
    atualizarResumo();
};

function capitalizeWords(nome) {
    return nome
      .toLowerCase() // Converte tudo para minúsculas
      .split(' ') // Divide o nome em palavras
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)) // Capitaliza a primeira letra de cada palavra
      .join(' '); // Junta tudo de volta em uma única string
  }
  

document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('alterarStatus(${proc.id})')) {
        const procedimentoId = event.target.dataset.id; // Ou outro identificador único
        alterarStatus(procedimentoId);
    }
});

const alterarStatus = (id) => {
    const procedimentos = getProcedimentos();
    const index = procedimentos.findIndex((p) => p.id === id);
    if (index !== -1) {
        // Alternar o status entre 'Pendente' e 'Pago'
        procedimentos[index].status = procedimentos[index].status === 'Pendente' ? 'Pago' : 'Pendente';
        setProcedimentos(procedimentos);
        renderTabela();
    }
};



// Evento para aplicar o filtro ao mudar a seleção
document.getElementById('filtro-status')?.addEventListener('change', renderTabela);

// Função para lidar com a busca/filtro
const filtrarTabela = () => {
    const filtroNome = document.getElementById('filtro-nome')?.value || '';
    const filtroLocal = document.getElementById('filtro-local')?.value || '';
    const filtroProcedimento = document.getElementById('filtro-procedimento')?.value || '';

    renderTabela({
        nome: filtroNome,
        local: filtroLocal,
        procedimento: filtroProcedimento,
    });
};

// Adicionar eventos para os campos de filtro
document.getElementById('filtro-nome')?.addEventListener('input', filtrarTabela);
document.getElementById('filtro-local')?.addEventListener('input', filtrarTabela);
document.getElementById('filtro-procedimento')?.addEventListener('input', filtrarTabela);

// Inicializar a Tabela
renderTabela();

// Função para limpar os filtros
const limparFiltros = () => {
    // Resetar os campos de filtro
    document.getElementById('filtro-nome').value = '';
    document.getElementById('filtro-local').value = '';
    document.getElementById('filtro-procedimento').value = '';
    document.getElementById('filtro-status').value = 'Todos';

    // Renderizar a tabela sem filtros (mostrar todos os dados)
    renderTabela();
};

// Adicionar evento para o botão de limpar filtros
document.getElementById('btn-limpar')?.addEventListener('click', limparFiltros);

// Inicializar a Tabela
renderTabela();


let idParaRemover = null; // Variável para armazenar o ID a ser removido

// Mostrar a modal de confirmação
const exibirModalConfirmacao = (id, nome, procedimento) => {
    idParaRemover = id;
    const mensagem = `Tem certeza de que deseja remover o procedimento "${procedimento}" de ${nome}?`;
    document.getElementById('mensagem-confirmacao').innerText = mensagem;

    // Exibir a modal
    document.getElementById('modal-confirmacao').style.display = 'flex';
};

// Ocultar a modal de confirmação
const ocultarModalConfirmacao = () => {
    document.getElementById('modal-confirmacao').style.display = 'none';
    idParaRemover = null;
};

// Confirmar a remoção
const confirmarRemocao = () => {
    if (idParaRemover !== null) {
        let procedimentos = getProcedimentos();
        procedimentos = procedimentos.filter((p) => p.id !== idParaRemover);
        setProcedimentos(procedimentos);
        renderTabela();
        ocultarModalConfirmacao();
    }
};

// Eventos para os botões da modal
document.getElementById('btn-confirmar').addEventListener('click', confirmarRemocao);
document.getElementById('btn-cancelar').addEventListener('click', ocultarModalConfirmacao);

// Atualize o botão Remover para exibir a modal
const removerProcedimento = (id) => {
    const procedimentos = getProcedimentos();
    const procedimento = procedimentos.find((p) => p.id === id);

    if (procedimento) {
        exibirModalConfirmacao(id, procedimento.nome, procedimento.procedimento);
    }
};


// Script para pré-selecionar a data atual no campo de data
document.addEventListener("DOMContentLoaded", () => {
    const dataInput = document.getElementById("data");

    const definirDataAtual = () => {
        if (dataInput) {
            const hoje = new Date();
            const dia = String(hoje.getDate()).padStart(2, '0');
            const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
            const ano = hoje.getFullYear();
            dataInput.value = `${ano}-${mes}-${dia}`;
        }
    };

    // Define a data ao carregar a página
    definirDataAtual();

    // Redefine a data ao exibir o formulário de cadastro
    const btnCadastrar = document.getElementById("btn-cadastrar");
    if (btnCadastrar) {
        btnCadastrar.addEventListener("click", () => {
            preencherUltimoCadastro(); // Preencher com os dados do último cadastro
        });
    }
});

// Preencher o formulário com os dados do último cadastro
const preencherUltimoCadastro = () => {
    const procedimentos = getProcedimentos();
    const ultimoCadastro = procedimentos[procedimentos.length - 1] || {};

    document.getElementById('data').value = ultimoCadastro.data || '';
    document.getElementById('nome').value = ultimoCadastro.nome || '';
    document.getElementById('procedimento').value = ultimoCadastro.procedimento || '';
    document.getElementById('status').value = ultimoCadastro.status || '';
    document.getElementById('local').value = ultimoCadastro.local || '';
};

// Configurar Formulário
document.getElementById('cadastro-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = document.getElementById('data')?.value;
    const nome = document.getElementById('nome')?.value;
    let procedimento = document.getElementById('procedimento')?.value;
    const status = document.getElementById('status')?.value;
    let local = document.getElementById('local')?.value;

    // Verificar campos "Outros"
    if (procedimento === 'outros') {
        procedimento = document.getElementById('outros')?.value;
    }
    if (local === 'outros') {
        local = document.getElementById('outros-local')?.value;
    }

    // Adicionar novo procedimento
    const procedimentos = getProcedimentos();
    const novoProcedimento = {
        id: Date.now(), // ID único com base no timestamp
        data,
        nome,
        procedimento,
        status,
        local
    };
    procedimentos.push(novoProcedimento);
    setProcedimentos(procedimentos);
    renderTabela();

    // Voltar para o dashboard após salvar
    document.getElementById('form-cadastro').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Limpar o formulário
    document.getElementById('cadastro-form').reset();
    e.preventDefault(); // Evita comportamento padrão

    // Esconde os campos "Outros" apenas se eles existirem no DOM
    const outrosProcedimentoInput = document.getElementById('outros-container');
    const outrosLocalInput = document.getElementById('outros-local-container');

    if (outrosProcedimentoInput) outrosProcedimentoInput.style.display = 'none';
    if (outrosLocalInput) outrosLocalInput.style.display = 'none';
});

// Mostrar ou ocultar os inputs "Outros" dinamicamente
const gerenciarInputsExtras = () => {
    const procedimentoSelect = document.getElementById('procedimento');
    const localSelect = document.getElementById('local');

    const outrosProcedimentoInput = document.getElementById('outros-container');
    const outrosLocalInput = document.getElementById('outros-local-container');

    // Verifica se a opção "outros" foi selecionada em "procedimento"
    if (procedimentoSelect?.value === 'outros') {
        outrosProcedimentoInput.style.display = 'block';
    } else {
        outrosProcedimentoInput.style.display = 'none';
        document.getElementById('outros').value = ''; // Limpa o campo
    }

    // Verifica se a opção "outros" foi selecionada em "local"
    if (localSelect?.value === 'outros') {
        outrosLocalInput.style.display = 'block';
    } else {
        outrosLocalInput.style.display = 'none';
        document.getElementById('outros-local').value = ''; // Limpa o campo
    }
};

document.getElementById('btn-cadastrar').addEventListener('click', () => {
    esconderCamposOutros(); // Garante que os campos "Outros" fiquem escondidos
});

const esconderCamposOutros = () => {
    const outrosProcedimentoInput = document.getElementById('outros-container');
    const outrosLocalInput = document.getElementById('outros-local-container');

    if (outrosProcedimentoInput) outrosProcedimentoInput.style.display = 'none';
    if (outrosLocalInput) outrosLocalInput.style.display = 'none';
};


// Adicionar eventos para os campos "procedimento" e "local"
document.getElementById('procedimento')?.addEventListener('change', gerenciarInputsExtras);
document.getElementById('local')?.addEventListener('change', gerenciarInputsExtras);

// Inicializar o estado dos campos "Outros"
document.addEventListener('DOMContentLoaded', () => {
    gerenciarInputsExtras();
});

// Mostrar/Ocultar Formulários
document.getElementById('btn-cadastrar')?.addEventListener('click', () => {
    document.getElementById('form-cadastro').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-cancelar1')?.addEventListener('click', () => {
        const formCadastro = document.getElementById('form-cadastro');
        if (formCadastro) {
            formCadastro.style.display = 'none';
        }
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.style.display = 'block';
        }
    });
});

const { jsPDF } = window.jspdf;
const doc = new jsPDF();


// Função para gerar o PDF com os procedimentos
const gerarPDF = () => {
    // Criar uma instância do jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Adicionar título ao PDF
    doc.setFontSize(16);
    doc.text('Resumo de Procedimentos', 14, 20);

    // Adicionar cabeçalho da tabela
    const header = ['Data', 'Nome', 'Procedimento', 'Local', 'Status'];
    const procedimentos = getProcedimentos();
    const rows = procedimentos.map(proc => [
        formatarData(proc.data),
        capitalizeWords(proc.nome),
        proc.procedimento,
        proc.local,
        proc.status
    ]);

    // Adicionar a tabela no PDF
    doc.autoTable({
        head: [header],
        body: rows,
        startY: 30, // Iniciar a tabela após o título
        theme: 'grid',
        margin: { top: 10 }
    });

    // Gerar o PDF e abrir em uma nova aba
    doc.save('procedimentos.pdf');
};

const btnGerarPDF = document.getElementById('btn-gerar-pdf');
if (btnGerarPDF) {
    btnGerarPDF.addEventListener('click', gerarPDF);
}

// Inicializar a Tabela
renderTabela();


