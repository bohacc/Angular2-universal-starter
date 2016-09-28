//noinspection TypeScriptUnresolvedFunction
var oracle = require('oracledb');
//noinspection TypeScriptUnresolvedFunction
var fs = require('fs');
//noinspection TypeScriptUnresolvedFunction
var Promise = require('promise');
//noinspection TypeScriptUnresolvedFunction
var Constants = require('./constants');

import { Oracledb } from './api_oracle';
import { Tools } from './tools';

export function loadObjects (req, res) {
  try {
    let vals, sql;
    vals = {
      code: req.params.code
    };
    sql =
      'SELECT ' +
      '  c.soubor as "fileName", ' +
      '  o.pozice as "position", ' +
      '  re.tabulka as "tableName", ' +
      '  o.id_objektu as "objectID", ' +
      '  o.typ_objektu as "objectType", ' +
      '  DECODE(nw.class_pro_body_stranky, null, 0, 1) as "bodyClass", ' +
      '  nw.id as "idPage" ' +
      'FROM ' +
      '  web_nastaveni_webu_objekty o, ' +
      '  web_redirect re, ' +
      '  web_nastaveni_webu nw, ' +
      '  web_clanky c ' +
      'WHERE ' +
      '  o.typ_objektu IN (1, 4) ' +
      '  and re.odkud = \'^\' || :code ||  \'$\' ' +
      '  and (' +
      '    (re.tabulka <> \'PRODUKTY\' and re.id_page = o.id_nast_webu) ' +
      '      or ' +
      '    (re.tabulka = \'PRODUKTY\' and nw.kod = \'ZAZNAM_ZBOZI\') ' +
      '  ) ' +
      '  and re.eshop = get_website ' +
      '  and to_char(c.id) = o.id_objektu ' +
      '  and nw.id = o.id_nast_webu ' +
      '  and nw.eshop = re.eshop ' +
      'ORDER BY ' +
      '  o.poradi ';

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let data:Array<Object> = Tools.getMultiResult(result);
        res.json(data);
      },
      function (result) {
        console.log(result);
        res.json([]);
      }
    );
    //res.json([{"fileName":"a_6344.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6344","objectType":1,"bodyClass":0},{"fileName":"a_6347.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6347","objectType":1,"bodyClass":0},{"fileName":"a_6350.html","position":3,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6350","objectType":1,"bodyClass":0},{"fileName":"a_6343.html","position":6,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6343","objectType":1,"bodyClass":0},{"fileName":"a_6367.html","position":3,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6367","objectType":1,"bodyClass":0},{"fileName":"a_6345.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6345","objectType":1,"bodyClass":0},{"fileName":"a_6348.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6348","objectType":1,"bodyClass":0},{"fileName":"a_6368.html","position":3,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6368","objectType":1,"bodyClass":0},{"fileName":"a_6349.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6349","objectType":1,"bodyClass":0},{"fileName":"a_6346.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6346","objectType":1,"bodyClass":0}]);
  } catch (e) {
    console.log(e);
  }
}

export function emptyImage (req, res) {
  //noinspection TypeScriptUnresolvedVariable
  res.sendFile((process.env.APP_PORT ? '/srv/nodejs/mcled_website_v3' : '') + '/images/noimage/mcled_noimage_B.png', {root: (process.env.APP_PORT ? '' : __dirname + '/../../')});
  //console.log('EMPTY IMAGE');
  //res.sendFile(emptyImg);
}

export function getProduct (req, res) {
  let sql, vals, sqlProperties, path, pathEmpty, imgEmptySmall, imgEmptyMedium, imgEmptyBig;
  try {
    //DBMS_LOB.SUBSTR
    sql =
      'SELECT ' +
      '  M.*, ' +
      '  decode(instr(med.popis, \'.\', -1), 0, null, substr(med.popis, instr(med.popis, \'.\', -1))) as "imgMediumExt", ' +
      '  decode(instr(small1.popis, \'.\', -1), 0, null, substr(small1.popis, instr(small1.popis, \'.\', -1))) as "imgSmall1Ext", ' +
      '  decode(instr(small2.popis, \'.\', -1), 0, null, substr(small2.popis, instr(small2.popis, \'.\', -1))) as "imgSmall2Ext", ' +
      '  decode(instr(small3.popis, \'.\', -1), 0, null, substr(small3.popis, instr(small3.popis, \'.\', -1))) as "imgSmall3Ext", ' +
      '  decode(instr(small4.popis, \'.\', -1), 0, null, substr(small4.popis, instr(small4.popis, \'.\', -1))) as "imgSmall4Ext", ' +
      '  decode(instr(big1.popis, \'.\', -1), 0, null, substr(big1.popis, instr(big1.popis, \'.\', -1))) as "imgBig1Ext", ' +
      '  decode(instr(big2.popis, \'.\', -1), 0, null, substr(big2.popis, instr(big2.popis, \'.\', -1))) as "imgBig2Ext", ' +
      '  decode(instr(big3.popis, \'.\', -1), 0, null, substr(big3.popis, instr(big3.popis, \'.\', -1))) as "imgBig3Ext", ' +
      '  decode(instr(big4.popis, \'.\', -1), 0, null, substr(big4.popis, instr(big4.popis, \'.\', -1))) as "imgBig4Ext" ' +
      'FROM ' +
      '  (SELECT ' +
      '     p.id as "id", ' +
      '     p.kod as "code", ' +
      '     DBMS_LOB.SUBSTR(pp.popis, 250, 1) as "name", ' +
      '     DBMS_LOB.SUBSTR(pp2.popis, 250, 1) as "name2", ' +
      '     DBMS_LOB.SUBSTR(pp3.popis, 1000, 1) as "descriptionTabs", ' +
      '     e1_web_cena(null, P.KOD, null, null, null, null, 1, 1) AS "price", ' +
      '     e1_web_cena(null, P.KOD, null, null, null, null, 1, 1) * ((ds.procent / 100) + 1) as "priceVat", ' +
      '     DECODE(p.dostupnost, \'' + Constants.availabilityCode + '\', 1, 0) as "inStock", ' +
      '     pd.nazev as "availability", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_MEDIUM_ESHOP\' ' +
      '        AND (SUBSTR(POPIS,INSTR(POPIS, \'.\', -1) - 2, 2) = \'_1\' OR SUBSTR(POPIS,INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_1_M\') ' +
      '      ) AS "imgMedium", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_SMALL_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_1\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_1_S\') ' +
      '      ) AS "imgSmall1", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_1\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_1_B\' ) ' +
      '      ) AS "imgBig1", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_SMALL_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_2\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_2_S\') ' +
      '      ) AS "imgSmall2", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_2\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_2_B\') ' +
      '      ) AS "imgBig2", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_SMALL_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_3\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_3_S\') ' +
      '      ) AS "imgSmall3", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '      PD.ID = PN.PRILOHA_ID ' +
      '      AND PN.TABULKA = \'PRODUKTY\' ' +
      '      AND PN.PK = P.KOD ' +
      '      AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '      AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_3\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_3_B\') ' +
      '      ) AS "imgBig3", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_SMALL_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_4\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_4_S\') ' +
      '      ) AS "imgSmall4", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'PRODUKTY\' ' +
      '        AND PN.PK = P.KOD ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_4\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_4_B\' ) ' +
      '      ) AS "imgBig4" ' +
      '   FROM ' +
      '     produkty p, ' +
      '     produkty_popis pp, ' +
      '     produkty_popis pp2, ' +
      '     produkty_popis pp3, ' +
      '     danove_sazby ds, ' +
      '     produkty_dostupnost pd ' +
      '   WHERE ' +
      '     p.presmerovani = :code ' +
      '     and p.kod = pp.produkt(+) ' +
      '     and pp.jazyk(+) = \'CZE\' ' +
      '     and pp.typ_popisu(+) = \'PRODUKT_NAZEV\' ' +
      '     and ds.kod = p.sazba_dan_pro ' +
      '     and p.dostupnost = pd.kod(+) ' +
      '     and p.kod = pp2.produkt(+) ' +
      '     and pp2.jazyk(+) = \'CZE\' ' +
      '     and pp2.typ_popisu(+) = \'PRODUKT_NAZEV_ROZ\' ' +
      '     and p.kod = pp3.produkt(+) ' +
      '     and pp3.jazyk(+) = \'CZE\' ' +
      '     and pp3.typ_popisu(+) = \'DETAILNI_POPIS\'' +
      '  ) m, ' +
      '  prilohy_data_info med, ' +
      '  prilohy_data_info small1, ' +
      '  prilohy_data_info small2, ' +
      '  prilohy_data_info small3, ' +
      '  prilohy_data_info small4, ' +
      '  prilohy_data_info big1, ' +
      '  prilohy_data_info big2, ' +
      '  prilohy_data_info big3, ' +
      '  prilohy_data_info big4 ' +
      'WHERE ' +
      '  m."imgMedium" = med.id(+) ' +
      '  and m."imgSmall1" = small1.id(+) ' +
      '  and m."imgSmall2" = small2.id(+) ' +
      '  and m."imgSmall3" = small3.id(+) ' +
      '  and m."imgSmall4" = small4.id(+) ' +
      '  and m."imgBig1" = big1.id(+) ' +
      '  and m."imgBig2" = big2.id(+) ' +
      '  and m."imgBig3" = big3.id(+) ' +
      '  and m."imgBig4" = big4.id(+)';

    sqlProperties =
      'SELECT ' +
      '  * ' +
      'FROM (' +
      'SELECT ' +
      '  pex.parametr, ' +
      '  pep.nazev as "paramName", ' +
      '  decode(pep.typ, 4, decode(DBMS_LOB.SUBSTR(pex.hodnota, 1, 1), \'1\', \'ano\', \'ne\'), DBMS_LOB.SUBSTR(pex.hodnota, 200, 1)) as "val", ' +
      '  decode(pep.typ, 6, DBMS_LOB.SUBSTR(pex.hodnota2, 200, 1), null) as "val2", ' +
      '  decode(pep.typ, 6, \'-\', null) as "oddVal2", ' +
      '  ppp.poradi as "sortOrder" ' +
      //'  min(ppp.poradi) as "sortOrder" ' +
      'FROM ' +
      '   produkty_predlohy_pol ppp, ' +
      '   produkty p, ' +
      '   produkty_eshop pex, ' +
      '   produkty_eshop_param pep ' +
      'WHERE ' +
      '  p.id = :id ' +
      '  and ppp.typ in(1,2) ' +
      '  and ppp.id_predlohy = p.predloha ' +
      '  and pex.produkt = p.kod ' +
      '  and pex.parametr = pep.kod ' +
      '  and pex.parametr = ppp.kod_param ' +
      ') ' +
      'GROUP BY ' +
      '  parametr, ' +
      '  "paramName", ' +
      '  "val", ' +
      '  "val2", ' +
      '  "oddVal2", ' +
      '  "sortOrder" ' +
      'ORDER BY ' +
      '  "sortOrder"';
      /*'  pex.parametr, ' +
      '  DBMS_LOB.SUBSTR(pex.hodnota, 200, 1), ' +
      '  DBMS_LOB.SUBSTR(pex.hodnota2, 200, 1), ' +
      '  pep.typ, ' +
      '  pep.nazev, ' +
      '  ppp.poradi ' +
      'ORDER BY ' +
      '  ppp.poradi '*/;

    vals = {code: req.params.code};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        data.inStock = data.inStock == '1';

        path = Constants.imgagePath;
        pathEmpty = Constants.imgagePathEmpty;
        imgEmptySmall = Constants.imgageEmptySmall;
        imgEmptyMedium = Constants.imgageEmptyMedium;
        imgEmptyBig = Constants.imgageEmptyBig;
        // IMAGES
        data.imgMediumFile = data.imgMedium ? path + (data.imgMedium || '') + (data.imgMediumExt || '') : pathEmpty + imgEmptyMedium;
        data.imgSmall1File = data.imgSmall1 ? path + (data.imgSmall1 || '') + (data.imgSmall1Ext || '') : pathEmpty + imgEmptySmall;
        data.imgSmall2File = data.imgSmall2 ? path + (data.imgSmall2 || '') + (data.imgSmall2Ext || '') : pathEmpty + imgEmptySmall;
        data.imgSmall3File = data.imgSmall3 ? path + (data.imgSmall3 || '') + (data.imgSmall3Ext || '') : pathEmpty + imgEmptySmall;
        data.imgSmall4File = data.imgSmall4 ? path + (data.imgSmall4 || '') + (data.imgSmall4Ext || '') : pathEmpty + imgEmptySmall;
        data.imgBig1File = data.imgBig1 ? path + (data.imgBig1 || '') + (data.imgBig1Ext || '') : pathEmpty + imgEmptyBig;
        data.imgBig2File = data.imgBig2 ? path + (data.imgBig2 || '') + (data.imgBig2Ext || '') : pathEmpty + imgEmptyBig;
        data.imgBig3File = data.imgBig3 ? path + (data.imgBig3 || '') + (data.imgBig3Ext || '') : pathEmpty + imgEmptyBig;
        data.imgBig4File = data.imgBig4 ? path + (data.imgBig4 || '') + (data.imgBig4Ext || '') : pathEmpty + imgEmptyBig;

        // descriptionTabs FOR SERVER RENDERING MUST NOT BE NULL
        //data.descriptionTabs = data.descriptionTabs || '';

        // PROPERTIES
        vals = {id: data.id};
        Oracledb.select(sqlProperties, vals, req, null, null).then(
          function (result) {
            let i = 0;
            let arr = [];
            let prop: any = Tools.getMultiResult(result);
            data.properties = [];
            prop.map(function (el, n) {
              if (i <= 8) {
                arr.push(el);
              }
              if (i === 8 || n === prop.length - 1) {
                data.properties.push({items: arr});
                arr = [];
              }
              i = i === 8 ? 1 : i + 1;
            });
            res.json(data);
          },
          function (result) {
            console.log(result);
            res.send('');
          }
        );
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );

  } catch (e) {
    console.log(e);
    res.json({});
  }
}

