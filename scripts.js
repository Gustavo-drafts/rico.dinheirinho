const Modal = {
    open() {
        // Abrir modal
        // Add class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active');
    },
    close() {
        // Fechar modal
        // Remove class active do modal
        const deactive = document
            .querySelector('.modal-overlay')
            .classList
            .remove('active');
    }
}

// Contrutor de array
const Storage = {
    // pegar dados
    get() {
        // retorno de string para um array/obj
        return JSON.parse(localStorage.getItem('dev.finances:transations')) || [];
    },

    // guardar dados
    set(transactions) {
        localStorage
            // guardando em 'dev...' 
            .setItem('dev.finances:transations',

                // transformando array em string
                JSON.stringify(transactions))
    }
}

// Area lógica
const Transaction = {

    // Array base
    all: Storage.get(),

    // adicionar transação
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    // remover transação
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    // Pegar todas as transações de entrada
    incomes() {
        income = 0;
        // para cada transação, 
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if (transaction.amount > 0) {
                // Somar e retornar uma variável
                income += transaction.amount;
            }
        })
        return income;
    },

    // Pegar todas as transações de saída
    expenses() {
        expense = 0;
        // para cada transação, 
        Transaction.all.forEach(transaction => {
            // se ela for menor que zero
            if (transaction.amount < 0) {
                // Somar e retornar uma variável
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

// Manipulação da DOM 
const Handle = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = Handle.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        Handle.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html =
            `                
            <td class="description">${transaction.description}</td>
            <td class=${CSSclass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>               
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        Handle.transactionsContainer.innerHTML = ' '
    }
}

// Tratando dados
const Utils = {

    // Tratando valor de Amount
    formatAmount(value) {
        value = value * 100

        return Math.round(value)
    },

    // Tratando valor de Date
    formatDate(date) {
        const splittedDate = date.split('-')

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    // Tratando exibição de moeda 
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''

        value = String(value).replace(/\D/g, '')
        value = Number(value) / 100

        value = value.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
        })
        return signal + value;
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // salvando valores em memória
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    // Verificar se todos os campos foram preenchidos
    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === '' ||
            amount.trim() === '' ||
            date.trim() === '') {
            throw new Error('Preencha todos os campos!')
        }
    },

    // formatar dados pra salvar
    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    // Limpando os campos
    clearFields() {
        Form.description.value = ''
        Form.amount.value = ''
        Form.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields();

            // Obter uma transação formatada
            const transaction = Form.formatValues();

            // Adicionar transação
            Transaction.add(transaction)

            // apagar dados do formulario
            Form.clearFields()

            // fechar modal
            Modal.close()

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {

        // adicionando dado tratado na DOM
        Transaction.all.forEach(Handle.addTransaction)

        // atualizando cards
        Handle.updateBalance()

        // atualizando localStorage
        Storage.set(Transaction.all)
    },

    reload() {
        Handle.clearTransactions()
        App.init()
    },
}

App.init()