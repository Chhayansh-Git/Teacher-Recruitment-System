// server/middleware/asyncHandler.js

export default function asyncHandler(fn) {
  return (req, res, next) => {
    Promise
      .resolve(fn(req, res, next))
      .catch(err => {
        // ← Log full error and stack to the console for debugging
        console.error("⚠️ uncaught error in route handler:", err);
        next(err);
      });
  };
}