export function redirectNavigations (req, res) {
  let sql, vals;
  try {
    sql =
      'SELECT ' +
      '  ID AS "idPage", ' +
      '  \'/\' || PRESMEROVANI as "code", ' +
      '  NAZEV as "name" ' +
      'FROM ' +
      '  WEB_NASTAVENI_WEBU ' +
      'WHERE ' +
      '  PRESMEROVANI IS NOT NULL ' +
      '  AND NVL(SYSTEM,0) = 0 ' +
      '  AND ID <> get_param(\'WEB_ESHOP_FIRST_PAGE\', 0, null, user) ' +
      '  AND ID NOT IN ' +
      '    (SELECT ' +
      '       ID ' +
      '     FROM ' +
      '       WEB_NASTAVENI_WEBU ' +
      '     WHERE ' +
      '       ID <> get_param(\'WEB_ESHOP_FIRST_PAGE\', 0, null, user) ' +
      '     START WITH ID = get_param(\'WEB_ESHOP_FIRST_PAGE\', 0, null, user) CONNECT BY PRIOR MATKA = ID ' +
      '     ) ' +
      'START WITH TO_CHAR(ID) = :id CONNECT BY PRIOR MATKA = ID ' +
      'ORDER BY ' +
      '  LEVEL DESC ';

    vals = {id: req.params.id};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let data: any = Tools.getMultiResult(result);
        res.json(data);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
  }
}

export function redirectNavigationsProduct (req, res) {
  let sql, vals;

  try {
    sql =
      'SELECT ' +
      '  to_char(pp.popis) AS "name", ' +
      '  \'/\' || presmerovani as "code" ' +
      'FROM ' +
      '  produkty p, ' +
      '  produkty_popis pp ' +
      'WHERE ' +
      '  p.presmerovani = :code ' +
      '  and pp.website(+) = get_website ' +
      '  and pp.produkt(+) = p.kod ' +
      '  and pp.typ_popisu(+) = \'PRODUKT_NAZEV\' ' +
      '  and pp.jazyk(+) = \'CZE\' ';

    vals = {code: req.params.code};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        res.json([data]);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
  }
}

export function productsList (req, res) {
  let sql, vals, rowsOnPage, page, sort, orderBySql, whereSql, filtersParams;

  try {
    rowsOnPage = req.query.rowsonpage;
    page = req.query.page;
    sort = req.query.sort;

    // SORTING
    if (sort === 'price_asc') {
      orderBySql = ' order by e1_web_cena(null,"code",null,null,null,null,1,1) asc ';
    } else if (sort === 'price_desc') {
      orderBySql = ' order by e1_web_cena(null,"code",null,null,null,null,1,1) desc ';
    } else if (sort === 'name_asc') {
      orderBySql = ' order by "name" asc ';
    } else if (sort === 'name_desc') {
      orderBySql = ' order by "name" desc ';
    } else if (sort === 'code_asc') {
      orderBySql = ' order by "code" asc ';
    } else if (sort === 'code_desc') {
      orderBySql = ' order by "code" desc ';
    }

    vals = {code: req.params.code};

    // FILTERING
    whereSql = getFilter(req.query.filter);
    filtersParams = req.query.filtersadv + Constants.commaParams + req.query.filtersbasic;
    //whereSql += getFilterParams(req.query.filtersadv, vals, false, true, 'parAdv', 'valAdv');
    whereSql += getFilterParams(filtersParams, vals, false, true, 'par', 'val');

    sql =
      'select ' +
      '  * ' +
      'from ' +
      '  (select ' +
      '     ROWNUM as "rowId", ' +
      '     s.* ' +
      '   from ' +
      '     (' + Constants.sqlListCore + whereSql + orderBySql + ') s ' +
      '   ) ' +
      'where ' +
      '  "rowId" <= ' + (page * rowsOnPage) +
      '  and "rowId" > ' + ((page * rowsOnPage) - rowsOnPage);
//console.log(sql);
    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let products = Tools.getMultiResult(result);
        return getProductsProperties(products);
      }
    ).then(
      function (result) {
        res.json(result);
      },
      function (result) {
        //console.log(result);
        res.send([]);
      }
    );
  } catch (e) {
    //console.log(e);
    res.send([]);
  }
}

export function productsListPagination (req, res) {
  let sql, vals, whereSql, filtersParams;

  try {
    vals = {code: req.params.code};

    whereSql = getFilter(req.query.filter);
    filtersParams = req.query.filtersadv + Constants.commaParams + req.query.filtersbasic;
    //whereSql += getFilterParams(req.query.filtersadv, vals, false, true, 'parAdv', 'valAdv');
    whereSql += getFilterParams(filtersParams, vals, false, true, 'par', 'val');

    sql =
      'select ' +
      ' count(*) as "rows" ' +
      'from ' +
      '  (' + Constants.sqlListCore + whereSql + ' )';

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let meta = Tools.getSingleResult(result);
        res.json(meta);
      },
      function (result) {
        //console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    //console.log(e);
  }
}

export function getFilter (filterStr) {
  var actionId, newsId, whereSql, availabilityCode, filter;
  filter = filterStr ? filterStr.split(':') : [];
  actionId = Constants.actionId;
  newsId = Constants.newsId;
  availabilityCode = Constants.availabilityCode;

  whereSql = '';
  if (filter.indexOf('stock') > -1) {
    whereSql += ' and p.dostupnost = \'' + availabilityCode + '\' ';
  }
  if (filter.indexOf('action') > -1) {
    whereSql += ' and exists(select id_produktu from crm_produkty_zatrideni where id_produktu = p.id and id_typ_zatrideni_produkt = ' + actionId + ') ';
  }
  if (filter.indexOf('news') > -1) {
    whereSql += ' and exists(select id_produktu from crm_produkty_zatrideni where id_produktu = p.id and id_typ_zatrideni_produkt = ' + newsId + ') ';
  }

  return whereSql;
}

export function productAttachments (req, res) {
  let sql, vals, tablesWhiteList, typesWhiteList, type;

  try {

    sql =
      'select ' +
      '  pn.priloha_id as "id", ' +
      '  pdi.popis as "fileName", ' +
      '  pdi.popis as "name", ' +
      '  pdi.puvodni_velikost / 1000000 as "size", ' +
      '  lower(decode(instr(pdi.popis, \'.\', -1), 0, null, substr(pdi.popis, instr(pdi.popis, \'.\', -1)))) as "ext" ' +
      'from ' +
      '  produkty p, ' +
      '  prilohy_nove pn, ' +
      '  prilohy_data_info pdi, ' +
      '  produkt_eshop_vazby pev ' +
      'where ' +
      '  p.id = :id ' +
      '  and pn.tabulka = \'PRODUKTY\' ' +
      '  and pn.pk = p.kod ' +
      '  and pdi.id = pn.priloha_id ' +
      '  and pdi.crm_priloha_ = UPPER(:type) ' +
      '  and pev.zobrazit = 1 ' +
      '  and pev.produkt = p.kod ' +
      '  and pev.eshop = get_website ';

    typesWhiteList = ['DOCUMENT_PRODUCT_ESHOP'];

    type = req.params.type ? req.params.type.toUpperCase() : '';
    if (typesWhiteList.indexOf(type) === -1) {
      res.json([]);
      return;
    }

    vals = {id: req.params.id, type: req.params.type};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let meta = Tools.getMultiResult(result);
        res.json(meta);
      },
      function (result) {
        console.log(result);
        res.send([]);
      }
    );
  } catch (e) {
    console.log(e);
    res.send([]);
  }
}

export function productsSimilar (req, res) {
  let sql, vals;

  try {

    if (!req.params.id && isNaN(req.params.id)) {
      res.json([]);
      return;
    }

    sql =
      'select ' +
      '  * ' +
      'from ' +
      '  (select ' +
      '     s.*, ' +
      '     rownum as "rowId" ' +
      '   from ' +
      '     (select ' +
      '        zp.id_produktu as "id", ' +
      '        \'/\' || p.presmerovani as "redirect", ' +
      '        p.kod as "code", ' +
      '        substr(to_char(pp.popis), 1, 250) as "name" ' +
      '      from ' +
      '        produkty p, ' +
      '        produkty_popis pp, ' +
      '        produkt_eshop_vazby pev, ' +
      '        crm_produkty_zatrideni zp, ' +
      '        (select ' +
      '           zp.id_typ_zatrideni_produkt as id ' +
      '         from ' +
      '           crm_produkty_zatrideni zp ' +
      '         where ' +
      '           zp.id_produktu = :id ' +
      '         ) s ' +
      '      where ' +
      '        p.id = zp.id_produktu ' +
      '        and p.kod = pev.produkt ' +
      '        and pev.eshop = get_website ' +
      '        and pev.zobrazit = 1 ' +
      '        and p.kod = pp.produkt(+) ' +
      '        and pp.jazyk(+) = \'CZE\' ' +
      '        and pp.website(+) = get_website ' +
      '        and pp.typ_popisu(+) = \'PRODUKT_NAZEV_ZKR\' ' +
      '        and zp.id_typ_zatrideni_produkt = s.id ' +
      '        and zp.id_produktu <> :id ' +
      '      group by ' +
      '         zp.id_produktu, ' +
      '         p.presmerovani, ' +
      '         p.kod, ' +
      '         substr(to_char(pp.popis), 1, 250) ' +
      //'      order by ' +
      //'        zp.produkt_order ' +
      '      ) s ' +
      '   ) ' +
      'where ' +
      '  "rowId" <= :count';

    vals = {id: req.params.id, count: req.query.count};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let products = Tools.getMultiResult(result);
        return getProductsProperties(products);
      }
    ).then(
      function (result) {
        //console.log(result);
        res.json(result);
        //res.json(result);
      },
      function (result) {
        console.log(result);
        res.send([]);
      }
    );
  } catch (e) {
    console.log(e);
  }
}

var getProductsProperties = function(products) {
  return new Promise(function (resolve, reject) {
    var ids = '', imgEmptyLarge, path, pathEmpty;
    products.map(function (el) {
      ids += (ids ? ',' : '') + el.id;
    });

    if (!ids) {
      reject([]);
      return;
    }

    var sql = Constants.sqlListInfo.replace(/@@IDS@@/g, ids);

    path = Constants.imgagePath;
    pathEmpty = Constants.imgagePathEmpty;
    imgEmptyLarge = Constants.imgageEmptyLarge;

    Oracledb.select(sql, {}, {}, null, null).then(
      function (result) {
        try {
          let properties = Tools.getMultiResult(result);
          products.map(function (el) {
            let info = properties.filter(
                function (elm) {
                  return elm.id === el.id;
                })[0] || {};
            el.price = info.price;
            el.availability = info.availability;
            el.imgMediumId = (info.imgMediumId || 0);
            el.imgMediumExt = info.imgMediumExt;
            el.imgMediumFile = el.imgMediumId ? path + (el.imgMediumId || '') + (el.imgMediumExt || '') : pathEmpty + imgEmptyLarge;
            el.action = (info.action == 1);
            el.news = (info.news == 1);
            el.priceVat = info.price * info.priceVatKoef;
            el.inStock = (info.inStock == 1);
            if (info.patternParams == 1121) {
              el.redirect = '/konfigurator';
            } else if (info.patternParams == 381) {
              el.redirect = '/konfigurator2';
            }
          });

          resolve(products);
        } catch (e) {
          console.log(e);
          reject([]);
        }
      },
      function (result) {
        console.log(result);
        reject([]);
      }
    );
  });
};

export function getFilterForList(req, res) {
  var sql, vals, sqlItems, params, sqlWhereFilters, valsItems;
  try {
    sql =
      'SELECT ' +
      '  PARAMETR as "par", ' +
      '  MIN(PORADI) AS "sortOrder", ' +
      '  TYP as "type", ' +
      '  NAZEV as "name" ' +
      'FROM ' +
      '  (SELECT ' +
      '     PE.PARAMETR, ' +
      '     PPP.PORADI, ' +
      '     PEP.TYP, ' +
      '     PEP.NAZEV, ' +
      '     CASE ' +
      '       WHEN PEP.TYP IN (2,3) THEN 1 ' +
      '       WHEN PEP.TYP IN (6) THEN 2 ' +
      '     ELSE 0 ' +
      '     END AS TYPN ' +
      '   FROM ' +
      '     PRODUKTY P, ' +
      '     PRODUKTY_ESHOP PE, ' +
      '     PRODUKTY_ESHOP_PARAM PEP, ' +
      '     CRM_PRODUKTY_ZATRIDENI Z, ' +
      '     PRODUKTY_PREDLOHY_POL PPP ' +
      '   WHERE ' +
      '     P.KOD=PE.PRODUKT ' +
      '     AND PEP.KOD = PE.PARAMETR ' +
      '     AND P.ID=Z.ID_PRODUKTU ' +
      '     AND (Z.ID_TYP_ZATRIDENI_PRODUKT,PPP.ID_PREDLOHY) ' +
      '       IN (SELECT ' +
      '             ctzp.ID,ctzp.ID_PREDLOHY ' +
      '           FROM ' +
      '             crm_typy_zatrideni_produkty ctzp, ' +
      '             web_nastaveni_webu_zatr_prod nwz, ' +
      '             web_nastaveni_webu wnw ' +
      '           WHERE ' +
      '             ctzp.id = nwz.id_zatrideni ' +
      '             and wnw.presmerovani = :code ' +
      '             and wnw.id = nwz.id_nastaveni ' +
      '           START WITH ctzp.ID = nwz.id_zatrideni CONNECT BY PRIOR ctzp.ID = ctzp.MATKA' +
      '           ) ' +
      '     AND PE.PRODUKT = P.KOD ' +
      '     AND PE.PARAMETR = PPP.KOD_PARAM ' +
      '     AND ((PPP.TYP IN(1,2) AND :type = 2) OR (PPP.TYP IN(41) AND :type = 1)) ' +
      '   ) S ' +
      'GROUP BY ' +
      '  parametr, ' +
      '  typ, ' +
      '  nazev ' +
      'ORDER BY ' +
      '  "sortOrder", ' +
      '  "par"';

    valsItems = {code: req.params.code, type: req.params.type};
    sqlWhereFilters = getFilterParams(req.query.filtersadv, valsItems, false, true, null, null);

    sqlItems =
      'SELECT ' +
      '  "par", ' +
      '  "par" || \':\' || "val" as "val", ' +
      '  "par" || \':\' || "val" as "id", ' +
      '  "val" as "name" ' +
      'FROM ' +
      '  (SELECT ' +
      '     (SELECT parametr FROM PRODUKTY_ESHOP_PARAMVALUE WHERE ID = S.ID_PARAMVALUE) as "par", ' +
      '     (SELECT DBMS_LOB.SUBSTR(HODNOTA, 250, 1) FROM PRODUKTY_ESHOP_PARAMVALUE WHERE ID = S.ID_PARAMVALUE) AS "val" ' +
      '   FROM ' +
      '     (SELECT ' +
      '        pe.id_paramvalue, ' +
      '        pe.parametr ' +
      '      FROM ' +
      '        produkty p, ' +
      '        crm_produkty_zatrideni z, ' +
      '        produkty_predlohy_pol ppp, ' +
      '        (SELECT ' +
      '           pe.produkt, ' +
      '           pe.parametr, ' +
      '           pe.id_paramvalue ' +
      '         FROM ' +
      '           produkty_eshop pe, ' +
      '           produkty p ' +
      '         WHERE ' +
      '           pe.produkt = p.kod ' +
      sqlWhereFilters +
      '         ) PE ' +
      '      WHERE ' +
      '        P.KOD=PE.PRODUKT ' +
      '        AND ((PPP.TYP IN(1,2) AND :type = 2) OR (PPP.TYP IN(41) AND :type = 1)) ' +
      '        AND (Z.ID_TYP_ZATRIDENI_PRODUKT, PPP.ID_PREDLOHY) ' +
      '          IN (SELECT ' +
      '                ctzp.ID, ' +
      '                ctzp.ID_PREDLOHY ' +
      '              FROM ' +
      '                crm_typy_zatrideni_produkty ctzp, ' +
      '                web_nastaveni_webu_zatr_prod nwz, ' +
      '                web_nastaveni_webu wnw ' +
      '              WHERE ' +
      '                ctzp.id = nwz.id_zatrideni ' +
      '                and wnw.presmerovani = :code ' +
      '                and wnw.id = nwz.id_nastaveni ' +
      '              START WITH ctzp.ID = nwz.id_zatrideni CONNECT BY PRIOR ctzp.ID = ctzp.MATKA ' +
      '              ) ' +
      '        AND P.ID = Z.ID_PRODUKTU ' +
      '        AND PE.PARAMETR = PPP.KOD_PARAM ' +
      '     ) S ' +
      '   GROUP BY ' +
      '     ID_PARAMVALUE ' +
      '   ORDER BY ' +
      '     (SELECT PORADI FROM PRODUKTY_ESHOP_PARAMVALUE WHERE ID = S.ID_PARAMVALUE) ' +
      '   ) ' +
      'WHERE ' +
      '  "val" IS NOT NULL';

    vals = {code: req.params.code, type: req.params.type};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        params = Tools.getMultiResult(result);
        return Oracledb.select(sqlItems, valsItems, req, null, null);
      }
    ).then(
      function (result) {
        var items = Tools.getMultiResult(result);
        params.map(function (el) {
          var values = items.filter(function (eli) {
            return eli.par === el.par;
          });
          el.items = values || [];
        });
        res.json(params);
      },
      function (result) {
        console.log(result);
      }
    );

  } catch (e) {
    console.log(e);
    res.send([]);
  }
};

