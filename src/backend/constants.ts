export var PATHS = {
  CART: '/kosik',
  LOGIN: '/login',
  HOMEPAGE: '/homepage',
  ORDER_SHIPPING_AND_PAYMENT: '/doprava-a-platba',
  ORDER_PERSONAL_DATA: '/osobni-udaje',
  ORDER_SUMMARY: '/shrnuti-objednavky',
  ORDER_SUCCESS: '/podekovani',
  NEW_USER_SUCCESS: '/registrace-vysledek'
};
export var SLASH = '/';
export var DOT = '.';
export var EMPTY_LOGIN_NAME = 'nepřihlášen';
export var MESSAGE_COUPON_INVALID = 'Neplatný kupón';
export var MESSAGE_COUPON_DELETE_ERROR = 'Chyba při mazání kupónu';
export var MESSAGE_COUPON_ERROR = 'Nepodařilo se vložit kupón';
export var MESSAGE_ORDER_ERROR = 'Nepodařilo se vytvořit objednávku';
export var MESSAGE_ORDER_AMOUNT_ERROR = 'V košíku nemáte žádné zboží';
export var MESSAGE_ORDER_SHIPPING_ERROR = 'Není vybraný způsob dopravy';
export var MESSAGE_ORDER_PAYMENT_ERROR = 'Není vybraný způsob platby';
export var MESSAGE_ORDER_FIRSTNAME_ERROR = 'Není zadáno jméno uživatele';
export var MESSAGE_ORDER_LASTNAME_ERROR = 'Není zadáno příjmení uživatele';
export var MESSAGE_ORDER_EMAIL_ERROR = 'Není zadán email uživatele';
export var MESSAGE_LOGIN_ERROR = 'Nepodařilo se přihlásit';
export var MESSAGE_LOGOUT_ERROR = 'Nepodařilo se odhlásit';
export var MESSAGE_LOGIN_OR_PASSWORD_ERROR = 'Chybné jméno nebo heslo';
export var MESSAGE_LOGIN_NOT_FILLED = 'Login není vyplněn';
export var MESSAGE_CART_ITEMS_NOT_FOUND = 'V košíku nemáte žádné zboží';
export var MESSAGE_UPDATE_USER_SUCCESS = 'Uživatelský profil byl uložen';
export var MESSAGE_EMAIL_VALIDATE = 'Email je neplatný';
export var MESSAGE_PHONE_VALIDATE = 'Telefon je neplatný';
export var MESSAGE_ZIP_VALIDATE = 'PSČ je neplatné';
export var MESSAGE_FIRSTNAME_NOT_FILLED = 'Jméno není vyplněno';
export var MESSAGE_LASTNAME_NOT_FILLED = 'Příjmení není vyplněno';
export var MESSAGE_EMAIL_NOT_FILLED = 'Email není vyplněn';
export var MESSAGE_PHONE_NOT_FILLED = 'Telefon není vyplněn';
export var MESSAGE_STREET_NOT_FILLED = 'Ulice není vyplněna';
export var MESSAGE_CITY_NOT_FILLED = 'Město není vyplněno';
export var MESSAGE_ZIP_NOT_FILLED = 'PSČ není vyplněno';
export var MESSAGE_PASSWORD_NOT_FILLED = 'Heslo není vyplněno';
export var MESSAGE_CONFIRM_PASSWORD_NOT_SAME = 'Heslo a heslo pro ověření musí být stejné';
export var MESSAGE_CONFIRM_PASSWORD_NOT_FILLED = 'Heslo pro ověření není vyplněno';
export var MESSAGE_EXIST_USER = 'Zadaný login již existuje, zadejte prosím jiný.';
export var MESSAGE_EXIST_USER_EMAIL = 'Uživatel se zadaným emailem již existuje, zadejte prosím jiný.';
export var MESSAGE_CREATE_USER_ERROR = 'Chyba při vytváření uživatele.';
export var MESSAGE_UPDATE_USER_ERROR = 'Chyba při ukladani uživatele.';
export var PRODUCT_ADD_TO_CART_ERROR = 'Chyba při vkládání do košíku';
export var SESSIONID_CODE = 'sessionid';
export var AUTH_TOKEN_CODE = 'auth_token';
export var ROOT_PATH = 'http://localhost:' + (parseInt(process.env.APP_PORT, 10) || 9002);
export var commaParams = '@';
export var actionId = 2664;
export var newsId = 2663;
export var availabilityCode = 'SKLADEM';
export var imageFileExtPath = '/images/theme/files/';
export var imgagePath = '/files/';
export var imgagePathEmpty = '/images/noimage/';
export var imgageEmptySmall = 'mcled_noimage_S.png';
export var imgageEmptyMedium = 'mcled_noimage_M.png';
export var imgageEmptyLarge = 'mcled_noimage_L.png';
export var imgageEmptyBig = 'mcled_noimage_B.png';
export var sqlListCore =
  'SELECT ' +
  '  \'/\' || p.presmerovani as "redirect", ' +
  '  p.id as "id", ' +
  '  p.kod as "code", ' +
  '  DBMS_LOB.SUBSTR(pp.popis, 250, 1) as "name" ' +
  'FROM ' +
  '  crm_produkty_zatrideni z, ' +
  '  produkty p, ' +
  '  produkty_popis pp, ' +
  '  produkt_eshop_vazby pv, ' +
  '  web_nastaveni_webu_zatr_prod nwz, ' +
  '  web_nastaveni_webu nw, ' +
  '  web_eshopy we, ' +
  '  (select id_produktu from crm_produkty_zatrideni where id_typ_zatrideni_produkt = 2663) ne, ' +
  '  (select id_produktu from crm_produkty_zatrideni where id_typ_zatrideni_produkt = 2664) ac ' +
  'WHERE ' +
  '  nw.presmerovani = :code ' +
  '  and p.matka is null ' +
  '  and p.presmerovani is not null ' +
  '  and p.kod = pp.produkt(+) ' +
  '  and pp.jazyk(+) = \'CZE\' ' +
  '  and pp.website(+) = get_website ' +
  '  and pp.typ_popisu(+) = \'PRODUKT_NAZEV_ZKR\' ' +
  '  and p.kod = pv.produkt ' +
  '  and pv.zobrazit = 1 ' +
  '  and pv.eshop = nw.eshop ' +
  '  and z.ID_TYP_ZATRIDENI_PRODUKT = nwz.id_zatrideni ' +
  '  and z.id_produktu = p.id ' +
  '  and nw.id = nwz.id_nastaveni ' +
  '  and we.user_login = USER ' +
  '  and we.kod = nw.eshop ' +
  '  and p.id = ne.id_produktu(+) ' +
  '  and p.id = ac.id_produktu(+) ';

