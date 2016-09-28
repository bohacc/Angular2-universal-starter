"use strict";
//noinspection TypeScriptUnresolvedFunction
var oracle = require('oracledb');
//noinspection TypeScriptUnresolvedFunction
var fs = require('fs');
//noinspection TypeScriptUnresolvedFunction
var Promise = require('promise');
//noinspection TypeScriptUnresolvedFunction
var Constants = require('./constants');
var api_oracle_1 = require('./api_oracle');
var tools_1 = require('./tools');
function loadObjects(req, res) {
    try {
        var vals = void 0, sql = void 0;
        vals = {
            code: req.params.code
        };
        console.log('LOAD');
        console.log(req.params.code);
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
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var data = tools_1.Tools.getMultiResult(result);
            res.json(data);
        }, function (result) {
            console.log(result);
            res.json([]);
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.loadObjects = loadObjects;
function emptyImage(req, res) {
    //noinspection TypeScriptUnresolvedVariable
    res.sendFile((process.env.APP_PORT ? '/srv/nodejs/mcled_website_v3' : '') + '/images/noimage/mcled_noimage_B.png', { root: (process.env.APP_PORT ? '' : __dirname + '/../../') });
    //console.log('EMPTY IMAGE');
    //res.sendFile(emptyImg);
}
exports.emptyImage = emptyImage;
function getProduct(req, res) {
    var sql, vals, sqlProperties, path, pathEmpty, imgEmptySmall, imgEmptyMedium, imgEmptyBig;
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
        '  ppp.poradi '*/ ;
        vals = { code: req.params.code };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var data = tools_1.Tools.getSingleResult(result);
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
            vals = { id: data.id };
            api_oracle_1.Oracledb.select(sqlProperties, vals, req, null, null).then(function (result) {
                var i = 0;
                var arr = [];
                var prop = tools_1.Tools.getMultiResult(result);
                data.properties = [];
                prop.map(function (el, n) {
                    if (i <= 8) {
                        arr.push(el);
                    }
                    if (i === 8 || n === prop.length - 1) {
                        data.properties.push({ items: arr });
                        arr = [];
                    }
                    i = i === 8 ? 1 : i + 1;
                });
                res.json(data);
            }, function (result) {
                console.log(result);
                res.send('');
            });
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
        res.json({});
    }
}
exports.getProduct = getProduct;
function redirectNavigations(req, res) {
    var sql, vals;
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
        vals = { id: req.params.id };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var data = tools_1.Tools.getMultiResult(result);
            res.json(data);
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.redirectNavigations = redirectNavigations;
function redirectNavigationsProduct(req, res) {
    var sql, vals;
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
        vals = { code: req.params.code };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var data = tools_1.Tools.getSingleResult(result);
            res.json([data]);
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.redirectNavigationsProduct = redirectNavigationsProduct;
function productsList(req, res) {
    var sql, vals, rowsOnPage, page, sort, orderBySql, whereSql, filtersParams;
    try {
        rowsOnPage = req.query.rowsonpage;
        page = req.query.page;
        sort = req.query.sort;
        // SORTING
        if (sort === 'price_asc') {
            orderBySql = ' order by e1_web_cena(null,"code",null,null,null,null,1,1) asc ';
        }
        else if (sort === 'price_desc') {
            orderBySql = ' order by e1_web_cena(null,"code",null,null,null,null,1,1) desc ';
        }
        else if (sort === 'name_asc') {
            orderBySql = ' order by "name" asc ';
        }
        else if (sort === 'name_desc') {
            orderBySql = ' order by "name" desc ';
        }
        else if (sort === 'code_asc') {
            orderBySql = ' order by "code" asc ';
        }
        else if (sort === 'code_desc') {
            orderBySql = ' order by "code" desc ';
        }
        vals = { code: req.params.code };
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
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var products = tools_1.Tools.getMultiResult(result);
            return getProductsProperties(products);
        }).then(function (result) {
            res.json(result);
        }, function (result) {
            //console.log(result);
            res.send([]);
        });
    }
    catch (e) {
        //console.log(e);
        res.send([]);
    }
}
exports.productsList = productsList;
function productsListPagination(req, res) {
    var sql, vals, whereSql, filtersParams;
    try {
        vals = { code: req.params.code };
        whereSql = getFilter(req.query.filter);
        filtersParams = req.query.filtersadv + Constants.commaParams + req.query.filtersbasic;
        //whereSql += getFilterParams(req.query.filtersadv, vals, false, true, 'parAdv', 'valAdv');
        whereSql += getFilterParams(filtersParams, vals, false, true, 'par', 'val');
        sql =
            'select ' +
                ' count(*) as "rows" ' +
                'from ' +
                '  (' + Constants.sqlListCore + whereSql + ' )';
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var meta = tools_1.Tools.getSingleResult(result);
            res.json(meta);
        }, function (result) {
            //console.log(result);
            res.send('');
        });
    }
    catch (e) {
    }
}
exports.productsListPagination = productsListPagination;
function getFilter(filterStr) {
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
exports.getFilter = getFilter;
function productAttachments(req, res) {
    var sql, vals, tablesWhiteList, typesWhiteList, type;
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
        vals = { id: req.params.id, type: req.params.type };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var meta = tools_1.Tools.getMultiResult(result);
            res.json(meta);
        }, function (result) {
            console.log(result);
            res.send([]);
        });
    }
    catch (e) {
        console.log(e);
        res.send([]);
    }
}
exports.productAttachments = productAttachments;
function productsSimilar(req, res) {
    var sql, vals;
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
        vals = { id: req.params.id, count: req.query.count };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var products = tools_1.Tools.getMultiResult(result);
            return getProductsProperties(products);
        }).then(function (result) {
            //console.log(result);
            res.json(result);
            //res.json(result);
        }, function (result) {
            console.log(result);
            res.send([]);
        });
    }
    catch (e) {
        console.log(e);
    }
}
exports.productsSimilar = productsSimilar;
var getProductsProperties = function (products) {
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
        api_oracle_1.Oracledb.select(sql, {}, {}, null, null).then(function (result) {
            try {
                var properties_1 = tools_1.Tools.getMultiResult(result);
                products.map(function (el) {
                    var info = properties_1.filter(function (elm) {
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
                    }
                    else if (info.patternParams == 381) {
                        el.redirect = '/konfigurator2';
                    }
                });
                resolve(products);
            }
            catch (e) {
                console.log(e);
                reject([]);
            }
        }, function (result) {
            console.log(result);
            reject([]);
        });
    });
};
function getFilterForList(req, res) {
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
        valsItems = { code: req.params.code, type: req.params.type };
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
        vals = { code: req.params.code, type: req.params.type };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            params = tools_1.Tools.getMultiResult(result);
            return api_oracle_1.Oracledb.select(sqlItems, valsItems, req, null, null);
        }).then(function (result) {
            var items = tools_1.Tools.getMultiResult(result);
            params.map(function (el) {
                var values = items.filter(function (eli) {
                    return eli.par === el.par;
                });
                el.items = values || [];
            });
            res.json(params);
        }, function (result) {
            console.log(result);
        });
    }
    catch (e) {
        console.log(e);
        res.send([]);
    }
}
exports.getFilterForList = getFilterForList;
;
function getFilterParams(filtersStr, vals, useWhere, firstAnd, parName, valName) {
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
                }
                else {
                    if (i > 0) {
                        sqlWhereFilters += ' or ';
                    }
                    else {
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
exports.getFilterParams = getFilterParams;
function getFilterType(req, res) {
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
        vals = { code: req.params.code };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var data = tools_1.Tools.getSingleResult(result);
            var pos = cats.indexOf(data.id);
            cat = pos > -1 ? data.id : 0;
            res.json({ cat: cat });
        }, function (result) {
            console.log(result);
            res.json({});
        });
    }
    catch (e) {
        console.log(e);
        res.json({});
    }
}
exports.getFilterType = getFilterType;
function getParamsObjForFilter(str) {
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
            }
            else {
                newArr.push({ par: item[0], vals: [item[1]] });
            }
        }
    });
    return newArr;
}
exports.getParamsObjForFilter = getParamsObjForFilter;
function category(req, res) {
    var sql, vals, imgEmptyBig, path, pathEmpty;
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
        vals = { code: req.params.code };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var cats = tools_1.Tools.getSingleResult(result);
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
        }, function (result) {
            console.log(result);
            res.json({});
        });
    }
    catch (e) {
        console.log(e);
        res.json({});
    }
}
exports.category = category;
function catsAttachments(req, res) {
    var sql, vals, typesWhiteList, type;
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
        vals = { id: req.params.id, type: req.params.type };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var meta = tools_1.Tools.getMultiResult(result);
            res.json(meta);
        }, function (result) {
            console.log(result);
            res.send([]);
        });
    }
    catch (e) {
        console.log(e);
        res.send([]);
    }
}
exports.catsAttachments = catsAttachments;
function attachments(req, res) {
    if (req.params.tableName && req.params.tableName.toUpperCase() === 'PRODUKTY') {
        productAttachments(req, res);
    }
    else if (req.params.tableName && req.params.tableName.toUpperCase() === 'ZATRIDENI_PRODUKTU') {
        catsAttachments(req, res);
    }
    else {
        res.json([]);
    }
}
exports.attachments = attachments;
function attachment(req, res) {
    var sql, vals, obj, sqlAtt;
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
        vals = { id: req.params.id };
        api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
            var att = tools_1.Tools.getSingleResult(result);
            obj = {
                fileName: att.fileName,
                fileLength: att.size,
                mimeType: att.mimeType
            };
            api_oracle_1.Oracledb.sendBlob(sqlAtt, vals, req, null, obj, res);
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
        res.send('');
    }
}
exports.attachment = attachment;
function test(req, res) {
    var sql, vals, obj, sqlAtt;
    try {
        sql =
            'begin web_udaje_eshop_uzivatele_json(:strings); end;';
        vals = { strings: { type: oracle.STRING, dir: oracle.BIND_IN, val: ['asessionid:123456789', 'aLoginName:bohac@notia.cz', 'aSaveContent:1'] } };
        api_oracle_1.Oracledb.executeSQL(sql, vals, req, null, { commit: true }).then(function (result) {
            vals = { sessionid: 123456789 };
            return api_oracle_1.Oracledb.select('SELECT s1 FROM sessionid_temp WHERE sessionid = :sessionid AND kod = \'WEB_UDAJE_ESHOP_UZIVATELE_JSON\'', vals, req, null, null);
        }).then(function (result) {
            console.log(result);
            res.send(tools_1.Tools.getSingleResult(result));
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
        res.send('');
    }
}
exports.test = test;
function xmlExportSeznam(req, res) {
    var sql, rows, temp, obj = '', i, l;
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
        api_oracle_1.Oracledb.select(sql, [], req, null, null).then(function (result) {
            rows = tools_1.Tools.getMultiResult(result);
            obj = '<SHOP>';
            for (i = 0, l = rows.length; i < l; i += 1) {
                temp =
                    '<SHOPITEM>' +
                        '<PRODUCTNAME>' + rows[i].productName + ' McLED ' + rows[i].kod + '</PRODUCTNAME>' +
                        '<DESCRIPTION>' + rows[i].description + '</DESCRIPTION>' +
                        '<PRODUCTNO>' + rows[i].productNo + '</PRODUCTNO>' +
                        '<URL>' + rows[i].url + '</URL>' +
                        '<IMGURL>' + rows[i].imgUrl + '</IMGURL>' +
                        '<PRICE_VAT>' + rows[i].priceVat + '</PRICE_VAT>' +
                        '<SHOP_DEPOTS>12805266</SHOP_DEPOTS>' +
                        '<ITEM_TYPE>new</ITEM_TYPE>' +
                        '<MANUFACTURER>' + rows[i].manufacturer + '</MANUFACTURER>' +
                        '<EAN>' + rows[i].ean + '</EAN>' +
                        '<DELIVERY_DATE>' + rows[i].deliveryDate + '</DELIVERY_DATE>' +
                        '<CATEGORYTEXT>' + rows[i].categoryText + '</CATEGORYTEXT>' +
                        '</SHOPITEM>';
                obj += temp;
            }
            ;
            obj += '</SHOP>';
            res.setHeader('Content-Type', 'text/xml');
            res.end(obj);
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
        res.send('');
    }
}
exports.xmlExportSeznam = xmlExportSeznam;
function xmlExportHeureka(req, res) {
    var sql, rows, temp, obj = '', i, l;
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
        api_oracle_1.Oracledb.select(sql, [], req, null, null).then(function (result) {
            rows = tools_1.Tools.getMultiResult(result);
            obj = '<SHOP>';
            for (i = 0, l = rows.length; i < l; i += 1) {
                temp =
                    '<SHOPITEM>' +
                        '<ITEM_ID>' + rows[i].kod + '</ITEM_ID>' +
                        '<PRODUCTNAME>' + rows[i].productName + ' McLED ' + rows[i].productNo + '</PRODUCTNAME>' +
                        '<DESCRIPTION>' + rows[i].description + '</DESCRIPTION>' +
                        '<URL>' + rows[i].url + '</URL>' +
                        '<IMGURL>' + rows[i].imgUrl + '</IMGURL>' +
                        '<IMGURL_ALTERNATIVE></IMGURL_ALTERNATIVE>' +
                        '<VIDEO_URL></VIDEO_URL>' +
                        '<PRICE_VAT>' + rows[i].priceVat + '</PRICE_VAT>' +
                        '<HEUREKA_CPC></HEUREKA_CPC>' +
                        '<MANUFACTURER>' + rows[i].manufacturer + '</MANUFACTURER>' +
                        '<CATEGORYTEXT>' + rows[i].categoryText + '</CATEGORYTEXT>' +
                        '<EAN>' + rows[i].ean + '</EAN>' +
                        '<DELIVERY_DATE>' + rows[i].deliveryDate + '</DELIVERY_DATE>' +
                        '</SHOPITEM>';
                obj += temp;
            }
            ;
            obj += '</SHOP>';
            res.setHeader('Content-Type', 'text/xml');
            res.end(obj);
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
        res.send('');
    }
}
exports.xmlExportHeureka = xmlExportHeureka;
function sitemap(req, res) {
    var sqlAdresa, sql, data, rows, adresa, date, temp, obj = '', i, l;
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
        api_oracle_1.Oracledb.select(sqlAdresa, [], req, null, null).then(function (result) {
            data = tools_1.Tools.getSingleResult(result);
            adresa = data.adresa;
            date = data.date;
            return api_oracle_1.Oracledb.select(sql, [], req, null, null);
        }).then(function (result) {
            rows = tools_1.Tools.getMultiResult(result);
            obj = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
            for (i = 0, l = rows.length; i < l; i += 1) {
                temp =
                    '<url>' +
                        '<loc>' + adresa + '/' + rows[i].from + '</loc>' +
                        '<lastmod>' + date + '</lastmod>' +
                        '</url>';
                obj += temp;
            }
            ;
            obj += '</urlset>';
            res.setHeader('Content-Type', 'text/xml');
            res.end(obj);
        }, function (result) {
            console.log(result);
            res.send('');
        });
    }
    catch (e) {
        console.log(e);
        res.send('');
    }
}
exports.sitemap = sitemap;
function partnersList(req, res) {
    var sql, rows, i, l, path = Constants.imgagePath, pathEmpty = Constants.imgagePathEmpty, imgEmptySmall = Constants.imgageEmptySmall;
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
        api_oracle_1.Oracledb.select(sql, [], req, null, null).then(function (result) {
            rows = tools_1.Tools.getMultiResult(result);
            res.json(rows);
        }, function (result) {
            console.log(result);
            res.json([]);
        });
    }
    catch (e) {
        console.log(e);
        res.send('');
    }
}
exports.partnersList = partnersList;
function newsletterLogin(req, res) {
    var sql, vals;
    if (req.params.email && tools_1.Tools.validateEmail(req.params.email)) {
        try {
            sql =
                'begin web_newsletter_insert_json(:strings); end;';
            //TODO: parameter asessionid
            vals = { strings: { type: oracle.STRING, dir: oracle.BIND_IN, val: ['asessionid:123456789', 'aSaveContent:1', 'aEmail:' + req.params.email] } };
            api_oracle_1.Oracledb.executeSQL(sql, vals, req, null, { commit: true }).then(function (result) {
                vals = { sessionid: 123456789 };
                return api_oracle_1.Oracledb.select('SELECT s1 as "result" FROM sessionid_temp WHERE sessionid = :sessionid AND kod = \'WEB_NEWSLETTER_INSERT_JSON\'', vals, req, null, null);
            }).then(function (result) {
                res.send(tools_1.Tools.getSingleResult(result));
            }, function (result) {
                console.log(result);
                res.send('');
            });
        }
        catch (e) {
            console.log(e);
            res.send('');
        }
    }
}
exports.newsletterLogin = newsletterLogin;
function logout(req, res) {
    tools_1.Tools.deleteCookie(res, 'auth_token');
    res.json({});
}
exports.logout = logout;
function login(req, res) {
    var sql, vals = {}, sqlResult, sessionid;
    try {
        sessionid = tools_1.Tools.getSessionId(req);
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
        api_oracle_1.Oracledb.executeSQL(sql, vals, req, null, { commit: true }).then(function (result) {
            vals = { sessionid: sessionid };
            return api_oracle_1.Oracledb.select(sqlResult, vals, req, null, null);
        }).then(function (result) {
            var data = tools_1.Tools.getSingleResult(result);
            var obj = data.result ? JSON.parse(data.result) : {};
            if (obj.overeno == '1') {
                tools_1.Tools.createCookie(res, Constants.AUTH_TOKEN_CODE, obj.authToken);
            }
            res.json({ isLogged: obj.overeno == '1' });
        }, function (result) {
            console.log(result);
            res.json({ isLogged: false });
        });
    }
    catch (e) {
        console.log(e);
        res.json({ isLogged: false });
    }
}
exports.login = login;
function sessionidCookie(req, res, next) {
    var sql, vals = {};
    try {
        if (!tools_1.Tools.getSessionId(res)) {
            sql =
                'SELECT ' +
                    '  encrypt_cookie(seq_sessionid_nbs.nextval) as "sessionid" ' +
                    'FROM ' +
                    '  dual';
            api_oracle_1.Oracledb.select(sql, vals, req, null, null).then(function (result) {
                var data = tools_1.Tools.getSingleResult(result);
                var sessionid = data.sessionid;
                tools_1.Tools.createCookie(res, Constants.SESSIONID_CODE, sessionid);
                next();
            }, function (result) {
                console.log(result);
                next();
            });
        }
        else {
            next();
        }
    }
    catch (e) {
        console.log(e);
        next();
    }
}
exports.sessionidCookie = sessionidCookie;
function createPartnerCookie(req, res, obj) {
    return new Promise(function (resolve, reject) {
        var sql, sqlDelete, sqlInsert, vals = {};
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
                '  VALUES (:sessionid, :partner, :login, sysdate, null, :authToken, get_website);';
        vals = {
            sessionid: tools_1.Tools.getSessionId(req),
            partner: obj.partner,
            login: obj.login,
            authToken: null,
        };
        api_oracle_1.Oracledb.select(sql, {}, req, null, null).then(function (result) {
            var data = tools_1.Tools.getSingleResult(result);
            vals.authToken = data.encryptCookie;
            return api_oracle_1.Oracledb.select(sqlDelete, vals, req, null, null);
        }).then(function (result) {
            return api_oracle_1.Oracledb.select(sqlInsert, vals, req, null, null);
        }).then(function (result) {
            tools_1.Tools.createCookie(res, Constants.AUTH_TOKEN_CODE, vals.authToken);
            resolve(vals);
        }, function (result) {
            reject(result);
        });
    });
}
exports.createPartnerCookie = createPartnerCookie;
function user(req, res) {
    var sql, vals = {}, sqlResult, sessionid;
    try {
        sessionid = tools_1.Tools.getSessionId(req);
        sql =
            'begin web_udaje_eshop_uzivatele_json(:strings); end;';
        sqlResult =
            'SELECT ' +
                '  s1 as "result" ' +
                'FROM ' +
                '  sessionid_temp ' +
                'WHERE ' +
                '  sessionid = decrypt_cookie(:sessionid) ' +
                '  AND kod = \'WEB_UDAJE_ESHOP_UZIVATELE_JSON\'';
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
        api_oracle_1.Oracledb.executeSQL(sql, vals, req, null, { commit: true }).then(function (result) {
            vals = { sessionid: sessionid };
            return api_oracle_1.Oracledb.select(sqlResult, vals, req, null, null);
        }).then(function (result) {
            var data = tools_1.Tools.getSingleResult(result);
            var obj = data.result ? JSON.parse(data.result) : {};
            res.json(obj);
        }, function (result) {
            console.log(result);
            res.json({});
        });
    }
    catch (e) {
        console.log(e);
        res.json({});
    }
}
exports.user = user;