export function getFilterParams (filtersStr, vals, useWhere, firstAnd, parName, valName) {
  var sqlWhereFilters, index, params;
  sqlWhereFilters = '';
  index = 0;
  params = getParamsObjForFilter(filtersStr);

  if (params.length > 0) {
    params.map(function (el) {
      if (sqlWhereFilters) {
        sqlWhereFilters += ' and ';
      }
      el.vals.map(function (val, i) {
        index += 1;
        vals[(parName || 'par') + index] = el.par;
        vals[(valName || 'val') + index] = val;

        if (el.vals.length === 1) {
          sqlWhereFilters += ' exists(select 1 from produkty_eshop where produkt = p.kod and parametr = :' + (parName || 'par') + index + ' and DBMS_LOB.SUBSTR(hodnota, 250, 1) = :' + (valName || 'val') + index + ') ';
        } else {
          if (i > 0) {
            sqlWhereFilters += ' or ';
          } else {
            sqlWhereFilters += ' (';
          }
          sqlWhereFilters += ' exists(select 1 from produkty_eshop where produkt = p.kod and parametr = :' + (parName || 'par') + index + ' and DBMS_LOB.SUBSTR(hodnota, 250, 1) = :' + (valName || 'val') + index + ') ';
          if (el.vals.length - 1 === i) {
            sqlWhereFilters += ') ';
          }
        }
      });
    });

    if (sqlWhereFilters) {
      if (firstAnd) {
        sqlWhereFilters = ' and ' + sqlWhereFilters;
      }
      if (useWhere) {
        sqlWhereFilters = ' where ' + sqlWhereFilters;
      }
    }
  }

  return sqlWhereFilters;
}

export function getFilterType (req, res) {
  var sql, vals, cat, cats = [2342, 2343, 2344, 2345, 2346, 2347, 2348, 2349];
  try {
    sql =
      'SELECT ' +
      '  nwz.id_zatrideni as "id" ' +
      'FROM ' +
      '  web_nastaveni_webu_zatr_prod nwz, ' +
      '  web_nastaveni_webu wnw ' +
      'WHERE ' +
      '  wnw.presmerovani = :code ' +
      '  and wnw.id = nwz.id_nastaveni';

    vals = {code: req.params.code};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        var data: any = Tools.getSingleResult(result);
        var pos = cats.indexOf(data.id);
        cat = pos > -1 ? data.id : 0;
        res.json({cat: cat});
      },
      function (result) {
        console.log(result);
        res.json({});
      }
    );

  } catch (e) {
    console.log(e);
    res.json({});
  }
}

export function getParamsObjForFilter (str: string): Array<Object> {
  var arr, item, newArr = [], existItem = [];
  arr = str ? str.split(Constants.commaParams) : [];
  arr.map(function (el) {
    item = el ? el.split(':') : [];
    if (item[0] && item[1]) {
      existItem = newArr.filter(function (eli) {
        return eli.par === item[0];
      });
      if (existItem.length > 0) {
        existItem[0].vals.push(item[1]);
      } else {
        newArr.push({par: item[0], vals: [item[1]]});
      }
    }
  });

  return newArr;
}

export function category (req, res) {
  let sql, vals, imgEmptyBig, path, pathEmpty;

  try {

    sql =
      'SELECT ' +
      '  s.*, ' +
      '  decode(instr(big1.popis, \'.\', -1), 0, null, substr(big1.popis, instr(big1.popis, \'.\', -1))) as "imgBig1Ext", ' +
      '  decode(instr(big2.popis, \'.\', -1), 0, null, substr(big2.popis, instr(big2.popis, \'.\', -1))) as "imgBig2Ext", ' +
      '  decode(instr(big3.popis, \'.\', -1), 0, null, substr(big3.popis, instr(big3.popis, \'.\', -1))) as "imgBig3Ext", ' +
      '  decode(instr(big4.popis, \'.\', -1), 0, null, substr(big4.popis, instr(big4.popis, \'.\', -1))) as "imgBig4Ext", ' +
      '  decode(instr(big5.popis, \'.\', -1), 0, null, substr(big5.popis, instr(big5.popis, \'.\', -1))) as "imgBig5Ext", ' +
      '  decode(instr(big6.popis, \'.\', -1), 0, null, substr(big6.popis, instr(big6.popis, \'.\', -1))) as "imgBig6Ext", ' +
      '  decode(instr(big7.popis, \'.\', -1), 0, null, substr(big7.popis, instr(big7.popis, \'.\', -1))) as "imgBig7Ext", ' +
      '  decode(instr(big8.popis, \'.\', -1), 0, null, substr(big8.popis, instr(big8.popis, \'.\', -1))) as "imgBig8Ext" ' +
      'FROM ' +
      '  (SELECT ' +
      '     zt.id as "id", ' +
      '     nw.nazev as "name", ' +
      '     DBMS_LOB.SUBSTR(zpp.popis, 250, 1) as "description", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_1\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_1_B\') ' +
      '      ) AS "imgBig1", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_2\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_2_B\') ' +
      '      ) AS "imgBig2", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_3\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_3_B\') ' +
      '      ) AS "imgBig3", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_4\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_4_B\') ' +
      '      ) AS "imgBig4", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_5\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_5_B\') ' +
      '      ) AS "imgBig5", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_6\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_6_B\') ' +
      '      ) AS "imgBig6", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_7\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_7_B\') ' +
      '      ) AS "imgBig7", ' +
      '     (SELECT ' +
      '        MAX(PD.ID) AS ID_PRILOHY ' +
      '      FROM ' +
      '        PRILOHY_DATA_INFO PD, ' +
      '        PRILOHY_NOVE PN ' +
      '      WHERE ' +
      '        PD.ID = PN.PRILOHA_ID ' +
      '        AND PN.TABULKA = \'ZATRIDENI_PRODUKTU\' ' +
      '        AND PN.PK = nwz.id_zatrideni ' +
      '        AND CRM_PRILOHA_TYP = \'IMAGE_BIG_ESHOP\' ' +
      '        AND (SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 2, 2) = \'_8\' OR SUBSTR(POPIS, INSTR(POPIS, \'.\', - 1) - 4, 4) = \'_8_B\') ' +
      '      ) AS "imgBig8" ' +
      '   FROM ' +
      '     crm_typy_zatrideni_produkty zt, ' +
      '     web_nastaveni_webu_zatr_prod nwz, ' +
      '     web_nastaveni_webu nw, ' +
      '     crm_zatrideni_produkty_popis zpp ' +
      '   WHERE ' +
      '     nw.presmerovani = :code ' +
      '     and nw.eshop = get_website ' +
      '     and nw.id = nwz.id_nastaveni ' +
      '     and nwz.id_zatrideni = zt.id ' +
      '     and zpp.jazyk(+) = \'CZE\' ' +
      '     and zpp.website(+) = get_website ' +
      '     and zpp.id_zatr(+) = nwz.id_zatrideni ' +
      '   ) s, ' +
      '  prilohy_data_info big1, ' +
      '  prilohy_data_info big2, ' +
      '  prilohy_data_info big3, ' +
      '  prilohy_data_info big4, ' +
      '  prilohy_data_info big5, ' +
      '  prilohy_data_info big6, ' +
      '  prilohy_data_info big7, ' +
      '  prilohy_data_info big8 ' +
      'WHERE ' +
      '  s."imgBig1" = big1.id(+) ' +
      '  and s."imgBig2" = big2.id(+) ' +
      '  and s."imgBig3" = big3.id(+) ' +
      '  and s."imgBig4" = big4.id(+) ' +
      '  and s."imgBig5" = big5.id(+) ' +
      '  and s."imgBig6" = big6.id(+) ' +
      '  and s."imgBig7" = big7.id(+) ' +
      '  and s."imgBig8" = big8.id(+) ';

    path = Constants.imgagePath;
    pathEmpty = Constants.imgagePathEmpty;
    imgEmptyBig = Constants.imgageEmptyBig;

    vals = {code: req.params.code};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let cats: any = Tools.getSingleResult(result);
        // IMAGES
        cats.imgBig1File = cats.imgBig1 ? path + (cats.imgBig1 || '') + (cats.imgBig1Ext || '') : pathEmpty + imgEmptyBig;
        cats.imgBig2File = cats.imgBig2 ? path + (cats.imgBig2 || '') + (cats.imgBig2Ext || '') : pathEmpty + imgEmptyBig;
        cats.imgBig3File = cats.imgBig3 ? path + (cats.imgBig3 || '') + (cats.imgBig3Ext || '') : pathEmpty + imgEmptyBig;
        cats.imgBig4File = cats.imgBig4 ? path + (cats.imgBig4 || '') + (cats.imgBig4Ext || '') : pathEmpty + imgEmptyBig;
        cats.imgBig5File = cats.imgBig5 ? path + (cats.imgBig5 || '') + (cats.imgBig5Ext || '') : pathEmpty + imgEmptyBig;
        cats.imgBig6File = cats.imgBig6 ? path + (cats.imgBig6 || '') + (cats.imgBig6Ext || '') : pathEmpty + imgEmptyBig;
        cats.imgBig7File = cats.imgBig7 ? path + (cats.imgBig7 || '') + (cats.imgBig7Ext || '') : pathEmpty + imgEmptyBig;
        cats.imgBig8File = cats.imgBig8 ? path + (cats.imgBig8 || '') + (cats.imgBig8Ext || '') : pathEmpty + imgEmptyBig;
        res.json(cats);
      },
      function (result) {
        console.log(result);
        res.json({});
      }
    );
  } catch (e) {
    console.log(e);
    res.json({});
  }
}

export function catsAttachments (req, res) {
  let sql, vals, typesWhiteList, type;

  try {

    sql =
      'select ' +
      '  pn.priloha_id as "id", ' +
      '  pdi.popis as "fileName", ' +
      '  pdi.popis as "name", ' +
      '  pdi.puvodni_velikost / 1000000 as "size", ' +
      '  lower(decode(instr(pdi.popis, \'.\', -1), 0, null, substr(pdi.popis, instr(pdi.popis, \'.\', -1)))) as "ext" ' +
      'from ' +
      '  prilohy_nove pn, ' +
      '  prilohy_data_info pdi ' +
      'where ' +
      '  pn.tabulka = \'ZATRIDENI_PRODUKTU\' ' +
      '  and pn.pk = :id ' +
      '  and pdi.id = pn.priloha_id ' +
      '  and pdi.crm_priloha_typ = UPPER(:type) ';

    typesWhiteList = ['DOCUMENT_PRODUCT_ZATRIDENI_ESHOP'];

    type = req.params.type ? req.params.type.toUpperCase() : '';
    if (typesWhiteList.indexOf(type) === -1) {
      res.json([]);
      return;
    }

    vals = {id: req.params.id, type: req.params.type};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let meta = Tools.getMultiResult(result);
        res.json(meta);
      },
      function (result) {
        console.log(result);
        res.send([]);
      }
    );
  } catch (e) {
    console.log(e);
    res.send([]);
  }
}

export function attachments (req, res) {
  if (req.params.tableName && req.params.tableName.toUpperCase() === 'PRODUKTY') {
    productAttachments(req, res);
  } else if (req.params.tableName && req.params.tableName.toUpperCase() === 'ZATRIDENI_PRODUKTU') {
    catsAttachments(req, res);
  } else {
    res.json([]);
  }
}

