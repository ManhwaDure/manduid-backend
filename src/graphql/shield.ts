import { rule, shield } from 'graphql-shield';
import { Permission } from './context/permissions';
import { Context } from './context/types';
import { GraphQLExposableError } from './exposableError';

const isAuthenticated = rule({
  cache: 'contextual',
})(async (parent, args, ctx: Context, info) => {
  return ctx.user.authenticated || '로그인이 필요합니다';
});

const hasPermission = (permission: Permission) =>
  rule({
    cache: 'contextual',
  })(async (parent, args, ctx: Context, info) => {
    if (ctx.user.authenticated)
      return (
        ctx.user.hasPermission(permission) ||
        '권한이 없습니다'
      );
    else return '로그인이 필요합니다';
  });

const hasAcceptOrDenyApplicationPermission = rule({
  cache: 'strict',
})(
  async (
    parent,
    { accepts }: { accepts: boolean },
    ctx: Context,
    info
  ) => {
    if (ctx.user.authenticated)
      return (
        (accepts &&
          ctx.user.hasPermission('application.accept')) ||
        (!accepts &&
          ctx.user.hasPermission('application.deny')) ||
        '권한이 없습니다.'
      );
    else return '로그인이 필요합니다.';
  }
);

const isPresident = rule({
  cache: 'contextual',
})(async (parent, args, ctx: Context, info) => {
  return (
    (ctx.user.authenticated && ctx.user.isPresident) ||
    '회장만이 가능합니다.'
  );
});

const permissions = shield(
  {
    Query: {
      me: isAuthenticated,
      applications: hasPermission('application.read'),
      executives: hasPermission('executive.list'),
      executiveTypes: hasPermission('executive.type.get'),
      getApplicationById: hasPermission('application.read'),
      members: hasPermission('roll.list'),
      getMemberByStudentId: hasPermission('roll.list'),
      getMemberById: hasPermission('roll.list'),
      oauth2Clients: hasPermission('oidc.list'),
      subscriptions: hasPermission('subscription.list'),
    },
    Mutation: {
      acceptOrDenyApplication: hasAcceptOrDenyApplicationPermission,
      appointExecutive: hasPermission('executive.appoint'),
      createApplicationFormAdditionalQuestion: hasPermission(
        'application.additionalQuestion.create'
      ),
      createExecutiveType: hasPermission(
        'executive.type.create'
      ),
      createMember: hasPermission('roll.create'),
      createSubscription: hasPermission(
        'subscription.create'
      ),
      deleteApplicationFormAdditionalQuestion: hasPermission(
        'application.additionalQuestion.delete'
      ),
      deleteExecutiveType: hasPermission(
        'executive.type.remove'
      ),
      deleteSubscription: hasPermission(
        'subscription.remove'
      ),
      disappointExecutive: hasPermission(
        'executive.disappoint'
      ),
      handoverPresident: isPresident,
      renameExecutiveType: hasPermission(
        'executive.type.rename'
      ),
      updateMember: hasPermission('roll.update'),
      updatePermission: hasPermission(
        'executive.type.update'
      ),
      updateUserProfile: hasPermission(
        'roll.updateProfile'
      ),
      changePassword: isAuthenticated,
      updateMyProfile: isAuthenticated,
    },
  },
  {
    fallbackError: (err) => {
      if (err instanceof GraphQLExposableError) {
        return err;
      } else {
        return new Error('Server Internal Error');
      }
    },
  }
);

export default permissions;
