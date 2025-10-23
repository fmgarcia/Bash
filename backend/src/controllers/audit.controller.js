const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AuditController {
  /**
   * Obtiene el historial de auditoría
   */
  static async getAuditTrail(req, res, next) {
    try {
      const { page = 1, limit = 50, entity, action, userId } = req.query;
      const skip = (page - 1) * limit;

      const where = {};

      if (entity) {
        where.entity = entity;
      }

      if (action) {
        where.action = action;
      }

      if (userId) {
        where.performedBy = parseInt(userId);
      }

      const [auditLogs, total] = await Promise.all([
        prisma.auditTrail.findMany({
          where,
          include: {
            performerUser: {
              select: {
                id: true,
                username: true,
                fullName: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: { performedAt: 'desc' }
        }),
        prisma.auditTrail.count({ where })
      ]);

      res.json({
        success: true,
        data: auditLogs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuditController;