export function attachment (req, res) {
  let sql, vals, obj, sqlAtt;

  try {

    sqlAtt =
      'select ' +
      '  blob_content as "content" ' +
      'from ' +
      '  prilohy_data ' +
      'where ' +
      '  id = :id ';

    sql =
      'select ' +
      '  popis as "fileName", ' +
      '  mime_type as "mimeType", ' +
      '  puvodni_velikost as "size" ' +
      'from ' +
      '  prilohy_data_info ' +
      'where ' +
      '  id = :id ';

    vals = {id: req.params.id};

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let att: any = Tools.getSingleResult(result);
        obj = {
          fileName: att.fileName,
          fileLength: att.size,
          mimeType: att.mimeType
        };
        Oracledb.sendBlob(sqlAtt, vals, req, null, obj, res);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function xmlExportSeznam (req, res) {
  let sql, rows, temp, obj = '', i, l;

  try {

    sql =
      'select ' +
      '  kod as "kod", ' +
      '  dbms_lob.substr(replace_to_wildcards(ps_nazev, 1), 240, 1) as "categoryText", ' +
      '  dbms_lob.substr(replace_to_wildcards(nazev, 1), 240, 1) as "productName", ' +
      '  dbms_lob.substr(replace_to_wildcards(popis, 1), 240, 1) as "description", ' +
      '  dbms_lob.substr(replace_to_wildcards(katalogove_cislo, 1), 240, 1) as "productNo", ' +
      '  dbms_lob.substr(replace_to_wildcards( nvl(get_param(\'XML_FEED_SEZNAM_SHOP_DEPOT\',0,null,user), web_format_sklad_ext_pro_exp(kod,\'SEZNAM\')), 1), 240, 1) as "shopDepots", ' +
      '  round(price_vat + (price_vat * (vat/100)), 2) as "priceVat", ' +
      '  get_param (\'WEB_ESHOP_ADDRESS\',uzivatel=>user)||\'/\'||presmerovani as "url", ' +
      '  get_param (\'WEB_ESHOP_ADDRESS\',uzivatel=>user)||\'/\'||get_param (\'WEB_ESHOP_ADDRESS_DAD\',uzivatel=>user)||\'/\'||\'web_get_img_data?aID=\'||id_prilohy as "imgUrl", ' +
      '  dbms_lob.substr(nvl(replace_to_wildcards((select nazev from partneri where partner=vyrobce), 1),\' \'), 240, 1) as "manufacturer", ' +
      '  nvl(ck_kod,\' \') as "ean", ' +
      '  nvl(dny,0) as "deliveryDate" ' +
      'from ' +
      '  (select ' +
      '    p.vyrobce, ' +
      '    p.sazba_dan_pro, ' +
      '    p.nazev, ' +
      '    p.nazev2, ' +
      '    p.popis, ' +
      '    p.katalogove_cislo, ' +
      '    p.presmerovani, ' +
      '    p.dostupnost, ' +
      '    p.id, ' +
      '    max(i.id) as id_prilohy, ' +
      '    p.kod, ' +
      '    d.dny, ' +
      '    c.kod as ck_kod, ' +
      '    ps.nazev as ps_nazev, ' +
      '    m.cena as price_vat, ' +
      '    (select nvl(danove_sazby.procent,0) from danove_sazby where kod=sazba_dan_pro and danove_sazby.dph_stat=\'CZ\' ) as vat ' +
      '   from ' +
      '     (select id,kod,dostupnost,presmerovani,katalogove_cislo,popis,nazev2,nazev,sazba_dan_pro,vyrobce from produkty) p, ' +
      '     (select id,crm_priloha_typ,soubor from prilohy_data_info) i, ' +
      '     (select pk,priloha_id,tabulka from prilohy_nove) n, ' +
      '     (select eshop,zobrazit,produkt from produkt_eshop_vazby) v, ' +
      '     (select produkt,vychozi,kod,typ from produkty_ck) c, ' +
      '     (select dny,kod,exportovat from produkty_dostupnost) d, ' +
      '     (select s.id_produktu,sp.nazev from produkty_srovnavace s, typy_srovnavace_produkty sp where s.id_typ_srovnavace_produkt = sp.id and typ = \'SEZNAM\') ps, ' +
      '     e1_web_cena_mv m ' +
      '   where ' +
      '     n.priloha_id=i.id and ' +
      '     n.pk=p.kod and ' +
      '     n.tabulka=\'PRODUKTY\' and ' +
      '     i.crm_priloha_typ=\'IMAGE_SMALL_ESHOP\' and ' +
      '     (substr(i.soubor, instr(i.soubor,\'.\',-1)-2, 2) = \'_1\' or substr(i.soubor, instr(i.soubor,\'.\',-1)-4, 4) = \'_1_S\') and ' +
      '     v.produkt=p.kod and ' +
      '     v.eshop=get_website and ' +
      '     v.zobrazit=1 and ' +
      '     c.produkt(+)=p.kod and ' +
      '     c.vychozi(+)=1 and ' +
      '     c.typ(+)=0 and ' +
      '     d.kod(+)=p.dostupnost and ' +
      '     d.exportovat=1 and ' +
      '     ps.id_produktu(+)=p.id and ' +
      '     p.kod=m.kod and ' +
      '     m.website=get_website ' +
      '   group by ' +
      '     p.kod, p.vyrobce, p.sazba_dan_pro, p.nazev, p.nazev2, p.popis, p.katalogove_cislo, p.presmerovani, p.dostupnost, p.id, d.dny, c.kod, ps.nazev, m.cena ' +
      '  )';

    Oracledb.select(sql, [], req, null, null).then(
      function (result) {
        rows = Tools.getMultiResult(result);
        obj = '<SHOP>';
        for (i = 0, l = rows.length; i < l; i += 1) {
          temp =
            '<SHOPITEM>' +
            '<PRODUCTNAME>'+rows[i].productName+' McLED '+rows[i].kod+'</PRODUCTNAME>' +
            '<DESCRIPTION>'+rows[i].description+'</DESCRIPTION>' +
            '<PRODUCTNO>'+rows[i].productNo+'</PRODUCTNO>' +
            '<URL>'+rows[i].url+'</URL>' +
            '<IMGURL>'+rows[i].imgUrl+'</IMGURL>' +
            '<PRICE_VAT>'+rows[i].priceVat+'</PRICE_VAT>' +
            '<SHOP_DEPOTS>12805266</SHOP_DEPOTS>' +
            '<ITEM_TYPE>new</ITEM_TYPE>' +
            '<MANUFACTURER>'+rows[i].manufacturer+'</MANUFACTURER>' +
            '<EAN>'+rows[i].ean+'</EAN>' +
            '<DELIVERY_DATE>'+rows[i].deliveryDate+'</DELIVERY_DATE>' +
            '<CATEGORYTEXT>'+rows[i].categoryText+'</CATEGORYTEXT>' +
            '</SHOPITEM>';
          obj += temp;
        };
        obj += '</SHOP>';
        res.setHeader('Content-Type', 'text/xml');
        res.end(obj);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function xmlExportHeureka (req, res) {
  let sql, rows, temp, obj = '', i, l;

  try {

    sql =
      'select ' +
      '  kod as "kod", ' +
      '  dbms_lob.substr(replace_to_wildcards(ps_nazev, 1), 240, 1) as "categoryText", ' +
      '  dbms_lob.substr(replace_to_wildcards(nazev, 1), 240, 1) as "productName", ' +
      '  dbms_lob.substr(replace_to_wildcards(popis, 1), 240, 1) as "description", ' +
      '  dbms_lob.substr(replace_to_wildcards(decode(katalogove_cislo,null,null,\'(\'||katalogove_cislo||\')\'), 1), 240, 1) as "productNo", ' +
      '  round(price_vat + (price_vat * (vat/100)), 2) as "priceVat", ' +
      '  get_param (\'WEB_ESHOP_ADDRESS\',uzivatel=>user)||\'/\'||presmerovani as "url", ' +
      '  get_param (\'WEB_ESHOP_ADDRESS\',uzivatel=>user)||\'/\'||get_param (\'WEB_ESHOP_ADDRESS_DAD\',uzivatel=>user)||\'/\'||\'web_get_img_data?aID=\'||id_prilohy as "imgUrl", ' +
      '  dbms_lob.substr(nvl(replace_to_wildcards((select nazev from partneri where partner=vyrobce), 1),\' \'), 240, 1) as "manufacturer", ' +
      '  nvl(ck_kod,\' \') as "ean", ' +
      '  nvl(dny,0) as "deliveryDate" ' +
      'from ' +
      '  (select ' +
      '    p.vyrobce, ' +
      '    p.sazba_dan_pro, ' +
      '    p.nazev, ' +
      '    p.nazev2, ' +
      '    p.popis, ' +
      '    p.katalogove_cislo, ' +
      '    p.presmerovani, ' +
      '    p.dostupnost, ' +
      '    p.id, ' +
      '    max(i.id) as id_prilohy, ' +
      '    p.kod, ' +
      '    d.dny, ' +
      '    c.kod as ck_kod, ' +
      '    ps.nazev as ps_nazev, ' +
      '    m.cena as price_vat, ' +
      '    (select nvl(danove_sazby.procent,0) from danove_sazby where kod=sazba_dan_pro and danove_sazby.dph_stat=\'CZ\' ) as vat ' +
      '   from ' +
      '     (select id,kod,dostupnost,presmerovani,katalogove_cislo,popis,nazev2,nazev,sazba_dan_pro,vyrobce from produkty) p, ' +
      '     (select id,crm_priloha_typ,soubor from prilohy_data_info) i, ' +
      '     (select pk,priloha_id,tabulka from prilohy_nove) n, ' +
      '     (select eshop,zobrazit,produkt from produkt_eshop_vazby) v, ' +
      '     (select produkt,vychozi,kod,typ from produkty_ck) c, ' +
      '     (select dny,kod,exportovat from produkty_dostupnost) d, ' +
      '     (select s.id_produktu,sp.nazev from produkty_srovnavace s, typy_srovnavace_produkty sp where s.id_typ_srovnavace_produkt = sp.id and typ = \'HEUREKA\') ps, ' +
      '     e1_web_cena_mv m ' +
      '   where ' +
      '     n.priloha_id=i.id and ' +
      '     n.pk=p.kod and ' +
      '     n.tabulka=\'PRODUKTY\' and ' +
      '     i.crm_priloha_typ=\'IMAGE_SMALL_ESHOP\' and ' +
      '     (substr(i.soubor, instr(i.soubor,\'.\',-1)-2, 2) = \'_1\' or substr(i.soubor, instr(i.soubor,\'.\',-1)-4, 4) = \'_1_S\') and ' +
      '     v.produkt=p.kod and ' +
      '     v.eshop=get_website and ' +
      '     v.zobrazit=1 and ' +
      '     c.produkt(+)=p.kod and ' +
      '     c.vychozi(+)=1 and ' +
      '     c.typ(+)=0 and ' +
      '     d.kod(+)=p.dostupnost and ' +
      '     d.exportovat=1 and ' +
      '     ps.id_produktu(+)=p.id and ' +
      '     p.kod=m.kod and ' +
      '     m.website=get_website ' +
      '   group by ' +
      '     p.kod, p.vyrobce, p.sazba_dan_pro, p.nazev, p.nazev2, p.popis, p.katalogove_cislo, p.presmerovani, p.dostupnost, p.id, d.dny, c.kod, ps.nazev, m.cena ' +
      '  )';

    Oracledb.select(sql, [], req, null, null).then(
      function (result) {
        rows = Tools.getMultiResult(result);
        obj = '<SHOP>';
        for (i = 0, l = rows.length; i < l; i += 1) {
          temp =
            '<SHOPITEM>' +
            '<ITEM_ID>'+rows[i].kod+'</ITEM_ID>' +
            '<PRODUCTNAME>'+rows[i].productName+' McLED '+rows[i].productNo+'</PRODUCTNAME>' +
            '<DESCRIPTION>'+rows[i].description+'</DESCRIPTION>' +
            '<URL>'+rows[i].url+'</URL>' +
            '<IMGURL>'+rows[i].imgUrl+'</IMGURL>' +
            '<IMGURL_ALTERNATIVE></IMGURL_ALTERNATIVE>' +
            '<VIDEO_URL></VIDEO_URL>' +
            '<PRICE_VAT>'+rows[i].priceVat+'</PRICE_VAT>' +
            '<HEUREKA_CPC></HEUREKA_CPC>' +
            '<MANUFACTURER>'+rows[i].manufacturer+'</MANUFACTURER>' +
            '<CATEGORYTEXT>'+rows[i].categoryText+'</CATEGORYTEXT>' +
            '<EAN>'+rows[i].ean+'</EAN>' +
            '<DELIVERY_DATE>'+rows[i].deliveryDate+'</DELIVERY_DATE>' +
            '</SHOPITEM>';
          obj += temp;
        };
        obj += '</SHOP>';
        res.setHeader('Content-Type', 'text/xml');
        res.end(obj);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function sitemap (req, res) {
  let sqlAdresa, sql, data, rows, adresa, date, temp, obj = '', i, l;

  try {
    sqlAdresa =
      'select ' +
      '  get_param(\'WEB_ESHOP_ADDRESS\',0,null,user) as "adresa", ' +
      '  to_char(sysdate,\'YYYY-MM-DD\') as "date" ' +
      'from ' +
      '  dual';

    sql =
      'select ' +
      '  replace(replace(r.odkud, \'$\', \'\'), \'^\', \'\') as "from" ' +
      'from ' +
      '  (select re.*,p.kod from produkty p, web_redirect re where re.id_presmerovani = p.id_presmerovani(+)) r, ' +
      '  web_eshopy e, ' +
      '  web_nastaveni_webu s ' +
      'where ' +
      '  e.user_login=get_website and ' +
      '  e.kod=r.eshop and ' +
      '  r.tabulka in (\'PRODUKTY\', \'WEB_NASTAVENI_WEBU\') and ' +
      '  r.id_presmerovani=s.id_presmerovani(+) and ' +
      '  ((r.tabulka=\'WEB_NASTAVENI_WEBU\' and ' +
      '    s.rss_export = 1 and ' +
      '    s.id not in(select id from web_nastaveni_webu start with id=(select id from web_nastaveni_webu where kod=\'SYSTEMOVE_ZAZNAMY\' and eshop=e.kod) connect by prior id=matka) and ' +
      '    r.id_presmerovani=s.id_presmerovani ' +
      '    ) or ' +
      '   (s.id is null and ' +
      '    r.tabulka<>\'WEB_NASTAVENI_WEBU\' ' +
      '   ) ' +
      '  ) and ' +
      '  ((r.tabulka=\'PRODUKTY\' ' +
      '    and exists(select 1 from produkt_eshop_vazby where produkt=r.kod and zobrazit=1) ' +
      '    ) or ' +
      '    (r.tabulka<>\'PRODUKTY\' ' +
      '    )' +
      '  ) and ' +
      '  r.aktivni=1 ' +
      'order by ' +
      '  tabulka ';

    Oracledb.select(sqlAdresa, [], req, null, null).then(
      function (result) {
        data = Tools.getSingleResult(result);
        adresa = data.adresa;
        date = data.date;
        return Oracledb.select(sql, [], req, null, null);
      }
    ).then(
      function (result) {
        rows = Tools.getMultiResult(result);
        obj = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        for (i = 0, l = rows.length; i < l; i += 1) {
          temp =
            '<url>' +
            '<loc>'+adresa+'/'+rows[i].from+'</loc>' +
            '<lastmod>'+date+'</lastmod>' +
            '</url>';
          obj += temp;
        };
        obj += '</urlset>';
        res.setHeader('Content-Type', 'text/xml');
        res.end(obj);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function partnersList (req, res) {
  let sql, rows, i, l,
    path = Constants.imgagePath,
    pathEmpty = Constants.imgagePathEmpty,
    imgEmptySmall = Constants.imgageEmptySmall;

  try {

    sql =
      'select ' +
      '  nazev as "name", ' +
      '  presmerovani as "redirect", ' +
      '  id_prilohy as "idAtt" ' +
      'from ' +
      '  (select ' +
      '    p.nazev, ' +
      '    dbms_lob.substr(pp.hodnota, 1000, 1) as presmerovani, ' +
      '   (select max(id) as id from prilohy_data_info pd, prilohy_nove pn ' +
      '    where pd.id = pn.priloha_id and crm_priloha_typ = \'IMAGE_SMALL_ESHOP\' and tabulka = \'PARTNERI\' and pk = p.partner ' +
      '    ) as id_prilohy, ' +
      '    partner_order ' +
      '   from ' +
      '     partneri p, ' +
      '     partneri_parametry pp, ' +
      '     (select partner, partner_order from crm_partneri_zatrideni where ' +
      '      id_typ_zatrideni_firma in (select id from crm_typy_zatrideni_firmy start with id = 1946 connect by prior id = matka) ' +
      '     ) s ' +
      '   where ' +
      '     p.partner = s.partner and ' +
      '     p.partner = pp.partner(+) and ' +
      '     pp.parametr = \'MCLED_ODKAZ\' ' +
      '   order by ' +
      '     partner_order ' +
      '  ) ' +
      'where ' +
      'rownum <= 7';

    Oracledb.select(sql, [], req, null, null).then(
      function (result) {
        rows = Tools.getMultiResult(result) || [];
        res.json(rows);
      },
      function (result) {
        console.log(result);
        res.json([]);
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }

}

export function newsletterLogin (req, res) {
  let sql, vals, sessionid, sqlProps;

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  if (req.body.email && Tools.validateEmail(req.body.email)) {
    res.json({});
    return;
  }
    try {

      sql =
        'begin web_newsletter_insert_json(:strings); end;';

      sqlProps =
        'SELECT ' +
        '  s1 as "result" ' +
        'FROM ' +
        '  sessionid_temp ' +
        'WHERE ' +
        '  sessionid = decrypt_cookie(:sessionid) ' +
        '  AND kod = \'WEB_NEWSLETTER_INSERT_JSON\'';

      vals = {
        strings: {
          type: oracle.STRING,
          dir: oracle.BIND_IN,
          val: [
            'asessionid:' + sessionid,
            'aSaveContent:1',
            'aExtCookies:1',
            'aEmail:' + req.body.email
          ]
        }
      };

      Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
        function (result) {
          vals = {sessionid: sessionid};
          return Oracledb.select(sqlProps, vals, req, null, null);
        }
      ).then(
        function (result) {
          res.send(Tools.getSingleResult(result));
        },
        function (result) {
          console.log(result);
          res.send('');
        }
      );
    } catch (e) {
      console.log(e);
      res.send('');
    }
}

export function logout (req, res) {
  let sql, vals = {}, sqlResult, sessionid, valsSessionid, loginName;

  try {
    loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

    sessionid = Tools.getSessionId(req);

    sql =
      'begin web_odhlasit_eshop(:strings); end;';

    sqlResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ODHLASIT_ESHOP_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlResult, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        try {
          let dataParse = (data && data.result ? JSON.parse(data.result) : {state: -1});
          if (dataParse.state == '1') {
            Tools.deleteCookie(res, 'auth_token');
          }
          res.json(dataParse);
        } catch (e) {
          console.log(e);
          res.json({state: -1});
        }
      },
      function (result) {
        console.log(result);
        res.json({isLogged: false});
      }
    );

  } catch (e) {
    console.log(e);
    res.json({isLogged: false});
  }
}

export function login (req, res) {
  let sql, vals = {}, valsUser, sqlResult, sessionid, valsSessionid, sqlUser, sqlUserResult;

  try {
    sessionid = Tools.getSessionId(req);

    sql =
      'begin web_prihlasit_eshop(:strings); end;';

    sqlResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_PRIHLASIT_ESHOP\'';

    sqlUser =
      'begin e1_web_udaje_eshop_uziv_json(:strings); end;';

    sqlUserResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_UDAJE_ESHOP_UZIV_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aSaveContent:1',
          'aExtCookies:1',
          'alg:' + (req.body.login || ''),
          'apd:' + (req.body.password || '')
        ]
      }
    };

    valsUser = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (req.body.login || ''),
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    let obj:any = {isLogged: false};
    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlResult, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        let dataParse = data.result ? JSON.parse(data.result) : {};
        if (dataParse.overeno == '1') {
          obj.isLogged = true;
          Tools.createAuthCookie(res, dataParse.authToken);
        }
        valsUser = {
          strings: {
            type: oracle.STRING,
            dir: oracle.BIND_IN,
            val: [
              'asessionid:' + sessionid,
              'aLoginName:' + (dataParse.authToken || ''),
              'aSaveContent:1',
              'aExtCookies:1',
            ]
          }
        };
        return Oracledb.executeSQL(sqlUser, valsUser, req, null, {commit: true});
      }
    ).then(
      function () {
        return Oracledb.select(sqlUserResult, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        let dataParse = data.result ? JSON.parse(data.result) : {};
        let user: any = {};
        /*for (var key in obj) {
         // skip loop if the property is from prototype
         if (!obj.hasOwnProperty(key)) continue;
         obj[key] = decodeURIComponent(obj[key]);
         }*/

        user.login = decodeURIComponent(dataParse.login || '');
        user.loginClient = decodeURIComponent(dataParse.login_client || '');
        user.isLogged = (user.loginClient != '' && user.loginClient != '0');
        /*user.priceAmount = decodeURIComponent(dataParse.castka_celkem);
         user.priceVatAmount = decodeURIComponent(dataParse.castka_celkem_sdph);*/

        // INVOICE
        user.firstName = decodeURIComponent(dataParse.jmeno_fak || '');
        user.lastName = decodeURIComponent(dataParse.prijmeni_fak || '');
        user.email = decodeURIComponent(dataParse.email || '');
        user.phone = decodeURIComponent(dataParse.telefon || '');
        user.street = decodeURIComponent(dataParse.ulice_fak || '');
        user.city = decodeURIComponent(dataParse.mesto_fak || '');
        user.country = decodeURIComponent(dataParse.stat_fak || '');
        user.zip = decodeURIComponent(dataParse.psc_fak || '');
        user.companyName = decodeURIComponent(dataParse.nazev_fak || '');

        // DELIVERY
        user.firstNameDelivery = decodeURIComponent(dataParse.jmeno_dod || '');
        user.lastNameDelivery = decodeURIComponent(dataParse.prijmeni_dod || '');
        user.streetDelivery = decodeURIComponent(dataParse.ulice_dod || '');
        user.cityDelivery = decodeURIComponent(dataParse.mesto_dod || '');
        user.countryDelivery = decodeURIComponent(dataParse.stat_dod || '');
        user.zipDelivery = decodeURIComponent(dataParse.psc_dod || '');
        user.companyNameDelivery = decodeURIComponent(dataParse.nazev_dod || '');

        user.deliveryIsNotInvoice = (dataParse.dodaci_je_fakturacni == '0');
        user.toCompany = (dataParse.fakturovat_na_firmu == '1');

        user.shipping = decodeURIComponent(dataParse.doprava || '');
        user.shippingDefault = decodeURIComponent(dataParse.doprava || '');
        user.payment = decodeURIComponent(dataParse.platba || '');
        user.paymentDefault = decodeURIComponent(dataParse.platba || '');

        user.saveAsNewUser = (dataParse.registrovat == '1');

        user.note = decodeURIComponent(dataParse.poznamka || '');
        user.note2 = decodeURIComponent(dataParse.poznamka2 || '');

        user.newsletter = (data.newsletter != '1');

        obj.user = user;
        res.json(obj);
      },
      function (result) {
        console.log(result);
        res.json({isLogged: false});
      }
    );

  } catch (e) {
    console.log(e);
    res.json({isLogged: false});
  }
}

export function sessionidCookie (req, res, next) {
  let sql, vals = {};
  try {
    if (!Tools.getSessionId(res)) {
      sql =
        'SELECT ' +
        '  encrypt_cookie(seq_sessionid_nbs.nextval) as "sessionid" ' +
        'FROM ' +
        '  dual';
      Oracledb.select(sql, vals, req, null, null).then(
        function (result) {
          let data: any = Tools.getSingleResult(result);
          let sessionid = data.sessionid;
          Tools.createCookie(res, Constants.SESSIONID_CODE, sessionid);
          next();
        },
        function (result) {
          console.log(result);
          next();
        }
      );
    } else {
      next();
    }
  } catch (e) {
    console.log(e);
    next();
  }
}

export function createPartnerCookie (req, res, obj) {
  return new Promise(function (resolve, reject) {
    let sql, sqlDelete, sqlInsert, vals: any = {};
    sql =
      'SELECT ' +
      '  encrypt_cookie(' +
      '    get_random_strings(3,24) || ' +
      '    get_abc(substr(to_char(sysdate, \'dd\'),1,1)) || ' +
      '    get_abc(substr(to_char(sysdate, \'dd\'),2,1)) || ' +
      '    get_abc(substr(to_char(sysdate, \'mm\'),1,1)) || ' +
      '    get_abc(substr(to_char(sysdate, \'mm\'),2,1)) || ' +
      '    get_abc(substr(to_char(sysdate, \'yy\'),1,1)) || ' +
      '    get_abc(substr(to_char(sysdate, \'yy\'),2,1))' +
      '  ) as "encryptCookie" ' +
      'FROM ' +
      '  dual';

    sqlDelete =
      'DELETE ' +
      '  web_user_cookie ' +
      'WHERE ' +
      '  login = :login ' +
      '  AND website = get_website';

    sqlInsert =
      'INSERT INTO WEB_USER_COOKIE (COOKIE, PARTNER, LOGIN, DATUM, AUTO_CONNECT_HASH, AUTH_TOKEN, WEBSITE) ' +
      '  VALUES (decrypt_cookie(:sessionid), :partner, :login, sysdate, null, :authToken, get_website);';

    vals = {
      sessionid: Tools.getSessionId(req),
      partner: obj.partner,
      login: obj.login,
      authToken: null,
    };

    Oracledb.select(sql, {}, req, null, null).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        vals.authToken = data.encryptCookie;
        return Oracledb.select(sqlDelete, vals, req, null, null);
      }
    ).then(
      function (result) {
        return Oracledb.select(sqlInsert, vals, req, null, null);
      }
    ).then(
      function (result) {
        Tools.createCookie(res, Constants.AUTH_TOKEN_CODE, vals.authToken);
        resolve(vals);
      },
      function (result) {
        reject(result);
      }
    );
  });
}

export function user (req, res) {
  let sql, vals = {}, sqlResult, sessionid, loginName;

  try {
    loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

    sessionid = Tools.getSessionId(req);
    if (!sessionid) {
      res.json({});
      return;
    }

    sql =
      'begin e1_web_udaje_eshop_uziv_json(:strings); end;';

    sqlResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_UDAJE_ESHOP_UZIV_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        vals = {sessionid: sessionid};
        return Oracledb.select(sqlResult, vals, req, null, null);
      }
    ).then(
      function (result) {
        try {
          let data: any = Tools.getSingleResult(result);
          let dataParse = (data.result ? JSON.parse(data.result) : {});
          let user: any = {};
          /*for (var key in obj) {
            // skip loop if the property is from prototype
            if (!obj.hasOwnProperty(key)) continue;
            obj[key] = decodeURIComponent(obj[key]);
          }*/

          user.login = decodeURIComponent(dataParse.login);
          user.loginClient = decodeURIComponent(dataParse.login_client);
          user.isLogged = (user.loginClient != '' && user.loginClient != '0');
          user.priceAmount = decodeURIComponent(dataParse.castka_celkem);
          user.priceVatAmount = decodeURIComponent(dataParse.castka_celkem_sdph);

          // INVOICE
          user.firstName = decodeURIComponent(dataParse.jmeno_fak);
          user.lastName = decodeURIComponent(dataParse.prijmeni_fak);
          user.email = decodeURIComponent(dataParse.email);
          user.phone = decodeURIComponent(dataParse.telefon);
          user.street = decodeURIComponent(dataParse.ulice_fak);
          user.city = decodeURIComponent(dataParse.mesto_fak);
          user.country = decodeURIComponent(dataParse.stat_fak);
          user.zip = decodeURIComponent(dataParse.psc_fak);
          user.companyName = decodeURIComponent(dataParse.nazev_fak);

          // DELIVERY
          user.firstNameDelivery = decodeURIComponent(dataParse.jmeno_dod);
          user.lastNameDelivery = decodeURIComponent(dataParse.prijmeni_dod);
          user.streetDelivery = decodeURIComponent(dataParse.ulice_dod);
          user.cityDelivery = decodeURIComponent(dataParse.mesto_dod);
          user.countryDelivery = decodeURIComponent(dataParse.stat_dod);
          user.zipDelivery = decodeURIComponent(dataParse.psc_dod);
          user.companyNameDelivery = decodeURIComponent(dataParse.nazev_dod);

          user.deliveryIsNotInvoice = (dataParse.dodaci_je_fakturacni == '0');
          user.toCompany = dataParse.fakturovat_na_firmu == '1';

          user.shipping = decodeURIComponent(dataParse.doprava);
          user.shippingDefault = decodeURIComponent(dataParse.doprava);
          user.payment = decodeURIComponent(dataParse.platba);
          user.paymentDefault = decodeURIComponent(dataParse.platba);

          user.saveAsNewUser = (dataParse.registrovat == '1');

          res.json(user);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.json({});
      }
    );
  } catch (e) {
    console.log(e);
    res.json({});
  }
}

export function productBuy (req, res) {
  let sql, vals, sessionid, sqlProps, loginName;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  if (!(req.params.id || req.body.code)) {
    res.json({});
    return;
  }
  try {

    sql =
      'begin e1_web_vlozit_do_kosiku_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_VLOZIT_DO_KOSIKU_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'aid:' + (req.params.id || ''),
          'akod:' + (req.body.code || ''),
          'amnozstvi:' + (req.body.amount || 1),
        ]
      }
    };

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        vals = {sessionid: sessionid};
        return Oracledb.select(sqlProps, vals, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        let obj = (data.result ? JSON.parse(data.result) : {});
        res.json(obj);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function cart (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, valsSessionid;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'begin e1_web_udaje_eshop_kosik_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_UDAJE_ESHOP_KOSIK_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        try {
          let data: any = Tools.getSingleResult(result);
          let dataParse: any = (data.result ? JSON.parse(data.result) : {records: []});
          let obj: any = {records: []};
          obj.priceAmount = decodeURIComponent(dataParse.castka_val);
          obj.priceAmountVat = decodeURIComponent(dataParse.castka_sdph);
          obj.shippingAndPayment = decodeURIComponent(dataParse.doprava_platba_sdph_val);
          obj.shippingVat = decodeURIComponent(dataParse.doprava_sdph_val);
          obj.paymentVat = decodeURIComponent(dataParse.platba_sdph_val);
          obj.paymentName = decodeURIComponent(dataParse.platba);
          obj.shippingName = decodeURIComponent(dataParse.doprava);
          dataParse.records.map(function (el) {
            obj.records.push({
              fileName: (el.id_prilohy ? (el.id_prilohy + Constants.DOT + el.file_ext) : Constants.imgageEmptySmall),
              name: decodeURIComponent(el.nazev),
              code: decodeURIComponent(el.kod),
              unit: decodeURIComponent(el.mj),
              amount: decodeURIComponent(el.mnozstvi),
              redirect: el.presmerovani,
              price: decodeURIComponent(el.cena_val),
              priceVat: decodeURIComponent(el.cena_sdph),
              priceAmount: decodeURIComponent(el.castka_val),
              priceVatAmount: decodeURIComponent(el.castka_sdph),
              availability: decodeURIComponent(el.dostupnost),
              discountPercent: decodeURIComponent(el.sleva_proc),
              itemId: el.cislo
            });
          });
          res.json(obj);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function productDelete (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, itemId, valsSessionid;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);
  itemId = req.params.itemId;

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  if (!req.params.itemId) {
    res.json({});
    return;
  }

  try {

    sql =
      'begin web_odstr_z_kos_dle_cisla_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ODSTR_Z_KOS_DLE_CISLA_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'acislo:' + itemId,
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        try {
          let data: any = Tools.getSingleResult(result);
          res.json(data);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function productPut (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, itemId, amount, valsSessionid;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);
  itemId = req.body.itemId;
  amount = req.body.amount;

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  if (!req.body.itemId || !req.body.amount) {
    res.json({});
    return;
  }

  try {

    sql =
      'begin e1_zmen_mnoz_kos_dle_cis_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_ZMEN_MNOZ_KOS_DLE_CIS_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'acislo:' + itemId,
          'amnozstvi:' + amount,
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        try {
          let data: any = Tools.getSingleResult(result);
          res.json(data);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function createUser (req, res) {
  let sql, vals, valsCreate, sessionid, sqlProps, loginName, sqlVerify, sqlLogin, sqlLoginResult, valsLogin,
    valsSessionid, valsVerify, sqlCreate, sqlCreateResult, sqlUser, sqlUserResult, obj, valsUser;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  if (!req.body.login || !req.body.password) {
    res.json({error: true});
    return;
  }

  try {

    sqlVerify =
      'SELECT ' +
      '  1 as "exist" ' +
      'FROM ' +
      '  partneri_osoby ' +
      'WHERE ' +
      '  upper(login_osoby) = upper(:login)';

    sql =
      'begin web_uloz_udaje_eshop_uziv_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ULOZ_UDAJE_ESHOP_UZIV_JSON\'';

    sqlCreate =
      'begin web_eshop_zalozit_uziv_json(:strings); end;';

    sqlCreateResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ESHOP_ZALOZIT_UZIV_JSON\'';

    sqlLogin =
      'begin web_prihlasit_eshop(:strings); end;';

    sqlLoginResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_PRIHLASIT_ESHOP\'';

    sqlUser =
      'begin e1_web_udaje_eshop_uziv_json(:strings); end;';

    sqlUserResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_UDAJE_ESHOP_UZIV_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'apravnicka:' + (req.body.toCompany ? 1 : 0),
          'pole:pravnicka',
          'afakturovat_na_firmu:' + (req.body.toCompany ? 1 : 0),
          'pole:fakturovat_na_firmu',
          'alogin:' + (req.body.login || ''),
          'pole:login',
          'apwd:' + (req.body.password || ''),
          'pole:pwd',
          'ajmeno_fak:' + (req.body.firstName || ''),
          'pole:jmeno_fak',
          'aprijmeni_fak:' + (req.body.lastName || ''),
          'pole:prijmeni_fak',
          'aemail:' + (req.body.email || ''),
          'pole:email',
          'atelefon:' + (req.body.phone || ''),
          'pole:telefon',
          'aulice_fak:' + (req.body.street || ''),
          'pole:ulice_fak',
          'amesto_fak:' + (req.body.city || ''),
          'pole:mesto_fak',
          'apsc_fak:' + (req.body.zip || ''),
          'pole:psc_fak',
          'anazev_fak:' + (req.body.companyName || ''),
          'pole:nazev_fak',
          'aulice_dod:' + (req.body.streetDelivery || ''),
          'pole:ulice_dod',
          'amesto_dod:' + (req.body.cityDelivery || ''),
          'pole:mesto_dod',
          'apsc_dod:' + (req.body.zipDelivery || ''),
          'pole:psc_dod',
          'anazev_dod' + (req.body.companyNameDelivery || ''),
          'pole:nazev_dod',
          'aic:' + (req.body.regId || ''),
          'pole:ic',
          'adic:' + (req.body.vatId || ''),
          'pole:dic',
          'adodaci_je_fakturacni:' + (req.body.deliveryIsNotInvoice || ''),
          'pole:dodaci_je_fakturacni',
          'aregistrovat:' + (req.body.saveAsNewUser ? '1' : '0'),
          'pole:registrovat',
          'anovy_zakaznik:' + ((loginName == '' || loginName == '0') ? '1' : '0'),
          'pole:novy_zakaznik',
          'apoznamka:' + (req.body.note || ''),
          'pole:poznamka',
          'apoznamka2:' + (req.body.note2 || ''),
          'pole:poznamka2',
          'anewsletter:' + (req.body.newsletter ? '1' : '0'),
          'pole:newsletter'
        ]
      }
    };

    valsLogin = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aSaveContent:1',
          'aExtCookies:1',
          'alg:' + (req.body.login || ''),
          'apd:' + (req.body.password || '')
        ]
      }
    };

    valsCreate = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'predulozeno:1',
        ]
      }
    };

    valsUser = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsVerify = {login: req.body.login};

    valsSessionid = {sessionid: sessionid};

    obj = {userExist: false, error: false, isLogged: false};
    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      },
      function (result) {
        console.log(result);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        return Oracledb.select(sqlVerify, valsVerify, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        if (data.exist) {
          Oracledb.executeSQL(sqlCreate, valsCreate, req, null, {commit: true}).then(
            function (result) {
              return Oracledb.select(sqlCreateResult, valsSessionid, req, null, null);
            }
          ).then(
            function (result) {
              let data: any = Tools.getSingleResult(result);
              return Oracledb.executeSQL(sqlLogin, valsLogin, req, null, {commit: true});
            }
          ).then(
            function () {
              return Oracledb.select(sqlLoginResult, valsSessionid, req, null, null);
            }
          ).then(
            function (result) {
              // AFTER LOGIN
              let data: any = Tools.getSingleResult(result);
              let dataParse = data.result ? JSON.parse(data.result) : {};
              if (dataParse.overeno == '1') {
                obj.isLogged = true;
                Tools.createCookie(res, Constants.AUTH_TOKEN_CODE, obj.authToken);
              }
              return Oracledb.executeSQL(sqlUser, valsUser, req, null, {commit: true});
            }
          ).then(
            function () {
              return Oracledb.select(sqlUserResult, valsSessionid, req, null, null);
            }
          ).then(
            function (result) {
              let data: any = Tools.getSingleResult(result);
              let dataParse = data.result ? JSON.parse(data.result) : {};
              for (var key in dataParse) {
                // skip loop if the property is from prototype
                if (!dataParse.hasOwnProperty(key)) continue;
                dataParse[key] = decodeURIComponent(dataParse[key]);
              }
              obj.user = dataParse;
              res.json(obj);
            },
            function () {
              console.log(result);
              res.json({userExist: null, error: true});
            },
          );
        } else {
          res.json({userExist: true, error: false});
        }
      },
      function (result) {
        console.log(result);
        res.json({userExist: null, error: true});
      }
    );

  } catch (e) {
    console.log(e);
    res.json({userExist: null, error: true});
  }
}

export function saveUser (req, res) {
  let sql, vals, valsCreate, sessionid, sqlProps, loginName, valsSessionid,
    sqlCreate, sqlCreateResult;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  if (!req.body.login || !req.body.password || !req.body.passwordConfirm) {
    res.json({error: true});
    return;
  }

  try {

    sql =
      'begin web_uloz_udaje_eshop_uziv_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ULOZ_UDAJE_ESHOP_UZIV_JSON\'';

    sqlCreate =
      'begin web_eshop_zalozit_uziv_json(:strings); end;';

    sqlCreateResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ESHOP_ZALOZIT_UZIV_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsCreate = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          //'apravnicka:' + (req.body.toCompany ? 1 : 0),
          //'pole:pravnicka',
          //'afakturovat_na_firmu:' + (req.body.toCompany ? 1 : 0),
          //'pole:fakturovat_na_firmu',
          //'alogin:' + req.body.login,
          //'pole:login',
          //'apwd:' + req.body.password,
          //'pole:pwd',
          'ajmeno_fak:' + (req.body.firstName || ''),
          'pole:jmeno_fak',
          'aprijmeni_fak:' + (req.body.lastName || ''),
          'pole:prijmeni_fak',
          'aemail:' + (req.body.email || ''),
          'pole:email',
          'atelefon:' + (req.body.phone || ''),
          'pole:telefon',
          'aulice_fak:' + (req.body.street || ''),
          'pole:ulice_fak',
          'amesto_fak:' + (req.body.city || ''),
          'pole:mesto_fak',
          'apsc_fak:' + (req.body.zip || ''),
          'pole:psc_fak',
          'anazev_fak:' + (req.body.companyName || ''),
          'pole:nazev_fak',
          'aulice_dod:' + (req.body.streetDelivery || ''),
          'pole:ulice_dod',
          'amesto_dod:' + (req.body.cityDelivery || ''),
          'pole:mesto_dod',
          'apsc_dod:' + (req.body.zipDelivery || ''),
          'pole:psc_dod',
          'anazev_dod' + (req.body.companyNameDelivery || ''),
          'pole:nazev_dod',
          'aic:' + (req.body.regId || ''),
          'pole:ic',
          'adic:' + (req.body.vatId || ''),
          'pole:dic',
          'adodaci_je_fakturacni:' + (req.body.deliveryIsNotInvoice || ''),
          'pole:dodaci_je_fakturacni',
          'aregistrovat:' + (req.body.saveAsNewUser ? '1' : '0'),
          'pole:registrovat',
          'anovy_zakaznik:' + ((loginName == '' || loginName == '0') ? '1' : '0'),
          'pole:novy_zakaznik',
          'apoznamka:' + (req.body.note || ''),
          'pole:poznamka',
          'apoznamka2:' + (req.body.note2 || ''),
          'pole:poznamka2',
          'anewsletter:' + (req.body.newsletter ? '1' : '0'),
          'pole:newsletter'
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        let data = Tools.getSingleResult(result);
        return Oracledb.executeSQL(sqlCreate, valsCreate, req, null, {commit: true});
      }
    ).then(
      function (result) {
        let data = Tools.getSingleResult(result);
        return Oracledb.select(sqlCreateResult, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        res.json({error: false});
      },
      function (result) {
        res.json({error: true});
      }
    );

  } catch (e) {
    console.log(e);
    res.json({userExist: null, error: true});
  }
}

