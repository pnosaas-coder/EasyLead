export interface AfricanCountry {
  code: string;
  name: string;
  dialCode: string;
  currency: string;
  defaultLang: 'fr' | 'en';
}

export const AFRICAN_COUNTRIES: AfricanCountry[] = [
  { code: 'CM', name: 'Cameroun', dialCode: '+237', currency: 'XAF', defaultLang: 'fr' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', currency: 'XOF', defaultLang: 'fr' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', currency: 'XOF', defaultLang: 'fr' },
  { code: 'CD', name: 'RD Congo', dialCode: '+243', currency: 'USD', defaultLang: 'fr' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', currency: 'XAF', defaultLang: 'fr' },
  { code: 'BJ', name: 'Bénin', dialCode: '+229', currency: 'XOF', defaultLang: 'fr' },
  { code: 'TG', name: 'Togo', dialCode: '+228', currency: 'XOF', defaultLang: 'fr' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', currency: 'XOF', defaultLang: 'fr' },
  { code: 'ML', name: 'Mali', dialCode: '+223', currency: 'XOF', defaultLang: 'fr' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', currency: 'GNF', defaultLang: 'fr' },
  { code: 'NE', name: 'Niger', dialCode: '+227', currency: 'XOF', defaultLang: 'fr' },
  { code: 'TD', name: 'Tchad', dialCode: '+235', currency: 'XAF', defaultLang: 'fr' },
  { code: 'CG', name: 'Congo-Brazzaville', dialCode: '+242', currency: 'XAF', defaultLang: 'fr' },
  { code: 'MG', name: 'Madagascar', dialCode: '+261', currency: 'MGA', defaultLang: 'fr' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', currency: 'RWF', defaultLang: 'en' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', currency: 'NGN', defaultLang: 'en' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', currency: 'GHS', defaultLang: 'en' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', currency: 'KES', defaultLang: 'en' },
  { code: 'ZA', name: 'Afrique du Sud', dialCode: '+27', currency: 'ZAR', defaultLang: 'en' },
];

export function getCountryByCode(code: string): AfricanCountry {
  const match = AFRICAN_COUNTRIES.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
  return (
    match || {
      code: 'CM',
      name: 'Cameroun',
      dialCode: '+237',
      currency: 'XAF',
      defaultLang: 'fr',
    }
  );
}