export var sqlListInfo = 'select ' +
  '  p.id as "id", ' +
  '  e1_web_cena(null, p.kod, null, null, null, null, 1, 1) AS "price", ' +
  '  ((ds.procent / 100) + 1) AS "priceVatKoef", ' +
  '  decode(p.dostupnost_datum, null, pd.nazev, \'Očekáváme\') AS "availability", ' +
  '  NVL(pn.priloha_id, 0) as "imgMediumId", ' +
  '  decode(instr(pdi.popis, \'.\', -1), 0, null, substr(pdi.popis, instr(pdi.popis, \'.\', -1))) as "imgMediumExt", ' +
  '  decode(ac.id_produktu, null, null, 1) as "action", ' +
  '  decode(ne.id_produktu, null, null, 1) as "news",' +
  '  decode(p.dostupnost, \'SKLADEM\', 1, 0) as "inStock", ' +
  '  p.predloha as "patternParams" ' +
  'from ' +
  '  produkty p, ' +
  '  prilohy_nove pn, ' +
  '  prilohy_data_info pdi, ' +
  '  produkty_dostupnost pd, ' +
  '  danove_sazby ds, ' +
  '  (select id_produktu from crm_produkty_zatrideni where id_typ_zatrideni_produkt = ' + newsId + ') ne, ' +
  '  (select id_produktu from crm_produkty_zatrideni where id_typ_zatrideni_produkt = ' + actionId + ') ac ' +
  'where ' +
  '  p.id in (@@IDS@@) ' +
  '  and pn.pk = p.kod ' +
  '  and pn.tabulka = \'PRODUKTY\' ' +
  '  and pdi.crm_priloha_typ = \'IMAGE_MEDIUM_ESHOP\' ' +
  '  and (' +
  '    instr(pdi.popis, \'_1_L.\') > 0 ' +
  '      or ' +
  '    substr(pdi.popis, length(pdi.popis) - 1) = \'_1\' ' +
  '      or ' +
  '    substr(substr(pdi.popis, 1, instr(pdi.popis, \'.\', - 1) - 1), length(substr(pdi.popis, 1, instr(pdi.popis, \'.\', - 1) - 1)) - 1) = \'_1\' ' +
  '  ) ' +
  '  and pdi.id = pn.priloha_id ' +
  '  and ds.kod = p.sazba_dan_pro ' +
  '  and p.id = ne.id_produktu(+) ' +
  '  and p.id = ac.id_produktu(+) ' +
  '  and p.dostupnost = pd.kod(+) ' +
  'group by ' +
  '  p.id, ' +
  '  p.kod, ' +
  '  ds.procent, ' +
  '  p.dostupnost_datum, ' +
  '  pd.nazev, ' +
  '  pn.priloha_id, ' +
  '  ac.id_produktu, ' +
  '  ne.id_produktu, ' +
  '  pdi.popis, ' +
  '  p.dostupnost, ' +
  '  p.predloha';
export var STATE = 'CZ';
export var FORMAT_NUMBER_1 = '1.0-0';
export var FORMAT_NUMBER_2 = '1.1-2';
