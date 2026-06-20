/* Arquivo central de scripts: script.js */
document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form.needs-validation');
  forms.forEach(form => form.addEventListener('submit', handleFormSubmit));
  
  setActiveNavLink();
  populateFeaturedProducts();
  delegateAddToCart();
  
  // Inicializa os comportamentos dinâmicos adicionados no Momento II
  initEstadoCidadeDinamic();
  initItensVendaDinamico();
  initVerMaisDescricao(); // Reativado — Função declarada com sucesso abaixo
});

function handleFormSubmit(e){
  const form = e.target;
  clearFormErrors(form);
  const validators = getValidators(form);
  const errors = [];

  for(const v of validators){
    const valid = v.fn(v.input.value);
    if(!valid){
      showError(v.input, v.message);
      errors.push({input:v.input, message:v.message});
    }
  }

  if(errors.length){
    e.preventDefault();
    errors[0].input.focus();
    return false;
  }

  e.preventDefault();
  showSuccess(form, 'Cadastro realizado com sucesso.');
  return true;
}

function getValidators(form){
  const list = [];
  // Validar campos obrigatórios genericamente
  form.querySelectorAll('[required]').forEach(input => {
    list.push({ input, fn: v => v.trim() !== '', message: 'Campo obrigatório.' });
  });

  // Validadores específicos por tipo de formulário
  const formType = form.querySelector('[name="_form"]') ? form.querySelector('[name="_form"]').value : '';
  
  if(formType === 'cadastro-cliente'){
    const nome = form.querySelector('[name="nome"]');
    if(nome) list.push({input:nome, fn:validateName, message:'O nome deve conter pelo menos duas palavras.'});

    const data = form.querySelector('[name="dataNascimento"]');
    if(data) list.push({input:data, fn:validatePastDate, message:'A data de nascimento deve ser anterior à data atual.'});

    const cpfcnpj = form.querySelector('[name="cpfcnpj"]');
    if(cpfcnpj) list.push({input:cpfcnpj, fn:validateCpfCnpjRegraProfessor, message:'CPF/CNPJ inválido de acordo com as regras estabelecidas.'});

    const tel = form.querySelector('[name="telefone"]');
    if(tel) list.push({input:tel, fn:validatePhone, message:'O telefone deve possuir exatamente 9 dígitos.'});

    const email = form.querySelector('[name="email"]');
    if(email) list.push({input:email, fn:validateEmail, message:'O e-mail deve conter "@" e um "." após a arroba.'});
  }

  if(formType === 'cadastro-produto'){
    const preco = form.querySelector('[name="preco"]');
    if(preco) list.push({input:preco, fn: v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, message:'Preço deve ser número maior que zero.'});
  }

  return list;
}

function showError(input, message){
  input.classList.add('invalid');
  let el = input.parentNode.querySelector('.error');
  if(!el){
    el = document.createElement('span');
    el.className='error';
    input.parentNode.appendChild(el);
  }
  el.textContent = message;
}

function clearFormErrors(form){
  form.querySelectorAll('.error').forEach(e => e.remove());
  form.querySelectorAll('.invalid').forEach(i => i.classList.remove('invalid'));
}

function showSuccess(form, message){
  let el = form.querySelector('.form-success');
  if(!el){
    el = document.createElement('div');
    el.className='form-success card';
    form.prepend(el);
  }
  el.textContent = message;
  el.style.borderLeft = '4px solid #2b8a3e';
  form.reset();
}

/* Realça o link de navegação ativo com base no path */
function setActiveNavLink(){
  try{
    const links = document.querySelectorAll('nav a');
    const path = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if(href && href.endsWith(path)) a.classList.add('active');
    });
  }catch(e){/* silencioso */}
}