export function saveCurrentUser (req, res) {
  let sql, sqlResult, loginName, vals, valsSessionid, sessionid, sqlVerify, valsVerify;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  sql =
    'begin web_uloz_udaje_eshop_uziv_json(:strings); end;';

  sqlResult =
    'SELECT ' +
    '  s1 as "result" ' +
    'FROM ' +
    '  sessionid_temp ' +
    'WHERE ' +
    '  sessionid = decrypt_cookie(:sessionid) ' +
    '  AND kod = \'WEB_ULOZ_UDAJE_ESHOP_UZIV_JSON\'';

  sqlVerify =
    'SELECT ' +
    '  1 as "exist" ' +
    'FROM ' +
    '  partneri_osoby ' +
    'WHERE ' +
    '  upper(login_osoby) = upper(:login)';

  vals = {
    strings: {
      type: oracle.STRING,
      dir: oracle.BIND_IN,
      val: [
        'asessionid:' + (sessionid || ''),
        'aLoginName:' + (loginName || ''),
        'aSaveContent:1',
        'aExtCookies:1',
        'apravnicka:' + (req.body.toCompany ? 1 : 0),
        'pole:pravnicka',
        'afakturovat_na_firmu:' + (req.body.toCompany ? 1 : 0),
        'pole:fakturovat_na_firmu',
        'alogin:' + req.body.login,
        'pole:login',
        'apwd:' + req.body.password,
        'pole:pwd',
        'ajmeno_fak:' + (req.body.firstName || ''),
        'pole:jmeno_fak',
        'aprijmeni_fak:' + (req.body.lastName || ''),
        'pole:prijmeni_fak',
        'aemail:' + (req.body.email || ''),
        'pole:email',
        'atelefon:' + (req.body.phone || ''),
        'pole:telefon',
        'aulice_fak:' + (req.body.street || ''),
        'pole:ulice_fak',
        'amesto_fak:' + (req.body.city || ''),
        'pole:mesto_fak',
        'apsc_fak:' + (req.body.zip || ''),
        'pole:psc_fak',
        'anazev_fak:' + (req.body.companyName || ''),
        'pole:nazev_fak',
        'aulice_dod:' + (req.body.streetDelivery || ''),
        'pole:ulice_dod',
        'amesto_dod:' + (req.body.cityDelivery || ''),
        'pole:mesto_dod',
        'apsc_dod:' + (req.body.zipDelivery || ''),
        'pole:psc_dod',
        'anazev_dod' + (req.body.companyNameDelivery || ''),
        'pole:nazev_dod',
        'aic:' + (req.body.regId || ''),
        'pole:ic',
        'adic:' + (req.body.vatId || ''),
        'pole:dic',
        'adodaci_je_fakturacni:' + (req.body.deliveryIsNotInvoice || ''),
        'pole:dodaci_je_fakturacni',
        'aregistrovat:' + (req.body.saveAsNewUser ? '1' : '0'),
        'pole:registrovat',
        'anovy_zakaznik:' + ((loginName == '' || loginName == '0') ? '1' : '0'),
        'pole:novy_zakaznik',
        'apoznamka:' + (req.body.note || ''),
        'pole:poznamka',
        'apoznamka2:' + (req.body.note2 || ''),
        'pole:poznamka2',
        'anewsletter:' + (req.body.newsletter ? '1' : '0'),
        'pole:newsletter'
      ]
    }
  };

  valsSessionid = {sessionid: sessionid};

  valsVerify = {login: req.body.login};

  Oracledb.select(sqlVerify, valsVerify, req, null, null).then(
    function (result) {
      let data: any = Tools.getSingleResult(result);
      if (data.exist == '1' && req.body.saveAsNewUser) {
        res.json({error: false, userExist: true});
      } else {
        Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
          function (result) {
            return Oracledb.select(sqlResult, valsSessionid, req, null, null);
          }
        ).then(
          function (result) {
            let data: any = Tools.getSingleResult(result);
            let obj = data.result ? JSON.parse(data.result) : {};
            res.json({error: false});
          },
          function (result) {
            res.json({error: true, userExist: false});
          },
        );
      }
    },
    function () {
      res.json({error: true, userExist: false});
    }
  );
}

