/**
 * ==============================================================================
 * MongoDB Connection Pool Utility (/lib/mongodb.js)
 * Implements Mongoose / MongoDB connection pooling with connection caching,
 * explicit timeout prevention, and error handling for Next.js App Router.
 * ==============================================================================
 */

// Global cached connection for Next.js hot-reloading in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with pooling and timeout controls
 * @returns {Promise<any>}
 */
export async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/borewell_db';

  // 1. If connection is already established and ready, reuse it immediately
  if (cached.conn && cached.conn.connection?.readyState === 1) {
    console.log('[Database] Reusing existing cached MongoDB connection');
    return cached.conn;
  }

  // 2. If no connection promise is in-flight, create a new pooled connection promise
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,                 // Maintain up to 10 socket connections
      minPoolSize: 2,                  // Keep minimum 2 connections ready
      serverSelectionTimeoutMS: 3000,  // Fail fast in 3s rather than hanging indefinitely
      socketTimeoutMS: 45000,          // Close inactive sockets after 45s
      connectTimeoutMS: 5000,          // Connection handshake timeout
    };

    console.log(`[Database] Initiating new MongoDB connection pool: ${MONGODB_URI}`);

    try {
      // Dynamically import mongoose to support environments with or without mongoose
      const mongooseModule = await import('mongoose').catch(() => null);
      const mongoose = mongooseModule?.default || mongooseModule;

      if (mongoose && typeof mongoose.connect === 'function') {
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
          console.log('[Database] ✅ MongoDB connection pool established successfully');
          return m;
        });
      } else {
        console.warn('[Database] ⚠️ Mongoose is not installed; database fallback active.');
        return null;
      }
    } catch (error) {
      console.error('[Database Error] ❌ Immediate connection initiation error:', error.message);
      cached.promise = null;
      throw new Error(`Database connection initialization failed: ${error.message}`);
    }
  }

  // 3. Await connection resolution with safety check
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset cached promise so future requests can retry rather than perpetually rejecting
    cached.promise = null;
    cached.conn = null;
    console.error('[Database Error] ❌ MongoDB connection rejected:', error.message);
    throw new Error(`Failed to establish database connection: ${error.message}`);
  }

  return cached.conn;
}

export default connectToDatabase;