/* Popula seção de produtos em destaque mapeando as imagens .png locais do seu diretório */
function populateFeaturedProducts(){
  const container = document.getElementById('featured-products');
  if(!container) return;
  const products = [
    { id:1, name:'Notebook Gamer', price:'3500,00', description:'RTX 3050, 16GB RAM, tela 144Hz ideal para jogos de última geração.', img:'imagens/notebook%20gamer.png' },
    { id:2, name:'Mouse RGB', price:'80,00', description:'Iluminação customizável, 6 botões programáveis e ajuste de peso.', img:'imagens/mouse%20RGB.png' },
    { id:3, name:'Teclado Mecânico', price:'250,00', description:'Switch Blue, anti-ghosting e retroiluminação para digitação precisa.', img:'imagens/teclado%20mecanico.png' }
  ];
  container.innerHTML = ''; 
  products.forEach(p => {
    const el = document.createElement('div'); el.className='product card';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <strong>${p.name}</strong>
      <p id="desc-feat-${p.id}" class="product-description muted">${p.description}</p>
      <div class="price"><span class="currency">R$</span> ${p.price}</div>
      <div class="actions">
        <button class="btn add-cart" data-id="${p.id}">Adicionar ao carrinho</button>
        <button class="btn-secondary btn-ver-mais" data-target="desc-feat-${p.id}">Ver mais</button>
      </div>
    `;
    container.appendChild(el);
  });
}

/* Delegação para botões "Adicionar ao carrinho" */
function delegateAddToCart(){
  document.addEventListener('click', e => {
    const btn = e.target.closest && e.target.closest('.add-cart');
    if(!btn) return;
    btn.textContent = 'Adicionado';
    btn.disabled = true;
    btn.style.background = '#2b8a3e';
  });
}

/* Validadores estruturados */
function validateName(v){
  if(!v) return false;
  const parts = v.trim().split(/\s+/);
  return parts.length >= 2 && parts.every(p => p.length >= 2);
}

function validatePastDate(v){
  if(!v) return false;
  const d = new Date(v + 'T00:00:00'); 
  const today = new Date();
  today.setHours(0,0,0,0);
  return d < today;
}

function validatePhone(v){
  if(!v) return false;
  return /^\d{5}-\d{4}$/.test(v) || /^\d{9}$/.test(v);
}

function validateEmail(v){
  if(!v) return false;
  const parts = v.split('@');
  if(parts.length !== 2) return false;
  return parts[1].includes('.');
}

/**
 * IMPLEMENTAÇÃO REQUISITO 2.c: VALIDAÇÃO NÃO OFICIAL DE CPF/CNPJ
 * Os dois últimos dígitos devem corresponder à soma de todos os anteriores.
 */
function validateCpfCnpjRegraProfessor(v) {
  if(!v) return false;
  const nums = v.replace(/\D/g, '');
  
  if(nums.length !== 11 && nums.length !== 14) return false;
  
  const corpo = nums.substring(0, nums.length - 2);
  const digitosVerificadores = parseInt(nums.substring(nums.length - 2), 10);
  
  let soma = 0;
  for (let i = 0; i < corpo.length; i++) {
    soma += parseInt(corpo.charAt(i), 10);
  }
  
  return soma === digitosVerificadores;
}

/**
 * IMPLEMENTAÇÃO REQUISITO 3: VÍNCULO DINÂMICO ESTADO/CIDADE
 * 3 estados, contendo pelo menos 5 cidades condicionadas cada.
 */
const dataCidades = {
  "MG": ["Uberlândia", "Uberaba", "Araguari", "Belo Horizonte", "Patos de Minas"],
  "SP": ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "São José dos Campos"],
  "RJ": ["Rio de Janeiro", "Niterói", "Petrópolis", "Duque de Caxias", "Cabo Frio"]
};

function initEstadoCidadeDinamic(){
  const selectEstado = document.getElementById('estado');
  const selectCidade = document.getElementById('cidade');
  
  if(!selectEstado || !selectCidade) return;
  
  selectEstado.addEventListener('change', () => {
    const estado = selectEstado.value;
    selectCidade.innerHTML = '<option value="">Selecione a cidade...</option>';
    
    if(estado && dataCidades[estado]){
      selectCidade.disabled = false;
      dataCidades[estado].forEach(cid => {
        const option = document.createElement('option');
        option.value = cid.toLowerCase().replace(/\s+/g, '-');
        option.textContent = cid;
        selectCidade.appendChild(option);
      });
    } else {
      selectCidade.disabled = true;
    }
  });
}

/**
 * IMPLEMENTAÇÃO REQUISITO 4: FORMULÁRIO DE VENDAS DINÂMICO
 * Insere novas linhas de itens dinamicamente na tela ao clicar.
 */
function initItensVendaDinamico(){
  const btnAddItem = document.getElementById('btn-add-item');
  const containerItens = document.getElementById('container-itens-venda');
  
  if(!btnAddItem || !containerItens) return;
  
  let itemIndex = 1;
  
  btnAddItem.addEventListener('click', (e) => {
    e.preventDefault();
    itemIndex++;
    
    const div = document.createElement('div');
    div.className = 'item-produto-linha form-group card';
    div.style.marginTop = '12px';
    div.style.padding = '12px';
    
    div.innerHTML = `
      <h4>Item #${itemIndex}</h4>
      <div class="form-group">
        <label for="produto-nome-${itemIndex}">Produto:</label>
        <input type="text" id="produto-nome-${itemIndex}" name="produto_nome[]" required placeholder="Ex: Periférico">
      </div>
      <div class="form-group">
        <label for="produto-quantidade-${itemIndex}">Quantidade:</label>
        <input type="number" id="produto-quantidade-${itemIndex}" name="produto_qtd[]" required min="1" value="1" style="width: 100%; padding: 10px 12px; border: 1px solid #ccc; border-radius: 4px; margin-top: 6px; box-sizing: border-box;">
      </div>
      <button type="button" class="btn btn-remover-item" style="background: #c62828; margin-top: 8px;">Remover Item</button>
    `;

    containerItens.appendChild(div);

    div.querySelector('.btn-remover-item').addEventListener('click', () => {
      div.remove();
    });
  });
}

/**
 * ALTERNA EXIBIÇÃO DA DESCRIÇÃO DO PRODUTO
 * Controla os elementos ocultos ativados pelo botão "Ver mais".
 */
function initVerMaisDescricao() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-ver-mais');
    if (!btn) return;

    const targetId = btn.dataset.target;
    const descElement = document.getElementById(targetId);

    if (descElement) {
      descElement.classList.toggle('show');

      if (descElement.classList.contains('show')) {
        btn.textContent = 'Fechar';
      } else {
        btn.textContent = 'Ver mais';
      }
    }
  });
}