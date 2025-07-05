/**
 * AsyncHandler - A utility function to handle async operations in Express routes
 * Wraps async functions to automatically catch errors and pass them to Express error handling middleware
 *
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 */
const AsyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default AsyncHandler;
