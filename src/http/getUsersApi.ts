import { Prisma } from '@prisma/client';
import Router from 'koa-router';
import { db } from '../db';
import getAllPermissionsOf from './getAllPermissionsOf';
import { tryAuthenticateClient } from './oauth2/middlewares';
const router = new Router();

router.get(
  '/get_users',
  tryAuthenticateClient(true),
  async (ctx) => {
    if (
      !ctx.oauth2.client.allowedScopes.includes('users')
    ) {
      ctx.type = 'application/json';
      ctx.status = 403;
      ctx.body = JSON.stringify({
        success: false,
        error: '`users` scope not allowed',
      });
      return;
    }

    const targets: (
      | 'admin'
      | 'banned'
      | 'all'
    )[] = ctx.request.query.targets?.split(' ') || [
      'admin',
      'banned',
    ];

    let where: Prisma.MemberWhereInput = null;
    if (targets.includes('all')) {
      where = {};
    } else {
      const OR: Prisma.MemberWhereInput[] = [];
      if (targets.includes('admin')) {
        OR.push({
          OR: [
            {
              isExecutive: true,
            },
            {
              isPresident: true,
            },
          ],
        });
      }
      if (targets.includes('banned')) {
        OR.push({
          OR: [
            {
              memberType: 'Explusion',
            },
            {
              memberType: 'Removed',
            },
          ],
        });
      }
      where = {
        OR,
      };
    }
    const users = await db.member.findMany({
      select: {
        ssoUser: {
          include: {
            member: true,
          },
        },
        memberType: true,
        isExecutive: true,
        isPresident: true,
        executiveTypeName: true,
      },
      where,
    });
    const result = await Promise.all(
      users
        .filter((i) => i.ssoUser !== null)
        .map(async (i) => {
          return {
            id: i.ssoUser.id,
            expulsed: i.memberType === 'Explusion',
            removed: i.memberType === 'Removed',
            permissions: await getAllPermissionsOf(
              i.ssoUser
            ),
            executiveTypeName: i.executiveTypeName,
            president: i.isPresident,
            executive: i.isExecutive,
          };
        })
    );
    ctx.type = 'application/json';
    ctx.status = 200;
    ctx.body = JSON.stringify({ result, success: true });
  }
);

export default router;
