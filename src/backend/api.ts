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

export function emptyImage (req, res) {
  res.sendFile((process.env.APP_PORT ? '/srv/nodejs/mcled_website_v3' : '') + '/images/noimage/mcled_noimage_B.png', {root: (process.env.APP_PORT ? '' : __dirname + '/../../')});
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
