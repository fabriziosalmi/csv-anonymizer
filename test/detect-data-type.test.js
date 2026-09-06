/**
 * Header type detection.
 *
 * These cases are the reason the detection was rewritten: every header in
 * "misclassified by substring matching" below was typed wrongly by the previous
 * implementation, silently and consistently.
 *
 * Run with `npm test`. No dependencies: script.js exports its detection
 * functions when required from Node and only wires up the UI in a browser.
 */

const assert = require('node:assert');
const { detectTypeFromHeader, tokenizeHeader, isIBAN } = require('../script.js');

let failures = 0;
let checks = 0;

function check(description, actual, expected) {
    checks++;
    try {
        assert.deepStrictEqual(actual, expected);
    } catch (error) {
        failures++;
        console.error(`  FAIL  ${description}`);
        console.error(`        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

function group(name, fn) {
    console.log(`\n${name}`);
    fn();
}

group('tokenizeHeader', () => {
    check('splits on underscores', tokenizeHeader('plate_number'), ['plate', 'number']);
    check('splits camelCase', tokenizeHeader('userId'), ['user', 'id']);
    check('splits on spaces and punctuation', tokenizeHeader('Codice Fiscale'), ['codice', 'fiscale']);
    check('folds accents', tokenizeHeader('città'), ['citta']);
    check('handles an empty header', tokenizeHeader(''), []);
});

group('misclassified by substring matching (the reported defect)', () => {
    // Each of these contains a keyword as a substring but not as a word.
    check('provider is not an id', detectTypeFromHeader('provider'), null);
    check('video_title is not an id', detectTypeFromHeader('video_title'), null);
    check('width is not an id', detectTypeFromHeader('width'), null);
    check('candidate is not a date', detectTypeFromHeader('candidate'), null);
    check('plate_number is an id, not a latitude', detectTypeFromHeader('plate_number'), 'id');
    check('validated is not a date', detectTypeFromHeader('validated'), null);
    check('paid is not an id', detectTypeFromHeader('paid'), null);
    check('belonging is not a longitude', detectTypeFromHeader('belonging'), null);
});

group('sensitive identifiers are recognised and never fuzzed', () => {
    const sensitive = [
        'ssn', 'SSN', 'iban', 'IBAN', 'vat', 'passport', 'passport_number',
        'codice_fiscale', 'Codice Fiscale', 'partita_iva', 'tax_id', 'tax id',
        'national_id', 'social_security_number', 'credit_card', 'card_number',
        'bank_account', 'numero_conto', 'driver_license', 'driving_licence',
        'cvv', 'dni', 'cpf', 'aadhaar', 'insurance_number',
    ];
    for (const header of sensitive) {
        check(`${header} is sensitive`, detectTypeFromHeader(header), 'sensitive_id');
    }
});

group('ordinary types still resolve', () => {
    check('email', detectTypeFromHeader('email'), 'email');
    check('user_email', detectTypeFromHeader('user_email'), 'email');
    check('youtube_url', detectTypeFromHeader('youtube_url'), 'youtube_url');
    check('website', detectTypeFromHeader('website'), 'url');
    check('profile_link', detectTypeFromHeader('profile_link'), 'url');
    check('created_at is not typed by header alone', detectTypeFromHeader('created_at'), null);
    check('order_date', detectTypeFromHeader('order_date'), 'date');
    check('birth_year', detectTypeFromHeader('birth_year'), 'date');
    check('phone_number', detectTypeFromHeader('phone_number'), 'phone');
    check('latitude', detectTypeFromHeader('latitude'), 'latitude');
    check('lat', detectTypeFromHeader('lat'), 'latitude');
    check('lng', detectTypeFromHeader('lng'), 'longitude');
    check('street_address', detectTypeFromHeader('street_address'), 'address');
    check('user_id', detectTypeFromHeader('user_id'), 'id');
    check('sku', detectTypeFromHeader('sku'), 'id');
    check('unit_price', detectTypeFromHeader('unit_price'), 'currency');
});

group('non-English headers', () => {
    check('indirizzo is an address', detectTypeFromHeader('indirizzo'), 'address');
    check('telefono is a phone', detectTypeFromHeader('telefono'), 'phone');
    check('data_nascita is a date', detectTypeFromHeader('data_nascita'), 'date');
    check('importo is currency', detectTypeFromHeader('importo'), 'currency');
    check('codice is an id', detectTypeFromHeader('codice'), 'id');
});

group('precedence', () => {
    // A sensitive identifier wins over the generic rule that would also match.
    check('card_number is sensitive, not an id', detectTypeFromHeader('card_number'), 'sensitive_id');
    check('tax_code is sensitive, not an id', detectTypeFromHeader('tax_code'), 'sensitive_id');
    check('phone_number is a phone, not an id', detectTypeFromHeader('phone_number'), 'phone');
});

group('isIBAN (mod-97)', () => {
    check('valid IBAN', isIBAN('IT60X0542811101000000123456'), true);
    check('valid IBAN with spaces', isIBAN('GB82 WEST 1234 5698 7654 32'), true);
    check('wrong check digits', isIBAN('IT61X0542811101000000123456'), false);
    check('not an IBAN', isIBAN('hello world'), false);
    check('a plain number is not an IBAN', isIBAN('123456789'), false);
    check('empty', isIBAN(''), false);
});

console.log(`\n${checks - failures}/${checks} checks passed`);
if (failures > 0) {
    console.error(`${failures} failing`);
    process.exit(1);
}
