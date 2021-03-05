// eslint-disable-next-line no-extend-native
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
};

class StringFilter {
    constructor(mentionsValue) {
        this.mentionsValue = mentionsValue;
    }

    replaceWithBraces = (filterFormula) => {
		const mentionLength = this.mentionsValue.length;
		let ruleFormula = filterFormula;
		for (let i = 0; i < mentionLength; i++) {
			let initialIndex = ruleFormula.indexOf('(' + this.mentionsValue[i].id);
			ruleFormula = ruleFormula.replaceAt(initialIndex, '{');
			ruleFormula = ruleFormula.replaceAt((this.mentionsValue[i].id.length + initialIndex + 1), '}');
        }
        const benefitFormula = this.replaceFormulaSpace(ruleFormula);
        return this.replaceUnderscore(benefitFormula.replace(/ +?/g, ''));
    };

    replaceFormulaSpace = (ruleFormula) => {
        return ruleFormula.replace(/\{.*?\}/g, function(string) {
            return string.replace(/\s/g, '__');
        });
    };

    replaceUnderscore = (benefitFormula) => {
        return benefitFormula.replace(/\{.*?\}/g, function(string) {
            return string.replace(/__/g, ' ');
        });
    };
    // addSpace = (benefitFormula) => {
    //     "abc|aha".replace(/\|/," ".repeat(1)+"|" + " ".repeat(1));
    // }
}

export default StringFilter;