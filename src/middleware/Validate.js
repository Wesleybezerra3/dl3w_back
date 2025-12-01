// src/middleware/validateIdentity.js
const isValidEmail = (email) => {
    if (typeof email !== "string") return false;
    // regex simples e eficaz para a maioria dos casos
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
};

const isValidDate = (dateStr, { minYear = 1900 } = {}) => {
    if (typeof dateStr !== "string") return false;
    // formato YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

    const [y, m, d] = dateStr.split("-").map((v) => Number(v));
    const date = new Date(dateStr);
    if (
        Number.isNaN(date.getTime()) ||
        date.getUTCFullYear() !== y ||
        date.getUTCMonth() + 1 !== m ||
        date.getUTCDate() !== d
    ) {
        return false;
    }

    // checar intervalo razoável (nascimento não pode ser futuro, e não antes de minYear)
    const today = new Date();
    const minDate = new Date(`${minYear}-01-01`);
    if (date > today) return false;
    if (date < minDate) return false;
    return true;
};

/**
 * Validação de CPF (algoritmo oficial)
 * aceita strings com ou sem pontuação
 */
const isValidCPF = (cpf) => {
    if (!cpf || typeof cpf !== "string") return false;
    const s = cpf.replace(/\D/g, "");
    if (s.length !== 11) return false;

    // rejeitar sequências repetidas (00000000000, 11111111111, ...)
    if (/^(\d)\1{10}$/.test(s)) return false;

    const calc = (t) => {
        let sum = 0;
        for (let i = 0; i < t - 1; i++) {
            sum += Number(s[i]) * (t + 1 - i - 1 + 1); // t = 10 ou 11
        }
        const mod = (sum * 10) % 11;
        return mod === 10 ? 0 : mod;
    };

    const d1 = (() => {
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += Number(s[i]) * (10 - i);
        const r = (sum * 10) % 11;
        return r === 10 ? 0 : r;
    })();

    const d2 = (() => {
        let sum = 0;
        for (let i = 0; i < 10; i++) sum += Number(s[i]) * (11 - i);
        const r = (sum * 10) % 11;
        return r === 10 ? 0 : r;
    })();

    return Number(s[9]) === d1 && Number(s[10]) === d2;
};

/**
 * Factory middleware:
 *  validateIdentity({ requireAll: true })  -> exige cpf, email e data_nascimento
 *  validateIdentity({ requireAll: false }) -> valida apenas os campos presentes
 */
const validateIdentity = (opts = {}) => {
    const { requireAll = true, minYear = 1900 } = opts;

    return (req, res, next) => {
        const errors = [];

        const { cpf, email, data_nascimento } = req.body || {};

        // Se requireAll true, campos obrigatórios
        if (requireAll) {
            if (!cpf) errors.push("Campo 'cpf' é obrigatório.");
            if (!email) errors.push("Campo 'email' é obrigatório.");
            if (!data_nascimento) errors.push("Campo 'data_nascimento' é obrigatório.");
        }

        // Validar apenas se presente (ou se obrigatório e presente)
        if (cpf) {
            if (!isValidCPF(String(cpf))) errors.push("CPF inválido.");
        }

        if (email) {
            if (!isValidEmail(String(email))) errors.push("E-mail inválido.");
        }

        if (data_nascimento) {
            if (!isValidDate(String(data_nascimento), { minYear })) {
                errors.push(
                    "Data de nascimento inválida. Use formato YYYY-MM-DD, sem ser futura e com ano razoável."
                );
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ ok: false, errors });
        }

        // tudo certo
        return next();
    };
};

module.exports = validateIdentity;