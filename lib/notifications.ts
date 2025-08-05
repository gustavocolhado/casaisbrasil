import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface NotificationData {
  postId?: string;
  commentId?: string;
  senderId?: string;
  followerId?: string;
  messageId?: string;
}

export interface CreateNotificationParams {
  userId: string;
  type: 'follow' | 'message' | 'like' | 'comment' | 'comment_like' | 'comment_reply';
  title: string;
  message: string;
  data?: NotificationData;
}

export class NotificationService {
  // Criar uma nova notificação
  static async createNotification(params: CreateNotificationParams) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          data: { ...(params.data || {}) },
          read: false,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      });

      console.log(`📢 Notificação criada: ${params.type} para ${params.userId}`);
      return notification;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  }

  // Buscar notificações de um usuário
  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      });

      return notifications;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      throw error;
    }
  }

  // Marcar notificação como lida
  static async markAsRead(notificationId: string) {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          read: true,
        },
      });

      return notification;
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  // Marcar todas as notificações de um usuário como lidas
  static async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      console.log(`✅ Todas as notificações de ${userId} marcadas como lidas`);
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  }

  // Contar notificações não lidas
  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      return count;
    } catch (error) {
      console.error('❌ Erro ao contar notificações não lidas:', error);
      throw error;
    }
  }

  // Deletar notificação
  static async deleteNotification(notificationId: string) {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
        },
      });

      console.log(`🗑️ Notificação ${notificationId} deletada`);
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      throw error;
    }
  }

  // Criar notificação de novo seguidor
  static async createFollowNotification(followerId: string, followingId: string) {
    try {
      const follower = await prisma.user.findUnique({
        where: { id: followerId },
        select: { username: true, image: true },
      });

      if (!follower) {
        throw new Error('Usuário seguidor não encontrado');
      }

      return await this.createNotification({
        userId: followingId,
        type: 'follow',
        title: 'Novo seguidor!',
        message: `${follower.username} começou a seguir você`,
        data: {
          followerId,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar notificação de follow:', error);
      throw error;
    }
  }

  // Criar notificação de nova mensagem
  static async createMessageNotification(senderId: string, receiverId: string, messageId: string) {
    try {
      const sender = await prisma.user.findUnique({
        where: { id: senderId },
        select: { username: true, image: true },
      });

      if (!sender) {
        throw new Error('Usuário remetente não encontrado');
      }

      return await this.createNotification({
        userId: receiverId,
        type: 'message',
        title: 'Nova mensagem',
        message: `${sender.username} enviou uma mensagem para você`,
        data: {
          senderId,
          messageId,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar notificação de mensagem:', error);
      throw error;
    }
  }

  // Criar notificação de curtida
  static async createLikeNotification(likerId: string, postId: string) {
    try {
      const liker = await prisma.user.findUnique({
        where: { id: likerId },
        select: { username: true, image: true },
      });

      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true },
      });

      if (!liker || !post) {
        throw new Error('Usuário ou post não encontrado');
      }

      // Não criar notificação se o usuário curtir seu próprio post
      if (likerId === post.userId) {
        return null;
      }

      return await this.createNotification({
        userId: post.userId!,
        type: 'like',
        title: 'Nova curtida!',
        message: `${liker.username} curtiu seu post`,
        data: {
          postId,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar notificação de curtida:', error);
      throw error;
    }
  }

  // Criar notificação de comentário
  static async createCommentNotification(commenterId: string, postId: string, commentId: string) {
    try {
      const commenter = await prisma.user.findUnique({
        where: { id: commenterId },
        select: { username: true, image: true },
      });

      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { userId: true },
      });

      if (!commenter || !post) {
        throw new Error('Usuário ou post não encontrado');
      }

      // Não criar notificação se o usuário comentar seu próprio post
      if (commenterId === post.userId) {
        return null;
      }

      return await this.createNotification({
        userId: post.userId!,
        type: 'comment',
        title: 'Novo comentário!',
        message: `${commenter.username} comentou seu post`,
        data: {
          postId,
          commentId,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar notificação de comentário:', error);
      throw error;
    }
  }

  // Criar notificação de curtida em comentário
  static async createCommentLikeNotification(likerId: string, commentId: string) {
    try {
      const liker = await prisma.user.findUnique({
        where: { id: likerId },
        select: { username: true, image: true },
      });

      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true, content: true, postId: true },
      });

      if (!liker || !comment) {
        throw new Error('Usuário ou comentário não encontrado');
      }

      // Não criar notificação se o usuário curtir seu próprio comentário
      if (likerId === comment.userId) {
        return null;
      }

      // Truncar o conteúdo do comentário para a mensagem
      const commentPreview = comment.content.length > 50 
        ? comment.content.substring(0, 50) + '...' 
        : comment.content;

      return await this.createNotification({
        userId: comment.userId!,
        type: 'like',
        title: 'Nova curtida no comentário!',
        message: `${liker.username} curtiu seu comentário: "${commentPreview}"`,
        data: {
          postId: comment.postId,
          commentId,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar notificação de curtida em comentário:', error);
      throw error;
    }
  }

  // Criar notificação de resposta a comentário
  static async createCommentReplyNotification(replierId: string, commentId: string, replyId: string) {
    try {
      const replier = await prisma.user.findUnique({
        where: { id: replierId },
        select: { username: true, image: true },
      });

      const parentComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { userId: true, content: true, postId: true },
      });

      if (!replier || !parentComment) {
        throw new Error('Usuário ou comentário não encontrado');
      }

      // Não criar notificação se o usuário responder seu próprio comentário
      if (replierId === parentComment.userId) {
        return null;
      }

      // Truncar o conteúdo do comentário para a mensagem
      const commentPreview = parentComment.content.length > 50 
        ? parentComment.content.substring(0, 50) + '...' 
        : parentComment.content;

      return await this.createNotification({
        userId: parentComment.userId!,
        type: 'comment',
        title: 'Nova resposta ao seu comentário!',
        message: `${replier.username} respondeu seu comentário: "${commentPreview}"`,
        data: {
          postId: parentComment.postId,
          commentId: replyId,
        },
      });
    } catch (error) {
      console.error('❌ Erro ao criar notificação de resposta a comentário:', error);
      throw error;
    }
  }
} 