export default [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  {
    name: 'strapi::session',
    config: {
      store: {
        async get(key: string) {
          const sessionInfo = await strapi.db.query("api::session.session").findOne({
            select: ['session', 'expires'],
            where: { key },
          });

          if (!sessionInfo) {
            return;
          }

          if (sessionInfo.expires < new Date().getTime()) {
            return;
          }

          return sessionInfo.session;
        },
        async set(key: string, session: unknown, maxAge: number) {
          const sessionInfo = await strapi.db.query("api::session.session").findOne({
            select: ['session', 'expires'],
            where: { key },
          });

          if (sessionInfo) {
            await strapi.db.query("api::session.session").update({
              data: {
                session,
                expires: new Date(new Date().getTime() + maxAge * 1000),
              },
              where: { key },
            });
          } else {
            await strapi.service('api::session.session').create({
              data: {
                key,
                session,
                expires: new Date(new Date().getTime() + maxAge * 1000),
              }
            })
          }
        },
        async destroy(key: string) {
          await strapi.db.query("api::session.session").delete({
            where: { key }
          });
        },
      },
    },
  },
  'strapi::favicon',
  'strapi::public',
];
