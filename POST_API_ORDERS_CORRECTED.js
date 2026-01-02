/**
 * ============================================================================
 * POST /api/orders - CORRECTED IMPLEMENTATION
 * ============================================================================
 * 
 * ISSUE FIXED:
 * - Unknown column 'lat' in 'field list' error
 * - Backend was trying to use orders.lat and orders.lng
 * - These columns DO NOT EXIST in orders table
 * 
 * SOLUTION:
 * - Use ONLY delivery_lat and delivery_lng (correct column names)
 * - Fetch user location from users table (lat, lng)
 * - Map: users.lat → delivery_lat, users.lng → delivery_lng
 * - Never use orders.lat or orders.lng
 * 
 * DATABASE COLUMNS REFERENCE:
 * ✅ delivery_lat    (correct)
 * ✅ delivery_lng    (correct)
 * ❌ lat             (DOES NOT EXIST)
 * ❌ lng             (DOES NOT EXIST)
 * ============================================================================
 */

router.post("/", async (req, res) => {
  /**
   * STEP 1: Parse and validate request body
   */
  const toNum = (v) => (v === undefined || v === null || v === "" ? null : Number(v));
  const toStr = (v) => (v === undefined || v === null ? null : String(v));
  const toJsonStr = (v, fallback = "[]") => {
    if (v === undefined || v === null) return fallback;
    try { return JSON.stringify(v); } catch (_) { return fallback; }
  };

  const userId = toNum(req.body.user_id);
  const restaurantId = toNum(req.body.restaurant_id);
  const itemsJson = toJsonStr(req.body.items, "[]");
  const totalVal = toNum(req.body.total);
  const paymentType = toStr(req.body.payment_type);
  const etaStr = toStr(req.body.estimated_delivery);
  const deliveryAddressOverride = toStr(req.body.delivery_address);

  // Validate required fields
  if (userId == null || restaurantId == null || totalVal == null) {
    return res.status(400).json({
      error: "Missing required fields: user_id, restaurant_id, total"
    });
  }

  const connection = await db.getConnection();
  connection.execute = wrapExecuteWithGuard(connection.execute.bind(connection));

  try {
    await connection.beginTransaction();

    /**
     * STEP 2: Fetch delivery location from users table
     * 
     * SQL QUERY:
     * SELECT lat, lng, address FROM users WHERE id = ? LIMIT 1;
     * 
     * These columns (users.lat, users.lng) are the SOURCE for delivery location.
     * They will be stored in orders table as delivery_lat and delivery_lng.
     */
    const [userRows] = await connection.execute(
      "SELECT lat, lng, address, phone FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!userRows || userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];
    
    // Extract and validate delivery location from users table
    const snapLat = user.lat != null ? Number(user.lat) : null;
    const snapLng = user.lng != null ? Number(user.lng) : null;
    const snapAddress = deliveryAddressOverride || (user.address != null ? user.address : null);
    const customerPhone = user.phone || null;

    // Validate that user has delivery location
    if (!Number.isFinite(snapLat) || !Number.isFinite(snapLng)) {
      await connection.rollback();
      return res.status(400).json({
        error: "User delivery location missing. Please set location in profile."
      });
    }

    /**
     * STEP 3: Generate unique order_id (12-digit random)
     */
    let uniqueOrderId = null;
    for (let i = 0; i < 10 && !uniqueOrderId; i++) {
      const randId = Math.floor(100000000000 + Math.random() * 900000000000).toString();
      const [existing] = await connection.execute(
        "SELECT id FROM orders WHERE order_id = ? LIMIT 1",
        [randId]
      );
      if (!existing || existing.length === 0) uniqueOrderId = randId;
    }
    if (!uniqueOrderId) uniqueOrderId = Date.now().toString().padStart(12, "0").slice(-12);

    /**
     * STEP 4: Fetch restaurant phone
     */
    const [restaurantRows] = await connection.execute(
      "SELECT phone FROM restaurants WHERE id = ? LIMIT 1",
      [restaurantId]
    );
    const restaurantPhone = (restaurantRows && restaurantRows[0]) ? restaurantRows[0].phone : null;

    /**
     * STEP 5: INSERT base order with delivery location
     * 
     * IMPORTANT SQL QUERY:
     * ✅ USES: delivery_lat, delivery_lng (CORRECT COLUMNS)
     * ❌ NEVER: lat, lng (COLUMNS DO NOT EXIST)
     * 
     * Mapping:
     * - delivery_lat   ← users.lat (delivery location snapshot)
     * - delivery_lng   ← users.lng (delivery location snapshot)
     * - delivery_address ← req.body.delivery_address OR users.address
     * - status        ← 'waiting_for_agent' (enum value)
     * - tracking_status ← 'pending' (enum value)
     */
    const baseInsertSql = `
      INSERT INTO orders (
        user_id,
        restaurant_id,
        delivery_lat,
        delivery_lng,
        delivery_address,
        customer_phone,
        restaurant_phone,
        status,
        tracking_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [insertResult] = await connection.execute(baseInsertSql, [
      userId,
      restaurantId,
      snapLat,           // from users.lat
      snapLng,           // from users.lng
      snapAddress,       // from users.address or override
      customerPhone,
      restaurantPhone,
      ORDER_STATUS.WAITING_AGENT,    // 'waiting_for_agent'
      TRACKING_STATUS.PENDING        // 'pending'
    ]);

    const orderDbId = insertResult.insertId;

    /**
     * STEP 6: UPDATE order with remaining fields
     * 
     * IMPORTANT: This update does NOT touch delivery_lat or delivery_lng
     * Those are immutable once set (snapshot of user location at order time)
     */
    const finalizeUpdateSql = `
      UPDATE orders
      SET items = ?,
          total = ?,
          order_id = ?,
          payment_type = ?,
          estimated_delivery = ?
      WHERE id = ?
    `;

    await connection.execute(finalizeUpdateSql, [
      itemsJson,
      totalVal,
      uniqueOrderId,
      paymentType,
      etaStr,
      orderDbId
    ]);

    await connection.commit();

    /**
     * STEP 7: Prepare response object
     * 
     * Note: delivery_lat and delivery_lng are from users table snapshot
     */
    const newOrder = {
      id: orderDbId,
      order_id: uniqueOrderId,
      user_id: userId,
      restaurant_id: restaurantId,
      items: req.body.items || [],
      total: totalVal,
      agent_id: null,
      status: ORDER_STATUS.WAITING_AGENT,
      tracking_status: TRACKING_STATUS.PENDING,
      payment_type: paymentType,
      estimated_delivery: etaStr,
      delivery_address: snapAddress,
      delivery_lat: snapLat,      // ✅ From users.lat
      delivery_lng: snapLng,      // ✅ From users.lng
      customer_phone: customerPhone,
      restaurant_phone: restaurantPhone
    };

    /**
     * STEP 8: Emit socket events
     */
    io.emit("newOrder", newOrder);
    io.emit(`orderForRestaurant_${restaurantId}`, newOrder);

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (err) {
    try { await connection.rollback(); } catch (_) {}
    
    console.error("Order creation error:", {
      userId,
      restaurantId,
      error: err.message,
      code: err.code
    });

    // Return appropriate error response
    if (err.code === "ORDERS_LEGACY_FIELDS") {
      return res.status(500).json({
        error: "Internal server error: unsafe column usage",
        details: "Contact support"
      });
    }

    return res.status(500).json({
      error: "Order creation failed",
      details: err.message
    });

  } finally {
    connection.release();
  }
});


/**
 * ============================================================================
 * VERIFICATION CHECKLIST
 * ============================================================================
 * 
 * ✅ All references to orders.lat removed
 * ✅ All references to orders.lng removed
 * ✅ All references to orders.address removed
 * ✅ Using only delivery_lat (from users.lat)
 * ✅ Using only delivery_lng (from users.lng)
 * ✅ Fetching from users table (correct source)
 * ✅ Status enum: 'waiting_for_agent' (valid value)
 * ✅ Tracking enum: 'pending' (valid value)
 * ✅ Two-phase insert (base + finalize)
 * ✅ Guard function wraps connection
 * ✅ Transaction safety
 * ✅ Error handling
 * ✅ Socket events emitted
 * ✅ Phone numbers captured
 * ✅ Address override support
 * 
 * ============================================================================
 * DATABASE SCHEMA (CONFIRMED)
 * ============================================================================
 * 
 * orders table:
 * - id (primary key)
 * - user_id ✅ Used
 * - restaurant_id ✅ Used
 * - agent_id (nullable, set by agent-orders.js)
 * - items ✅ Used
 * - total ✅ Used
 * - order_id ✅ Used
 * - payment_type ✅ Used
 * - estimated_delivery ✅ Used
 * - status ✅ Used
 * - delivery_address ✅ Used
 * - delivery_lat ✅ Used
 * - delivery_lng ✅ Used
 * - notes (nullable)
 * - created_at (auto)
 * - updated_at (auto)
 * - tracking_status ✅ Used
 * - agent_assigned_at (nullable)
 * - picked_up_at (nullable)
 * - delivered_at (nullable)
 * - customer_phone ✅ Used
 * - restaurant_phone ✅ Used
 * 
 * NEVER USED: lat, lng, address (DO NOT EXIST)
 * 
 * ============================================================================
 * AGENT ASSIGNMENT FLOW (DO NOT BREAK)
 * ============================================================================
 * 
 * Agent assignment (in agent-orders.js) must:
 * 
 * 1. UPDATE orders
 *    SET agent_id = ?,
 *        status = 'agent_assigned',
 *        tracking_status = 'accepted'
 *    WHERE id = ? AND agent_id IS NULL
 * 
 * 2. NEVER UPDATE delivery_lat or delivery_lng (immutable)
 * 3. NEVER UPDATE delivery_address (immutable)
 * 4. Broadcast to socket rooms
 * 
 * ============================================================================
 * SQL QUERIES SUMMARY
 * ============================================================================
 * 
 * Query 1: Fetch user location
 * SELECT lat, lng, address, phone FROM users WHERE id = ? LIMIT 1;
 * 
 * Query 2: Check unique order_id
 * SELECT id FROM orders WHERE order_id = ? LIMIT 1;
 * 
 * Query 3: Fetch restaurant phone
 * SELECT phone FROM restaurants WHERE id = ? LIMIT 1;
 * 
 * Query 4: INSERT base order
 * INSERT INTO orders (
 *   user_id, restaurant_id, delivery_lat, delivery_lng,
 *   delivery_address, customer_phone, restaurant_phone,
 *   status, tracking_status
 * ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
 * 
 * Query 5: UPDATE order with items/total
 * UPDATE orders
 * SET items = ?, total = ?, order_id = ?,
 *     payment_type = ?, estimated_delivery = ?
 * WHERE id = ?;
 * 
 * ============================================================================
 * ERROR RESPONSES
 * ============================================================================
 * 
 * 400: Missing required fields
 * 400: User delivery location missing
 * 404: User not found
 * 500: Order creation failed (catch block)
 * 500: Unsafe column usage (guard block)
 * 
 * ============================================================================
 */
