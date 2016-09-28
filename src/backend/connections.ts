export module Connections {
  export function getConnection (req) {
    var i, l, connect = {}, loginToken;
    return connect = {
      user: 'mcled_website_v3',
      password: 'Slepic12',
      database: '',
      hostname: '',
      port: 1521,
      clientDB: '',
      connectString: (process.env.APP_CONNECT_STRING || 'mail.schmachtl.cz/notia'),
      meta: {}
    };
  }
}
