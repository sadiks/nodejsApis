const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/dashboard/{userId}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get aggregated dashboard data (BFF endpoint)
 *     description: |
 *       **Core BFF endpoint.** Makes 3 downstream service calls in parallel using `Promise.allSettled`
 *       and returns a single composed payload for the React MFE dashboard.
 *
 *       Aggregates:
 *       - **User profile** from User Service
 *       - **Orders summary** from Order Service
 *       - **Notifications** from Notification Service
 *
 *       If one downstream service fails, the others still return (partial failure resilience).
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to aggregate data for
 *         example: u1
 *     responses:
 *       200:
 *         description: Aggregated dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardResponse'
 *             example:
 *               success: true
 *               message: Dashboard data aggregated successfully
 *               data:
 *                 user:
 *                   id: u1
 *                   name: Alice Johnson
 *                   role: admin
 *                 orders:
 *                   total: 2
 *                   pending: 1
 *                   items: []
 *                 notifications:
 *                   total: 2
 *                   unread: 1
 *                   items: []
 *                 meta:
 *                   aggregatedAt: "2025-01-15T10:30:00.000Z"
 *                   elapsed_ms: 65
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:userId', authenticate, dashboardController.getDashboard);

module.exports = router;