export function saveCurrentUserPart (req, res) {
  let sql, sqlResult, loginName, vals, valsSessionid, sessionid;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  sql =
    'begin web_uloz_udaje_eshop_uziv_json(:strings); end;';

  sqlResult =
    'SELECT ' +
    '  s1 as "result" ' +
    'FROM ' +
    '  sessionid_temp ' +
    'WHERE ' +
    '  sessionid = decrypt_cookie(:sessionid) ' +
    '  AND kod = \'WEB_ULOZ_UDAJE_ESHOP_UZIV_JSON\'';

  vals = {
    strings: {
      type: oracle.STRING,
      dir: oracle.BIND_IN,
      val: [
        'asessionid:' + (sessionid || ''),
        'aLoginName:' + (loginName || ''),
        'aSaveContent:1',
        'aExtCookies:1',
        'ajmeno_fak:' + (req.body.firstName || ''),
        'pole:jmeno_fak',
        'aprijmeni_fak:' + (req.body.lastName || ''),
        'pole:prijmeni_fak',
        'aemail:' + (req.body.email || ''),
        'pole:email',
        'atelefon:' + (req.body.phone || ''),
        'pole:telefon',
        'aulice_fak:' + (req.body.street || ''),
        'pole:ulice_fak',
        'amesto_fak:' + (req.body.city || ''),
        'pole:mesto_fak',
        'apsc_fak:' + (req.body.zip || ''),
        'pole:psc_fak',
        'anazev_fak:' + (req.body.companyName || ''),
        'pole:nazev_fak',
        'aulice_dod:' + (req.body.streetDelivery || ''),
        'pole:ulice_dod',
        'amesto_dod:' + (req.body.cityDelivery || ''),
        'pole:mesto_dod',
        'apsc_dod:' + (req.body.zipDelivery || ''),
        'pole:psc_dod',
        'anazev_dod' + (req.body.companyNameDelivery || ''),
        'pole:nazev_dod',
        'aic:' + (req.body.regId || ''),
        'pole:ic',
        'adic:' + (req.body.vatId || ''),
        'pole:dic',
        'adodaci_je_fakturacni:' + (req.body.deliveryIsNotInvoice || ''),
        'pole:dodaci_je_fakturacni',
        'aregistrovat:' + (req.body.saveAsNewUser ? '1' : '0'),
        'pole:registrovat',
        'anovy_zakaznik:' + ((loginName == '' || loginName == '0') ? '1' : '0'),
        'pole:novy_zakaznik',
        'apoznamka:' + (req.body.note || ''),
        'pole:poznamka',
        'apoznamka2:' + (req.body.note2 || ''),
        'pole:poznamka2',
        'anewsletter:' + (req.body.newsletter ? '1' : '0'),
        'pole:newsletter'
      ]
    }
  };

  valsSessionid = {sessionid: sessionid};

  Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
    function (result) {
      return Oracledb.select(sqlResult, valsSessionid, req, null, null);
    }
  ).then(
    function (result) {
      let data: any = Tools.getSingleResult(result);
      let obj = data.result ? JSON.parse(data.result) : {};
      res.json({error: false});
    },
    function (result) {
      res.json({error: true});
    },
  );
}


export function shipping (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, valsSessionid, obj: any;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'begin e1_web_udaje_dopr_objed_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_UDAJE_DOPR_OBJED_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'aplatba:' + (req.params.code || ''),
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      },
      function (result) {
        console.log(result);
      }
    ).then(
      function (result) {
        try {
          let data: any = Tools.getSingleResult(result);
          let dataParse: any = (data.result ? JSON.parse(data.result) : {records: []});
          obj = {
            records: [],
            priceAmount: decodeURIComponent(dataParse.celkem || ''),
            priceAmountVat: decodeURIComponent(dataParse.celkem_sdph || '')
          };
          dataParse.records.map(function (el) {
            obj.records.push({
              code: decodeURIComponent(el.kod || ''),
              name: decodeURIComponent(el.nazev || ''),
              price: decodeURIComponent(el.cena || ''),
              priceVat: decodeURIComponent(el.cena_sdph || ''),
              selected: (el.selected == '1'),
              editable: (el.editovat == '1')
            });
          });
          res.json(obj);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function payment (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, valsSessionid;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'begin e1_web_udaje_platba_objed_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_UDAJE_PLATBA_OBJED_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'adoprava:' + (req.params.code || ''),
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        try {
          let data: any = Tools.getSingleResult(result);
          let dataParse: any = (data.result ? JSON.parse(data.result) : {records: []});
          let obj = {
            records: [],
            priceAmount: decodeURIComponent(dataParse.celkem),
            priceAmountVat: decodeURIComponent(dataParse.celkem_sdph)
          };
          dataParse.records.map(function (el) {
            obj.records.push({
              code: decodeURIComponent(el.kod),
              name: decodeURIComponent(el.nazev),
              price: decodeURIComponent(el.cena),
              priceVat: decodeURIComponent(el.cena_sdph),
              selected: (el.selected == '1'),
              editable: (el.editovat == '1')
            });
          });
          res.json(obj);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function paymentPost (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, valsSessionid;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'begin web_platba_na_e_objed_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_PLATBA_NA_E_OBJED_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'akod:' + (req.body.code || ''),
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        res.json(data);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function shippingPost (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, valsSessionid, data, valsDelete, sqlDelete;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'begin web_doprava_na_e_objed_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_DOPRAVA_NA_E_OBJED_JSON\'';

    sqlDelete =
      'update web_eshop_udaje ' +
      '  set platba = null ' +
      'where ' +
      '  (sessionid = decrypt_cookie(:sessionid) or (login = decrypt_cookie(:login) and login is not null)) ' +
      '  and sessionid is not null ';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'akod:' + (req.body.code || ''),
        ]
      }
    };

    valsDelete = {
      sessionid: sessionid,
      login: (loginName || '')
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        data = Tools.getSingleResult(result);
        return Oracledb.executeSQL(sqlDelete, valsDelete, req, null, {commit: true})
      }
    ).then(
      function (result) {
        res.json(data);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function cartInfo (req, res) {
  let sql, vals, sessionid, sqlProps, loginName;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'select ' +
      '  SUM(kp.mnozstvi) as "amount", ' +
      '  SUM(kp.mnozstvi * (kp.cena + (kp.cena * (nvl(ds.procent, 0) / 100)))) as "priceVatAmount" ' +
      'from ' +
      '  produkty p, ' +
      '  web_kosik_pol kp, ' +
      '  web_kosik k, ' +
      '  danove_sazby ds ' +
      'where ' +
      '  p.kod = kp.produkt ' +
      '  and ds.kod = p.sazba_dan_pro ' +
      '  and k.id = kp.id_kosik ' +
      '  and (k.sessionid = decrypt_cookie(:sessionid) OR (login = decrypt_cookie(:login) AND login is not null)) ' +
      '  and k.sessionid is not null ' +
      '  and web_check_login = \'1\' ' +
      '  and upper(k.user_name) = upper(USER) ' +
      '  ';

    vals = {
      sessionid: sessionid,
      login: (loginName || ''),
    };

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let data = Tools.getSingleResult(result);
        res.json(data);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function user2 (req, res) {
  let sql, vals = {}, sessionid, loginName;

  try {
    loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

    sessionid = Tools.getSessionId(req);
    if (!sessionid) {
      res.json({});
      return;
    }

    sql =
      'select ' +
      '  decrypt_cookie(:loginName) as "loginClient", ' +
      '  login as "login", ' +
      '  jmeno_fak as "jmenoFak", ' +
      '  prijmeni_fak as "prijmeniFak", ' +
      '  email as "email", ' +
      '  telefon as "telefon", ' +
      '  ulice_fak as "uliceFak", ' +
      '  mesto_fak as "mestoFak", ' +
      '  stat_fak as "statFak", ' +
      '  psc_fak as "pscFak", ' +
      '  nazev_fak as "nazevFak", ' +
      '  jmeno_dod as "jmenoDod", ' +
      '  prijmeni_dod as "prijmeniDod", ' +
      '  ulice_dod as "uliceDod", ' +
      '  mesto_dod as "mestoDod", ' +
      '  stat_dod as "statDod", ' +
      '  psc_dod as "pscDod", ' +
      '  nazev_dod as "nazevDod", ' +
      '  dodaci_je_fakturacni as "dodaciJeFakturacni", ' +
      '  fakturovat_na_firmu as "fakturovatNaFirmu", ' +
      '  nazev_dod as "nazevDod", ' +
      '  doprava as "doprava", ' +
      '  platba as "platba", ' +
      '  poznamka as "poznamka", ' +
      '  poznamka2 as "poznamka2", ' +
      '  novy_zakaznik as "novy_zakaznik", ' +
      '  registrovat as "registrovat", ' +
      '  newsletter as "newsletter" ' +
      'from ' +
      '  web_eshop_udaje ' +
      'where ' +
      '  db_user = user and ' +
      '  ((sessionid = decrypt_cookie(:sessionid) and sessionid is not null and ' +
      '    nvl(sessionid,\'0\') <> \'0\') or  ' +
      '   (login = decrypt_cookie(:loginName) and login is not null and ' +
      '    nvl(login,\'0\') <> \'0\')) and ' +
      '  web_check_login = 1 ';

    vals = {
      sessionid: sessionid,
      loginName: loginName
    };

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        try {
          let data: any = Tools.getSingleResult(result);
          let user: any = {};

          user.login = data.login || '';
          user.loginClient = data.loginClient || '';
          user.isLogged = (user.loginClient != '' && user.loginClient != '0');
          /*user.priceAmount = dataParse.castka_celkem;
          user.priceVatAmount = dataParse.castka_celkem_sdph;*/

          // INVOICE
          user.firstName = data.jmenoFak || '';
          user.lastName = data.prijmeniFak || '';
          user.email = data.email || '';
          user.phone = data.telefon || '';
          user.street = data.uliceFak || '';
          user.city = data.mestoFak || '';
          user.country = data.statFak || '';
          user.zip = data.pscFak || '';
          user.companyName = data.nazevFak || '';

          // DELIVERY
          user.firstNameDelivery = data.jmenoDod || '';
          user.lastNameDelivery = data.prijmeniDod || '';
          user.streetDelivery = data.uliceDod || '';
          user.cityDelivery = data.mestoDod || '';
          user.countryDelivery = data.statDod || '';
          user.zipDelivery = data.pscDod || '';
          user.companyNameDelivery = data.nazev_dod || '';

          user.deliveryIsNotInvoice = data.dodaciJeFakturacni == '0';
          user.toCompany = data.fakturovatNaFirmu == '1';

          user.shipping = data.doprava || '';
          user.shippingDefault = data.doprava || '';
          user.payment = data.platba || '';
          user.paymentDefault = data.platba || '';

          user.saveAsNewUser = (data.registrovat == '1');

          user.note = (data.poznamka || '');
          user.note2 = (data.poznamka2 || '');

          user.newsletter = (data.newsletter != '0');

          res.json(user);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.json({});
      }
    );
  } catch (e) {
    console.log(e);
    res.json({});
  }
}

export function cart2 (req, res) {
  let sql, sqlDoprPlatba, sqlKup, vals, sessionid, loginName, i, l, data, dataDoprPlatba,
    sumCastka = 0, sumCastkaSDph = 0, limit = 0, limitSDph = 0;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'select a.*, ' +
      '  a.id_prilohy as "idPrilohy", ' +
      '  get_file_ext(i.MIME_TYPE) as "fileExt" ' +
      'from ' +
      ' (select ' +
      '   kp.cislo as "cislo", ' +
      '   kp.produkt as "kod", ' +
      '   kp.nazev as "nazev", ' +
      '   kp.mj as "mj", ' +
      '   kp.mnozstvi as "mnozstvi", ' +
      '   p.presmerovani as "presmerovani", ' +
      '   pd.nazev as "dostupnost", ' +
      '   (nvl(kp.cena,0) * nvl(kp.mnozstvi,0)) as "castka", ' +
      '   (nvl(kp.cena,0) * nvl(kp.mnozstvi,0)) + ' +
      '      ((nvl(kp.cena,0) * nvl(kp.mnozstvi,0)) * (nvl(ds.procent, 0) / 100)) as "castkaSDph", ' +
      '   nvl(kp.cena,0) as "cena", ' +
      '   null as "slevaProc", ' +
      '   (select max(pd.id) from prilohy_data_info pd, prilohy_nove pn ' +
      '    where pd.id = pn.priloha_id and pn.tabulka = \'PRODUKTY\' and pn.pk = p.kod and ' +
      '      crm_priloha_typ = \'IMAGE_SMALL_ESHOP\' and ' +
      '      (substr(popis,instr(popis,\'.\',-1)-2,2) = \'_1\' OR ' +
      '       substr(popis,instr(popis,\'.\',-1)-4,4) = \'_1_S\') ' +
      '   ) as id_prilohy ' +
      ' from ' +
      '   web_kosik_pol kp, ' +
      '   web_kosik k, ' +
      '   produkty p, ' +
      '   produkty_dostupnost pd, ' +
      '   danove_sazby ds ' +
      ' where ' +
      '   k.id = kp.id_kosik and ' +
      '   p.kod = kp.produkt and ' +
      '   pd.kod(+) = p.dostupnost and ' +
      '   ds.kod = p.sazba_dan_pro and ' +
      '   ((k.sessionid = decrypt_cookie(:sessionid) and k.sessionid is not null and ' +
      '     nvl(k.sessionid,\'0\') <> \'0\') or ' +
      '    (k.login = decrypt_cookie(:loginName) and k.login is not null and ' +
      '     nvl(k.login,\'0\') <> \'0\')) and ' +
      '   web_check_login = 1 and ' +
      '   k.user_name = user ' +
      ') a, ' +
      ' prilohy_data_info i ' +
      'where ' +
      ' i.id(+) = a.id_prilohy';

    sqlDoprPlatba =
      'select a.*, ' +
      '  nvl(dp.castka, 0) as "limit", ' +
      '  nvl(dp.castka_sdph, 0) as "limitSDph", ' +
      '  doprava_castka + (doprava_castka * (doprava_procent / 100)) as "dopravaSDph", ' +
      '  platba_castka + (platba_castka * (platba_procent / 100)) as "platbaSDph" ' +
      'from ' +
      ' web_vazby_doprava_platba dp, ' +
      ' (select ' +
      '   dopr.doprava as doprava_kod, ' +
      '   dopr.nazev as "doprava", ' +
      '   pl.platba as platba_kod, ' +
      '   pl.nazev as "platba", ' +
      '   e1_web_cena(po.partner, dopr.produkt) as doprava_castka, ' +
      '   e1_web_cena(po.partner, pl.produkt) as platba_castka, ' +
      '   nvl(dopr.procent, 0) as doprava_procent, ' +
      '   nvl(pl.procent, 0) as platba_procent ' +
      ' from ' +
      '   web_kosik k, ' +
      '   (select e.sessionid, d.nazev, e.doprava, d.produkt, nvl(ds.procent, 0) as procent ' +
      '     from web_eshop_udaje e, zpusoby_dopravy d, produkty pr, danove_sazby ds ' +
      '   where ' +
      '     ((e.sessionid = decrypt_cookie(:sessionid) and e.sessionid is not null and ' +
      '       nvl(e.sessionid,\'0\') <> \'0\') or ' +
      '      (e.login = decrypt_cookie(:loginName) and e.login is not null and ' +
      '       nvl(e.login,\'0\') <> \'0\')) and ' +
      '     e.db_user = user and d.kod = e.doprava(+) and pr.kod(+) = d.produkt and ' +
      '     ds.kod(+) = pr.sazba_dan_pro) dopr, ' +
      '   (select e.sessionid, p.nazev, e.platba, p.produkt, nvl(ds.procent, 0) as procent ' +
      '    from web_eshop_udaje e, zpusoby_plateb p, produkty pr, danove_sazby ds ' +
      '    where ' +
      '     ((e.sessionid = decrypt_cookie(:sessionid) and e.sessionid is not null and ' +
      '       nvl(e.sessionid,\'0\') <> \'0\') or ' +
      '      (e.login = decrypt_cookie(:loginName) and e.login is not null and ' +
      '       nvl(e.login,\'0\') <> \'0\')) and ' +
      '     e.db_user = user and p.kod = e.platba(+) and pr.kod(+) = p.produkt and ' +
      '     ds.kod(+) = pr.sazba_dan_pro) pl, ' +
      '   partneri_osoby po ' +
      ' where ' +
      '   ((k.sessionid = decrypt_cookie(:sessionid) and k.sessionid is not null and ' +
      '     nvl(k.sessionid,\'0\') <> \'0\') or ' +
      '    (k.login = decrypt_cookie(:loginName) and k.login is not null and ' +
      '     nvl(k.login,\'0\') <> \'0\')) and ' +
      '   k.user_name = user and ' +
      '   web_check_login = 1 and ' +
      '   po.login_osoby(+) = decrypt_cookie(:loginName) and ' +
      '   po.login_osoby(+) = k.login and ' +
      '   dopr.sessionid(+) = k.sessionid and ' +
      '   pl.sessionid(+) = k.sessionid ' +
      ' ) a ' +
      'where ' +
      '  dp.eshop(+) = get_website and ' +
      '  dp.stat(+) = \'' + Constants.STATE + '\' and ' +
      '  dp.kod_doprava(+) = a.doprava_kod and ' +
      '  dp.kod_platba(+) = a.platba_kod';

    sqlKup =
      'select ' +
      '  nvl(k.cena_bez_dph, 0) as "cenaBezDph", ' +
      '  nvl(k.cena_s_dph, 0) as "cenaSDph" ' +
      'from ' +
      '  web_eshop_kupony k, ' +
      '  web_eshop_kupony_kosik kk ' +
      'where ' +
      '  kk.user_name = user and ' +
      '  k.ck = kk.kod_kuponu and ' +
      '  ((kk.sessionid = decrypt_cookie(:sessionid) and kk.sessionid is not null and ' +
      '    nvl(kk.sessionid,\'0\') <> \'0\') or ' +
      '    (kk.partner_login = decrypt_cookie(:loginName) and kk.partner_login is not null and ' +
      '    nvl(kk.partner_login,\'0\') <> \'0\')) and ' +
      '  web_check_login = 1 ';

    vals = {
      sessionid: sessionid,
      loginName: loginName
    };

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        data = Tools.getMultiResult(result);
        return Oracledb.select(sqlDoprPlatba, vals, req, null, null);
      }
    ).then(
      function (result) {
        dataDoprPlatba = Tools.getSingleResult(result);
        return Oracledb.select(sqlKup, vals, req, null, null);
      }
    ).then(
      function (result) {
        try {
          let dataKup: any = Tools.getMultiResult(result);
          let obj: any = {records: []};

          for (i = 0, l = data.length; i < l; i += 1) {
            sumCastka += data[i].castka;
            sumCastkaSDph += data[i].castkaSDph;

            obj.records.push({
              fileName: (data[i].idPrilohy ? (data[i].idPrilohy + Constants.DOT + data[i].fileExt) : Constants.imgageEmptySmall),
              name: data[i].nazev,
              code: data[i].kod,
              unit: data[i].mj,
              amount: data[i].mnozstvi,
              redirect: data[i].presmerovani || '',
              price: data[i].cena,
              priceAmount: data[i].castka,
              priceVatAmount: data[i].castkaSDph,
              availability: data[i].dostupnost || '',
              discountPercent: data[i].slevaProc,
              itemId: data[i].cislo
            });
          }

          obj.shippingName = dataDoprPlatba.doprava || '';
          obj.paymentName = dataDoprPlatba.platba || '';
          obj.shippingVat = dataDoprPlatba.dopravaSDph;
          obj.paymentVat = dataDoprPlatba.platbaSDph;
          limit = dataDoprPlatba.limit;
          limitSDph = dataDoprPlatba.limitSDph;

          obj.shippingAndPayment = (limitSDph > 0 && sumCastkaSDph >= limitSDph) || (limit > 0 && sumCastka >= limit) ? 0 : obj.shippingVat + obj.paymentVat;
          obj.leftToShippingFree = (limitSDph > 0 && limitSDph >= sumCastkaSDph) ? limitSDph - sumCastkaSDph : 0;

          for (i = 0, l = dataKup.length; i < l; i += 1) {
            sumCastka -= dataKup[i].cenaBezDph;
            sumCastkaSDph -= dataKup[i].cenaSDph;
          }
          obj.priceAmount = sumCastka;
          obj.priceAmountVat = sumCastkaSDph;

          res.json(obj);
        } catch (e) {
          console.log(e);
          res.json({});
        }
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function createOrder (req, res) {
  let sql, vals, valsReg, sessionid, sqlProps, loginName, valsSessionid, sqlCreateUserResult,
    sqlCreateUser, sqlReg, sqlVerify, valsCreateUser, valsVerify;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql = 'begin e1_web_eshop_vytvor_objp_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'E1_WEB_ESHOP_VYTVOR_OBJP_JSON\'';

    sqlCreateUser =
      'begin web_eshop_zalozit_uziv_json(:strings); end;';

    sqlCreateUserResult =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ESHOP_ZALOZIT_UZIV_JSON\'';

    sqlVerify =
      'SELECT ' +
      '  1 as "exist" ' +
      'FROM ' +
      '  partneri_osoby ' +
      'WHERE ' +
      '  upper(login_osoby) = upper(decrypt_cookie(:login))';

    sqlReg =
      'select ' +
      '  registrovat as "registrovat" ' +
      'from ' +
      '  web_eshop_udaje ' +
      'where ' +
      '  db_user = user ' +
      '  and (' +
      '    (' +
      '     sessionid = decrypt_cookie(:sessionid) ' +
      '     and sessionid is not null ' +
      '     and nvl(sessionid, \'0\') <> \'0\' ' +
      '     ) ' +
      '    or  ' +
      '    (' +
      '     login = decrypt_cookie(:login) ' +
      '     and login is not null ' +
      '     and nvl(login, \'0\') <> \'0\' ' +
      '     )' +
      '  )   ' +
      '  and web_check_login = 1 ';

    valsSessionid = {sessionid: sessionid};

    valsReg = {
      sessionid: sessionid,
      login: (loginName || '')
    };

    valsVerify = {
      login: (loginName || '')
    };

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
        ]
      }
    };

    valsCreateUser = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'predulozeno:1',
        ]
      }
    };

    let isRegister = false;
    Oracledb.select(sqlReg, valsReg, req, null, null).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        isRegister = (data.registrovat == '1');
        return Oracledb.select(sqlVerify, valsVerify, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);

        if (data.exist && isRegister) {
          res.json({userExist: true});
          return;
        }

        if (isRegister) {
          Oracledb.executeSQL(sqlCreateUser, valsCreateUser, req, null, null).then(
            function (result) {
              return Oracledb.select(sqlCreateUserResult, valsSessionid, req, null, {connection: result.connection, holdConnect: true});
            }
          ).then(
            function (result) {
              return Oracledb.executeSQL(sql, vals, req, null, {connection: result.connection, commit: true});
            }
          ).then(
            function (result) {
              return Oracledb.select(sqlProps, valsSessionid, req, null, null);
            }
          ).then(
            function (result) {
              let data: any = Tools.getSingleResult(result);
              let dataParse = data && data.result ? JSON.parse(data.result) : {};
              res.json(dataParse);
            },
            function (result) {
              console.log(result);
              res.send('');
            }
          );
        } else {
          Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
            function (result) {
              return Oracledb.select(sqlProps, valsSessionid, req, null, null);
            }
          ).then(
            function (result) {
              let data: any = Tools.getSingleResult(result);
              let dataParse = data && data.result ? JSON.parse(data.result) : {};
              res.json(dataParse);
            },
            function (result) {
              console.log(result);
              res.send('');
            }
          );
        }
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function verifyOrder (req, res) {
  let sql, vals, sessionid, sqlProps, loginName;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({});
    return;
  }

  try {

    sql =
      'select ' +
      '  SUM(kp.mnozstvi) as "amount", ' +
      '  u.doprava as "shipping", ' +
      '  u.platba as "payment", ' +
      '  u.jmeno_fak as "firstName", ' +
      '  u.prijmeni_fak as "lastName", ' +
      '  u.email as "email" ' +
      'from ' +
      '  produkty p, ' +
      '  web_kosik_pol kp, ' +
      '  web_kosik k, ' +
      '  danove_sazby ds, ' +
      '  web_eshop_udaje u ' +
      'where ' +
      '  p.kod = kp.produkt ' +
      '  and ds.kod = p.sazba_dan_pro ' +
      '  and k.id = kp.id_kosik ' +
      '  and (k.sessionid = decrypt_cookie(:sessionid) OR (k.login = decrypt_cookie(:login) AND k.login is not null)) ' +
      '  and k.sessionid is not null ' +
      '  and (u.sessionid = decrypt_cookie(:sessionid) or (u.login = decrypt_cookie(:login) and u.login is not null)) ' +
      '  and u.sessionid is not null ' +
      'group by ' +
      '  u.doprava, ' +
      '  u.platba, ' +
      '  u.jmeno_fak, ' +
      '  u.prijmeni_fak, ' +
      '  u.email ' +
      '';

    vals = {
      sessionid: sessionid,
      login: (loginName || ''),
    };

    Oracledb.select(sql, vals, req, null, null).then(
      function (result) {
        let data = Tools.getSingleResult(result);
        res.json(data);
      },
      function (result) {
        console.log(result);
        res.send('');
      }
    );
  } catch (e) {
    console.log(e);
    res.send('');
  }
}

export function addCoupon (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, valsSessionid, data, valsDelete, sqlDelete;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({error: true});
    return;
  }

  try {

    sql =
      'begin web_eshop_uplatnit_slevu_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ESHOP_UPLATNIT_SLEVU_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'aSlevove_kupony_pole_nazev:akod',
          'akod:' + (req.body.code || ''),
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        let dataParse = (data ? JSON.parse(data.result) : {error: true});
        let valid = (dataParse && dataParse.records && dataParse.records[0].platny == '1');
        res.json({error: false, valid: valid});
      },
      function (result) {
        console.log(result);
        res.json({error: true});
      }
    );
  } catch (e) {
    console.log(e);
    res.json({error: true});
  }
}

export function removeCoupon (req, res) {
  let sql, vals, sessionid, sqlProps, loginName, valsSessionid, data, valsDelete, sqlDelete;

  loginName = Tools.getCookieId(req, Constants.AUTH_TOKEN_CODE);

  sessionid = Tools.getSessionId(req);
  if (!sessionid) {
    res.json({error: true});
    return;
  }

  try {

    sql =
      'begin web_eshop_odebrat_kupon_json(:strings); end;';

    sqlProps =
      'SELECT ' +
      '  s1 as "result" ' +
      'FROM ' +
      '  sessionid_temp ' +
      'WHERE ' +
      '  sessionid = decrypt_cookie(:sessionid) ' +
      '  AND kod = \'WEB_ESHOP_ODEBRAT_KUPON_JSON\'';

    vals = {
      strings: {
        type: oracle.STRING,
        dir: oracle.BIND_IN,
        val: [
          'asessionid:' + sessionid,
          'aLoginName:' + (loginName || ''),
          'aSaveContent:1',
          'aExtCookies:1',
          'kupon:' + (req.params.code || ''),
        ]
      }
    };

    valsSessionid = {sessionid: sessionid};

    Oracledb.executeSQL(sql, vals, req, null, {commit: true}).then(
      function (result) {
        return Oracledb.select(sqlProps, valsSessionid, req, null, null);
      }
    ).then(
      function (result) {
        let data: any = Tools.getSingleResult(result);
        let dataParse = (data ? JSON.parse(data.result) : {error: true});
        res.json(dataParse);
      },
      function (result) {
        console.log(result);
        res.json({error: true});
      }
    );
  } catch (e) {
    console.log(e);
    res.json({error: true});
  }
}
